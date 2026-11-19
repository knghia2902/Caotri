"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getStatusLabel } from "@/lib/utils";
import { sendNewOrderNotification } from "@/lib/email";
import { getVnDateKey, isValidDateKey, vnStartOfDay } from "@/lib/date-vn";
import {
  checkoutSchema,
  updateOrderStatusSchema,
  updateOrderNotesSchema,
  type CheckoutInput,
  type UpdateOrderStatusInput,
  type UpdateOrderNotesInput,
} from "@/lib/order-schema";
import {
  createOfflineOrderSchema,
  updateOrderItemCostSchema,
  type CreateOfflineOrderInput,
  type UpdateOrderItemCostInput,
} from "@/lib/finance-schema";

export type {
  CheckoutInput,
  UpdateOrderStatusInput,
  UpdateOrderNotesInput,
  CreateOfflineOrderInput,
  UpdateOrderItemCostInput,
};

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message?: string;
  error?: string;
}

export interface OrderActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sinh mã đơn hàng ngẫu nhiên duy nhất (VD: DH-849201 hoặc OFF-849201)
 */
function generateOrderNumber(prefix: string = "DH"): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomStr}`;
}

/**
 * Chuyển chuỗi ngày/giờ đầu vào sang Date theo múi giờ Việt Nam (UTC+7)
 */
function parseVnDateTimeInput(raw?: string | null): Date {
  if (!raw || !raw.trim()) return new Date();
  const trimmed = raw.trim();

  // Định dạng YYYY-MM-DD -> lấy 12:00 giờ VN trong ngày đó
  if (isValidDateKey(trimmed)) {
    const start = vnStartOfDay(trimmed);
    return new Date(start.getTime() + 12 * 60 * 60 * 1000);
  }

  // Định dạng datetime-local (YYYY-MM-DDTHH:mm hoặc YYYY-MM-DDTHH:mm:ss) không có múi giờ -> gắn +07:00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}+07:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
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

    // Tra cứu giá vốn (costPrice) hiện tại của sản phẩm để snapshot vào OrderItem
    const productIds = Array.from(
      new Set(validated.items.map((item) => item.productId).filter(Boolean))
    );
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, costPrice: true },
    });
    const costPriceMap = new Map<string, number | null>(
      products.map((p) => [p.id, p.costPrice ?? null])
    );

    // Đảm bảo mã đơn hàng không bị trùng
    let orderNumber = generateOrderNumber("DH");
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    let attempts = 0;
    while (exists && attempts < 5) {
      orderNumber = generateOrderNumber("DH");
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
          channel: "WEB",
          paymentMethod: "COD",
          items: {
            create: validated.items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              costPrice: costPriceMap.get(item.productId) ?? null,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });
      return order;
    });

    // Kích hoạt gửi thông báo email ngầm đến Admin (non-blocking để checkout nhanh tức thì)
    sendNewOrderNotification(createdOrder).catch((err) => {
      console.error("[Order Action] Gửi email đơn hàng thất bại:", err);
    });

    return {
      success: true,
      orderId: createdOrder.id,
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
 * Server Action tạo đơn bán trực tiếp / bán ngoài web (Offline, Zalo, Facebook...) — CHỈ DÀNH CHO ADMIN
 */
export async function createOfflineOrderAction(
  input: CreateOfflineOrderInput
): Promise<CreateOrderResult> {
  try {
    const session = await requireRole(["ADMIN"]);
    const validated = createOfflineOrderSchema.parse(input);

    // Tra cứu giá vốn từ danh mục sản phẩm cho các dòng có productId
    const catalogProductIds = Array.from(
      new Set(
        validated.items
          .map((item) => item.productId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const catalogProducts =
      catalogProductIds.length > 0
        ? await prisma.product.findMany({
            where: { id: { in: catalogProductIds } },
            select: { id: true, costPrice: true },
          })
        : [];
    const costPriceMap = new Map<string, number | null>(
      catalogProducts.map((p) => [p.id, p.costPrice ?? null])
    );

    const subtotal = validated.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalAmount = Math.max(
      0,
      subtotal - validated.discount + validated.shippingFee
    );

    if (totalAmount <= 0) {
      return {
        success: false,
        error: "Tổng giá trị đơn hàng phải lớn hơn 0!",
      };
    }

    const effectiveSoldAt = parseVnDateTimeInput(validated.soldAt);
    const prefix = validated.channel === "WEB" ? "DH" : "OFF";

    let orderNumber = generateOrderNumber(prefix);
    let exists = await prisma.order.findUnique({ where: { orderNumber } });
    let attempts = 0;
    while (exists && attempts < 5) {
      orderNumber = generateOrderNumber(prefix);
      exists = await prisma.order.findUnique({ where: { orderNumber } });
      attempts++;
    }

    const customerName = validated.customerName?.trim() || "Khách lẻ";
    const customerPhone = validated.customerPhone?.trim() || "";
    const customerAddress =
      validated.customerAddress?.trim() || "Mua trực tiếp tại cửa hàng";

    const outOfStockProductIds = Array.from(
      new Set(
        validated.items
          .filter((item) => item.productId && item.markOutOfStock)
          .map((item) => item.productId as string)
      )
    );

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          customerAddress,
          customerNotes: validated.customerNotes?.trim() || null,
          adminNotes: validated.adminNotes?.trim() || null,
          totalAmount,
          status: validated.completeImmediately ? "COMPLETED" : "PENDING",
          channel: validated.channel,
          paymentMethod: validated.paymentMethod,
          discount: validated.discount,
          shippingFee: validated.shippingFee,
          soldAt: validated.completeImmediately ? effectiveSoldAt : null,
          createdById: session.userId,
          items: {
            create: validated.items.map((item) => {
              const resolvedCost =
                item.costPrice !== undefined && item.costPrice !== null
                  ? item.costPrice
                  : item.productId
                    ? (costPriceMap.get(item.productId) ?? null)
                    : null;

              return {
                productId: item.productId || null,
                productName: item.productName.trim(),
                price: item.price,
                costPrice: resolvedCost,
                quantity: item.quantity,
              };
            }),
          },
        },
      });

      // Cập nhật trạng thái hết hàng nếu Admin tích chọn
      if (outOfStockProductIds.length > 0) {
        await tx.product.updateMany({
          where: { id: { in: outOfStockProductIds } },
          data: { inStock: false },
        });
      }

      // Nếu hoàn thành ngay -> tự động ghi nhận phiếu Thu (IN) vào sổ quỹ
      if (validated.completeImmediately) {
        await tx.cashflowEntry.create({
          data: {
            type: "IN",
            category:
              validated.channel === "WEB" ? "ORDER_SALE" : "OFFLINE_SALE",
            amount: totalAmount,
            paymentMethod: validated.paymentMethod,
            occurredAt: effectiveSoldAt,
            dateKey: getVnDateKey(effectiveSoldAt),
            note: `Thu đơn ${order.orderNumber} (${validated.channel}) - ${customerName}`,
            orderId: order.id,
            createdById: session.userId,
          },
        });
      }

      return order;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");
    revalidatePath("/admin/products");

    return {
      success: true,
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      message: `Đã tạo đơn ${createdOrder.orderNumber} thành công`,
    };
  } catch (err: unknown) {
    console.error("Lỗi khi tạo đơn bán ngoài web:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi tạo đơn bán trực tiếp!",
    };
  }
}

/**
 * Server Action cập nhật trạng thái đơn hàng (ADMIN và STAFF).
 * Tự động đồng bộ sổ quỹ (CashflowEntry) khi hoàn thành hoặc hủy/hoàn tác đơn đã hoàn thành.
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

    // Chặn STAFF đảo ngược hoặc hủy đơn đã COMPLETED (ảnh hưởng sổ quỹ & lợi nhuận)
    if (
      existingOrder.status === "COMPLETED" &&
      validated.status !== "COMPLETED" &&
      session.role !== "ADMIN"
    ) {
      return {
        success: false,
        error:
          "Chỉ Quản trị viên (ADMIN) mới có quyền thay đổi trạng thái đơn đã hoàn thành!",
      };
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

    await prisma.$transaction(async (tx) => {
      const now = new Date();
      let soldAtUpdate: Date | null | undefined = undefined;

      if (validated.status === "COMPLETED") {
        const effectiveSoldAt = existingOrder.soldAt ?? now;
        soldAtUpdate = effectiveSoldAt;

        // Idempotent: chỉ tạo phiếu Thu nếu đơn này chưa có phiếu IN nào
        const existingIn = await tx.cashflowEntry.findFirst({
          where: { orderId: existingOrder.id, type: "IN" },
          select: { id: true },
        });

        if (!existingIn) {
          await tx.cashflowEntry.create({
            data: {
              type: "IN",
              category:
                existingOrder.channel === "WEB" ? "ORDER_SALE" : "OFFLINE_SALE",
              amount: existingOrder.totalAmount,
              paymentMethod: existingOrder.paymentMethod || "COD",
              occurredAt: effectiveSoldAt,
              dateKey: getVnDateKey(effectiveSoldAt),
              note: `Thu đơn ${existingOrder.orderNumber} - ${existingOrder.customerName}`,
              orderId: existingOrder.id,
              createdById: session.userId,
            },
          });
        }
      } else if (existingOrder.status === "COMPLETED") {
        if (validated.status === "CANCELLED") {
          // COMPLETED -> CANCELLED: ghi phiếu Hoàn tiền (REFUND) nếu đã từng ghi Thu và chưa có Hoàn tiền
          const [existingIn, existingRefund] = await Promise.all([
            tx.cashflowEntry.findFirst({
              where: { orderId: existingOrder.id, type: "IN" },
              select: { id: true },
            }),
            tx.cashflowEntry.findFirst({
              where: {
                orderId: existingOrder.id,
                type: "OUT",
                category: "REFUND",
              },
              select: { id: true },
            }),
          ]);

          if (existingIn && !existingRefund) {
            const reasonSuffix = validated.cancelReason?.trim()
              ? ` (${validated.cancelReason.trim()})`
              : "";
            await tx.cashflowEntry.create({
              data: {
                type: "OUT",
                category: "REFUND",
                amount: existingOrder.totalAmount,
                paymentMethod: existingOrder.paymentMethod || "COD",
                occurredAt: now,
                dateKey: getVnDateKey(now),
                note: `Hoàn tiền hủy đơn ${existingOrder.orderNumber}${reasonSuffix}`,
                orderId: existingOrder.id,
                createdById: session.userId,
              },
            });
          }
        } else {
          // COMPLETED -> PENDING / CONTACTED / SHIPPING (hoàn tác bấm nhầm): gỡ phiếu Thu tự động
          soldAtUpdate = null;
          await tx.cashflowEntry.deleteMany({
            where: {
              orderId: existingOrder.id,
              type: "IN",
            },
          });
        }
      }

      await tx.order.update({
        where: { id: validated.orderId },
        data: {
          status: validated.status,
          adminNotes: adminNotesUpdate || undefined,
          ...(soldAtUpdate !== undefined ? { soldAt: soldAtUpdate } : {}),
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${validated.orderId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/finance");

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
 * Server Action cập nhật giá vốn (costPrice) của một dòng sản phẩm trong đơn hàng — CHỈ DÀNH CHO ADMIN
 */
export async function updateOrderItemCostAction(
  input: UpdateOrderItemCostInput
): Promise<OrderActionResult> {
  try {
    await requireRole(["ADMIN"]);
    const validated = updateOrderItemCostSchema.parse(input);

    const existingItem = await prisma.orderItem.findUnique({
      where: { id: validated.orderItemId },
      select: { id: true, orderId: true },
    });

    if (!existingItem) {
      return {
        success: false,
        error: "Không tìm thấy dòng sản phẩm trong đơn hàng",
      };
    }

    await prisma.orderItem.update({
      where: { id: validated.orderItemId },
      data: { costPrice: validated.costPrice },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${existingItem.orderId}`);
    revalidatePath("/admin/finance");

    return {
      success: true,
      message: "Đã cập nhật giá vốn sản phẩm thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi cập nhật giá vốn sản phẩm:", err);
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: err.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Đã có lỗi xảy ra khi cập nhật giá vốn!",
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
