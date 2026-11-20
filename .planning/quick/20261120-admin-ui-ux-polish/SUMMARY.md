# Admin UI/UX Polish — Summary

**Date:** 2026-11-20  
**Status:** Verified & Complete

## Overview

Polished the entire Admin Dashboard (`src/app/admin/` and `src/components/admin/`) to unify the flat-monochrome design system (`rounded-[10px]`, `tabular-nums`, `#F7F7F5` / `#E7E7E3` / `#111111`), replace native browser confirm dialogs with a shared `ConfirmDialog`, fix state-sync and invoice data bugs, and improve day-to-day operational ergonomics.

## Completed Changes

### Stream A — Shell, Navigation, Dashboard & Auth (`#38`)
- `src/components/admin/confirm-dialog.tsx`: Created shared flat-monochrome `ConfirmDialog` (`Esc` + backdrop close when `!loading`, `#D94A4A` danger / `#111111` default).
- `src/app/admin/(dashboard)/loading.tsx`: Added monochrome loading skeleton for the dashboard.
- `src/components/admin/sidebar.tsx`: Renamed `"Tài chính & Dòng tiền"` → `"Tài chính"`, kept a clean flat nav list (no category headers), added `pendingOrdersCount` amber badge on `Đơn hàng`, and fixed collapsed-mode tooltip clipping (`overflow-visible` when collapsed).
- `src/components/admin/header.tsx`: Updated `pathTitles` (`Tài chính`, `Nhân viên`, `Sao lưu`, `Lượt truy cập`) and made parent breadcrumb segments clickable on subpages.
- `src/app/admin/(dashboard)/layout.tsx` & `src/components/admin/admin-shell.tsx`: Fetched `pendingOrdersCount` (`status: "PENDING"`) and passed it to `AdminSidebar`.
- `src/app/admin/(dashboard)/page.tsx` & `src/components/admin/vps-monitor-card.tsx`: Reordered to a business-first layout (Welcome Banner with quick actions → 4-column KPI row with `isArchived: false` fix & merged Inventory card → 2-column Finance + Traffic row → 7-day Revenue chart → Recent Orders table using `OrderStatusBadge` → `VpsMonitorCard` at bottom), standardized `rounded-[10px]` and `tabular-nums`.
- `src/app/admin/login/page.tsx` & `src/components/admin/login-form.tsx`: Aligned `#F7F7F5`, `#555550`/`#74746E`, and `rounded-[10px]`.
- `src/app/admin/(dashboard)/profile/page.tsx`: Fixed role badge to display `"Quản trị viên"` for `ADMIN` and `"Nhân viên"` for `STAFF`.

### Stream B — Products, Orders & Offline Order (`#40`)
- `src/components/admin/product-table.tsx`: Replaced dark leftovers (`divide-zinc-800/60`, `bg-[#111111]`/`bg-zinc-900` thumbnails) with `divide-[#E7E7E3]` and `bg-[#F3F3F1]`; standardized `rounded-[10px]` and `tabular-nums`; synced `initialProducts` via `useEffect`; wired per-row `ExternalLink` to `/products/${product.slug}`; replaced `window.confirm()` with `ConfirmDialog`; ensured modals/lightbox support `Esc` + backdrop close and `max-h-[90vh]` scroll.
- `src/components/admin/product-form.tsx`: Fixed `shortDescription` initialization (`initialData?.shortDescription || ""`), added sticky bottom action bar with `Lưu` and `Lưu & Thêm tiếp` (on create), standardized `rounded-[10px]` and `tabular-nums`.
- `src/components/admin/order-table.tsx`: Standardized `rounded-[10px]` and `tabular-nums`; hid `Gọi` / `Zalo` links when `customerPhone` is empty.
- `src/app/admin/(dashboard)/orders/[id]/page.tsx` & `src/components/admin/order-detail-view.tsx`: Fetched `SiteSetting` shop info for Print Invoice (removed hardcoded fake phone numbers), rendered `discount`/`shippingFee` rows when `> 0`, distinguished COD vs paid (`CASH`/`BANK_TRANSFER`) on print, added 1-click Copy buttons (phone, address, `"Copy tóm tắt đơn"`), hid `Gọi`/`Zalo` when phone is empty, synced `adminNotes` & `currentStatus` via `useEffect`, standardized `rounded-[10px]` and `tabular-nums`.
- `src/components/admin/offline-order-modal.tsx`: Added `Esc` + backdrop close when not submitting, defaulted `markOutOfStock` to `true` for newly added catalog products, and added `tabular-nums`.

### Stream C — Banners, Categories, Settings, Users, Backups & Finance (`#39`)
- `src/components/admin/banner-grid.tsx`: Switched active badge to light-mode (`bg-emerald-50 text-emerald-700 border-emerald-200`), thumbnail background to `bg-[#F3F3F1]`, `rounded-[10px]`, `useEffect` sync on `initialBanners`, and replaced `window.confirm()` with `ConfirmDialog`.
- `src/components/admin/category-table.tsx`: Added framed card wrapper (`border border-[#E7E7E3] rounded-[10px] bg-white overflow-hidden`) and replaced `window.confirm()` with `ConfirmDialog`.
- `src/components/admin/settings-form.tsx`: Converted section icon boxes to monochrome `#F7F7F5` + `border-[#E7E7E3]` + `#111111`, standardized `rounded-[10px]`, and changed `admin_notify_email` input from `type="email"` to `type="text"`.
- `src/components/admin/user-manager.tsx`: Removed `temp-${Date.now()}` optimistic ID bug in favor of `router.refresh()` + `useEffect` sync, added `Esc` + backdrop close and `max-h-[90vh] overflow-y-auto` on modals, standardized `rounded-[10px]` + `tabular-nums`, and replaced `confirm()` with `ConfirmDialog`.
- `src/components/admin/backup-manager.tsx`: Added `Esc` + backdrop close and `max-h-[90vh] overflow-y-auto` on the Google Drive modal, standardized `rounded-[10px]`, and replaced both `confirm()` calls with `ConfirmDialog`.
- `src/components/admin/finance-shell.tsx`, `finance-analytics-view.tsx`, `cashflow-ledger-view.tsx`, `cashflow-entry-modal.tsx`: Shortened heading to `"Tài chính"`, added `tabular-nums` across KPIs and table figures, added `Esc` + backdrop close and `max-h-[90vh] overflow-y-auto` on `CashflowEntryModal`, and replaced `window.confirm()` with `ConfirmDialog`.

## Verification Results

1. **TypeScript (`npx tsc --noEmit`)**: Passed with **0 errors**.
2. **Production Build (`npm run build:local` / `next build`)**: Passed with **0 errors** (compiled in 6.2s, lint & type validity passed, 10/10 static pages generated).
3. **Sanity Checks**:
   - `"Tài chính"` confirmed in `sidebar.tsx:51`, `header.tsx:28`, and `finance-shell.tsx:99`; `sidebar.tsx` remains a flat nav list with no category headers.
   - Zero occurrences of `divide-zinc-800/60`, `bg-emerald-950/80`, or hardcoded fake invoice phone numbers (`0987.654.321`, `0909.123.456`) in `src/components/admin/` (only `placeholder="VD: 0987.654.321"` remains in `settings-form.tsx:207`).
   - Zero occurrences of `window.confirm(` or bare `confirm(` in `product-table.tsx`, `banner-grid.tsx`, `category-table.tsx`, `user-manager.tsx`, `backup-manager.tsx`, and `cashflow-ledger-view.tsx`.
