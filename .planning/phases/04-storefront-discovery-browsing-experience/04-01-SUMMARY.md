---
phase: 04-storefront-discovery-browsing-experience
plan: 04-01
status: complete
date: 2026-09-09
---

# Plan 04-01 Summary: Storefront Shell, Hero Banner Slider & Home Showcase

## What Was Built
1. **Khung Header & Footer Storefront Dark Gaming (`storefront-header.tsx` & `storefront-footer.tsx`)**:
   - Header: Logo CaoTri Gear phát sáng neon cyan, menu danh mục nhanh, khe Instant Search, nút Hotline gọi nhanh, giỏ hàng với badge số lượng, menu drawer responsive trên thiết bị di động.
   - Footer: 3 banner cam kết dịch vụ (Chính hãng 100%, Giao hàng siêu tốc, Bảo hành 1 đổi 1), thông tin cửa hàng nạp từ CSDL `SiteSetting`, icon mạng xã hội Zalo OA & Fanpage Facebook.
2. **Thẻ Sản Phẩm ProductCard Tái Sử Dụng (`product-card.tsx`)**:
   - Ảnh sản phẩm hiệu ứng hover zoom, fallback ảnh lỗi thông minh.
   - Đầy đủ nhãn badge: Giảm giá -X%, Hàng mới về, Nổi bật, Trạng thái hết hàng.
   - Giá bán nổi bật màu cyan format VNĐ, giá gốc gạch ngang.
   - Nút Thêm vào giỏ hàng (Sonner toast) và Xem chi tiết.
3. **Dải Danh Mục Phân Loại CategoryRibbon (`category-ribbon.tsx`)**:
   - Lưới hiển thị các danh mục gaming gear (Chuột, Phím, Tai nghe, Lót chuột, Màn hình...).
   - Hiển thị số lượng sản phẩm liên kết và đường dẫn lọc theo từng danh mục.
4. **Hero Banner Slider Toàn Chiều Rộng (`hero-banner-slider.tsx`)**:
   - Tự động chuyển slide sau mỗi 5 giây (autoplay); tự động tạm dừng khi rê chuột.
   - Nút điều hướng trước/sau và dãy chấm tròn (dots indicator) trực quan.
   - Chuyển cảnh crossfade mượt mà, hỗ trợ link click trực tiếp vào sự kiện khuyến mãi.
5. **Trang Chủ Động Hoàn Chỉnh (`src/app/page.tsx`)**:
   - Thay thế mockup tĩnh cũ bằng Server Component nạp 100% dữ liệu thực từ Prisma.
   - Hiển thị Hero Slider banner, Dải danh mục, Khối sản phẩm Nổi bật, Banner kêu gọi tư vấn cấu hình Zalo 1-1, Khối Hàng mới về.

## Verification
- `npm run build` -> PASSED (Trang chủ `/` biên dịch thành công 100%, không lỗi SSR hay TypeScript).
