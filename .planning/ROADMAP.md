# Roadmap: Gaming Gear & Tech Accessories E-Commerce

## Overview

Hệ thống Website bán linh kiện và Gaming Gear được phát triển theo lộ trình 6 Phase chuẩn hóa: Thiết lập nền tảng dự án và cơ sở dữ liệu -> Xây dựng hệ thống bảo mật & phân quyền Admin -> Phát triển bộ công cụ quản trị sản phẩm & banner -> Xây dựng giao diện cửa hàng (Storefront) tối ưu tìm kiếm & hiển thị -> Hoàn thiện giỏ hàng và luồng đặt hàng chốt đơn qua Zalo/Facebook -> Xây dựng phân hệ xử lý đơn hàng và Dashboard thống kê.

## Phases

- [x] **Phase 1: Project Scaffolding, Theme & Database Setup** - Khởi tạo Next.js, cấu hình Tailwind gaming theme, tạo Prisma schema quan hệ và seed dữ liệu mẫu phong phú. (completed 2026-09-09)
- [x] **Phase 2: Authentication & Admin RBAC** - Đăng nhập quản trị an toàn, Next.js Middleware bảo vệ route `/admin/*`, phân quyền 2 cấp độ Admin và Staff. (completed 2026-09-09)
- [x] **Phase 3: Admin Catalog & Content Management** - Quản lý CRUD Danh mục, Sản phẩm (nhiều ảnh, giá, specs), upload ảnh qua CDN, quản lý Banner slider và thông tin liên hệ. (completed 2026-09-09)
- [ ] **Phase 4: Storefront Discovery & Browsing Experience** - Trang chủ hấp dẫn, danh mục gear, tìm kiếm theo tên, bộ lọc theo tầm giá, trang chi tiết sản phẩm và dock liên hệ nhanh.
- [ ] **Phase 5: Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow** - Giỏ hàng không lỗi hydration, form đặt hàng nhanh guest checkout, tạo mã đơn hàng và nút 1-click chuyển tiếp chat Zalo/FB.
- [ ] **Phase 6: Admin Order Fulfillment & Dashboard Analytics** - Quản lý trạng thái đơn hàng (Mới -> Đã liên hệ -> Giao hàng -> Hoàn thành), thống kê doanh số & đơn hàng tại Dashboard, nghiệm thu dự án.

## Phase Details

### Phase 1: Project Scaffolding, Theme & Database Setup

**Goal**: Khởi tạo nền tảng mã nguồn Next.js App Router, thiết lập phong cách giao diện gaming hiện đại và cấu hình cơ sở dữ liệu quan hệ PostgreSQL với Prisma.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):

  1. Dự án Next.js 14/15 khởi chạy thành công với TypeScript và Tailwind CSS.
  2. Database PostgreSQL kết nối thông suốt qua Prisma ORM với đầy đủ bảng: Users, Categories, Products, Orders, OrderItems, Banners, SiteSettings.
  3. Lệnh Seed Data chạy thành công, nạp sẵn danh mục phụ kiện gaming (Chuột, Phím, Tai nghe, Lót chuột, Màn hình) và tài khoản quản trị ban đầu.

**Plans**: 3 plans

Plans:
**Wave 1**

- [x] 01-01: Khởi tạo Next.js App Router, TypeScript, Tailwind CSS và thiết kế theme Clean Tech Minimalist.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02: Thiết lập Prisma ORM, cấu hình Schema quan hệ đầy đủ (SQLite dev) và tạo singleton client.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03: Viết script Seed Data nạp 6 danh mục, 15-20 sản phẩm demo và tài khoản admin/staff mặc định.

### Phase 2: Authentication & Admin RBAC

