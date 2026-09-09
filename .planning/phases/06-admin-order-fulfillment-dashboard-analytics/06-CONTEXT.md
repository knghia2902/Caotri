# Phase 6: Admin Order Fulfillment & Dashboard Analytics - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Giai đoạn này hoàn thiện phân hệ xử lý đơn hàng và bảng điều khiển báo cáo cho Quản trị viên (Admin) và Nhân viên (Staff):
- **Dashboard Analytics (`/admin`)**: Hiển thị thẻ thống kê tổng quan (Doanh thu thực tế, Doanh thu đang xử lý, Số đơn mới cần xử lý, Tổng sản phẩm trong kho), Biểu đồ thanh doanh thu 7 ngày gần nhất, và Bảng 5-10 đơn hàng mới nhất cần xử lý kèm trạng thái.
- **Danh sách Đơn hàng (`/admin/orders`)**: Bảng quản lý đơn hàng chuẩn Clean Tech Minimalist; Dãy Tabs lọc trạng thái kèm số đếm thời gian thực (`Tất cả`, `Chờ xử lý`, `Đã liên hệ`, `Đang giao`, `Hoàn thành`, `Đã hủy`); Thanh tìm kiếm nhanh theo Mã đơn (`#DH-XXXXXX`), SĐT, Tên khách; Phân trang (Pagination 10 đơn/trang); Đổi trạng thái nhanh trực tiếp trên từng dòng qua Dropdown Selector.
- **Chi tiết Đơn hàng (`/admin/orders/[id]`)**: Xem thông tin đầy đủ người nhận, danh sách linh kiện đặt mua kèm hình ảnh, đơn giá, tổng tiền; Bộ công cụ liên hệ khách hàng (Nút gọi điện `tel:`, Nút mở chat Zalo trực tiếp với khách `zalo.me/[phone]`, Nút In phiếu giao hàng print-friendly); Ô Ghi chú nội bộ (Staff/Admin Notes) để lưu mã vận đơn hoặc lịch sử tư vấn; Hộp thoại xác nhận (AlertDialog) khi chuyển sang trạng thái "Đã hủy" (CANCELLED).
- **Kiểm thử & Nghiệm thu v1.0**: Kiểm thử tự động luồng chuyển trạng thái đơn hàng trong CSDL, kiểm tra phân quyền RBAC (Staff có quyền xem/sửa đơn, cập nhật trạng thái), nghiệm thu toàn diện v1.0.

</domain>

<decisions>
## Implementation Decisions

### 1. Bảng điều khiển & Thống kê (Dashboard Analytics)
- **D-01 (Revenue Metrics):** Tách bạch 2 chỉ số doanh thu rõ ràng:
  - **Doanh thu thực tế (COMPLETED):** Chỉ tính tổng tiền của các đơn hàng đã giao thành công (`status = "COMPLETED"`).
  - **Doanh thu đang xử lý:** Tổng tiền các đơn đang trong tiến trình (`PENDING`, `CONTACTED`, `SHIPPING`) để nắm bắt doanh số tiềm năng.
  - **Đơn hàng mới:** Đếm số lượng đơn ở trạng thái `PENDING` cần xử lý ngay lập tức.
- **D-02 (Dashboard Visualization):**
  - Khối thẻ thống kê (Stat Cards) trực quan có icon và tỷ lệ tăng trưởng.
  - Biểu đồ thanh SVG (Bar Chart) tinh gọn biểu diễn doanh thu 7 ngày gần nhất, phong cách Flat Minimal Clean Tech, tải siêu nhẹ không phụ thuộc thư viện nặng.
  - Bảng 5-10 đơn hàng mới nhất cần xử lý kèm badge trạng thái và nút xem nhanh.

