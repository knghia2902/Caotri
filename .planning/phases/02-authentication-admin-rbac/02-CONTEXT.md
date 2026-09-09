# Phase 2: Authentication & Admin RBAC - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Xây dựng hệ thống xác thực tài khoản quản trị và phân quyền vai trò (Admin / Staff) cho phân hệ Admin Dashboard:
- Trang đăng nhập quản trị `/admin/login`.
- Quản lý phiên đăng nhập an toàn (Custom JWT với thư viện `jose` và HTTP-only Cookie).
- Next.js Middleware bảo vệ toàn bộ các route `/admin/*` (tự động điều hướng về `/admin/login` khi chưa đăng nhập).
- Khung giao diện Admin Layout (Sidebar điều hướng có thể thu gọn, Header có user info & badge role, breadcrumbs, nút xem shop, nút đăng xuất).
- Kiểm soát phân quyền 2 lớp (RBAC):
  - Giao diện: Ẩn/hiện menu tương ứng với vai trò `ADMIN` vs `STAFF`.
  - Backend/Routing: Tự động điều hướng về `/admin/dashboard` kèm thông báo cảnh báo khi Staff truy cập URL bị giới hạn; kiểm tra vai trò chặt chẽ trong Server Actions.

</domain>

<decisions>
## Implementation Decisions

### Cơ chế Xác thực & Phiên làm việc (Auth & Session)
- **D-01:** Sử dụng **Custom JWT Session** với thư viện `jose` và **Cookie httpOnly** (cờ `secure`, `sameSite: 'lax'`, `path: '/'`).
  - *Lý do:* Tương thích 100% với Next.js 15 (App Router) và React 19, hoạt động trơn tru không lỗi trên Edge Middleware mà không gặp các vấn đề breaking change của Auth.js / NextAuth v5 beta.
  - *Mô hình:* Lưu thông tin tối thiểu trong JWT (`userId`, `email`, `name`, `role`).
- **D-02:** Thời hạn phiên đăng nhập: **7 ngày** (áp dụng Sliding Session tự động gia hạn khi người dùng thao tác).

### Giao diện Đăng nhập (/admin/login)
- **D-03:** Bố cục **Split Screen 2 cột**:
  - Cột trái: Ảnh artwork Gaming Gear / Tech Minimalist ấn tượng kèm slogan và logo CaoTri Gaming Gear.
  - Cột phải: Form đăng nhập Clean Tech sắc nét, trường Email, Mật khẩu, nút Đăng nhập và hiển thị lỗi trực quan.
- **D-04:** Tích hợp nút **1-click Quick-fill demo credentials**:
  - Nút "Điền tài khoản Admin" (`admin@caotri.vn` / `admin123@`).
  - Nút "Điền tài khoản Staff" (`staff@caotri.vn` / `staff123@`).
  - Giúp việc kiểm thử, bàn giao và quản trị thuận tiện tối đa.

### Khung Giao diện Quản trị (Admin Layout & Navigation)
- **D-05:** **Sidebar điều hướng có thể thu gọn (Collapsible Sidebar)**:
  - Desktop: Mặc định rộng 260px, có nút toggle thu gọn thành icon-only 64px (vẫn xem được tooltip).
  - Mobile: Drawer trượt từ bên trái với nút Hamburger ở Header.
  - Menu items:
    - Dashboard tổng quan (`/admin`)
    - Quản lý Đơn hàng (`/admin/orders`)
    - Quản lý Sản phẩm (`/admin/products`)
    - Quản lý Danh mục (`/admin/categories`)
    - Quản lý Banners (`/admin/banners`) - *Chỉ Admin*
    - Cài đặt hệ thống / Liên hệ (`/admin/settings`) - *Chỉ Admin*
- **D-06:** **Header trên cùng (Top bar)** đầy đủ tiện ích:
  - Breadcrumbs chỉ rõ vị trí hiện tại.
  - Nút "Xem Cửa hàng" (icon ExternalLink) mở trang Storefront `/` ở tab mới hoặc điều hướng nhanh.
  - Thông tin người dùng: Tên hiển thị + Badge Role (`ADMIN`: Neon cyan/rose badge; `STAFF`: Zinc badge).
  - Nút Đăng xuất (Logout) với hành động xóa cookie session và quay về `/admin/login`.

