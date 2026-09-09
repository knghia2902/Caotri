"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

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
 * Server Action xử lý tạo đơn hàng
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
