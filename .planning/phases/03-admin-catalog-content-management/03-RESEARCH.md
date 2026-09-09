# Phase 3: Admin Catalog & Content Management - Research

**Researched:** 2026-09-09
**Domain:** Next.js 15 Server Actions CRUD, Cloudflare Pages CDN Image Management, Dynamic Specs Editor & Admin CMS
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** **Không lưu ảnh trên đĩa cục bộ (`public/uploads`)**: Tuyệt đối không ghi file vào filesystem để sẵn sàng 100% triển khai lên Cloudflare Pages / Edge runtime (vốn là read-only filesystem).
- **D-02:** **Quản lý hình ảnh qua URL trực tiếp**: Dán/nhập link ảnh trực tiếp từ CDN (Cloudflare R2, Cloudinary, Imgur, Supabase, Unsplash) và tích hợp sẵn module client Cloudinary/R2 khi người dùng cấu hình biến môi trường trong `.env`.
- **D-03:** **Bộ sưu tập nhiều hình ảnh (Multiple Images Gallery)**: Cho phép thêm nhiều link ảnh, xem preview tức thì, xóa bớt; ảnh đầu tiên tự động làm ảnh đại diện (thumbnail) chính.
- **D-04:** **Bảng Key-Value động kết hợp Preset gợi ý theo Danh mục**: Tự động gợi ý các trường thông số đặc thù của từng dòng gaming gear (Chuột: Sensor, DPI, Switch; Phím: Switch, Keycap, Hotswap; Màn hình: Tấm nền, Tần số Hz...), người dùng có thể thêm/sửa/xóa dòng tự do.
- **D-05:** **Quản lý Danh mục (`/admin/categories`)**: Bảng Clean Tech kết hợp Modal Dialog Thêm / Sửa nhanh ngay trên trang danh sách.
- **D-06:** **Quản lý Sản phẩm (`/admin/products`)**: Bảng danh sách sản phẩm có tìm kiếm, lọc danh mục và **Quick-Toggle 1-Click** bật/tắt nhanh "Nổi bật" (`isFeatured`) và "Còn hàng" (`inStock`) trực tiếp trên bảng.
- **D-07:** **Trang Thêm / Sửa Sản phẩm riêng biệt (`/admin/products/new` & `[id]/edit`)**: Form 2 cột rộng rãi, dễ dàng quản lý gallery nhiều ảnh và bảng specs.
- **D-08:** **Quản lý Banners (`/admin/banners`)**: Bố cục Card Grid trực quan với ảnh banner lớn, nút toggle `isActive`, chỉnh sửa link điều hướng và thứ tự `order`.
- **D-09:** **Cài đặt Cửa hàng (`/admin/settings`)**: Form cấu hình Hotline, link Zalo OA, Fanpage Facebook, Địa chỉ và Email hỗ trợ (chỉ dành cho vai trò ADMIN).

### the agent's Discretion
- Utility `slugify`: Hàm tự động chuyển đổi tiêu đề tiếng Việt có dấu thành URL slug chuẩn SEO (ví dụ: "Bàn phím cơ DareU EK87" $\rightarrow$ "ban-phim-co-dareu-ek87").
- Tổ chức Server Actions theo từng domain nghiệp vụ: `src/app/actions/category.ts`, `src/app/actions/product.ts`, `src/app/actions/banner.ts`, `src/app/actions/setting.ts`.
- Tận dụng `revalidatePath` để cập nhật dữ liệu tức thì cho Server Components mà không cần reload trang.

### Deferred Ideas (OUT OF SCOPE)
- Upload ảnh trực tiếp lên Cloudflare R2 qua Presigned URL (khi có thông tin R2 Bucket / S3 credentials trong file `.env` khi deploy production).
- Phân trang nâng cao (Pagination controls).

</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Category Table & Modal CRUD | Frontend Server / Client | Database (Prisma) | Server Component nạp danh sách + Client Component Modal thêm/sửa nhanh |
| Product List & Quick-Toggle | Frontend Server / Client | Database (Prisma) | Bảng dữ liệu lọc/tìm kiếm + Server Actions toggle `isFeatured`/`inStock` tức thì |
| Product Form (New/Edit) | Frontend Server / Client | Database (Prisma) | Form 2 cột: Gallery nhiều ảnh + Preset Specs Key-Value + Zod validation |
| Banner Card Grid | Frontend Server / Client | Database (Prisma) | Hiển thị thẻ banner trực quan, nút toggle `isActive`, modal chỉnh sửa |
| Site Settings Form | Frontend Server / Client | Database (Prisma) | Cập nhật cấu hình cửa hàng (Hotline/Zalo/FB), bảo vệ bởi `requireRole(['ADMIN'])` |
| Cloudflare-Ready Images | Browser / CDN | Database (Prisma) | Lưu trữ mảng URL ảnh dạng JSON trong DB, không ghi đĩa máy chủ |

</architectural_responsibility_map>

<research_summary>
## Summary

Trong kiến trúc Next.js 15 App Router chuẩn bị triển khai lên **Cloudflare Pages**, việc loại bỏ toàn bộ các thao tác ghi đĩa cục bộ (`fs.writeFile`, `public/uploads`) là yêu cầu tối quan trọng. Thay vào đó, toàn bộ hình ảnh sản phẩm và banner được quản lý thông qua mảng các chuỗi URL (lưu dạng chuỗi JSON `["https://..."]` trong cột `images` của model `Product`, và `imageUrl` của model `Banner`).

