---
phase: 02-authentication-admin-rbac
plan: 02-03
status: complete
date: 2026-09-09
---

# Plan 02-03 Summary: Admin Dashboard Layout, Collapsible Sidebar & RBAC Guard

## What Was Built
1. **Collapsible Admin Sidebar (`src/components/admin/sidebar.tsx`)**:
   - Sidebar linh hoạt: Mở rộng 256px (`w-64`) $\leftrightarrow$ Thu gọn 80px (`w-20` icon-only với tooltip).
   - Menu items: Dashboard, Đơn hàng, Sản phẩm, Danh mục, Banners, Cài đặt Shop.
   - Tự động lọc ẩn các menu Admin-only (`Banners`, `Cài đặt Shop`) khi người dùng có vai trò `STAFF`.
   - Hỗ trợ mobile drawer trượt từ bên trái với backdrop mờ khi bấm Hamburger button.
2. **Top Header (`src/components/admin/header.tsx`)**:
   - Nút Hamburger mở menu mobile.
   - Dynamic Breadcrumbs hiển thị vị trí trang hiện tại.
   - Nút "Xem Cửa hàng" mở trang chủ Storefront `/` ở tab mới.
   - User block: Tên, Email và Badge Role nổi bật (`ADMIN` màu neon cyan, `STAFF` màu secondary).
   - Nút Đăng xuất kết nối Server Action `logoutAction`.
3. **Admin Shell & Layouts**:
   - `src/components/admin/admin-shell.tsx`: Đồng bộ trạng thái thu gọn và mobile drawer giữa Sidebar và Header.
   - `src/app/admin/layout.tsx`: Root admin layout nhúng `Toaster` (Sonner) và `ToastHandler` bắt lỗi `?error=forbidden`.
   - `src/app/admin/(dashboard)/layout.tsx`: Server Component bảo vệ phiên, chuyển hướng về login nếu thiếu session, bọc nội dung trong `AdminShell`.
4. **Dashboard Home Page (`src/app/admin/(dashboard)/page.tsx`)**:
   - Welcome banner chào mừng người dùng đang đăng nhập và hiển thị vai trò.
   - 4 Stat cards đếm dữ liệu trực tiếp từ database qua Prisma: Sản phẩm (17), Danh mục (6), Đơn hàng (0), Banners (3).
   - Hộp thông tin chi tiết quyền hạn tài khoản (ADMIN toàn quyền, STAFF ghi chú các giới hạn).
5. **RBAC Guard 2 Lớp (Defense-in-Depth)**:
   - Lớp 1: Giao diện lọc menu + Middleware chặn và chuyển hướng kèm thông báo toast.
   - Lớp 2: Hàm helper `requireRole(allowedRoles: UserRole[])` trong `src/lib/auth.ts` bảo vệ mọi mutation/Server Actions.
6. **Bổ sung Neon Badge (`src/components/ui/badge.tsx`)**:
   - Bổ sung variant `neon` (`bg-cyan-950/80 text-cyan-400 border border-cyan-500/50`) cho phong cách Clean Tech Gaming.

## Verification
- `npx tsx scripts/test-auth.ts` -> PASSED (5/5 tests).
- `npm run build` -> PASSED (Next.js 15 build thành công toàn bộ route `/admin`, `/admin/login`, middleware).