### Chính sách Phân quyền RBAC (Role-Based Access Control)
- **D-07:** **Quy tắc phân quyền chi tiết**:
  - Vai trò `ADMIN`: Toàn quyền trên mọi trang và mọi Server Action (Bao gồm Banners, Settings, xóa sản phẩm, v.v.).
  - Vai trò `STAFF`: Quyền xem và cập nhật Đơn hàng; xem và cập nhật Sản phẩm / Danh mục; **BỊ CHẶN** truy cập Banners và Settings hệ thống.
- **D-08:** **Xử lý khi Staff vi phạm quyền**:
  - Điều hướng ngay về `/admin/dashboard` kèm thông báo Toast cảnh báo: *"Bạn không có quyền truy cập trang này"*.
- **D-09:** **Bảo mật 2 lớp (Defense-in-Depth)**:
  - Lớp 1 (UI & Middleware): Ẩn menu trên Sidebar và chặn ngay tại Middleware khi nhận diện cookie chứa role không phù hợp.
  - Lớp 2 (Server Action/API): Tất cả mutation nhạy cảm đều gọi hàm helper `requireRole(['ADMIN'])` để từ chối ngay lập tức nếu không đúng quyền.

### the agent's Discretion
- Tạo helper `src/lib/auth.ts` cung cấp các hàm `createSession`, `verifySession`, `deleteSession`, `getCurrentUser`.
- Cài đặt thư viện `jose` cho JWT mã hóa chuẩn Web Crypto API.
- Cung cấp component thông báo Toast (`sonner` hoặc custom toast) để thông báo kết quả đăng nhập, đăng xuất và cảnh báo quyền hạn.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — Định hướng dự án và kiến trúc tổng thể
- `.planning/REQUIREMENTS.md` — Tiêu chuẩn chi tiết cho `AUTH-01`, `AUTH-02`, `AUTH-03`
- `.planning/ROADMAP.md` — Mục tiêu và tiêu chí hoàn thành của Phase 2
- `src/types/index.ts` — Định nghĩa kiểu dữ liệu `UserRole`, `SessionPayload`
- `prisma/schema.prisma` — Model `User` (`email`, `password`, `role`)
- `src/lib/prisma.ts` — Prisma client truy vấn người dùng khi xác thực

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: Nút bấm với nhiều variant (`default`, `outline`, `ghost`, `secondary`, `destructive`).
- `src/components/ui/card.tsx`: Khung hiển thị giao diện Clean Tech.
- `src/components/ui/badge.tsx`: Huy hiệu vai trò (`ADMIN` / `STAFF`).
- `src/components/ui/input.tsx`: Ô nhập dữ liệu email, mật khẩu.
- `src/lib/utils.ts`: Hàm `cn` ghép Tailwind classes.
- `prisma/dev.db`: Cơ sở dữ liệu đã seed sẵn 2 tài khoản mẫu `admin@caotri.vn` và `staff@caotri.vn`.

### Established Patterns
- Clean Tech Minimalist: Nền tối `bg-zinc-950`, viền `border-zinc-800`, text `text-zinc-100` / `text-zinc-400`, điểm nhấn cyan `text-cyan-400`.
- Server Actions kết hợp Zod validation và Prisma Client.

</code_context>

<specifics>
## Specific Ideas & References

- Giao diện đăng nhập Split Screen:
  - Cột bên trái hiển thị một card nghệ thuật gaming gear với hiệu ứng gradient tối, slogan "CaoTri Gaming Gear - Quản trị cửa hàng trực tuyến".
  - Cột bên phải là form đăng nhập tinh tế với nút điền nhanh tài khoản demo để trải nghiệm ngay không cần nhớ mật khẩu.
- Header Admin có nút "Xem Cửa hàng" để quản trị viên có thể chuyển đổi qua lại giữa Storefront và Dashboard mượt mà.

</specifics>

<deferred>
## Deferred Ideas

- Đăng nhập qua OAuth (Google Login cho Admin/Staff) — Để dành cho các phiên bản sau nếu có nhu cầu mở rộng.
- Tính năng Quên mật khẩu & Gửi mã OTP qua Email — Tích hợp cùng dịch vụ gửi mail Resend ở Phase sau.

</deferred>
