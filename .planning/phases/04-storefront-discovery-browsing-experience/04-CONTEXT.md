# Phase 4: Storefront Discovery & Browsing Experience - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Xây dựng toàn bộ giao diện Cửa hàng trực tuyến (Storefront) tối ưu trải nghiệm khám phá, tìm kiếm và xem chi tiết sản phẩm cho khách hàng:
- **Trang chủ (`/`)**: Hero Banner Slider toàn chiều rộng (autoplay 5s, nạp từ Prisma), Lưới phân loại danh mục, Khối sản phẩm nổi bật (Featured), Khối sản phẩm mới về (New arrivals), Cam kết dịch vụ/bảo hành.
- **Thanh Header & Footer chung**:
  - Header: Logo CaoTri Gear, Menu danh mục nhanh, Thanh Instant Search Popover hiển thị kết quả trực tiếp khi gõ, Giỏ hàng preview, Nút Hotline liên hệ nhanh, Nút truy cập Quản trị.
  - Footer: Thông tin thương hiệu, Hotline, Zalo, Fanpage Facebook, Địa chỉ showroom và chính sách nạp từ bảng `SiteSetting`.
- **Trang Danh mục & Bộ lọc sản phẩm (`/category/[slug]` & `/products`)**:
  - Lưới sản phẩm responsive với Product Card gaming hiện đại (hình ảnh, tên, giá bán, giá gốc, badge Nổi bật/Mới/Giảm giá, nút xem chi tiết và thêm giỏ).
  - Thanh trượt khoảng giá ngân sách (Price Range Slider) 2 đầu kéo từ min đến max kèm ô nhập số tiền trực tiếp.
  - Sắp xếp sản phẩm linh hoạt: Giá tăng dần, Giá giảm dần, Mới nhất, Bán chạy.
  - Phân trang hoặc tải thêm mượt mà.
- **Trang Chi tiết Sản phẩm (`/products/[slug]`)**:
  - Bố cục 2 cột: Cột trái là Gallery ảnh lớn kèm dải thumbnail cuộn bên dưới; Cột phải hiển thị Tên, Mã/Slug, Danh mục, Giá bán, Giá gốc, Trạng thái Còn hàng, Nút Thêm vào giỏ / Mua ngay, Nút Chốt đơn/Tư vấn Zalo.
  - Phía dưới: Tabs Mô tả chi tiết sản phẩm & Bảng Thông số kỹ thuật (Tech Specs) Clean Tech kẻ sọc xen kẽ rõ ràng.
- **Floating Quick-Contact Dock**:
  - Nổi cố định ở góc phải dưới (bottom-right): 3 nút tròn tách biệt xếp dọc (Zalo chat, Facebook Messenger, Gọi Hotline) có hiệu ứng lan tỏa sóng (Pulse), click mở ngay ứng dụng chat hoặc quay số điện thoại; nạp số điện thoại và đường link trực tiếp từ CSDL `SiteSetting`.

</domain>

<decisions>
## Implementation Decisions

### Phong cách Giao diện Storefront & Hero Banner Slider
- **D-01:** Áp dụng **Dark Gaming Sleek** làm theme chủ đạo cho toàn bộ Storefront: Nền tối `zinc-950`, bo viền `zinc-800` sắc nét, hiệu ứng ánh sáng Neon Cyan đặc trưng game thủ, đồng bộ visual design với Admin Dashboard.
- **D-02:** **Hero Banner Slider** toàn chiều rộng màn hình:
  - Tự động chuyển slide sau mỗi 5 giây (autoplay); tự động tạm dừng khi khách rê chuột vào banner.
  - Hỗ trợ đầy đủ nút mũi tên điều hướng trước/sau và chấm tròn chỉ số slide (dots indicator).
  - Nạp dữ liệu các banner đang kích hoạt (`isActive: true`) từ CSDL Prisma sắp xếp theo thứ tự `orderIndex: 'asc'`.

### Trải nghiệm Tìm kiếm & Bộ lọc khoảng giá ngân sách
- **D-03:** **Thanh trượt giá (Price Range Slider) 2 đầu kéo**:
  - Cho phép khách hàng tùy chỉnh mức giá tối thiểu (min) và tối đa (max) để lọc linh hoạt các dòng phụ kiện gaming từ giá rẻ đến cao cấp.
  - Kèm 2 ô nhập số tiền trực tiếp để người dùng gõ số chính xác nếu không muốn kéo thanh trượt.
- **D-04:** **Instant Search Popover trên Header**:
  - Khi người dùng gõ từ khóa tìm kiếm trên Header, một khung popover nổi xổ xuống hiển thị ngay các sản phẩm phù hợp (ảnh thumbnail, tên, giá bán, danh mục).
  - Khách hàng có thể click trực tiếp vào sản phẩm để xem chi tiết, hoặc bấm phím Enter / nút "Xem tất cả kết quả" để chuyển hướng tới trang `/products?search=...` với đầy đủ bộ lọc.

