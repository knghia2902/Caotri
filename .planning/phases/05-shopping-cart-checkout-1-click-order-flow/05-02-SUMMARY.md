# Plan 05-02 Summary: One-page Cart & Guest Checkout Page

**Phase:** 05-shopping-cart-checkout-1-click-order-flow
**Plan:** 05-02
**Wave:** 2
**Status:** Completed
**Requirements Addressed:** CART-02, CART-04, CART-05

## Completed Work
1. **Cart Item Row Component (`src/components/cart/cart-item-row.tsx`)**:
   - Giao diện Flat Minimal với ảnh 80x80 trên nền `#F3F3F1`, tên sản phẩm kèm link, giá format VNĐ sắc nét.
   - Stepper số lượng (+/-) tăng giảm số lượng tức thì, nút xóa rác (`Trash2`) màu muted hover đỏ.
   - Ngăn cách giữa các item bằng đường kẻ mảnh `border-b border-[#E7E7E3]`.

2. **Server Action Đặt hàng (`src/app/actions/order.ts`)**:
   - Cài đặt thư viện `zod` xác thực dữ liệu chặt chẽ (`checkoutSchema`).
   - Kiểm tra định dạng số điện thoại Việt Nam (10 chữ số đầu 03/05/07/08/09), họ tên tối thiểu 2 ký tự, địa chỉ chi tiết tối thiểu 5 ký tự.
   - Hàm `generateOrderNumber()` tạo mã đơn dạng `#DH-XXXXXX` ngẫu nhiên duy nhất.
   - Giao dịch `prisma.$transaction` tạo bản ghi `Order` và các `OrderItem` tương ứng an toàn.

3. **Form Thanh toán Nhanh (`src/components/cart/checkout-form.tsx`)**:
   - Form thông tin người nhận không cần đăng nhập (Họ tên, SĐT, Địa chỉ, Ghi chú).
   - Bảng tóm tắt thanh toán: Tạm tính, Phí vận chuyển (Miễn phí), Tổng thanh toán to đậm.
   - Nút hành động chính cao 48px nền đen `#111`, trạng thái loading `isPending`, tự động dọn giỏ hàng và chuyển hướng khi thành công.

4. **Trang Giỏ hàng One-page Checkout (`src/app/cart/page.tsx` & `src/components/cart/cart-content.tsx`)**:
   - Bố cục 2 cột trên Desktop (Cột trái: Danh sách linh kiện + nút Xóa tất cả; Cột phải: Form thanh toán).
   - Màn hình Giỏ hàng trống tối giản kèm nút "Khám Phá Sản Phẩm Ngay".

## Verification
- `npx tsc --noEmit`: Đạt (không lỗi compile).
