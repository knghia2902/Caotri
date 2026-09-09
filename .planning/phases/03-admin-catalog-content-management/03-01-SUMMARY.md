---
phase: 03-admin-catalog-content-management
plan: 03-01
status: complete
date: 2026-09-09
---

# Plan 03-01 Summary: Category Management & Modal CRUD

## What Was Built
1. **Hàm tiện ích sinh slug tiếng Việt (`src/lib/slugify.ts`)**:
   - Chuyển đổi toàn diện các ký tự tiếng Việt có dấu thành không dấu (a, e, i, o, u, y, d).
   - Xóa ký tự đặc biệt, chuẩn hóa gạch nối, cắt khoảng trắng, trả về slug chuẩn SEO.
2. **Server Actions Quản lý Danh mục (`src/app/actions/category.ts`)**:
   - `createCategory(data)`: Kiểm tra `requireRole(['ADMIN', 'STAFF'])`, kiểm tra slug trùng lặp, tạo bản ghi Prisma, revalidate paths.
   - `updateCategory(id, data)`: Cập nhật thông tin danh mục, kiểm tra xung đột slug, revalidate cache.
   - `deleteCategory(id)`: Kiểm tra ràng buộc sản phẩm liên kết (nếu có `products > 0` sẽ chặn xóa và cảnh báo rõ ràng), xóa danh mục nếu rỗng.
3. **Modal Dialog Thêm/Sửa Danh mục (`src/components/admin/category-modal.tsx`)**:
   - Giao diện Clean Tech Gaming dark mode, backdrop blur mờ.
   - Tự động sinh slug khi gõ tên, hỗ trợ tinh chỉnh slug thủ công.
   - Hỗ trợ nhập URL ảnh/icon kèm khung preview trực quan (Cloudflare-ready).
   - Thứ tự hiển thị `orderIndex` và mô tả ngắn.
4. **Bảng Quản lý Danh mục tương tác (`src/components/admin/category-table.tsx` & `/admin/categories/page.tsx`)**:
   - Tìm kiếm thời gian thực theo tên, slug, mô tả.
   - Hiển thị badge số lượng sản phẩm liên kết, ảnh icon danh mục.
   - Nút Sửa mở modal với dữ liệu điền sẵn, nút Xóa có xác nhận và trạng thái loading.
5. **Cải tiến Button UI (`src/components/ui/button.tsx`)**:
   - Bổ sung biến thể `variant="neon"` với hiệu ứng cyan glow đặc trưng phong cách Gaming Gear.

## Verification
- `npx tsx -e "import { slugify } from './src/lib/slugify'"` -> PASSED (sinh slug chuẩn).
- `npm run build` -> PASSED (`/admin/categories` biên dịch thành công, không lỗi TypeScript hay cú pháp).
