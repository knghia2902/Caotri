# Stack Research

**Domain:** Gaming Gear & Computer Accessories E-Commerce
**Researched:** 2026-09-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x / 14.x (App Router) | Fullstack React Web Framework | Server Components tối ưu SEO cho sản phẩm, Server Actions xử lý mutations mượt mà, API routes tích hợp sẵn cho cả Storefront và Admin |
| TypeScript | 5.x | Ngôn ngữ tĩnh an toàn | Đảm bảo tính toàn vẹn dữ liệu từ Database (Prisma) qua API đến Client Component |
| Tailwind CSS | 3.4+ | Utility-first CSS Framework | Xây dựng giao diện phong cách Gaming Gear (Dark/Light mode, Neon accents, Sleek Cards) nhanh, responsive mượt trên Mobile/Desktop |
| Prisma ORM | 5.x / 6.x | Type-safe Database ORM | Đơn giản hóa migrations, mô hình hóa quan hệ Category - Product - Order - User, tự động sinh TypeScript types |
| PostgreSQL | 15+ (Supabase) | Cơ sở dữ liệu quan hệ | Đảm bảo tính toàn vẹn giao dịch đơn hàng, hỗ trợ JSONB cho thông số kỹ thuật (tech specs) linh hoạt của từng dòng gear |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 4.x / 5.x | State Management nhẹ cho giỏ hàng | Lưu trữ Cart state client-side, đồng bộ với LocalStorage không gây re-render thừa |
| Lucide React | Latest | Icon Set hiện đại | Icon trực quan cho danh mục, giỏ hàng, bộ lọc, hotline, Zalo, social |
| Zod | 3.x | Schema validation | Xác thực dữ liệu form đặt hàng (SĐT Việt Nam, địa chỉ) và form quản trị sản phẩm |
| React Hook Form | 7.x | Quản lý form | Tối ưu form checkout và form quản trị thêm/sửa sản phẩm nhiều trường |
| NextAuth.js / Auth.js | 5.x / 4.x | Xác thực & phân quyền Admin/Staff | Quản lý session, phân quyền RBAC (Role: ADMIN, STAFF), bảo vệ route `/admin` |
| Cloudinary SDK / Supabase Storage | Latest | Quản lý CDN & tải lên hình ảnh | Lưu trữ tối ưu ảnh sản phẩm, tự động nén WebP/AVIF giúp trang tải siêu nhanh |
| Sonner / React-Hot-Toast | Latest | Thông báo Toast UI | Phản hồi thêm giỏ hàng thành công, cập nhật đơn hàng thành công |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + Prettier | Chuẩn hóa code style | Đảm bảo code sạch, nhất quán |
| Prisma Studio | GUI quản lý dữ liệu trực tiếp | Cực kỳ tiện lợi để xem/sửa data nhanh khi dev |

## Installation

```bash
# Core & Framework
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Database & ORM
npm install @prisma/client
npm install -D prisma

# State, Forms & Validation
npm install zustand zod react-hook-form @hookform/resolvers

# UI & Icons
npm install lucide-react sonner clsx tailwind-merge

# Auth & Storage
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js App Router | Vite React SPA + Express | Khi muốn tách biệt hoàn toàn 2 repository frontend & backend độc lập |
| Prisma ORM | Drizzle ORM | Khi cần câu query raw SQL siêu nhẹ, tối giản runtime overhead |
| Supabase / Cloudinary | Lưu file cục bộ (Local Disk) | Khi ngân sách 0đ hoặc không có kết nối internet khi triển khai on-premise |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux Toolkit cho giỏ hàng | Quá nhiều boilerplate phức tạp không cần thiết cho e-commerce đơn giản | Zustand hoặc React Context |
| Pages Router (Next.js cũ) | Không tận dụng được Server Components, metadata SEO khó quản lý | Next.js App Router |
| Lưu trữ ảnh dưới dạng Base64 trong Database | Làm phình to DB, truy vấn chậm, không thể cache CDN | Cloudinary / Supabase Storage hoặc Static URLs |

## Stack Patterns by Variant

**Nếu triển khai đơn giản không cần thẻ tín dụng cloud:**
- Dùng PostgreSQL cục bộ hoặc Docker / Neon Serverless Postgres miễn phí.
- Upload ảnh trực tiếp vào thư mục `/public/uploads` (cho môi trường VPS / Local) hoặc Free Cloudinary tier.

**Nếu quy mô mở rộng nhiều chi nhánh:**
- Mở rộng thêm bảng `Branch` và `StockLocation` trong schema Prisma.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15 | React 19 / 18 | Tương thích tốt với Server Actions |
| Prisma 5/6 | PostgreSQL 14+ | Hỗ trợ đầy đủ connection pooling |

## Sources

- Next.js Official Documentation (App Router, Server Actions)
- Prisma Official Docs (Relations, Schema Design)
- Tailwind CSS Best Practices for E-commerce UI

---
*Stack research for: Gaming Gear & Tech Accessories E-Commerce*
*Researched: 2026-09-09*
