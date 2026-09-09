# Gaming Gear & Tech Accessories E-Commerce

## What This Is

Hệ thống Website thương mại điện tử chuyên kinh doanh thiết bị linh kiện & gaming gear (chuột, bàn phím, tai nghe, lót chuột, màn hình,...). Hệ thống gồm 2 phân hệ chính: Cửa hàng trực tuyến (Storefront) tối ưu trải nghiệm mua sắm và trang Quản trị (Admin Dashboard) quản lý sản phẩm, đơn hàng, danh mục, banner và phân quyền nhân viên.

## Core Value

Trải nghiệm mua hàng nhanh chóng, mượt mà: khách hàng dễ dàng tìm kiếm, chọn lọc sản phẩm theo nhu cầu, lên đơn tiện lợi với kết nối trực tiếp qua Zalo/Facebook/Hotline; đồng thời Admin quản lý kho hàng và đơn hàng trực quan, hiệu quả.

## Business Context

- **Customer**: Khách hàng cá nhân, game thủ, người dùng văn phòng có nhu cầu mua sắm thiết bị gaming gear và phụ kiện công nghệ.
- **Revenue model**: Bán lẻ sản phẩm phụ kiện, thiết bị máy tính, linh kiện gaming.
- **Success metric**: Tỷ lệ chuyển đổi đơn hàng, thời gian tải trang nhanh, quản trị đơn hàng & kho sản phẩm thuận tiện.
- **Strategy notes**: Tối ưu SEO cho sản phẩm, hiển thị trực quan và hỗ trợ liên hệ chốt đơn đa kênh (Zalo, Facebook, Hotline).

## Requirements

### Validated

- [x] **Foundation & Data Architecture**: Khởi tạo dự án Next.js 15 App Router, TypeScript, Tailwind Clean Tech theme, Prisma ORM với 7 models quan hệ và nạp Seed Data 6 danh mục, 17 sản phẩm gaming thực tế. (*Validated in Phase 1: Project Scaffolding, Theme & Database Setup*)

### Active

- [ ] **Storefront - Trang chủ**: Hero banner slider giới thiệu, khối sản phẩm nổi bật (Featured), sản phẩm mới về (New Arrivals), lưới danh mục sản phẩm trực quan.
- [ ] **Storefront - Danh mục & Sản phẩm**: Phân loại theo ngành hàng (Chuột, Phím, Tai nghe, Lót chuột, Màn hình,...).
- [ ] **Storefront - Tìm kiếm & Lọc**: Tìm kiếm theo tên sản phẩm, lọc theo danh mục, khoảng giá ngân sách, sắp xếp giá (thấp đến cao, cao đến thấp, mới nhất).
- [ ] **Storefront - Chi tiết sản phẩm**: Bộ sưu tập hình ảnh (slider/gallery), tên sản phẩm, thông số kỹ thuật & mô tả chi tiết, giá niêm yết, giá khuyến mãi, trạng thái còn hàng.
- [ ] **Storefront - Giỏ hàng**: Thêm/xóa sản phẩm, tăng giảm số lượng, lưu trữ giỏ hàng trong LocalStorage/Session.
- [ ] **Storefront - Đặt hàng & Chốt đơn**: Form đặt hàng nhanh (Họ tên, SĐT, Địa chỉ, Ghi chú), tạo đơn hàng có mã Order ID vào hệ thống và điều hướng sang Zalo/Facebook/Hotline kèm thông tin đơn hàng để chốt đơn tức thì.
- [ ] **Admin - Dashboard**: Thống kê tổng quan doanh số/đơn hàng, tổng số lượng sản phẩm, trạng thái các đơn hàng gần đây.
- [ ] **Admin - Quản lý sản phẩm**: Thêm, sửa, xóa, tìm kiếm sản phẩm; upload nhiều ảnh, cấu hình giá bán, danh mục, trạng thái nổi bật.
- [ ] **Admin - Quản lý đơn hàng**: Danh sách đơn hàng, xem chi tiết thông tin khách hàng và sản phẩm đặt, cập nhật trạng thái đơn (Chờ xử lý, Đã liên hệ, Đang giao, Đã hoàn thành, Đã hủy).
- [ ] **Admin - Quản lý danh mục**: Tạo, sửa, xóa danh mục sản phẩm, sắp xếp thứ tự hiển thị.
- [ ] **Admin - Quản lý Banner & Nội dung**: Quản lý hình ảnh banner trang chủ, cấu hình thông tin liên hệ (Hotline, link Zalo OA, Fanpage Facebook).
- [ ] **Admin - Phân quyền tài khoản**: Đăng nhập xác thực, phân quyền vai trò Admin (toàn quyền hệ thống) và Staff/Nhân viên (xử lý đơn hàng, cập nhật sản phẩm).

### Out of Scope

- Tích hợp cổng thanh toán trực tuyến tự động (VNPay, MoMo, Stripe) ở v1.0 — Luồng chốt đơn trực tiếp qua Zalo/Facebook/Hotline linh hoạt hơn cho mô hình kinh doanh hiện tại.
- Quản lý kho đa chi nhánh phức tạp (Multi-warehouse) — Giữ quản lý tồn kho tập trung đơn giản ở giai đoạn đầu.
- Hệ thống diễn đàn/bình luận đa cấp phức tạp — Tập trung vào mua bán sản phẩm nhanh chóng.

## Context

- Khách hàng cần một giải pháp hiện đại, giao diện bắt mắt đậm chất công nghệ/gaming gear (dark/light theme hiện đại, clean UI).
- Quy trình đặt hàng hướng tới sự tiện dụng tại thị trường Việt Nam: chốt đơn nhanh qua tin nhắn Zalo và Facebook Messenger.
- Hệ thống hỗ trợ responsive toàn diện (Mobile-first, Tablet, Desktop).

## Constraints

- **Tech Stack**: Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Supabase).
- **Image Storage**: Cloudinary / Supabase Storage tối ưu CDN tải nhanh cho hình ảnh sản phẩm & banner.
- **Authentication**: NextAuth.js / Auth.js hoặc JWT session bảo mật cho phân hệ Admin.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js Fullstack (App Router) | Hiệu năng cao, SEO tốt cho trang bán hàng, API routes tích hợp sẵn | ✓ Validated in Phase 1 |
| Prisma ORM Schema & SQLite Dev | Type-safe quan hệ 7 models, tương thích Postgres | ✓ Validated in Phase 1 |
| Đặt hàng lưu DB + điều hướng Zalo/FB | Đảm bảo Admin lưu vết và thống kê được đơn hàng, đồng thời tối ưu tỷ lệ chốt đơn của khách qua Zalo/FB | — Pending |
| Phân quyền Admin & Staff | Đảm bảo an toàn phân cấp, nhân viên chỉ truy cập phần việc được giao | — Pending (Phase 2) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-09 after Phase 1 completion*
