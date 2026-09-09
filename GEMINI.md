<!-- GSD:project-start source:PROJECT.md -->

## Project

**Gaming Gear & Tech Accessories E-Commerce**

Hệ thống Website thương mại điện tử chuyên kinh doanh thiết bị linh kiện & gaming gear (chuột, bàn phím, tai nghe, lót chuột, màn hình,...). Hệ thống gồm 2 phân hệ chính: Cửa hàng trực tuyến (Storefront) tối ưu trải nghiệm mua sắm và trang Quản trị (Admin Dashboard) quản lý sản phẩm, đơn hàng, danh mục, banner và phân quyền nhân viên.

**Core Value:** Trải nghiệm mua hàng nhanh chóng, mượt mà: khách hàng dễ dàng tìm kiếm, chọn lọc sản phẩm theo nhu cầu, lên đơn tiện lợi với kết nối trực tiếp qua Zalo/Facebook/Hotline; đồng thời Admin quản lý kho hàng và đơn hàng trực quan, hiệu quả.

### Constraints

- **Tech Stack**: Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL (Supabase).
- **Image Storage**: Cloudinary / Supabase Storage tối ưu CDN tải nhanh cho hình ảnh sản phẩm & banner.
- **Authentication**: NextAuth.js / Auth.js hoặc JWT session bảo mật cho phân hệ Admin.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

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

# Core & Framework

# Database & ORM

# State, Forms & Validation

# UI & Icons

# Auth & Storage

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

- Dùng PostgreSQL cục bộ hoặc Docker / Neon Serverless Postgres miễn phí.
- Upload ảnh trực tiếp vào thư mục `/public/uploads` (cho môi trường VPS / Local) hoặc Free Cloudinary tier.
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

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
