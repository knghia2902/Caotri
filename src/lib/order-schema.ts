import { z } from "zod";

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
