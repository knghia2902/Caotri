---
phase: 03-admin-catalog-content-management
plan: 03-03
status: complete
date: 2026-09-09
---

# Plan 03-03 Summary: Banner Slider Management & Storefront Site Settings

## What Was Built
1. **Server Actions Quản lý Banner & Cài đặt Cửa hàng**:
   - `src/app/actions/banner.ts`: `createBanner`, `updateBanner`, `deleteBanner`, `toggleBannerActive` (hỗ trợ phân quyền ADMIN/STAFF, revalidate trang chủ `/` và `/admin/banners`).
   - `src/app/actions/setting.ts`: `updateSettings` (bảo vệ nghiêm ngặt chỉ dành cho tài khoản `ADMIN`, cập nhật bảng `SiteSetting` cho Hotline, Zalo OA, Facebook Fanpage, Tên shop, Địa chỉ, Email).
2. **Quản lý Banner Slider trang chủ dạng Card Grid (`src/components/admin/banner-grid.tsx` & `/admin/banners/page.tsx`)**:
   - Giao diện Card Grid hiện đại, hình ảnh banner preview lớn sắc nét tỉ lệ 16:8.
   - Quick-Toggle switch 1-click Bật / Tắt trạng thái `isActive` kèm hiệu ứng phản hồi tức thì và Toast thông báo.
   - Hiển thị thứ tự hiển thị `#orderIndex`, liên kết điều hướng và ID.
   - Modal Thêm / Sửa Banner (`src/components/admin/banner-modal.tsx`) hỗ trợ xem trước ảnh trực tiếp từ URL CDN.
3. **Cài đặt Cửa hàng (`src/components/admin/settings-form.tsx` & `/admin/settings/page.tsx`)**:
   - Khối 1: Kênh liên hệ & Chốt đơn (Hotline bán hàng, Chat Zalo OA, Fanpage Facebook).
   - Khối 2: Thông tin cửa hàng (Tên thương hiệu, Showroom địa chỉ, Email hỗ trợ kỹ thuật).
   - Phân quyền bảo mật: Chặn nhân viên STAFF, chỉ cho phép ADMIN chỉnh sửa.
4. **Kiểm thử tự động toàn diện Phase 3 (`scripts/test-catalog.ts`)**:
   - Kiểm tra 17/17 tiêu chí: Sinh slug tiếng Việt SEO, Presets thông số kỹ thuật, CRUD Danh mục, CRUD Sản phẩm với Gallery JSON và Specs JSON, Quick-toggle Nổi bật & Tồn kho, CRUD Banners, Cập nhật Cài đặt Cửa hàng.

## Verification
- `npx tsx scripts/test-catalog.ts` -> PASSED (17/17 tests passed).
- `npm run build` -> PASSED (tất cả các route `/admin/banners`, `/admin/settings`, `/admin/categories`, `/admin/products/*` biên dịch hoàn hảo).
