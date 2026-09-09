# Plan 06-02 Summary: Order List Management, Status Tabs, Search & Status Flow

**Phase:** 06-admin-order-fulfillment-dashboard-analytics
**Plan:** 06-02
**Wave:** 2
**Status:** Completed
**Requirements Addressed:** ORDER-02, ORDER-04

## Completed Work

1. **Server Actions Quản lý Đơn hàng (`src/app/actions/order.ts`)**:
   - `updateOrderStatusAction`: Xác thực phân quyền `requireRole(["ADMIN", "STAFF"])`, kiểm tra Zod schema, chuyển đổi trạng thái (`PENDING`, `CONTACTED`, `SHIPPING`, `COMPLETED`, `CANCELLED`). Khi chọn trạng thái `CANCELLED` có kèm lý do hủy, ghi lại timestamp và tên người thực hiện vào `adminNotes`.
   - `updateOrderNotesAction`: Cho phép nhân viên lưu hoặc bổ sung ghi chú nội bộ cho đơn hàng.
   - `revalidatePath` đồng bộ lại `/admin/orders`, `/admin`, và `/admin/orders/[id]`.

2. **Component Badge Trạng thái (`src/components/admin/order-status-badge.tsx`)**:
   - Thiết kế chuẩn Clean Tech Minimalist: `PENDING` (hổ phách nhạt), `CONTACTED` (xanh dương nhạt), `SHIPPING` (tím nhạt), `COMPLETED` (xanh lá nhạt), `CANCELLED` (xám nhạt).

3. **Hộp thoại Hủy Đơn An toàn (`src/components/admin/cancel-order-dialog.tsx`)**:
   - Modal xác nhận hủy đơn ngăn ngừa thao tác nhầm lẫn.
   - Hỗ trợ chọn nhanh các lý do phổ biến ("Khách đổi ý qua Zalo", "Không liên lạc được", "Trùng đơn hàng", "Sai số điện thoại/địa chỉ") và textarea nhập chi tiết.

4. **Bảng Quản lý Đơn hàng Toàn diện (`src/components/admin/order-table.tsx`)**:
   - Dãy Tabs trạng thái ngang với số đếm đơn hàng thời gian thực (Tất cả, Chờ xử lý, Đã liên hệ, Đang giao, Hoàn thành, Đã hủy).
   - Thanh tìm kiếm đa trường (mã đơn, SĐT, tên khách) kèm nút xóa nhanh.
   - Dropdown đổi trạng thái trực tiếp trên từng dòng bảng; tự động chặn và hiển thị CancelOrderDialog khi người dùng chọn "Hủy đơn hàng".
   - Phân trang chuẩn 10 đơn/trang với nút Trang trước / Trang sau và hiển thị tổng số đơn.
   - Nút hành động nhanh 1-click: Gọi điện (`tel:`) và nhắn tin Zalo (`https://zalo.me/[phone]`).

5. **Trang Quản lý Đơn hàng (`src/app/admin/(dashboard)/orders/page.tsx`)**:
   - Kết nối Prisma ORM, kiểm tra phiên phân quyền `ADMIN` hoặc `STAFF`.
   - Phân tích linh hoạt URL searchParams (`status`, `q`, `page`), thực hiện truy vấn song song qua `Promise.all` không gây nghẽn SSR.

## Verification
- `npx tsc --noEmit`: 100% Typecheck passed không lỗi.
- Đảm bảo tuân thủ thiết kế Clean Tech Minimalist và mô hình bảo mật RBAC.