### 2. Quy trình & Thao tác Trạng thái Đơn hàng (Order Status Workflow)
- **D-03 (Status Flow):** Hệ thống hỗ trợ 5 trạng thái chuẩn:
  - `PENDING`: Chờ xử lý (đơn mới đặt từ web).
  - `CONTACTED`: Đã liên hệ (đã gọi điện/chat Zalo chốt thông tin).
  - `SHIPPING`: Đang giao hàng (đã đóng gói hoặc bàn giao shipper/đơn vị vận chuyển).
  - `COMPLETED`: Hoàn thành (khách đã nhận hàng và thanh toán thành công).
  - `CANCELLED`: Đã hủy (khách đổi ý, trùng đơn, hoặc không liên lạc được).
- **D-04 (Quick Status Update):** Cho phép đổi trạng thái đơn hàng bằng Dropdown Selector trực tiếp ngay trên từng dòng của bảng danh sách `/admin/orders` VÀ cả bên trong trang chi tiết `/admin/orders/[id]`, cập nhật tức thì qua Server Action kèm Sonner Toast phản hồi.
- **D-05 (Safe Cancellation):** Khi chuyển sang trạng thái "Đã hủy" (CANCELLED), hiển thị hộp thoại xác nhận (AlertDialog) kèm lý do tùy chọn (Khách hủy qua Zalo, Sai số điện thoại, Trùng đơn, v.v.) để tránh thao tác nhầm lẫn.

### 3. Giao diện & Bộ lọc Danh sách Đơn hàng (Order List & Filtering)
- **D-06 (Status Tabs with Counters):** Dãy Tabs ngang phong cách Clean Tech gồm: `Tất cả`, `Chờ xử lý (PENDING)`, `Đã liên hệ (CONTACTED)`, `Đang giao (SHIPPING)`, `Hoàn thành (COMPLETED)`, `Đã hủy (CANCELLED)`. Mỗi Tab hiển thị Badge số lượng đơn theo thời gian thực.
- **D-07 (Instant Search & Pagination):**
  - Thanh tìm kiếm lọc theo Mã đơn hàng (`#DH-XXXXXX`), Số điện thoại khách hàng hoặc Tên khách hàng.
  - Phân trang chuẩn bảng quản trị (Pagination 10 đơn hàng/trang) với nút Trang trước / Trang sau và tổng số trang/đơn hàng.

### 4. Trang Chi tiết Đơn hàng & Chăm sóc Khách hàng (Order Detail & Actions)
- **D-08 (1-Click Contact Actions):** Trang chi tiết đơn hàng `/admin/orders/[id]` trang bị bộ nút hành động tiện lợi cho nhân viên:
  - **Nút Gọi điện:** `tel:[customerPhone]` hỗ trợ click-to-call ngay trên điện thoại hoặc phần mềm gọi thoại.
  - **Nút Mở chat Zalo:** `https://zalo.me/[customerPhone]` mở ứng dụng Zalo để nhân viên nhắn tin trao đổi, gửi ảnh thực tế linh kiện hoặc thông báo mã vận đơn cho khách.
  - **Nút In phiếu giao hàng:** Mở chế độ in (Print-friendly view) tối giản chứa đầy đủ mã đơn, thông tin người nhận, danh sách linh kiện và tổng thu để dán trực tiếp lên hộp hàng gear.
- **D-09 (Staff/Admin Notes):** Cung cấp ô ghi chú nội bộ (Staff/Admin Notes) để nhân viên lưu mã vận đơn vận chuyển (GHTK, GHN, Viettel Post...) hoặc ghi chú tiến độ tư vấn, độc lập với phần ghi chú của khách hàng.

### the agent's Discretion
- Tạo component `OrderStatusBadge` tái sử dụng thống nhất màu sắc theo phong cách Minimal Editorial:
  - `PENDING`: Badge màu vàng/amber (`bg-amber-50 text-amber-700 border-amber-200`).
  - `CONTACTED`: Badge màu xanh dương cyan/blue (`bg-blue-50 text-blue-700 border-blue-200`).
  - `SHIPPING`: Badge màu tím/indigo (`bg-indigo-50 text-indigo-700 border-indigo-200`).
  - `COMPLETED`: Badge màu xanh lá (`bg-emerald-50 text-emerald-700 border-emerald-200`).
  - `CANCELLED`: Badge màu xám/đỏ nhạt (`bg-zinc-100 text-zinc-600 border-zinc-200`).
