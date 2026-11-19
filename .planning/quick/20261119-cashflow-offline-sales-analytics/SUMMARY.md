# Cashflow, Offline Sales & Profit Analytics — Implementation Summary

**Date:** 2026-11-19  
**Scope:** End-to-end ADMIN-only Finance Analytics (P&L), Cashflow Ledger (Sổ Quỹ), and Offline/POS/Zalo/Facebook Order Recording for TringuyenGear.

## 1. Summary of Changes

### Database & Domain Backend (Wave 1)
- **`prisma/schema.prisma`**:
  - Extended `Order` with `channel`, `paymentMethod`, `discount`, `shippingFee`, `soldAt`, `createdById`/`createdBy`, `cashflowEntries`, and composite indexes `[status, soldAt]`, `[channel, createdAt]`.
  - Extended `OrderItem` with nullable `productId` (`onDelete: SetNull` for ad-hoc items) and `costPrice` snapshot.
  - Added `CashflowEntry` model (`type`, `category`, `amount`, `paymentMethod`, `occurredAt`, `dateKey`, `note`, `orderId`, `createdById`) with indexes on `dateKey`, `[type, dateKey]`, `[category, dateKey]`, and `orderId`.
- **`src/lib/date-vn.ts`**: Vietnam timezone (`Asia/Ho_Chi_Minh`, fixed UTC+7) utilities and `getPeriodRange("day" | "week" | "month", anchorDateKey)` (Monday–Sunday weeks, full month daily buckets, 7-day rolling buckets for day view).
- **`src/lib/order-analytics.ts`**: Migrated `computeDailyRevenue` to VN UTC+7 via `date-vn.ts`.
- **`src/lib/finance-schema.ts`**: Channel/payment/cashflow enums, Vietnamese labels, `OPERATING_EXPENSE_CATEGORIES`, and Zod schemas (`createOfflineOrderSchema`, `cashflowEntrySchema`, `updateCashflowEntrySchema`, `updateOrderItemCostSchema`).
- **`src/lib/finance-analytics.ts`**:
  - `getFinanceAnalytics(period, dateKey)`: Computes Revenue (Web vs Offline), COGS + missing-cost count, Gross Profit/Margin, Operating Expenses (excluding `INVENTORY_IMPORT` & `REFUND`), Other Income, Net Profit/Margin, Cash In/Out/Net Cashflow, Channel Mix, and daily trend series.
  - `getCashflowLedger(filters)`: Chronological running balance + payment method split (`CASH` vs `BANK_TRANSFER`) + `INVENTORY_IMPORT` summary.
  - `getDashboardFinanceSnapshot()`: Today & This Month KPIs for the Admin Dashboard.
- **`src/app/actions/order.ts`**:
  - `createOrderAction`: Snapshots `Product.costPrice` onto `OrderItem.costPrice`.
  - `createOfflineOrderAction` (`ADMIN`-only): Supports catalog & ad-hoc items, optional `markOutOfStock`, discount/shipping, and atomic `CashflowEntry(IN)` creation when `completeImmediately: true`.
  - `updateOrderStatusAction`: Transactional `Order` ↔ `CashflowEntry` sync (idempotent `IN` on `COMPLETED`, `REFUND` `OUT` on `COMPLETED -> CANCELLED`, auto-`IN` deletion + `soldAt = null` on `COMPLETED -> PENDING/CONTACTED/SHIPPING`, and blocks `STAFF` from reverting `COMPLETED` orders).
  - `updateOrderItemCostAction` (`ADMIN`-only): Updates `OrderItem.costPrice` for accurate COGS/profit calculation.
- **`src/app/actions/cashflow.ts`**: `createCashflowEntryAction`, `updateCashflowEntryAction`, `deleteCashflowEntryAction` (`ADMIN`-only; blocks editing/deleting order-linked entries).
- **`src/middleware.ts`**: Added `/admin/finance` and `/admin/users` to `ADMIN_ONLY_ROUTES`.
- **`scripts/backfill-finance.ts`**: Idempotent VPS-safe backfill for `Order.soldAt`, `OrderItem.costPrice`, and `CashflowEntry(IN)` on existing `COMPLETED` orders.

