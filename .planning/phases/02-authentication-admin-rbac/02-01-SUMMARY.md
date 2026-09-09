---
phase: 02-authentication-admin-rbac
plan: 02-01
status: complete
date: 2026-09-09
---

# Plan 02-01 Summary: Core Auth Library & Session Infrastructure

## What Was Built
1. **Thư viện xác thực & JWT (`src/lib/auth.ts`)**:
   - Tích hợp thư viện `jose` (v5+) mã hóa chuẩn Web Crypto API.
   - Hàm `signJWT(payload)` tạo token HS256 với thời hạn 7 ngày.
   - Hàm `verifyJWT(token)` giải mã an toàn, tương thích cả Edge Runtime và Node.js.
   - Các helper quản lý cookie HTTP-only: `setSessionCookie(token)`, `getSessionCookie()`, `clearSessionCookie()`.
   - Các helper phân quyền backend: `requireAuth()`, `requireRole(allowedRoles)`.
2. **Server Actions (`src/app/actions/auth.ts`)**:
   - `loginAction(prevState, formData)`: Nhận email & password, truy vấn User từ Prisma, xác thực bcrypt hash, ký JWT và đặt cookie session.
   - `logoutAction()`: Xóa cookie session và điều hướng về `/admin/login`.
   - `getCurrentUserAction()`: Trả về thông tin user từ session hiện tại.
3. **Mở rộng Type-safe (`src/types/index.ts`)**:
   - Thêm `UserRole` và `SessionPayload`.
4. **Kiểm thử tự động (`scripts/test-auth.ts`)**:
   - Vượt qua 5/5 bài kiểm tra: Ký & giải mã JWT, phát hiện token giả mạo, kiểm tra mật khẩu bcrypt cho Admin và Staff, và logic phân quyền RBAC.

## Verification
- `npx tsx scripts/test-auth.ts` -> PASSED (5/5 tests).
- `npm run build` -> PASSED (Next.js 15 build thành công).