- Tối ưu giao diện in ấn bằng CSS media query `@media print` ẩn sidebar và header quản trị khi bấm In.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & Architecture
- `DESIGN.md` §18 (Admin Dashboard), §19 (Admin Orders) — Quy chuẩn hiển thị bảng quản trị, thanh điều hướng và badge trạng thái
- `.planning/PROJECT.md` — Mục tiêu cốt lõi của hệ thống bán gaming gear
- `.planning/REQUIREMENTS.md` §Admin Orders & Dashboard Analytics (ORDER-01 → ORDER-04) — 4 yêu cầu kỹ thuật chi tiết
- `prisma/schema.prisma` — Schema model `Order` và `OrderItem`
- `src/lib/auth.ts` — Phân quyền RBAC cho ADMIN và STAFF (cả 2 đều có quyền xử lý đơn hàng theo AUTH-03)
- `src/types/index.ts` — Định nghĩa types cho Order và UserRole

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx`: Card và CardContent cho Stat Cards
- `src/components/ui/badge.tsx`: Badge hiển thị trạng thái
- `src/components/ui/button.tsx`: Button đen primary `#111` và secondary trắng
- `src/components/admin/sidebar.tsx`: Đã có sẵn liên kết `/admin/orders` cho cả ADMIN và STAFF
- `src/lib/prisma.ts`: Database client cho Server Actions
- `src/lib/utils.ts`: Hàm `formatPrice` / `formatVND` và `cn()`

### Established Patterns
- Server Actions trong `src/app/actions/` có xác thực Zod và kiểm tra quyền qua `getCurrentSession` hoặc `requireRole`
- Bảng quản trị Flat Minimal với border `#E7E7E3`, text `#111` và hover `#F7F7F5`
- Phản hồi Toast với `sonner`

### Integration Points
- `src/app/admin/(dashboard)/page.tsx`: Cập nhật trang Dashboard chính với các thẻ doanh thu, biểu đồ thanh và danh sách đơn mới
- `src/app/admin/(dashboard)/orders/page.tsx` (mới): Trang danh sách đơn hàng có tabs lọc, tìm kiếm và phân trang
- `src/app/admin/(dashboard)/orders/[id]/page.tsx` (mới): Trang chi tiết đơn hàng, cập nhật trạng thái, ghi chú và in phiếu
- `src/app/actions/order.ts`: Bổ sung Server Actions cập nhật trạng thái đơn hàng (`updateOrderStatusAction`) và cập nhật ghi chú (`updateOrderNotesAction`)

</code_context>

<specifics>
## Specific Ideas

- Nút mở Zalo trực tiếp bằng SĐT của khách (`https://zalo.me/${customerPhone}`) là giải pháp cực kỳ thực chiến cho shop gaming gear tại Việt Nam, giúp nhân viên không phải gõ tay SĐT vào điện thoại để tìm Zalo khách.
- Bản in phiếu giao hàng (`window.print()`) được thiết kế tối giản, loại bỏ hoàn toàn các nút bấm và menu khi in ấn, chỉ giữ lại phiếu đơn hàng với đầy đủ barcode/mã đơn và thông tin chuyển phát.

</specifics>

<deferred>
## Deferred Ideas

- Tích hợp API tự động đẩy đơn sang các hãng vận chuyển (GHTK / Viettel Post / GHN) — thuộc Milestone v2.0.
- Tự động gửi tin nhắn Zalo ZNS / SMS Brandname thông báo trạng thái đơn hàng cho khách — thuộc Milestone v2.0.

</deferred>

---

*Phase: 06-admin-order-fulfillment-dashboard-analytics*
*Context gathered: 2026-09-09*
