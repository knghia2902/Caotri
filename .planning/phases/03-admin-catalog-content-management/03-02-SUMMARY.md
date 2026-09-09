---
phase: 03-admin-catalog-content-management
plan: 03-02
status: complete
date: 2026-09-09
---

# Plan 03-02 Summary: Product Management, Multiple Images Gallery & Dynamic Specs

## What Was Built
1. **Bộ thông số mẫu Presets theo ngành hàng (`src/lib/presets.ts`)**:
   - Định nghĩa mẫu thông số tiêu chuẩn cho 5 ngành hàng gaming: Chuột gaming, Bàn phím cơ, Tai nghe, Lót chuột, Màn hình gaming.
   - Hàm helper `getSpecsPresetForCategory(slug)` hỗ trợ tự động nhận diện slug ngành hàng.
2. **Server Actions Quản lý Sản phẩm (`src/app/actions/product.ts`)**:
   - `createProduct(data)`: Tạo sản phẩm mới, kiểm tra `requireRole(['ADMIN', 'STAFF'])`, sinh slug tự động, lưu mảng ảnh và specs dưới dạng JSON (Cloudflare-ready, zero disk writes).
   - `updateProduct(id, data)`: Cập nhật thông tin chi tiết, ảnh, specs, giá niêm yết, giá khuyến mãi.
   - `deleteProduct(id)`: Xóa sản phẩm khỏi cơ sở dữ liệu.
   - `toggleProductFeatured(id, currentStatus)`: Đổi nhanh trạng thái Nổi bật với 1 truy vấn.
   - `toggleProductInStock(id, currentStatus)`: Đổi nhanh trạng thái Còn hàng / Hết hàng.
3. **Trình quản lý Gallery ảnh CDN (`src/components/admin/image-gallery-editor.tsx`)**:
   - Dán URL trực tiếp (Cloudflare R2 / Cloudinary / Unsplash / Supabase).
   - Lưới thumbnail hiển thị nhãn "Ảnh chính (Thumbnail)", hỗ trợ đổi ảnh chính, xóa ảnh và thay đổi thứ tự ảnh.
4. **Trình biên tập Thông số kỹ thuật động (`src/components/admin/specs-editor.tsx`)**:
   - Bảng Key - Value linh hoạt thêm/xóa/sửa từng dòng.
   - Nút "Nạp mẫu gợi ý" tải các trường tiêu chuẩn của ngành hàng đã chọn.
5. **Bảng Quản lý Sản phẩm có Quick-Toggle (`src/components/admin/product-table.tsx`)**:
   - Tìm kiếm thời gian thực theo tên, slug, thương hiệu.
   - Lọc đa chiều: theo Danh mục, Tồn kho (Còn/Hết), Trạng thái Nổi bật.
   - **Quick-Toggle 1-Click**: Icon sao vàng bật/tắt Nổi bật và Badge trạng thái kho hàng Còn hàng/Hết hàng cập nhật tức thì với Optimistic UI + Toast thông báo.
6. **Form 2 Cột & Các Trang Quản Trị Sản Phẩm**:
   - `src/components/admin/product-form.tsx`: Form 2 cột chuyên nghiệp phân tách giữa Nội dung - Media - Specs và Phân loại - Giá bán - Trạng thái.
   - `/admin/products`: Trang danh sách sản phẩm.
   - `/admin/products/new`: Trang thêm sản phẩm mới.
   - `/admin/products/[id]/edit`: Trang chỉnh sửa sản phẩm hiện có.

## Verification
- `npm run build` -> PASSED (tất cả 3 route `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit` biên dịch thành công 100%).
