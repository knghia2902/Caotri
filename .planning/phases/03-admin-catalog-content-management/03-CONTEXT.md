# Phase 3: Admin Catalog & Content Management - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Xây dựng toàn bộ phân hệ quản lý dữ liệu sản phẩm, danh mục và nội dung cửa hàng cho trang Quản trị (Admin Dashboard):
- Module Quản lý Danh mục (`/admin/categories`): CRUD danh mục sản phẩm (tên, slug, icon/ảnh URL, thứ tự hiển thị `order`).
- Module Quản lý Sản phẩm (`/admin/products`): Bảng danh sách sản phẩm với tìm kiếm, lọc danh mục, quick-toggle trạng thái; trang Thêm mới (`/admin/products/new`) và Chỉnh sửa (`/admin/products/[id]/edit`) với nhiều ảnh, giá niêm yết, giá khuyến mãi, bảng thông số kỹ thuật (tech specs).
- Cơ chế quản lý hình ảnh tương thích Cloudflare Pages: Quản lý URL ảnh trực tiếp từ CDN/R2/Cloudinary (hoàn toàn không ghi đĩa local).
- Module Quản lý Banner trang chủ (`/admin/banners`): Card Grid trực quan, toggle bật/tắt hiển thị `isActive`, chỉnh sửa liên kết điều hướng và thứ tự `order`.
- Module Cài đặt thông tin cửa hàng (`/admin/settings`): Form cấu hình Hotline, link Zalo OA, link Facebook Fanpage, Địa chỉ và Email hỗ trợ (chỉ dành cho vai trò ADMIN).

</domain>

<decisions>
## Implementation Decisions

### Chiến lược Quản lý Hình ảnh (Cloudflare-ready, Zero Local Disk Writes)
- **D-01:** **Không lưu ảnh trên đĩa cục bộ (public/uploads)** để đảm bảo khả năng triển khai không lỗi trên Cloudflare Pages / Edge runtime (vốn không hỗ trợ filesystem ghi).
- **D-02:** Hỗ trợ **Quản lý hình ảnh qua URL trực tiếp** từ CDN (Cloudflare R2, Cloudinary, Imgur, Supabase, Unsplash) và tích hợp sẵn module upload Cloudinary/R2 khi người dùng cấu hình biến môi trường trong `.env`.
- **D-03:** Mỗi sản phẩm hỗ trợ **Bộ sưu tập nhiều hình ảnh (Multiple Images Gallery)**: Người dùng có thể thêm nhiều URL ảnh, xem preview tức thì, xóa bớt ảnh; ảnh đầu tiên trong danh sách tự động làm ảnh đại diện (thumbnail) chính.

### Cơ chế nhập Thông số kỹ thuật (Tech Specs) Sản phẩm
- **D-04:** Xây dựng **Bảng Key-Value động kết hợp Preset gợi ý theo Danh mục**:
  - Khi người dùng chọn Danh mục, form tự động gợi ý các thông số đặc thù của dòng gaming gear đó:
    - *Chuột gaming:* Cảm biến (Sensor), Độ phân giải (DPI), Switch, Trọng lượng, Kết nối.
    - *Bàn phím cơ:* Loại Switch, Chất liệu Keycap, Hotswap, Layout, Đèn LED, Kết nối.
    - *Tai nghe gaming:* Kích thước Driver, Dải tần số, Microphone, Kiểu kết nối, Trọng lượng.
    - *Lót chuột:* Chất liệu bề mặt, Kích thước, Đế chống trượt, Bo viền.
    - *Màn hình:* Kích thước & Tấm nền, Tần số quét (Hz), Độ phân giải, Thời gian phản hồi.
  - Người dùng có thể tùy ý thêm dòng mới, sửa tên trường hoặc xóa bớt dòng bất kỳ. Dữ liệu được lưu dạng JSON trong cơ sở dữ liệu.

### Giao diện CRUD Danh mục & Sản phẩm
- **D-05:** **Quản lý Danh mục (`/admin/categories`)**:
  - Hiển thị danh sách dạng Bảng Clean Tech (ảnh đại diện, tên danh mục, slug, thứ tự hiển thị, số lượng sản phẩm liên kết).
  - Thao tác Thêm / Sửa nhanh qua **Modal Dialog** ngay trên trang danh sách, không cần rời trang.
- **D-06:** **Quản lý Sản phẩm (`/admin/products`)**:
  - Bảng danh sách hiển thị: Ảnh thumbnail, Tên sản phẩm, Danh mục, Giá bán & Giá gốc, Huy hiệu Tồn kho, Nổi bật, Mới về.
  - Tích hợp **Quick-Toggle 1-Click**: Cho phép bật/tắt nhanh cờ "Nổi bật" (`isFeatured`) và "Còn hàng" (`inStock`) trực tiếp trên bảng sản phẩm, gọi Server Action lưu ngay vào CSDL mà không cần mở form chỉnh sửa.
  - Thanh công cụ: Tìm kiếm theo tên sản phẩm và Lọc theo Danh mục.
