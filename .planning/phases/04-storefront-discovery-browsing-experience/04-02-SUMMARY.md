---
phase: 04-storefront-discovery-browsing-experience
plan: 04-02
status: complete
date: 2026-09-09
---

# Plan 04-02 Summary: Instant Search Popover, Catalog Browsing & Dual Price Range Slider

## What Was Built
1. **Server Action Instant Search (`src/app/actions/search.ts`)**:
   - `searchProductsAction(query)`: Truy vấn nhanh tối đa 6 sản phẩm khớp với từ khóa tìm kiếm theo tên hoặc slug, chỉ tìm sản phẩm `isActive: true`.
   - Trả về thông tin cơ bản kèm giá, ảnh chính (được parse an toàn từ JSON mảng ảnh) và tên danh mục.

2. **Thanh Tìm Kiếm Instant Search Popover (`src/components/storefront/instant-search.tsx`)**:
   - Thanh input tìm kiếm tích hợp trực tiếp trên Header (cả màn hình Desktop và Mobile Drawer).
   - Tự động debounce 250ms khi người dùng nhập từ khóa để tránh spam request.
   - Popover dropdown hiển thị ngay kết quả gồm ảnh thumbnail, tên sản phẩm, danh mục và giá bán VNĐ.
   - Hỗ trợ phím Enter hoặc nút "Xem tất cả kết quả" để chuyển thẳng sang trang danh mục `/products?q=...`.
   - Xử lý click outside để tự động đóng dropdown popover.

3. **Thanh Trượt Kép Lọc Giá Dual Price Range Slider (`src/components/storefront/price-range-slider.tsx`)**:
   - 2 đầu kéo trượt đồng thời (min-max) trực quan từ 0đ đến 10.000.000đ.
   - Hai ô nhập giá tiền VNĐ cho phép người dùng gõ số chính xác bất kỳ lúc nào.
   - 4 nút chọn nhanh ngân sách thông dụng (Quick Budget Pills): `< 500k`, `500k - 1.5tr`, `1.5tr - 3tr`, `> 3tr`.
   - Nút "Áp dụng giá" đẩy query parameter `minPrice` & `maxPrice` lên URL mượt mà.

4. **Sidebar Bộ Lọc Đa Chiều CatalogFilter (`src/components/storefront/catalog-filter.tsx`)**:
   - Lọc theo danh mục sản phẩm (tất cả hoặc theo từng category slug).
   - Lọc theo khoảng giá với `PriceRangeSlider`.
   - Lọc theo tình trạng còn hàng (In Stock checkbox).
   - Nút "Xóa tất cả bộ lọc" để đưa về trạng thái mặc định.

5. **Trang Duyệt Sản Phẩm Toàn Diện (`src/app/products/page.tsx`)**:
   - Server Component hỗ trợ Next.js 15 Async `searchParams`.
   - Tích hợp tìm kiếm từ khóa `q`, lọc theo `category`, `minPrice`, `maxPrice`, `inStock`.
   - Bộ chọn sắp xếp (Sort by): Giá tăng dần, Giá giảm dần, Mới nhất, Cũ nhất.
   - Lưới hiển thị danh sách sản phẩm với thẻ `ProductCard` tái sử dụng, kèm trạng thái Empty State khi không tìm thấy sản phẩm phù hợp.

6. **Trang Duyệt Theo Danh Mục (`src/app/category/[slug]/page.tsx`)**:
   - Chuyên biệt cho từng danh mục với breadcrumb điều hướng (Trang chủ > Danh mục > Tên danh mục).
   - Header danh mục hiển thị tên và mô tả danh mục cùng số lượng sản phẩm.
   - Kế thừa toàn bộ bộ lọc giá, tình trạng kho và sắp xếp tương thích hoàn hảo.

## Verification
- `npm run build` -> PASSED (Biên dịch thành công cả 2 route động `/products` và `/category/[slug]`, 100% type-safe với Next.js 15).
