"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Thiếu mã sản phẩm"),
  productName: z.string().min(1, "Thiếu tên sản phẩm"),
  price: z.number().positive("Giá sản phẩm phải lớn hơn 0"),
  quantity: z.number().int().min(1, "Số lượng sản phẩm tối thiểu là 1"),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, "Họ và tên người nhận cần ít nhất 2 ký tự")
    .max(100, "Họ và tên không quá 100 ký tự"),
  customerPhone: z
    .string()
    .regex(
      /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/,
      "Số điện thoại không hợp lệ (Vui lòng nhập 10 chữ số đúng định dạng Việt Nam)"
    ),
  customerAddress: z
    .string()
    .min(5, "Vui lòng nhập địa chỉ nhận hàng chi tiết (số nhà, tên đường, phường/xã, quận/huyện)")
    .max(255, "Địa chỉ quá dài"),
  customerNotes: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, "Giỏ hàng của bạn đang trống"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface CreateOrderResult {
  success: boolean;
  orderNumber?: string;
  error?: string;
}

export interface OrderActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Thiếu mã đơn hàng"),
  status: z.enum(["PENDING", "CONTACTED", "SHIPPING", "COMPLETED", "CANCELLED"]),
  cancelReason: z.string().max(500, "Lý do hủy tối đa 500 ký tự").optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateOrderNotesSchema = z.object({
  orderId: z.string().min(1, "Thiếu mã đơn hàng"),
  adminNotes: z.string().max(2000, "Ghi chú tối đa 2000 ký tự"),
});

export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>;

export function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "CONTACTED":
      return "Đã liên hệ";
    case "SHIPPING":
      return "Đang giao";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

/**
 * Sinh mã đơn hàng ngẫu nhiên duy nhất dạng DH-XXXXXX (ví dụ: DH-849201)
 */
function generateOrderNumber(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DH-${randomStr}`;
}

/**
 * Server Action xử lý tạo đơn hàng từ Storefront Checkout
 */
export async function createOrderAction(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  try {
    const validated = checkoutSchema.parse(input);

    // Tính tổng tiền an toàn phía server
    const totalAmount = validated.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (totalAmount <= 0) {
      return { success: false, error: "Tổng giá trị đơn hàng không hợp lệ!" };
    }

    // Đảm bảo mã đơn hàng không bị trùng
    let orderNumber = generateOrderNumber();
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    let attempts = 0;
    while (exists && attempts < 5) {
      orderNumber = generateOrderNumber();
      exists = await prisma.order.findUnique({ where: { orderNumber } });
      attempts++;
    }

    // Thực hiện lưu giao dịch tạo Order và các OrderItem
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName: validated.customerName.trim(),
          customerPhone: validated.customerPhone.trim(),
          customerAddress: validated.customerAddress.trim(),
          customerNotes: validated.customerNotes?.trim() || null,
          totalAmount,
          status: "PENDING",
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });
      return order;
    });

    return {
      success: true,
      orderNumber: createdOrder.orderNumber,
    };
  } catch (err: unknown) {
    console.error("Lỗi khi tạo đơn hàng:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi tạo đơn hàng!",
    };
  }
}

/**
 * Server Action cập nhật trạng thái đơn hàng (ADMIN và STAFF)
 */
export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput
): Promise<OrderActionResult> {
  try {
    // Kiểm tra phân quyền: Cả ADMIN và STAFF đều có quyền xử lý đơn hàng
    const session = await requireRole(["ADMIN", "STAFF"]);

    const validated = updateOrderStatusSchema.parse(input);

    const existingOrder = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Đơn hàng không tồn tại trong hệ thống" };
    }

    let adminNotesUpdate = existingOrder.adminNotes || "";
    if (validated.status === "CANCELLED" && validated.cancelReason) {
      const timestamp = new Date().toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const cancelLog = `[HỦY ĐƠN lúc ${timestamp} bởi ${session.name}]: ${validated.cancelReason.trim()}`;
      adminNotesUpdate = adminNotesUpdate ? `${cancelLog}\n${adminNotesUpdate}` : cancelLog;
    }

    await prisma.order.update({
      where: { id: validated.orderId },
      data: {
        status: validated.status,
        adminNotes: adminNotesUpdate || undefined,
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${validated.orderId}`);
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã cập nhật trạng thái đơn sang "${getStatusLabel(validated.status)}"`,
    };
  } catch (err: unknown) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi cập nhật trạng thái!",
    };
  }
}

/**
 * Server Action cập nhật ghi chú nội bộ của nhân viên (ADMIN và STAFF)
 */
export async function updateOrderNotesAction(
  input: UpdateOrderNotesInput
): Promise<OrderActionResult> {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const validated = updateOrderNotesSchema.parse(input);

    const existingOrder = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!existingOrder) {
      return { success: false, error: "Đơn hàng không tồn tại" };
    }

    await prisma.order.update({
      where: { id: validated.orderId },
      data: {
        adminNotes: validated.adminNotes.trim(),
      },
    });

    revalidatePath(`/admin/orders/${validated.orderId}`);

    return {
      success: true,
      message: "Đã lưu ghi chú nội bộ thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi cập nhật ghi chú đơn hàng:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi lưu ghi chú!",
    };
  }
}
