# Phase 1: Project Scaffolding, Theme & Database Setup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 1-Project Scaffolding, Theme & Database Setup
**Areas discussed:** Phong cách giao diện & Bảng màu, Cấu trúc & Dữ liệu Seed mẫu, Cấu hình Kết nối Database

---

## Phong cách giao diện & Bảng màu (Visual Theme & Palette)

| Option | Description | Selected |
|--------|-------------|----------|
| Gaming Dark Modern | Nền tối công nghệ (zinc-950), điểm nhấn Cyan/Neon mượt mà, tôn vẻ đẹp của gear có LED | |
| Cyberpunk High-Contrast | Nền đen sâu với dải màu tím/hồng neon rực rỡ, đậm chất eSports | |
| Clean Tech Minimalist | Giao diện sáng thanh lịch, tối giản hiện đại (như Keychron/Apple), tập trung tối đa vào chi tiết ảnh sản phẩm | ✓ |

**User's choice:** Clean Tech Minimalist - Giao diện sáng thanh lịch, tối giản hiện đại (như Keychron/Apple), tập trung tối đa vào chi tiết ảnh sản phẩm.
**Notes:** Giúp website trang nhã, chuyên nghiệp, hình ảnh sản phẩm nổi bật rõ nét.

---

## Cấu trúc & Dữ liệu Seed mẫu (Seed Data Scope)

| Option | Description | Selected |
|--------|-------------|----------|
| Bộ dữ liệu phong phú thực tế | Đầy đủ 6 danh mục chính (Chuột, Phím cơ, Tai nghe, Lót chuột, Màn hình, Phụ kiện) với 15-20 sản phẩm mẫu hot (Logitech, Razer, Akko, Keychron, HyperX...) kèm ảnh HD và thông số kỹ thuật chuẩn | ✓ |
| Bộ dữ liệu gọn nhẹ | Mỗi danh mục 1-2 sản phẩm mẫu cơ bản để phục vụ dev và test luồng | |
| Chuyên sâu Bàn phím cơ & Chuột | Tập trung danh mục switch cơ, keycap, kit bàn phím và chuột siêu nhẹ | |

**User's choice:** (Recommended) Bộ dữ liệu phong phú thực tế - Đầy đủ 6 danh mục chính với 15-20 sản phẩm mẫu hot kèm ảnh HD và thông số kỹ thuật chuẩn.
**Notes:** Tạo trải nghiệm thực tế ngay từ lúc dev Storefront và Admin.

---

## Cấu hình Kết nối Database (Database Setup)

| Option | Description | Selected |
|--------|-------------|----------|
| PostgreSQL (Supabase / Neon / Local Postgres) | Cung cấp file .env.example chuẩn, schema Prisma dùng provider postgresql | |
| Khởi tạo với SQLite cục bộ khi dev trước | Chạy ngay lập tức không cần cài đặt DB server, khi deploy production chỉ cần đổi sang PostgreSQL | ✓ |
| Docker Compose PostgreSQL | Tích hợp sẵn Docker Compose chạy PostgreSQL cục bộ | |

**User's choice:** test với sqlite trước rồi supabase sau.
**Notes:** Ưu tiên khởi tạo với SQLite cục bộ (`file:./dev.db`) để kiểm thử trơn tru, không phụ thuộc server bên ngoài; Prisma schema được thiết kế tương thích cao để chuyển sang Supabase Postgres khi deploy.

---

## the agent's Discretion

- Thiết kế cấu trúc thư mục dự án Next.js chuẩn mực (`/src`).
- Tích hợp bộ icon Lucide React và các UI components tái sử dụng (Button, Input, Card).

## Deferred Ideas

- Chuyển đổi Prisma Provider sang Supabase PostgreSQL khi chuẩn bị đưa lên môi trường Staging/Production.