**Goal**: Xây dựng hệ thống xác thực bảo mật và phân quyền vai trò (Admin / Staff) cho phân hệ quản trị.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):

  1. Người dùng có thể đăng nhập an toàn vào `/admin/login` với email và mật khẩu được mã hóa bcrypt.
  2. Toàn bộ các route `/admin/*` được bảo vệ bằng Middleware; truy cập không hợp lệ sẽ bị chuyển hướng về login.
  3. Phân quyền hoạt động chuẩn xác: Admin có toàn quyền, Staff chỉ có quyền xem/sửa đơn hàng và cập nhật sản phẩm.

**Plans**: 3 plans

Plans:
**Wave 1**

- [x] 02-01: Cài đặt jose, xây dựng core auth library và server actions (login/logout/getCurrentUser) kèm test script.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02: Thiết lập Edge Middleware bảo vệ `/admin/*` và xây dựng trang đăng nhập `/admin/login` Split Screen 2 cột kèm nút demo quick-fill.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03: Xây dựng Admin Layout, Collapsible Sidebar, Top Header và helper requireRole phân quyền 2 lớp (ADMIN/STAFF).

### Phase 3: Admin Catalog & Content Management

**Goal**: Cung cấp công cụ quản trị mạnh mẽ để thêm, sửa, xóa danh mục, sản phẩm với thư viện ảnh, quản lý banner slider và nội dung hotline/zalo.
**Depends on**: Phase 2
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):

  1. Admin/Staff có thể thực hiện CRUD danh mục sản phẩm (tên, slug, ảnh đại diện).
  2. Admin/Staff có thể thêm, sửa, xóa sản phẩm với nhiều hình ảnh, cấu hình giá niêm yết, giá sale, thông số kỹ thuật (specs) và toggle "Nổi bật".
  3. Hình ảnh sản phẩm và banner được tải lên và lưu trữ tối ưu qua Cloudinary/Storage CDN.
  4. Quản trị viên có thể thay đổi banner trang chủ và cấu hình SĐT Hotline, link Zalo OA, link Facebook Fanpage.

**Plans**: 3 plans

Plans:
**Wave 1**
- [x] 03-01: Tiện ích slugify tiếng Việt, Server Actions Category và trang quản lý Danh mục dạng bảng + modal dialog.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02: Quản lý Sản phẩm toàn diện (Multiple Images Gallery CDN, Dynamic Tech Specs Presets, Bảng sản phẩm có Quick-Toggle và trang form new/edit).

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 03-03: Quản lý Banners trang chủ dạng Card Grid, trang Cài đặt Cửa hàng (Hotline/Zalo/FB) và script kiểm thử catalog tự động.

### Phase 4: Storefront Discovery & Browsing Experience

**Goal**: Xây dựng giao diện cửa hàng trực tuyến hiện đại, tối ưu tốc độ và trải nghiệm tìm kiếm, lọc sản phẩm cho game thủ.
**Depends on**: Phase 3
**Requirements**: STORE-01, STORE-02, STORE-03, STORE-04, STORE-05, STORE-06
**Success Criteria** (what must be TRUE):

  1. Trang chủ hiển thị banner slider động, lưới danh mục sản phẩm, khối sản phẩm nổi bật và sản phẩm mới về.
  2. Khách hàng có thể lọc danh sách sản phẩm theo danh mục và theo các khoảng giá ngân sách linh hoạt.
  3. Khách hàng có thể tìm kiếm sản phẩm theo từ khóa tên và sắp xếp theo giá tăng/giảm.
  4. Trang chi tiết sản phẩm hiển thị thư viện ảnh chất lượng cao, thông số kỹ thuật rõ ràng và trạng thái còn hàng.
  5. Floating contact dock (Hotline, Zalo, Messenger) luôn hiển thị ở góc màn hình.

**Plans**: 3 plans

Plans:
**Wave 1**
- [ ] 04-01: Storefront Shell (Header, Footer Dark Gaming), Hero Banner Slider tự động chuyển slide, ProductCard và Trang chủ hoàn chỉnh.

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 04-02: Instant Search Popover trên Header, Trang duyệt sản phẩm kết hợp Thanh trượt giá kép (Price Range Slider) và Trang danh mục.

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 04-03: Trang Chi tiết Sản phẩm (Showcase Gallery ảnh, Tabs Mô tả & Bảng Specs kẻ sọc), Floating Quick-Contact Dock (Hotline/Zalo/FB) và script kiểm thử storefront.