- **D-07:** **Trang Thêm / Sửa Sản phẩm riêng biệt (`/admin/products/new` & `/admin/products/[id]/edit`)**:
  - Dùng trang riêng với form rộng rãi, chia layout 2 cột khoa học (Cột chính: Tên, slug tự động sinh, mô tả, gallery ảnh, thông số kỹ thuật specs; Cột phụ: Chọn danh mục, thiết lập giá bán & giá khuyến mãi, trạng thái tồn kho, gắn cờ nổi bật/mới về).

### Quản lý Banners trang chủ & Cấu hình Cửa hàng (Site Settings)
- **D-08:** **Quản lý Banners (`/admin/banners`)**:
  - Bố cục dạng **Card Grid trực quan**: Mỗi banner hiển thị ảnh preview lớn tỉ lệ chuẩn, tiêu đề, link điều hướng khi click (`linkUrl`), thứ tự hiển thị (`order`), nút switch Bật/Tắt hiển thị (`isActive`), nút Chỉnh sửa và Xóa.
  - Thao tác Thêm / Sửa banner qua Modal Dialog trực quan.
- **D-09:** **Cài đặt Cửa hàng (`/admin/settings`)**:
  - Form cấu hình chia 2 nhóm rõ ràng:
    - *Kênh liên hệ & Chốt đơn:* Số điện thoại Hotline, Link Zalo OA / cá nhân, Link Fanpage Facebook.
    - *Thông tin thương hiệu:* Tên cửa hàng ("CaoTri Gaming Gear"), Địa chỉ shop, Email hỗ trợ.
  - Một nút "Lưu thay đổi" (Save Changes) cập nhật toàn bộ vào bảng `SiteSetting` qua Server Action.
  - Áp dụng kiểm tra bảo mật `requireRole(['ADMIN'])`: Chỉ tài khoản Quản trị viên mới được lưu thay đổi (Staff bị chặn).

### the agent's Discretion
- Tạo Server Actions tách bạch: `src/app/actions/category.ts`, `src/app/actions/product.ts`, `src/app/actions/banner.ts`, `src/app/actions/setting.ts`.
- Tự động sinh `slug` thân thiện SEO từ tên tiếng Việt (ví dụ: "Bàn phím cơ Keychron K2 Pro" $\rightarrow$ "ban-phim-co-keychron-k2-pro").
- Sử dụng hàm `formatVND` từ Phase 1 để định dạng tiền tệ đẹp mắt trên các bảng sản phẩm.
- Tích hợp Sonner Toast thông báo thành công / lỗi cho mọi thao tác CRUD.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — Định hướng dự án và kiến trúc tổng thể
- `.planning/REQUIREMENTS.md` — Tiêu chuẩn chi tiết cho `ADMIN-01`, `ADMIN-02`, `ADMIN-03`, `ADMIN-04`, `ADMIN-05`
- `.planning/ROADMAP.md` — Mục tiêu và tiêu chí hoàn thành của Phase 3
- `src/types/index.ts` — Định nghĩa kiểu dữ liệu `ProductSpecs`, `Role`, `UserRole`
- `prisma/schema.prisma` — Schema các model `Category`, `Product`, `Banner`, `SiteSetting`
- `src/lib/auth.ts` — Helper `requireRole`, `requireAuth` bảo vệ các Server Actions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/prisma.ts`: Client truy vấn và mutate CSDL SQLite / Postgres.
- `src/lib/auth.ts`: Hàm `requireRole(['ADMIN'])` và `requireAuth()` đã xây dựng ở Phase 2 để bảo vệ Server Actions.
- `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`: Bộ UI components đã chuẩn hóa.
- `src/lib/utils.ts`: Hàm `cn()` ghép class Tailwind và `formatVND(amount)` định dạng tiền tệ.
- `src/components/admin/sidebar.tsx` & `header.tsx`: Khung giao diện Admin Shell có sẵn các menu liên kết tới `/admin/categories`, `/admin/products`, `/admin/banners`, `/admin/settings`.

### Established Patterns
- Server Actions với `'use server'` kết hợp Zod validation và `revalidatePath`.
- Toast notifications qua `sonner` thông báo kết quả tức thì.
- Phân quyền RBAC 2 lớp: Chặn giao diện + Chặn logic trong Server Actions.

</code_context>

<specifics>
## Specific Ideas & References

- Trình nhập ảnh Gallery: Cho phép người dùng nhập nhanh URL ảnh (hoặc paste nhiều URL) và hiển thị lưới ảnh thumbnail có nút kéo đổi vị trí hoặc nút "Đặt làm ảnh chính", nút "Xóa ảnh".
- Presets thông số kỹ thuật: Tự động điền danh sách key tương ứng khi đổi danh mục trong form sản phẩm, tiết kiệm 90% thời gian nhập liệu cho admin.

</specifics>

<deferred>
## Deferred Ideas

- Upload ảnh trực tiếp lên Cloudflare R2 qua Presigned URL — Sẽ kích hoạt cấu hình khi người dùng cung cấp thông tin R2 Bucket / S3 credentials trong file `.env` khi triển khai production.
- Phân trang nâng cao (Pagination với pageSize tùy chọn) — Tạm thời dùng pagination tiêu chuẩn hoặc danh sách scroll tối ưu.

</deferred>
