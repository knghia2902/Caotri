# Phase 4: Storefront Discovery & Browsing Experience - Research

**Researched:** 2026-09-09
**Domain:** Next.js 15 App Router Storefront, Dark Gaming Theme, Dynamic Banner Slider, Price Range Slider, Instant Search Popover & Product Details Showcase
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** **Dark Gaming Sleek Theme**: Nền tối `zinc-950`, viền `zinc-800` sắc nét, điểm nhấn Neon Cyan (`cyan-400`/`cyan-500`) đặc trưng game thủ, đồng bộ visual design với Admin Dashboard.
- **D-02:** **Hero Banner Slider toàn chiều rộng**:
  - Tự động chuyển slide sau mỗi 5 giây (autoplay 5s), tự động tạm dừng khi hover chuột.
  - Hỗ trợ nút mũi tên điều hướng và chấm tròn indicator (dots).
  - Nạp banner `isActive: true` từ CSDL Prisma theo thứ tự `orderIndex: 'asc'`.
- **D-03:** **Thanh trượt giá (Price Range Slider) 2 đầu kéo**:
  - Cho phép khách kéo min - max để lọc sản phẩm linh hoạt từ giá rẻ đến cao cấp.
  - Kèm 2 ô nhập số tiền trực tiếp (VNĐ) để người dùng gõ số chính xác.
- **D-04:** **Instant Search Popover trên Header**:
  - Khi người dùng gõ từ khóa tìm kiếm trên Header, popover xổ xuống ngay hiển thị các sản phẩm phù hợp (ảnh thumbnail, tên, giá bán, danh mục).
  - Bấm Enter hoặc nút "Xem tất cả kết quả" chuyển hướng tới trang `/products?search=...` với đầy đủ bộ lọc.
- **D-05:** **Bố cục 2 Cột Trang Chi tiết Sản phẩm (`/products/[slug]`)**:
  - Cột trái: Khung ảnh lớn sắc nét, bên dưới là hàng thumbnail cuộn ngang; click đổi ảnh lớn tức thì.
  - Cột phải: Thông tin sản phẩm (Tên, Danh mục, Giá khuyến mãi định dạng VNĐ, Giá niêm yết gạch ngang, Huy hiệu Còn hàng, Nút Thêm giỏ, Nút Chat Zalo tư vấn).
- **D-06:** **Bảng Thông số kỹ thuật (Tech Specs) Clean Tech**:
  - Đặt trong khu vực Tabs bên dưới (cùng với Mô tả chi tiết).
  - Trình bày dạng bảng kẻ sọc xen kẽ (Zebra stripes), phân định 2 cột Tên thông số và Giá trị chi tiết.
- **D-07:** **Floating Quick-Contact Dock**:
  - Nổi cố định ở góc phải dưới (bottom-right): 3 nút tròn tách biệt xếp dọc (Gọi Hotline, Chat Zalo, Facebook Messenger) có hiệu ứng lan tỏa sóng (Pulse).
  - Dữ liệu nạp trực tiếp từ bảng `SiteSetting`.

### the agent's Discretion
- Tạo component `ProductCard` dùng chung cho toàn bộ Storefront (Trang chủ, Trang danh mục, Trang tìm kiếm).
- Xây dựng component layout dùng chung: `StorefrontHeader`, `StorefrontFooter`, `QuickContactDock`.
- Server Action `searchProductsAction(query)` tìm kiếm nhanh hỗ trợ Instant Search Popover.

### Deferred Ideas (OUT OF SCOPE)
- Giỏ hàng tương tác lưu LocalStorage và form checkout guest (Phase 5).
- Đánh giá sản phẩm và tích điểm thành viên (v2).

</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Storefront Layout & Header | Server Component / Client Popover | Database (Prisma) | Nạp danh mục và settings từ CSDL; Header tích hợp Client Popover tìm kiếm |
| Hero Banner Slider | Client Component | Database (Prisma) | Server Component nạp banners `isActive: true`, Client Component xử lý autoplay & slide transition |
| Home Showcase (Featured & New) | Server Component | Database (Prisma) | Nạp trực tiếp sản phẩm `isFeatured: true` và `isNew: true` từ CSDL, tối ưu SEO |
| Catalog & Category Browsing | Server Component / Client Filter | Database (Prisma) | Server Component nạp danh sách; Client Component xử lý Price Range Slider, Sort & Search |
| Product Details Showcase | Server Component / Client Gallery | Database (Prisma) | SEO metadata theo slug; Client Component xử lý chọn ảnh thumbnail & tabs specs |
| Floating Quick-Contact Dock | Client Component | Database (Prisma) | Đọc Hotline, Zalo, Facebook từ `SiteSetting`; hiển thị hiệu ứng pulse cố định góc màn hình |

</architectural_responsibility_map>

<research_summary>
## Summary

Phase 4 là bước chuyển mình quan trọng của toàn bộ dự án: chuyển từ phân hệ Quản trị Admin sang giao diện Khách hàng (Storefront).

