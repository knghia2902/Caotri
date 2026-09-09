---
phase: 01-project-scaffolding-theme-database-setup
plan: 01-02
title: Prisma ORM Setup & Comprehensive E-Commerce Schema
status: complete
requirements:
  - FOUND-02
completed_at: 2026-09-09
---

# Plan 01-02 Summary: Prisma ORM Setup & Comprehensive E-Commerce Schema

## Accomplishments
- Cài đặt và cấu hình Prisma ORM với SQLite cục bộ (`file:./dev.db`) phục vụ phát triển nhanh chóng không phụ thuộc server/cloud.
- Thiết kế Schema E-Commerce hoàn chỉnh 7 thực thể:
  1. `User`: Tài khoản quản trị, mật khẩu băm, vai trò ADMIN / STAFF.
  2. `Category`: Danh mục sản phẩm, slug duy nhất, ảnh đại diện, thứ tự hiển thị.
  3. `Product`: Thông tin sản phẩm, giá bán, giá gốc, thư viện ảnh (JSON), thông số kỹ thuật specs (JSON), cờ nổi bật/mới/còn hàng.
  4. `Order`: Đơn đặt hàng, mã định danh duy nhất (`DH-xxxxxx`), thông tin khách hàng, tổng tiền, trạng thái đơn.
  5. `OrderItem`: Chi tiết món hàng trong đơn đặt.
  6. `Banner`: Banner slider trang chủ kèm liên kết và trạng thái kích hoạt.
  7. `SiteSetting`: Lưu cấu hình cửa hàng (Hotline, link Zalo OA, link Facebook).
- Tạo file singleton `src/lib/prisma.ts` chống memory leak khi Next.js hot-reload.
- Tạo `src/types/index.ts` định nghĩa types đồng bộ cho tầng client và server.

## Key Files Created
- `prisma/schema.prisma`: Định nghĩa Schema cơ sở dữ liệu.
- `.env`: Cấu hình DATABASE_URL trỏ vào `file:./dev.db`.
- `.env.example`: Hướng dẫn cấu hình môi trường SQLite và Supabase PostgreSQL.
- `src/lib/prisma.ts`: Singleton instance PrismaClient.
- `src/types/index.ts`: TypeScript types mở rộng (Role, OrderStatus, ProductSpecs, CartItem).

## Verification
- `npx prisma validate` xác nhận cú pháp schema hoàn toàn hợp lệ.
- `npx prisma db push` đã tạo thành công cơ sở dữ liệu SQLite `dev.db` và sinh Prisma Client types.
- `npm run build` biên dịch thành công, xác nhận tính tương thích toàn diện.

## Self-Check: PASSED