Cách tiếp cận này mang lại 3 ưu điểm vượt trội:
1. **Cloudflare & Edge Ready 100%**: Ứng dụng hoạt động mượt mà trên môi trường Serverless / Cloudflare Pages không có ổ đĩa ghi.
2. **Linh hoạt tối đa nguồn ảnh**: Có thể lấy ảnh từ bất kỳ CDN nào (Cloudflare R2, Supabase Storage, Cloudinary, Imgur, CDN hãng Razer/Logitech/Keychron).
3. **Hiệu năng tải trang cực nhanh**: Ảnh được cache trực tiếp từ CDN toàn cầu, không gây nghẽn băng thông của server ứng dụng.

</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Server Actions | 15.x | Mutation dữ liệu CRUD | Type-safe, tích hợp sẵn với `revalidatePath`, không cần viết API routes rời rạc |
| Prisma ORM | 5.x / 6.x | Tương tác CSDL | Type-safe queries cho Category, Product, Banner, SiteSetting |
| Lucide React | 0.460+ | Icons quản trị | Icons: Plus, Edit, Trash2, Eye, EyeOff, Star, Check, Upload, Image, ExternalLink |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sonner | ^1.7.0 | Thông báo Toast UI | Phản hồi thông báo thêm/sửa/xóa thành công hoặc lỗi |
| React Hook Form / Zod | 7.x / 3.x | Form state & validate | Đảm bảo tính toàn vẹn dữ liệu trước khi gọi Server Actions |

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Dynamic Tech Specs Presets
Khi người dùng chọn danh mục, form tự động nạp danh sách key thông số đặc thù:
```typescript
export const CATEGORY_SPEC_PRESETS: Record<string, string[]> = {
  chuot-gaming: ["Cảm biến (Sensor)", "Độ phân giải (DPI)", "Switch", "Trọng lượng", "Kiểu kết nối", "Thời lượng pin"],
  ban-phim-co: ["Loại Switch", "Chất liệu Keycap", "Hotswap", "Layout", "Đèn LED", "Kiểu kết nối"],
  tai-nghe-gaming: ["Kích thước Driver", "Dải tần số", "Microphone", "Kiểu kết nối", "Trọng lượng"],
  lot-chuot: ["Chất liệu bề mặt", "Kích thước", "Đế chống trượt", "Bo viền"],
  man-hinh-gaming: ["Kích thước & Tấm nền", "Tần số quét (Hz)", "Độ phân giải", "Thời gian phản hồi", "Cổng kết nối"],
};
```

### Pattern 2: Cloudflare-Safe Multiple Images Editor
Component quản lý danh sách URL ảnh:
- Ô nhập link ảnh (kèm nút "+ Thêm ảnh").
- Hiển thị danh sách thumbnail ảnh dạng lưới.
- Nút "Đặt làm ảnh chính" (di chuyển URL lên vị trí đầu tiên `images[0]`).
- Nút "Xóa ảnh" khỏi danh sách.
- Xem trước ảnh phóng to khi click.

### Pattern 3: Quick-Toggle Server Action
Cho phép bật/tắt nhanh trên bảng sản phẩm mà không reload cả trang:
```typescript
export async function toggleProductFeatured(id: string, currentState: boolean) {
  await requireRole(['ADMIN', 'STAFF']);
  await prisma.product.update({
    where: { id },
    data: { isFeatured: !currentState },
  });
  revalidatePath('/admin/products');
  return { success: true };
}
```

</architecture_patterns>

<validation_architecture>
## Validation Architecture

Quy trình kiểm thử tự động cho Phase 3 gồm:
1. **Catalog CRUD Automated Test (`scripts/test-catalog.ts`)**:
   - Kiểm tra hàm `slugify` tạo slug chuẩn SEO không dấu.
   - Thử nghiệm gọi Server Actions (hoặc Prisma service logic):
     - Tạo danh mục mới -> Cập nhật danh mục -> Xóa danh mục test.
     - Tạo sản phẩm mới với multiple images và dynamic specs -> Cập nhật -> Toggle isFeatured -> Toggle inStock -> Xóa sản phẩm test.
     - Tạo banner mới -> Toggle isActive -> Xóa banner test.
     - Cập nhật site settings (hotline, zalo, facebook) với role ADMIN và kiểm tra role STAFF bị chặn.
2. **Next.js Production Build**:
   - `npm run build` xác nhận tất cả các trang `/admin/categories`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/banners`, `/admin/settings` biên dịch thành công 100%.

</validation_architecture>

<pitfalls>
## Common Pitfalls & Traps

1. **Ghi đĩa cục bộ trên Serverless**:
   - *Lỗi:* Sử dụng `fs.writeFileSync` hoặc lưu vào `public/uploads` sẽ hoạt động trên máy local nhưng chắc chắn crash 100% khi deploy lên Cloudflare Pages hoặc Vercel.
   - *Khắc phục:* Tuyệt đối không dùng `fs` để lưu file ảnh người dùng tải lên; lưu chuỗi URL ảnh từ CDN vào CSDL.
2. **Hydration Mismatch trên Dynamic Form Rows**:
   - *Lỗi:* Khởi tạo các dòng specs ngẫu nhiên bằng `Math.random()` để sinh id có thể gây lệch HTML giữa Server và Client.
   - *Khắc phục:* Sử dụng index hoặc hàm id deterministic/client-only sau khi mount.
3. **Revalidation sau khi cập nhật dữ liệu**:
   - *Lỗi:* Sau khi cập nhật danh mục hoặc sản phẩm, trang web vẫn hiển thị dữ liệu cũ do Next.js cache.
   - *Khắc phục:* Gọi `revalidatePath('/admin/products')`, `revalidatePath('/admin/categories')`, `revalidatePath('/')` trong mọi Server Actions.

</pitfalls>

---

*Phase: 03-admin-catalog-content-management*
*Research completed: 2026-09-09*
*Ready for planning: yes*
