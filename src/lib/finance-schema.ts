import { z } from "zod";

export const ORDER_CHANNELS = [
  "WEB",
  "OFFLINE",
  "ZALO",
  "FACEBOOK",
  "OTHER",
] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const ORDER_CHANNEL_LABELS: Record<OrderChannel, string> = {
  WEB: "Website",
  OFFLINE: "Tại cửa hàng",
  ZALO: "Zalo",
  FACEBOOK: "Facebook",
  OTHER: "Kênh khác",
};

export const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "COD",
  "OTHER",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Tiền mặt",
  BANK_TRANSFER: "Chuyển khoản",
  COD: "Thu hộ (COD)",
  OTHER: "Khác",
};

export const CASHFLOW_TYPES = ["IN", "OUT"] as const;
export type CashflowType = (typeof CASHFLOW_TYPES)[number];

export const CASHFLOW_TYPE_LABELS: Record<CashflowType, string> = {
  IN: "Thu",
  OUT: "Chi",
};

export const CASHFLOW_IN_CATEGORIES = [
  "ORDER_SALE",
  "OFFLINE_SALE",
  "OTHER_IN",
] as const;
export type CashflowInCategory = (typeof CASHFLOW_IN_CATEGORIES)[number];

export const CASHFLOW_OUT_CATEGORIES = [
  "INVENTORY_IMPORT",
  "SHIPPING",
  "MARKETING",
  "OPERATING",
  "SALARY",
  "REFUND",
  "OTHER_OUT",
] as const;
export type CashflowOutCategory = (typeof CASHFLOW_OUT_CATEGORIES)[number];

export const CASHFLOW_CATEGORIES = [
  ...CASHFLOW_IN_CATEGORIES,
  ...CASHFLOW_OUT_CATEGORIES,
] as const;
export type CashflowCategory = (typeof CASHFLOW_CATEGORIES)[number];

/**
 * Các hạng mục chi phí vận hành được trừ vào Lợi nhuận ròng (P&L).
 * KHÔNG bao gồm INVENTORY_IMPORT (tránh tính trùng với Giá vốn hàng bán COGS)
 * và KHÔNG bao gồm REFUND (đơn hủy đã bị loại khỏi doanh thu COMPLETED).
 */
export const OPERATING_EXPENSE_CATEGORIES: readonly CashflowOutCategory[] = [
  "SHIPPING",
  "MARKETING",
  "OPERATING",
  "SALARY",
  "OTHER_OUT",
] as const;

export const CASHFLOW_CATEGORY_LABELS: Record<CashflowCategory, string> = {
  ORDER_SALE: "Thu đơn hàng Web",
  OFFLINE_SALE: "Thu bán lẻ / Offline",
  OTHER_IN: "Thu nhập khác",
  INVENTORY_IMPORT: "Nhập hàng / Thu mua 2nd",
  SHIPPING: "Phí vận chuyển / Đóng gói",
  MARKETING: "Quảng cáo / Marketing",
  OPERATING: "Chi phí vận hành (Mặt bằng, Điện, Net...)",
  SALARY: "Lương / Thưởng nhân viên",
  REFUND: "Hoàn tiền đơn hủy",
  OTHER_OUT: "Chi phí khác",
};

export function getChannelLabel(channel?: string | null): string {
  if (!channel) return ORDER_CHANNEL_LABELS.WEB;
  return (
    ORDER_CHANNEL_LABELS[channel as OrderChannel] ?? channel
  );
}

export function getPaymentMethodLabel(method?: string | null): string {
  if (!method) return PAYMENT_METHOD_LABELS.COD;
  return (
    PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method
  );
}

export function getCashflowCategoryLabel(category?: string | null): string {
  if (!category) return "";
  return (
    CASHFLOW_CATEGORY_LABELS[category as CashflowCategory] ?? category
  );
}

export const offlineOrderItemSchema = z.object({
  productId: z.string().min(1).optional().nullable(),
  productName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên sản phẩm")
    .max(200, "Tên sản phẩm tối đa 200 ký tự"),
  price: z.number().min(0, "Giá bán không được âm"),
  costPrice: z.number().min(0, "Giá vốn không được âm").optional().nullable(),
  quantity: z.number().int().min(1, "Số lượng tối thiểu là 1"),
  markOutOfStock: z.boolean().optional(),
});

export type OfflineOrderItemInput = z.infer<typeof offlineOrderItemSchema>;

export const createOfflineOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .max(100, "Tên khách hàng tối đa 100 ký tự")
    .optional()
    .default("Khách lẻ"),
  customerPhone: z
    .string()
    .trim()
    .max(30, "Số điện thoại tối đa 30 ký tự")
    .optional()
    .default(""),
  customerAddress: z
    .string()
    .trim()
    .max(255, "Địa chỉ tối đa 255 ký tự")
    .optional()
    .default("Mua trực tiếp tại cửa hàng"),
  customerNotes: z
    .string()
    .trim()
    .max(500, "Ghi chú khách tối đa 500 ký tự")
    .optional()
    .nullable(),
  adminNotes: z
    .string()
    .trim()
    .max(2000, "Ghi chú nội bộ tối đa 2000 ký tự")
    .optional()
    .nullable(),
  channel: z.enum(ORDER_CHANNELS).default("OFFLINE"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
  discount: z.number().min(0, "Giảm giá không được âm").default(0),
  shippingFee: z.number().min(0, "Phí ship không được âm").default(0),
  soldAt: z.string().optional().nullable(),
  completeImmediately: z.boolean().default(true),
  items: z
    .array(offlineOrderItemSchema)
    .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
});

export type CreateOfflineOrderInput = z.input<typeof createOfflineOrderSchema>;

const cashflowBaseSchema = z.object({
  type: z.enum(CASHFLOW_TYPES),
  category: z.enum(CASHFLOW_CATEGORIES),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("CASH"),
  occurredAt: z.string().optional().nullable(),
  note: z
    .string()
    .trim()
    .max(1000, "Ghi chú tối đa 1000 ký tự")
    .optional()
    .nullable(),
});

function validateCategoryMatchesType(data: {
  type: CashflowType;
  category: CashflowCategory;
}): boolean {
  if (data.type === "IN") {
    return (CASHFLOW_IN_CATEGORIES as readonly string[]).includes(data.category);
  }
  return (CASHFLOW_OUT_CATEGORIES as readonly string[]).includes(data.category);
}

export const cashflowEntrySchema = cashflowBaseSchema.refine(
  validateCategoryMatchesType,
  {
    message: "Danh mục thu/chi không khớp với loại phiếu",
    path: ["category"],
  }
);

export type CashflowEntryInput = z.input<typeof cashflowEntrySchema>;

export const updateCashflowEntrySchema = cashflowBaseSchema
  .extend({
    id: z.string().min(1, "Thiếu mã phiếu thu/chi"),
  })
  .refine(validateCategoryMatchesType, {
    message: "Danh mục thu/chi không khớp với loại phiếu",
    path: ["category"],
  });

export type UpdateCashflowEntryInput = z.input<typeof updateCashflowEntrySchema>;

export const updateOrderItemCostSchema = z.object({
  orderItemId: z.string().min(1, "Thiếu mã dòng sản phẩm"),
  costPrice: z.number().min(0, "Giá vốn không được âm").nullable(),
});

export type UpdateOrderItemCostInput = z.infer<typeof updateOrderItemCostSchema>;
