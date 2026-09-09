# Phase 1: Project Scaffolding, Theme & Database Setup - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Khởi tạo cấu trúc dự án Next.js 14/15 App Router Fullstack (TypeScript, Tailwind CSS), thiết lập bảng màu giao diện phong cách Clean Tech Minimalist, cấu hình Prisma ORM với cơ sở dữ liệu SQLite cho local development trước (sẵn sàng chuyển sang Supabase PostgreSQL khi deploy), và viết script Seed Data nạp sẵn 6 danh mục gaming gear cùng 15-20 sản phẩm mẫu thực tế.

</domain>

<decisions>
## Implementation Decisions

### Visual Theme & Styling
- **D-01:** Sử dụng phong cách **Clean Tech Minimalist** (thanh lịch, hiện đại, tối giản như Keychron / Apple Tech) làm phong cách chủ đạo cho cả Storefront và Admin.
- **D-02:** Nền sáng sạch sẽ, độ tương phản cao, typography hiện đại, đường bo góc tinh tế, tập trung tôn vinh tối đa hình ảnh chi tiết và sắc nét của sản phẩm gaming gear.

### Seed Data Scope
- **D-03:** Cung cấp bộ dữ liệu phong phú thực tế với **6 danh mục chính**:
  1. Chuột Gaming (Logitech G Pro X Superlight, Razer DeathAdder V3 Pro,...)
  2. Bàn phím cơ (Keychron Q1 Pro, Akko 3087, MonsGeek M1,...)
  3. Tai nghe & Audio (HyperX Cloud II, SteelSeries Arctis Nova,...)
  4. Lót chuột & Mousepad (Artisan Ninja FX, SteelSeries QcK Heavy,...)
  5. Màn hình Gaming & Giá treo (Asus ROG Swift, LG UltraGear, Arm màn hình Human Motion,...)
  6. Phụ kiện & Switch cơ (Gateron Oil King, Dầu lube Krytox, Keycap PBT,...)
- **D-04:** Mỗi sản phẩm mẫu có từ 2-4 ảnh chất lượng cao, giá niêm yết, giá khuyến mãi và thông số kỹ thuật (specs) thực tế chi tiết (DPI, switch, kết nối, trọng lượng, kích thước).
- **D-05:** Tạo sẵn 1 tài khoản Admin mặc định (`admin@caotri.vn`) và 1 tài khoản Staff (`staff@caotri.vn`) được mã hóa bcrypt để phục vụ kiểm thử phân quyền ở Phase 2.

### Database Environment
- **D-06:** Khởi tạo và kiểm thử với **SQLite cục bộ trước** (`file:./dev.db`) để có thể dev và chạy test ngay lập tức mà không phụ thuộc internet hay tài khoản cloud.
- **D-07:** Thiết kế Prisma Schema chuẩn hóa (dùng các kiểu dữ liệu tương thích cao, mapping chuỗi/JSON rõ ràng), cung cấp file `.env.example` và script migration sẵn sàng chuyển đổi sang Supabase PostgreSQL khi triển khai production.

### the agent's Discretion
- Kiến trúc thư mục mã nguồn Next.js (`/src/app`, `/src/components`, `/src/lib`, `/src/types`, `/src/actions`).
- Lựa chọn icon set hiện đại với Lucide React.
- Cấu hình Tailwind CSS components dùng chung (Button, Card, Badge, Input).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope & Architecture
- `.planning/PROJECT.md` — Mục tiêu, phạm vi và công nghệ lõi của dự án
- `.planning/REQUIREMENTS.md` — Danh sách yêu cầu v1 (FOUND-01, FOUND-02, FOUND-03)
- `.planning/research/ARCHITECTURE.md` — Cấu trúc hệ thống Next.js App Router và mô hình dữ liệu Prisma
- `.planning/research/STACK.md` — Phiên bản thư viện và cấu hình gói đề xuất

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Dự án là Greenfield (khởi tạo mới hoàn toàn).

### Established Patterns
- Next.js 14/15 App Router với Server Components mặc định.
- Server Actions và Prisma Client Singleton cho database queries.
- Tailwind CSS với clean tech theme.

### Integration Points
- Prisma schema trong `/prisma/schema.prisma` làm nguồn sự thật (Source of Truth) cho toàn bộ types và queries của hệ thống.
- Seed script `/prisma/seed.ts` được cấu hình trong `package.json`.

</code_context>

<specifics>
## Specific Ideas

- Giao diện Clean Tech Minimalist: Không quá hầm hố hay màu mè, ưu tiên đường nét sạch sẽ, chữ đen/xám đậm trên nền trắng/xám nhạt tinh tế, giúp sản phẩm công nghệ nổi bật tự nhiên.
- Dữ liệu demo phải mang tính ứng dụng cao, tên gọi chuẩn của các dòng gear nổi tiếng tại thị trường Việt Nam để người dùng trải nghiệm cảm nhận sự chân thực ngay từ ngày đầu.

</specifics>

<deferred>
## Deferred Ideas

- Chế độ Dark mode chuyển đổi (Toggle Dark/Light theme) — Có thể cân nhắc thêm ở giai đoạn hoàn thiện giao diện nếu người dùng yêu cầu.
- Chuyển đổi Prisma provider sang Supabase PostgreSQL khi chuẩn bị deploy production.

</deferred>

---

*Phase: 1-Project Scaffolding, Theme & Database Setup*
*Context gathered: 2026-09-09*