### Phase 5: Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow

**Goal**: Cung cấp giỏ hàng mượt mà, form đặt hàng nhanh và luồng chuyển tiếp chốt đơn tiện lợi qua Zalo/Facebook.
**Depends on**: Phase 4
**Requirements**: CART-01, CART-02, CART-03, CART-04, CART-05, CART-06
**Success Criteria** (what must be TRUE):

  1. Khách hàng có thể thêm/xóa sản phẩm, điều chỉnh số lượng trong giỏ hàng; dữ liệu giỏ hàng đồng bộ mượt mà không bị lỗi hydration.
  2. Khách hàng có thể đặt hàng nhanh qua form Họ tên, SĐT, Địa chỉ, Ghi chú với xác thực hợp lệ (Zod).
  3. Đơn hàng được lưu vào Database với mã định danh duy nhất (`#DH-xxxxxx`).
  4. Màn hình xác nhận hiển thị nút "Chốt đơn qua Zalo" và "Chat Facebook" mở ứng dụng chat với tin nhắn soạn sẵn nội dung đơn hàng.

**Plans**: TBD

Plans:

- [ ] 05-01: Triển khai Zustand Cart Store lưu LocalStorage an toàn không lỗi Hydration và giao diện Giỏ hàng.
- [ ] 05-02: Xây dựng Form Checkout đặt hàng nhanh và Server Action lưu Order vào Database.
- [ ] 05-03: Xây dựng Trang Order Success với bộ nút 1-click chuyển tiếp Zalo, Facebook Messenger và sao chép đơn hàng.

### Phase 6: Admin Order Fulfillment & Dashboard Analytics

**Goal**: Hoàn thiện quy trình xử lý đơn hàng cho Admin/Staff, Dashboard báo cáo và nghiệm thu tổng thể dự án.
**Depends on**: Phase 5
**Requirements**: ORDER-01, ORDER-02, ORDER-03, ORDER-04
**Success Criteria** (what must be TRUE):

  1. Bảng điều khiển Dashboard hiển thị trực quan các thẻ số liệu: Tổng số đơn, doanh số dự tính, tổng sản phẩm và biểu đồ tóm tắt.
  2. Danh sách đơn hàng trong trang quản trị cho phép lọc theo trạng thái và tìm kiếm theo mã đơn hoặc SĐT.
  3. Chi tiết đơn hàng hiển thị đầy đủ thông tin khách nhận, danh sách linh kiện đặt mua và cho phép cập nhật trạng thái đơn (Mới -> Đã liên hệ -> Đang giao -> Hoàn thành -> Hủy).
  4. Toàn bộ hệ thống được kiểm thử end-to-end từ lúc khách đặt hàng đến khi admin cập nhật hoàn tất.

**Plans**: TBD

Plans:

- [ ] 06-01: Xây dựng Dashboard Analytics thống kê đơn hàng và doanh số.
- [ ] 06-02: Xây dựng module Quản trị Đơn hàng (Danh sách, lọc trạng thái, xem chi tiết và cập nhật tiến độ).
- [ ] 06-03: Kiểm thử toàn diện end-to-end, tối ưu SEO, kiểm tra responsive và nghiệm thu v1.0.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding, Theme & Database Setup | 3/3 | Complete    | 2026-09-09 |
| 2. Authentication & Admin RBAC | 3/3 | Complete    | 2026-09-09 |
| 3. Admin Catalog & Content Management | 3/3 | Complete    | 2026-09-09 |
| 4. Storefront Discovery & Browsing Experience | 0/3 | Not started | - |
| 5. Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow | 0/3 | Not started | - |
| 6. Admin Order Fulfillment & Dashboard Analytics | 0/3 | Not started | - |

---
*Roadmap created: 2026-09-09*
*Granularity: standard (6 phases)*
