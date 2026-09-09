---
phase: 01-project-scaffolding-theme-database-setup
plan: 01-03
title: Seed Data Script & Demo Gaming Catalog Generation
status: complete
requirements:
  - FOUND-03
completed_at: 2026-09-09
---

# Plan 01-03 Summary: Seed Data Script & Demo Gaming Catalog Generation

## Accomplishments
- Cài đặt `bcryptjs` và cấu hình lệnh seed tự động trong `package.json` (`prisma.seed = "npx tsx prisma/seed.ts"`).
- Xây dựng kho dữ liệu mẫu thực tế và phong phú `src/lib/seed-data.ts`:
  + 6 danh mục: Chuột Gaming, Bàn phím cơ, Tai nghe & Audio, Lót chuột & Mousepad, Màn hình & Giá đỡ, Phụ kiện & Switch.
  + 17 sản phẩm gaming gear thực tế (Logitech, Razer, Keychron, Akko, HyperX, Artisan, Pulsar, Asus ROG...) kèm bộ sưu tập ảnh sắc nét, thông số kỹ thuật chi tiết dạng JSON và giá bán chuẩn thị trường.
  + 3 banners slider trang chủ.
  + 6 cấu hình cửa hàng (Hotline, Zalo OA, Fanpage, Địa chỉ).
- Viết kịch bản `prisma/seed.ts` tự động băm mật khẩu bằng bcrypt và nạp vào database.
- Khởi tạo 2 tài khoản quản trị sẵn sàng cho Phase 2:
  + Admin: `admin@caotri.vn` (Mật khẩu: `admin123@`, Role: `ADMIN`)
  + Staff: `staff@caotri.vn` (Mật khẩu: `staff123@`, Role: `STAFF`)

## Key Files Created
- `src/lib/seed-data.ts`: Dữ liệu seed fixture chi tiết.
- `prisma/seed.ts`: Kịch bản nạp dữ liệu vào cơ sở dữ liệu.
- `prisma/dev.db`: Cơ sở dữ liệu SQLite đã nạp 17 sản phẩm, 6 danh mục, 3 banners và 2 users.

## Verification
- Chạy `npx prisma db seed` hoàn thành 100% không phát sinh lỗi.
- Script test độc lập xác nhận:
  + `usersCount`: 2
  + `categories`: 6
  + `products`: 17
  + `banners`: 3
  + `adminPassValid`: true (xác thực bcrypt chính xác)
- Lệnh `npm run build` tiếp tục biên dịch hoàn hảo.

## Self-Check: PASSED
