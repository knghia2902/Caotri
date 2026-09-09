# Phase 6: Admin Order Fulfillment & Dashboard Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 06-admin-order-fulfillment-dashboard-analytics
**Areas discussed:** Trực quan hóa Dashboard Analytics, Quy trình Quản lý Trạng thái Đơn hàng, Giao diện & Bộ lọc Danh sách Đơn hàng, Trang Chi tiết Đơn hàng & Hỗ trợ Liên hệ Khách

---

## Trực quan hóa Dashboard Analytics

| Option | Description | Selected |
|--------|-------------|:--------:|
| Tách bạch Doanh thu thực tế & Doanh thu tiềm năng | Tách bạch 2 chỉ số: Doanh thu thực tế (đã hoàn thành - COMPLETED) và Doanh thu đang xử lý (tổng các đơn PENDING/CONTACTED/SHIPPING), cùng số đơn mới cần xử lý ngay | ✓ |
| Chỉ tính 1 số Doanh thu duy nhất | Tổng tiền của tất cả các đơn hàng chưa bị hủy | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Stat Cards + Biểu đồ thanh SVG + Bảng đơn hàng gần đây | Thẻ thống kê + Biểu đồ thanh (SVG Bar Chart) doanh thu theo ngày/tháng + Bảng 5-10 đơn hàng mới nhất cần xử lý kèm trạng thái | ✓ |
| Chỉ Thẻ thống kê + Bảng danh sách đơn | Không có biểu đồ, chỉ dùng thẻ số liệu và bảng danh sách đơn | |

**User's choice:** Tách bạch 2 chỉ số doanh thu; Bố cục kết hợp Stat Cards, Biểu đồ thanh 7 ngày gần nhất và Bảng đơn hàng mới nhất cần xử lý.

---

## Quy trình Quản lý Trạng thái Đơn hàng

| Option | Description | Selected |
|--------|-------------|:--------:|
| Dropdown Selector nhanh trên bảng VÀ trang chi tiết | Cho phép đổi trạng thái nhanh bằng Dropdown Selector ngay trên dòng của bảng danh sách đơn hàng VÀ cả trong trang chi tiết đơn hàng | ✓ |
| Chỉ đổi trạng thái trong trang chi tiết | Bắt buộc mở trang chi tiết đơn hàng `/admin/orders/[id]` mới được cập nhật trạng thái | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Xác nhận AlertDialog khi hủy đơn | Hiển thị hộp thoại xác nhận nhanh (AlertDialog) kèm lý do tùy chọn khi chuyển sang CANCELLED | ✓ |
| Đổi trạng thái trực tiếp kèm Toast Undo | Chuyển trực tiếp với Sonner toast và nút Undo | |

**User's choice:** Thao tác đổi trạng thái nhanh ngay trên dòng bảng; Bắt buộc có hộp thoại xác nhận khi hủy đơn.

---

## Giao diện & Bộ lọc Danh sách Đơn hàng

| Option | Description | Selected |
|--------|-------------|:--------:|
| Dãy Tabs ngang Clean Tech có Badge số lượng | Tabs: Tất cả, Chờ xử lý, Đã liên hệ, Đang giao, Hoàn thành, Đã hủy có Badge hiển thị số lượng đơn thời gian thực | ✓ |
| Dropdown filter + Date range picker | Lọc theo dropdown và chọn khoảng ngày | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Pagination 10 đơn/trang chuẩn admin | Phân trang chuẩn bảng quản trị với bộ nút Trang trước / Trang sau và hiển thị tổng số đơn | ✓ |
| Scrollable table 50 đơn | Cuộn dọc bảng dữ liệu không phân trang | |

**User's choice:** Tabs trạng thái Clean Tech kèm badge số đếm thời gian thực; Phân trang chuẩn 10 đơn/trang.

---

## Trang Chi tiết Đơn hàng & Hỗ trợ Liên hệ Khách

| Option | Description | Selected |
|--------|-------------|:--------:|
| Đầy đủ bộ công cụ 1-Click: Gọi điện, Chat Zalo, In phiếu | Nút Gọi điện (tel), Nút Mở chat Zalo với khách (zalo.me/sđt), và Nút In phiếu giao hàng (Print view tối giản để dán lên kiện gear) | ✓ |
| Chỉ hiển thị thông tin cơ bản | Không tích hợp nút chat Zalo hay nút In phiếu | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Có ô Ghi chú nội bộ (Staff/Admin Notes) | Để nhân viên lưu mã vận đơn (GHTK/GHN) hoặc lịch sử tư vấn, độc lập với ghi chú của khách | ✓ |
| Chỉ dùng ghi chú của khách | Không cần ô ghi chú nội bộ | |

**User's choice:** Tích hợp bộ công cụ liên hệ nhanh (Gọi điện, Chat Zalo với khách, In phiếu dán thùng hàng); Hỗ trợ ô Ghi chú nội bộ (Staff Notes).

---

## the agent's Discretion

- Thiết kế component `OrderStatusBadge` tái sử dụng thống nhất mã màu (Vàng PENDING, Xanh dương CONTACTED, Tím SHIPPING, Xanh lá COMPLETED, Xám CANCELLED).
- Tối ưu bản in phiếu đóng gói hàng với CSS print (`@media print`).

## Deferred Ideas

- Tích hợp API tự động đẩy đơn sang các đơn vị vận chuyển (GHTK / Viettel Post / GHN) — thuộc Milestone v2.0.
- Tự động gửi tin nhắn Zalo ZNS / SMS Brandname cập nhật trạng thái đơn cho khách — thuộc Milestone v2.0.
