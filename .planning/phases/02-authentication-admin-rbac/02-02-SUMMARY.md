---
phase: 02-authentication-admin-rbac
plan: 02-02
status: complete
date: 2026-09-09
---

# Plan 02-02 Summary: Edge Middleware & Split-Screen Login Page

## What Was Built
1. **Next.js Edge Middleware (`src/middleware.ts`)**:
   - Tự động bảo vệ toàn bộ các route `/admin/*`.
   - Chặn người dùng chưa đăng nhập và chuyển hướng về `/admin/login?redirect=...`.
   - Giải mã và xác thực token JWT siêu tốc ngay tại Edge runtime.
   - Chuyển hướng người dùng đã đăng nhập về `/admin` nếu họ truy cập vào `/admin/login`.
   - Phân quyền RBAC tầng Middleware: Chặn tài khoản role `STAFF` truy cập các route cấm (`/admin/banners`, `/admin/settings`) và tự động redirect về `/admin?error=forbidden`.
2. **Component Form Đăng nhập (`src/components/admin/login-form.tsx`)**:
   - Quản lý form input email, mật khẩu với giao diện Clean Tech.
   - Nút Đăng nhập có hiệu ứng loading indicator và báo lỗi trực quan.
   - Nút 1-click Quick-fill demo credentials: click "Admin Demo" hoặc "Staff Demo" tự động điền tài khoản để test và bàn giao thuận tiện.
3. **Trang Đăng nhập Split Screen (`src/app/admin/login/page.tsx`)**:
   - Bố cục 2 cột trên desktop (`lg:grid-cols-2`): Cột trái hiển thị artwork gaming gear, logo CaoTri Gear và các điểm nhấn công nghệ; cột phải chứa form đăng nhập.
   - Tương thích tốt trên mobile.
   - Tích hợp liên kết quay lại trang chủ Storefront `/`.

## Verification
- `npm run build` -> PASSED (Biên dịch Middleware và trang `/admin/login` thành công không lỗi).
