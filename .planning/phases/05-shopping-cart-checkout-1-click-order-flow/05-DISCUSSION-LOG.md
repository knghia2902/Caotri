# Phase 5: Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow - Discussion Log

**Date:** 2026-09-09
**Phase:** 5
**Status:** Completed

---

## Areas Discussed

### 1. Bố cục trang Giỏ hàng & Đặt hàng
- **Options Presented:**
  1. (Recommended) One-page Checkout: Tích hợp cả danh sách món và Form đặt hàng trên cùng 1 trang /cart (Cột trái món hàng, cột phải form đặt hàng nhanh).
  2. Tách riêng 2 trang: Trang xem giỏ hàng (/cart) -> Bấm "Tiến hành đặt hàng" mới sang trang Form thanh toán (/checkout).
- **User Selection:** Option 1 (One-page Checkout).
- **Notes:** Tối ưu số lần nhấp chuột, khách hàng xem lại sản phẩm ngay cạnh thông tin giao hàng giúp tăng tỷ lệ hoàn tất đơn hàng đáng kể.

### 2. Hành vi khi bấm "Thêm vào giỏ hàng"
- **Options Presented:**
  1. (Recommended) Hiện Toast thông báo nhẹ nhàng ở góc kèm nút 'Xem giỏ' (giữ khách ở lại trang tiếp tục mua sắm).
  2. Mở ngăn kéo Giỏ hàng nhanh bên phải (Slide-over Cart Drawer) ngay khi bấm thêm.
  3. Chuyển hướng (redirect) thẳng vào trang /cart ngay lập tức.
- **User Selection:** Option 1 (Hiện Toast Sonner kèm nút hành động xem giỏ).
- **Notes:** Tránh làm phiền khách đang duyệt gear, khách có thể chủ động bấm "Xem giỏ" khi sẵn sàng thanh toán.

### 3. Cấu trúc tin nhắn chốt đơn tự động (Zalo / Facebook)
- **Options Presented:**
  1. (Recommended) Đầy đủ chi tiết: Mã đơn, Tên khách, SĐT, Địa chỉ nhận, Danh sách từng món kèm giá, Tổng tiền thanh toán và Ghi chú.
  2. Tóm gọn: Chỉ gửi Mã đơn hàng, Tên khách, Tổng tiền và link tra cứu đơn.
- **User Selection:** Option 1 (Đầy đủ chi tiết).
- **Notes:** Cung cấp đầy đủ thông tin để cả khách và chủ shop đối chiếu ngay lập tức trong khung chat mà không cần tra cứu thêm.

---

## Builder's Discretion Items
- Quản lý trạng thái client bằng Zustand store với middleware persist lưu vào LocalStorage.
- Tạo mã đơn ngẫu nhiên chuyên nghiệp `#DH-XXXXXX`.
- Tạo nút Sao chép thông tin đơn để dự phòng cho các nền tảng chat khác.