### Bố cục Trang Chi tiết Sản phẩm & Tech Specs
- **D-05:** **Bố cục 2 Cột Showcase Sản phẩm (`/products/[slug]`)**:
  - Cột trái: Khung ảnh lớn sắc nét, bên dưới là hàng thumbnail cuộn ngang; click vào bất kỳ thumbnail nào sẽ lập tức đổi ảnh lớn mượt mà.
  - Cột phải: Thông tin sản phẩm tổng quan (Tên, Danh mục, Giá khuyến mãi định dạng VNĐ, Giá niêm yết gạch ngang, Huy hiệu Còn hàng / Hết hàng, Nút Mua ngay / Thêm giỏ hàng, Nút Chat Zalo tư vấn).
- **D-06:** **Bảng Thông số kỹ thuật (Tech Specs) Clean Tech**:
  - Đặt trong khu vực Tabs bên dưới (cùng với Mô tả chi tiết).
  - Trình bày dạng bảng kẻ sọc xen kẽ (Zebra stripes `bg-zinc-900/60` và `bg-zinc-950/40`), phân định rõ ràng 2 cột Tên thông số và Giá trị chi tiết.

### Floating Quick-Contact Dock
- **D-07:** Nổi cố định ở góc phải dưới màn hình (bottom-right):
  - Gồm 3 nút tròn tách biệt xếp dọc:
    1. **Gọi Hotline:** Màu xanh ngọc/cyan, click kích hoạt `tel:...`.
    2. **Chat Zalo:** Màu xanh dương Zalo đặc trưng, click mở đường dẫn `https://zalo.me/...`.
    3. **Facebook Messenger:** Màu tím/xanh gradient Messenger, click mở Fanpage / m.me chat.
  - Hiệu ứng lan tỏa sóng (Pulse animation) nhẹ nhàng thu hút sự chú ý.
  - Dữ liệu Hotline, link Zalo và Facebook được nạp động từ CSDL bảng `SiteSetting`.

### the agent's Discretion
- Tạo component layout dùng chung cho Storefront (`StorefrontHeader`, `StorefrontFooter`, `QuickContactDock`).
- Xây dựng component `ProductCard` tái sử dụng linh hoạt trên cả Trang chủ, Trang danh mục và Trang tìm kiếm.
- Tận dụng Server Components để nạp trước dữ liệu SEO-friendly, kết hợp Client Components cho các tương tác như Slider, Instant Search, Range Slider và Image Gallery switch.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — Mục tiêu tổng thể và kiến trúc Gaming Gear E-Commerce
- `.planning/REQUIREMENTS.md` — Yêu cầu chi tiết `STORE-01` đến `STORE-06`
- `.planning/ROADMAP.md` — Tiêu chí hoàn thành của Phase 4
- `src/lib/prisma.ts` — Client truy vấn Category, Product, Banner, SiteSetting
- `src/lib/utils.ts` — Hàm `formatPrice` định dạng tiền tệ và `cn`
- `src/lib/slugify.ts` — Hàm tiện ích slug chuẩn SEO
- `src/types/index.ts` — Định nghĩa types của sản phẩm, danh mục, specs

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prisma/schema.prisma`: Đầy đủ các model `Category`, `Product`, `Banner`, `SiteSetting`. Dữ liệu seed đã có sẵn 6 danh mục, 17 sản phẩm, 3 banners và cấu hình hotline/zalo.
- `src/components/ui/button.tsx`: Có sẵn các variant `default`, `neon`, `outline`, `secondary`, `ghost`.
- `src/components/ui/badge.tsx` & `card.tsx`: Đã thiết lập sẵn styling Clean Tech.
- `src/lib/utils.ts`: `formatPrice()` hiển thị chuẩn tiền tệ Việt Nam đồng.

### Established Patterns
- Server Components cho các trang nạp dữ liệu từ Prisma (SEO tối đa).
- Client Components cho tương tác động (Slider, Search popover, Range Slider, Gallery switch).
- Lucide React icon set hiện đại và Sonner toast cho phản hồi người dùng.

### Integration Points
- `src/app/page.tsx`: Thay thế mockup tĩnh bằng Trang chủ Storefront hoàn chỉnh.
- `src/app/products/page.tsx`: Trang danh sách sản phẩm kết hợp tìm kiếm và bộ lọc giá.
- `src/app/category/[slug]/page.tsx`: Trang lọc theo từng danh mục cụ thể.
- `src/app/products/[slug]/page.tsx`: Trang chi tiết sản phẩm.
- `src/components/storefront/*`: Thư mục chứa toàn bộ UI components của storefront.

</code_context>

<specifics>
## Specific Ideas

- Nút Chat Zalo và Gọi Hotline: Khi khách hàng duyệt xem sản phẩm nào, các nút liên hệ hỗ trợ mở kênh giao tiếp nhanh chóng với chủ shop mà không cần đăng ký tài khoản rườm rà.
- Price Range Slider: Có thanh trượt 2 mốc kéo mượt mà kèm ô hiển thị min/max bằng VNĐ.

</specifics>

<deferred>
## Deferred Ideas

- Giỏ hàng tương tác và checkout guest form — Thuộc phạm vi chính của Phase 5.
- Đánh giá bình luận và hệ thống thành viên tích điểm — Thuộc v2 requirements.

</deferred>

---

*Phase: 4-Storefront Discovery & Browsing Experience*
*Context gathered: 2026-09-09*
