---
phase: 04-storefront-discovery-browsing-experience
plan: 04-03
status: complete
date: 2026-09-09
---

# Plan 04-03 Summary: Product Details Showcase, Tech Specs & Floating Contact Dock

## What Was Built
1. **Trình Xem Bộ Sưu Tập Ảnh Sản Phẩm Tương Tác (`src/components/storefront/product-gallery-viewer.tsx`)**:
   - Khung xem ảnh lớn chính với hiệu ứng hover zoom, tỷ lệ vuông tiêu chuẩn, viền `zinc-800`.
   - Nút điều hướng ảnh trước/sau (Previous / Next) xuất hiện trực quan khi rê chuột.
   - Badge đếm số lượng ảnh hiện tại trên tổng số ảnh (`Eye` icon, ví dụ: 1/4).
   - Dải thumbnail nhỏ cuộn ngang bên dưới với viền phát sáng cyan neon khi được chọn, click chuyển ảnh tức thì.
   - Xử lý ảnh lỗi fallback tự động không làm gãy giao diện.

2. **Cụm Tương Tác Đặt Hàng & Tư Vấn (`src/components/storefront/product-actions.tsx`)**:
   - Bộ chọn số lượng sản phẩm (+ / -) với giới hạn linh hoạt từ 1 đến 99.
   - Hiển thị nhãn tình trạng kho hàng: "Còn hàng (Sẵn sàng giao)" hoặc "Tạm hết hàng".
   - Nút "Thêm vào giỏ hàng" tích hợp thông báo Sonner Toast hiển thị tên và tổng số tiền.
   - Nút "Mua ngay" chuẩn bị cho quy trình thanh toán nhanh.
   - Nút "Chat Zalo để tư vấn cấu hình & ưu đãi riêng" chuyển thẳng đến Zalo OA/cá nhân với tin nhắn soạn sẵn.

3. **Tabs Mô Tả Chi Tiết & Bảng Thông Số Kỹ Thuật Clean Tech (`src/components/storefront/product-tabs.tsx`)**:
   - Tabs chuyển đổi mượt mà giữa "Mô Tả Sản Phẩm" và "Thông Số Kỹ Thuật".
   - Bảng thông số kỹ thuật thiết kế dạng kẻ sọc (Zebra stripes) xen kẽ: `even:bg-zinc-900/60 odd:bg-zinc-950/40`.
   - Cột thuộc tính bên trái màu `zinc-400`, cột giá trị bên phải màu `zinc-100 font-medium`.
   - Tự động parse linh hoạt từ chuỗi JSON object hoặc JSON array lưu trong CSDL `product.specs`.

4. **Trang Chi Tiết Sản Phẩm Chuẩn Gaming (`src/app/products/[slug]/page.tsx`)**:
   - Server Component hỗ trợ dynamic async `params: Promise<{ slug: string }>` theo chuẩn Next.js 15.
   - `generateMetadata` tạo tiêu đề và mô tả SEO động tối ưu tìm kiếm theo từng sản phẩm.
   - Breadcrumb điều hướng phân cấp (Trang chủ > Sản phẩm > Danh mục > Tên sản phẩm).
   - Bố cục 2 cột chuyên nghiệp: bên trái là Gallery ảnh sticky khi cuộn trang, bên phải là khối thông tin sản phẩm, giá bán, tiết kiệm %, nút mua hàng và hộp 3 cam kết vàng (Chính hãng 100%, Giao nhanh 24h, Đổi trả 7 ngày).
   - Lưới sản phẩm tương tự (Related Products) cùng danh mục ở chân trang giúp giữ chân khách hàng.

5. **Floating Quick-Contact Dock Cố Định (`src/components/storefront/quick-contact-dock.tsx`)**:
   - Nổi cố định ở góc phải dưới (`fixed bottom-6 right-6 z-40`) trên toàn bộ Storefront.
   - 3 nút tròn liên hệ tách biệt với hiệu ứng sóng lan tỏa (Pulse ring animations) thu hút ánh nhìn:
     1. Nút Chat Zalo (xanh dương, mở link Zalo tư vấn).
     2. Nút Facebook Messenger (gradient xanh tím, mở chat Fanpage).
     3. Nút Gọi Hotline (neon cyan, click quay số trực tiếp).
   - Tích hợp tooltip tiếng Việt khi rê chuột.
   - Nạp cấu hình thời gian thực từ bảng `SiteSetting`.

6. **Kịch Bản Kiểm Thử Tự Động Toàn Diện (`scripts/test-storefront.ts`)**:
   - 7 bài kiểm thử truy vấn CSDL: Banners active, Danh mục kèm số lượng sản phẩm, Sản phẩm nổi bật & mới về, Tìm kiếm từ khóa, Lọc khoảng giá ngân sách, Nạp chi tiết sản phẩm JSON images/specs, Cấu hình liên hệ SiteSetting.
   - Đạt tỷ lệ thành công 7/7 bài kiểm thử (100%).

## Verification
- `npx tsx scripts/test-storefront.ts` -> PASSED 7/7 TESTS.
- `npm run build` -> PASSED (Biên dịch thành công 100% tất cả các route tĩnh và động: `/`, `/category/[slug]`, `/products`, `/products/[slug]`).