### Finance Dashboard & Modals UI (Wave 2 — Finance UI)
- **`src/app/admin/(dashboard)/finance/page.tsx`**: Server Component enforcing `ADMIN` role, reading URL `searchParams`, and loading analytics, ledger, and non-archived products in parallel.
- **`src/components/admin/finance-shell.tsx`**: Tab switcher (`Phân tích Lợi nhuận` / `Sổ Quỹ Thu-Chi`), Period switcher (`Ngày | Tuần | Tháng`), date navigation, and modal triggers.
- **`src/components/admin/finance-analytics-view.tsx`** & **`src/components/admin/finance-trend-chart.tsx`**: 6 KPI cards, interactive pure-SVG grouped bar chart (`Doanh thu & Lợi nhuận` / `Thu & Chi`), Channel Mix breakdown, and daily P&L table.
- **`src/components/admin/cashflow-ledger-view.tsx`**: Summary cards, URL-synced filters, running balance ledger, lock indicators for auto-synced order entries, and manual edit/delete controls.
- **`src/components/admin/offline-order-modal.tsx`** & **`src/components/admin/cashflow-entry-modal.tsx`**: Full offline/POS order creation modal and manual income/expense entry modal.

### Admin Integration (Wave 2 — Integration)
- **`src/components/admin/sidebar.tsx`**: Added `Tài chính & Dòng tiền` (`/admin/finance`) with `adminOnly: true`.
- **`src/components/admin/offline-order-trigger.tsx`**: Reusable trigger button wrapping `OfflineOrderModal`.
- **`src/app/admin/(dashboard)/page.tsx`**: Added ADMIN-only `+ Tạo đơn bán ngoài` action and Today/This-Month Finance Snapshot strip.
- **`src/app/admin/(dashboard)/orders/page.tsx`** & **`src/components/admin/order-table.tsx`**: Added channel filter pills, channel/payment badges, and ADMIN-only `+ Tạo đơn bán ngoài` button.
- **`src/app/admin/(dashboard)/orders/[id]/page.tsx`** & **`src/components/admin/order-detail-view.tsx`**: Added channel/payment/discount/shipping/soldAt display and ADMIN-only inline `costPrice` editing + per-order gross profit summary (sanitizing `costPrice` out of props for non-`ADMIN`).

## 2. Verification Results (Wave 3)

| Check | Result | Details |
| :--- | :---: | :--- |
| **TypeScript (`npx tsc --noEmit`)** | PASS | 0 errors |
| **Production Build (`npm run build:local`)** | PASS | `next build` exited 0; `/admin/finance` compiled cleanly (`ƒ /admin/finance`, 11.6 kB / 168 kB First Load JS) |
| **RBAC — Middleware & Page** | PASS | `src/middleware.ts` blocks `STAFF` on `/admin/finance` & `/admin/users`; `finance/page.tsx` enforces `session.role === "ADMIN"` server-side; sidebar hides nav item for `STAFF` |
| **RBAC — Server Actions** | PASS | `createOfflineOrderAction`, `updateOrderItemCostAction`, and all 3 actions in `src/app/actions/cashflow.ts` enforce `requireRole(["ADMIN"])`; `updateOrderStatusAction` blocks `STAFF` from reverting `COMPLETED` orders |
| **RBAC — Data Leakage** | PASS | `admin/(dashboard)/page.tsx`, `orders/page.tsx`, and `orders/[id]/page.tsx` gate `financeSnapshot`, `offlineProducts`, and `costPrice` strictly behind `isAdmin` before serializing to Client Components |
| **Accounting — `INVENTORY_IMPORT`** | PASS | Counted in `cashOut` / `netCashflow` and tracked in `inventoryImportOut`; excluded from `OPERATING_EXPENSE_CATEGORIES`, `operatingExpenses`, and `netProfit` |
| **Accounting — Order ↔ Cashflow Sync** | PASS | Idempotent `IN` creation on `COMPLETED`; `COMPLETED -> CANCELLED` creates single `REFUND` (`OUT`); `COMPLETED -> PENDING/CONTACTED/SHIPPING` deletes auto `IN` and resets `soldAt` |
| **Timezone Consistency** | PASS | Fixed `Asia/Ho_Chi_Minh` (UTC+7) used across `src/lib/date-vn.ts`, `src/lib/finance-analytics.ts`, `src/lib/order-analytics.ts`, and `scripts/backfill-finance.ts` |
| **Backfill Safety** | PASS | `scripts/backfill-finance.ts` only updates null `soldAt`/null `costPrice` and inserts missing `IN` entries; safe and idempotent for production VPS SQLite |

## 3. Production VPS Deployment Notes

1. Pull latest code and apply schema changes: `npx prisma generate && npx prisma db push`.
2. Run one-time idempotent backfill on VPS SQLite: `npx tsx scripts/backfill-finance.ts`.
3. Rebuild and restart the Next.js server.
