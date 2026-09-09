# Plan 06-01 Summary: Dashboard Analytics & SVG Bar Chart

**Phase:** 06-admin-order-fulfillment-dashboard-analytics
**Plan:** 06-01
**Wave:** 1
**Status:** Completed
**Requirements Addressed:** ORDER-01

## Completed Work
1. **Prisma Schema Update & Database Push (`prisma/schema.prisma`)**:
   - Thêm trường `adminNotes String?` vào model `Order` phục vụ ghi chú nội bộ của nhân viên (per D-09).
   - Đã chạy `npx prisma db push` đồng bộ cấu trúc CSDL SQLite và tái tạo `@prisma/client`.

2. **Module Phân tích Doanh thu (`src/lib/order-analytics.ts`)**:
   - Hàm `computeDailyRevenue` nhóm doanh số theo 7 ngày liên tiếp (hôm nay + 6 ngày trước), tính toán cả Doanh thu thực tế (COMPLETED), Doanh thu đang xử lý (PENDING/CONTACTED/SHIPPING) và số lượng đơn, hoạt động độc lập không phụ thuộc SQL dialect.

3. **Biểu đồ thanh thuần SVG (`src/components/admin/revenue-bar-chart.tsx`)**:
   - Vẽ biểu đồ cột responsive chuẩn Clean Tech Minimalist không cần thư viện bên thứ ba (0 KB bundle size, zero hydration mismatch).
   - Hiển thị trục Y làm tròn triệu VNĐ, đường lưới mờ `#E7E7E3`, nhãn ngày tháng kèm thứ, hiệu ứng hover với tooltip chi tiết.

4. **Nâng cấp Trang Admin Dashboard (`src/app/admin/(dashboard)/page.tsx`)**:
   - Thực thi các truy vấn CSDL đồng thời không gây waterfall SSR qua `Promise.all`.
   - Hiển thị khối 4 Stat Cards: Doanh thu thực tế (đã thu hoàn tất), Doanh thu đang xử lý (tiềm năng), Đơn mới cần xử lý (với link "Xử lý ngay"), Sản phẩm đang kinh doanh.
   - Nhúng biểu đồ doanh thu 7 ngày và bảng danh sách đơn hàng gần đây với mã đơn, khách hàng, số món, tổng tiền và badge trạng thái.

## Verification
- `npx prisma db push`: Đồng bộ CSDL thành công.
- `npx tsc --noEmit`: Typecheck thành công 0 lỗi.