Nhờ kiến trúc **Next.js 15 App Router** và việc CSDL đã có sẵn dữ liệu phong phú từ các phase trước (6 danh mục, 17 sản phẩm với gallery JSON & specs JSON, 3 banners và site settings), Storefront có thể:
1. **Server-Side Render (SSR)** toàn bộ nội dung tĩnh và động để đạt điểm SEO tối đa: tiêu đề trang, metadata, OpenGraph tags, danh sách sản phẩm.
2. **Client-Side Interactivity** ở các vị trí cần trải nghiệm người dùng mượt mà:
   - Slider banner tự động chạy với CSS transitions.
   - Khung gợi ý tìm kiếm tức thì (Instant Search Popover) với debounced fetch.
   - Thanh trượt giá kép (Dual Range Slider) cho phép lọc theo ngân sách mà không gây reload trang không cần thiết.
   - Gallery chuyển ảnh thumbnail mượt mà với fallback ảnh lỗi.
   - Nút liên hệ nhanh mở trực tiếp Zalo OA / Messenger / Hotline.

</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.x | Server Components & Page Routing | Tối ưu SEO cho sản phẩm, hỗ trợ async params `Promise<{ slug: string }>` |
| Prisma Client | 6.x | Tương tác CSDL | Truy vấn linh hoạt theo slug, categoryId, khoảng giá `gte`/`lte`, sắp xếp `orderBy` |
| Tailwind CSS | 3.4+ | Styling Dark Gaming Theme | `zinc-950`, `zinc-900`, `cyan-400`, `cyan-500`, neon glow shadows |
| Lucide React | Latest | Icon Set hiện đại | `Gamepad2`, `Search`, `ShoppingBag`, `Phone`, `MessageSquare`, `ExternalLink`, `ChevronLeft`, `ChevronRight`, `SlidersHorizontal` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Sonner | Latest | Toast UI | Thông báo khi khách hàng click Thêm giỏ hàng (chuẩn bị kết nối Phase 5) |
| use-debounce / timeout | Standard | Trì hoãn input tìm kiếm | Tránh spam query khi khách hàng gõ từ khóa trong ô tìm kiếm |

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Storefront Layout Wrapper
Thay vì bọc layout toàn app, ta tạo nhóm route `(storefront)` hoặc cấu trúc trang công khai riêng biệt với `StorefrontHeader`, `StorefrontFooter` và `QuickContactDock` để không ảnh hưởng tới layout của `/admin/*`.

### Pattern 2: Instant Search Action
```typescript
export async function searchProductsAction(query: string) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { slug: { contains: q } },
      ],
    },
    take: 6,
    include: { category: { select: { name: true, slug: true } } },
  });
  return products;
}
```

### Pattern 3: Dual Price Range Slider
Sử dụng input range hoặc thanh kéo 2 điểm với CSS custom slider để khách hàng điều chỉnh khoảng giá từ 0₫ đến 10.000.000₫ kèm ô nhập số tiền trực tiếp.

### Pattern 4: Floating Contact Dock Pulse Animation
```css
@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(6, 182, 212, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
}
```

</architecture_patterns>

<validation_architecture>
## Validation Architecture

Quy trình kiểm thử tự động cho Phase 4 gồm:
1. **Storefront Automated Test (`scripts/test-storefront.ts`)**:
   - Kiểm tra truy vấn CSDL cho Trang chủ (Banners active, Featured products, New products, Categories).
   - Kiểm tra truy vấn lọc sản phẩm theo category slug, khoảng giá min/max, từ khóa tìm kiếm.
   - Kiểm tra truy vấn sản phẩm theo slug chi tiết (lấy đầy đủ images JSON, specs JSON).
   - Kiểm tra đọc cấu hình hotline, zalo, facebook từ `SiteSetting` cho Floating Dock.
2. **Next.js Production Build**:
   - `npm run build` xác nhận tất cả các trang `/`, `/products`, `/category/[slug]`, `/products/[slug]` biên dịch thành công 100% không lỗi SSR hay TypeScript.

</validation_architecture>

<pitfalls>
## Common Pitfalls & Traps

1. **Async Params trong Next.js 15**:
   - *Lỗi:* Trong Next.js 15, `params` của trang động là `Promise<{ slug: string }>` thay vì plain object. Truy cập trực tiếp `params.slug` sẽ gây cảnh báo hoặc lỗi biên dịch.
   - *Khắc phục:* Luôn dùng `const { slug } = await params;`.
2. **Lỗi Parse JSON images / specs khi dữ liệu rỗng**:
   - *Lỗi:* `JSON.parse` có thể ném exception nếu dữ liệu là null hoặc không hợp lệ.
   - *Khắc phục:* Luôn bọc trong khối try-catch an toàn hoặc fallback `[]` / `{}`.
3. **Hydration Mismatch trên Instant Search Popover & Slider**:
   - *Lỗi:* Trạng thái mở/đóng hoặc chỉ số slide khởi tạo khác nhau giữa server và client.
   - *Khắc phục:* Đánh dấu Client Component bằng `'use client'`, quản lý state sau khi component mount (`useEffect`).

</pitfalls>

---

*Phase: 04-storefront-discovery-browsing-experience*
*Research completed: 2026-09-09*
*Ready for planning: yes*
