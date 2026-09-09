# Phase 6: Admin Order Fulfillment & Dashboard Analytics - Research

**Date:** 2026-09-09
**Status:** Completed

## Executive Summary
This research document covers technical approaches, codebase patterns, database query strategies, visual component designs, and verification architecture for **Phase 6: Admin Order Fulfillment & Dashboard Analytics**.

All solutions adhere strictly to the project's **Clean Tech Minimalist** aesthetic (as defined in `DESIGN.md`), existing architectural conventions (`src/lib/auth.ts`, `src/lib/prisma.ts`, `src/app/actions/`), and requirements **ORDER-01 through ORDER-04**.

---

## 1. Dashboard Analytics Data Queries (`/admin`)

### Business Metrics Breakdown
- **Completed Revenue (Doanh thu thực tế):** Sum of `totalAmount` where `status = "COMPLETED"`.
- **Pending Revenue (Doanh thu đang xử lý):** Sum of `totalAmount` where `status IN ["PENDING", "CONTACTED", "SHIPPING"]`.
- **New Orders Count (Đơn mới cần xử lý):** Count where `status = "PENDING"`.
- **In-Stock Products Count (Sản phẩm trong kho):** Count of products where `inStock = true` (or total products).
- **7-Day Revenue Grouping:** Aggregated daily revenue for the past 7 days (today + previous 6 days).
- **Recent Orders List:** 5–8 most recent orders ordered by `createdAt DESC`.

### Query Implementation Pattern (Zero-Waterfall Concurrent Fetching)
To achieve sub-50ms SSR latency and eliminate query waterfalls, all metrics are fetched concurrently via `Promise.all` inside `src/app/admin/(dashboard)/page.tsx`:

```typescript
// Calculate date boundary for the past 7 days (at 00:00:00)
const now = new Date();
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(now.getDate() - 6);
sevenDaysAgo.setHours(0, 0, 0, 0);

const [
  completedRevenueAgg,
  pendingRevenueAgg,
  pendingOrdersCount,
  inStockProductsCount,
  ordersIn7Days,
  recentOrders,
] = await Promise.all([
  // 1. Doanh thu thực tế (COMPLETED)
  prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "COMPLETED" },
  }),

  // 2. Doanh thu đang xử lý (Tiềm năng)
  prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: { in: ["PENDING", "CONTACTED", "SHIPPING"] },
    },
  }),

  // 3. Số đơn mới cần xử lý
  prisma.order.count({
    where: { status: "PENDING" },
  }),

  // 4. Số sản phẩm trong kho đang kinh doanh
  prisma.product.count({
    where: { inStock: true },
  }),

  // 5. Đơn hàng trong 7 ngày gần nhất để vẽ biểu đồ
  prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: { in: ["COMPLETED", "SHIPPING", "CONTACTED", "PENDING"] },
    },
    select: {
      totalAmount: true,
      createdAt: true,
      status: true,
    },
  }),

  // 6. Bảng đơn hàng gần đây cần xử lý
  prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  }),
]);
```

### 7-Day Bucket Grouping Logic (Database Agnostic)
SQLite (local dev) and PostgreSQL (production Supabase) have incompatible date-truncation SQL syntax (`strftime` vs `to_char`). Fetching the 7-day order list and bucketing into date slots in TypeScript provides:
1. **100% Portability:** Identical behavior in dev and production.
2. **Deterministic Day Sequence:** Exactly 7 buckets generated even on days with zero sales.
3. **High Performance:** In-memory grouping of ~100 records takes < 2ms.

```typescript
export interface DailyRevenuePoint {
  date: string;       // "2026-09-09"
  label: string;      // "09/09"
  dayOfWeek: string;  // "Th 4"
  completedRevenue: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeDailyRevenue(orders: { totalAmount: number; createdAt: Date; status: string }[]): DailyRevenuePoint[] {
  const result: DailyRevenuePoint[] = [];
  const daysOfWeekMap = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    const label = `${day}/${month}`;
    const dayOfWeek = daysOfWeekMap[d.getDay()];

    const matchingOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const oYear = orderDate.getFullYear();
      const oMonth = String(orderDate.getMonth() + 1).padStart(2, "0");
      const oDay = String(orderDate.getDate()).padStart(2, "0");
      return `${oYear}-${oMonth}-${oDay}` === dateKey;
    });

    const completedRevenue = matchingOrders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalRevenue = matchingOrders
      .reduce((sum, o) => sum + o.totalAmount, 0);

    result.push({
      date: dateKey,
      label,
      dayOfWeek,
      completedRevenue,
      totalRevenue,
      orderCount: matchingOrders.length,
    });
  }

  return result;
}
```

---

## 2. Lightweight SVG Bar Chart Architecture

Per **D-02** and **DESIGN.md §21**:
> *"Biểu đồ thanh SVG (Bar Chart) tinh gọn biểu diễn doanh thu 7 ngày gần nhất, phong cách Flat Minimal Clean Tech, tải siêu nhẹ không phụ thuộc thư viện nặng. Line chart hoặc bar chart đơn sắc. Không gradient."*

### Why Pure SVG over 3rd-Party Libraries
- **Bundle size:** 0 KB added (recharts/chart.js add 150KB+).
- **Zero Hydration Mismatch:** SSR-ready SVG renders immediately on initial load.
- **Strict Brand Design:** Direct control over colors (`#111111`, `#E7E7E3`, `#74746E`), typography, borders, and responsive sizing.

### Component Design (`src/components/admin/revenue-bar-chart.tsx`)
- **ViewBox:** `0 0 650 220` with responsive scaling via `w-full h-auto`.
- **Y-Axis Scale Calculation:**
  ```typescript
  const maxVal = Math.max(...data.map(d => d.completedRevenue), 1_000_000);
  // Round up to nearest nice interval (e.g. 5M, 10M, 20M)
  const chartMax = Math.ceil(maxVal / 1_000_000) * 1_000_000;
  ```
- **Structure:**
  1. **Background Gridlines:** 4 horizontal dashed lines (`stroke="#E7E7E3" strokeDasharray="3 3"`).
  2. **Y-Axis Labels:** Shortened VND values (`0`, `2M`, `4M`, `6M`) aligned at `x="45" text-anchor="end"`.
  3. **7 Bar Groups:** Evenly distributed across `x: 60` to `x: 630`.
     - Column width: `colWidth = (630 - 60) / 7` (~81px).
     - Bar width: 36px (centered in each column).
     - Bar fill: Solid `#111111` with `rx="4" ry="4"`.
     - Zero-value state: A subtle 3px baseline placeholder (`fill="#E7E7E3"`).
     - Hover highlight: `<g className="group cursor-pointer">` with `<rect className="group-hover:fill-[#333] transition-colors" />`.
     - Floating Tooltip or Info Badge: Shows exact currency (e.g. `3.450.000 ₫`) and order count.
  4. **X-Axis Labels:** Day label (`DD/MM`) and day of week (`Th 2`, `Hôm nay`), with the current day emphasized with `font-semibold text-[#111111]`.

---

## 3. Order List Table, Tabs, Search & Pagination (`/admin/orders`)

### Architecture Strategy: URL SearchParams Driven
Following standard Next.js best practices, `/admin/orders` should use URL query parameters:
`?status=PENDING&q=0988&page=1`

**Key Advantages:**
1. **Direct Link Sharing & Bookmarks:** Staff can bookmark the "Chờ xử lý" queue directly (`/admin/orders?status=PENDING`).
2. **Server-Side Pagination:** Handles thousands of orders with `skip: (page - 1) * 10` and `take: 10`.
3. **No Redundant State:** Browser Back/Forward navigation works naturally.

### Status Tabs (`OrderStatusTabs`)
5 standard statuses plus "Tất cả":
- `ALL`: Tất cả đơn hàng
- `PENDING`: Chờ xử lý (Amber badge)
- `CONTACTED`: Đã liên hệ (Blue badge)
- `SHIPPING`: Đang giao hàng (Indigo badge)
- `COMPLETED`: Hoàn thành (Emerald badge)
- `CANCELLED`: Đã hủy (Zinc badge)

Tabs fetch counts using `prisma.order.groupBy`:
```typescript
const statusCounts = await prisma.order.groupBy({
  by: ["status"],
  _count: { _all: true },
});
```
Each tab displays an active indicator (underline/dark badge) and the real-time count.

### Table Columns (Clean Tech Minimalist)
In compliance with `DESIGN.md §24`:
1. **Mã đơn:** `#DH-XXXXXX` (clickable link to `/admin/orders/[id]`, mono font, font-semibold).
2. **Khách hàng:** Name + Delivery Address snippet.
3. **Liên hệ:** Phone number with 1-click quick-action icons (Call `tel:`, Chat `zalo.me/`).
4. **Tổng tiền:** Formatted VND (`formatPrice`), bold `#111`.
5. **Trạng thái:** Quick-change Dropdown Selector (with optimistic update and toast).
6. **Ngày đặt:** Formatted `HH:mm DD/MM/YYYY`.
7. **Thao tác:** View detail button (`/admin/orders/[id]`).

### Quick Status Update with Safe Cancellation Modal
- On the table row, an interactive `<select>` dropdown lets staff change status directly.
- **Safety Interception (D-05):** If the user selects `CANCELLED`, prevent immediate commit and open a confirmation modal (`CancelOrderDialog`) requiring confirmation and an optional cancellation reason.
- Normal status changes call `updateOrderStatusAction` immediately with optimistic UI update and `toast.success`.

---

## 4. Order Detail Page Architecture (`/admin/orders/[id]`)

### Data Model Extension Required
`Order` model in `prisma/schema.prisma` currently has `customerNotes String?`, but needs `adminNotes String?` for staff internal tracking (shipping code, consultation history).

```prisma
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  customerName    String
  customerPhone   String
  customerAddress String
  customerNotes   String?
  adminNotes      String?     // <-- ADD THIS FIELD FOR PHASE 6
  totalAmount     Float
  status          String      @default("PENDING")
  items           OrderItem[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}
```

### Layout Organization (2-Column Desktop Grid)
1. **Header & Quick Actions:**
   - Breadcrumb: `Admin > Đơn hàng > #DH-XXXXXX`.
   - Title: Mã đơn `#DH-XXXXXX` with order creation timestamp.
   - Quick action button bar:
     - **Gọi điện:** `tel:[customerPhone]` (with phone icon).
     - **Mở Zalo:** `https://zalo.me/[customerPhone]` (target="_blank", with chat icon).
     - **In phiếu giao hàng:** `window.print()` button.

2. **Left Column (65% width) - Order Contents:**
   - **Product List Card:**
     - Table listing each `OrderItem`:
       - Thumbnail image (from related Product).
       - Product name & SKU/ID.
       - Unit price.
       - Quantity.
       - Subtotal.
     - Summary footer: Subtotal, Shipping fee (0 ₫ / Miễn phí), Total Amount (`formatPrice(totalAmount)`).
   - **Recipient & Delivery Card:**
     - Customer name, phone, full address.
     - Customer notes (`customerNotes`) in a distinct callout box.

3. **Right Column (35% width) - Workflow & Admin Notes:**
   - **Order Status Progression Card:**
     - Visual vertical or horizontal stepper showing order progression (`PENDING` → `CONTACTED` → `SHIPPING` → `COMPLETED`).
     - Status selector dropdown + Safe Cancellation modal.
   - **Internal Staff / Admin Notes Card (D-09):**
     - Textarea for internal notes (e.g. Mã vận đơn: `GHTK-98214152`, Lịch sử gọi xác nhận).
     - "Lưu ghi chú" button invoking `updateOrderNotesAction`.
     - Subtitle clarifying: *"Ghi chú này chỉ lưu nội bộ nhân viên, không hiển thị cho khách."*

### Print View Architecture (`@media print`)
When staff clicks "In phiếu giao hàng" (`window.print()`):
- Tailwind `print:hidden` hides:
  - `AdminSidebar`
  - `AdminHeader`
  - Breadcrumbs & Action buttons (Call, Zalo, In)
  - Admin internal notes card
  - Status progression stepper
- Tailwind `print:block` / printable container formats the page as a clean delivery receipt:
  - Header: **CaoTri Gaming Gear - Phiếu Giao Hàng & Thu Hộ**
  - Order code & Barcode placeholder
  - Sender: CaoTri Gear, Hotline, Store Address
  - Recipient: Name, Phone, Shipping Address, Customer note
  - Itemized table with quantities and total collection amount (COD)
  - Signature lines: "Người nhận hàng" / "Người giao hàng"

---

## 5. Required Server Actions (`src/app/actions/order.ts`)

### Action 1: `updateOrderStatusAction`
```typescript
const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, "Thiếu mã đơn hàng"),
  status: z.enum(["PENDING", "CONTACTED", "SHIPPING", "COMPLETED", "CANCELLED"]),
  cancelReason: z.string().max(500).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export async function updateOrderStatusAction(input: UpdateOrderStatusInput): Promise<OrderActionResult> {
  try {
    // 1. RBAC check (ADMIN or STAFF)
    const session = await requireRole(["ADMIN", "STAFF"]);

    // 2. Validate input
    const validated = updateOrderStatusSchema.parse(input);

    // 3. Check order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });
    if (!existingOrder) {
      return { success: false, error: "Đơn hàng không tồn tại" };
    }

    // 4. Update order data
    let adminNotesUpdate = existingOrder.adminNotes || "";
    if (validated.status === "CANCELLED" && validated.cancelReason) {
      const timestamp = new Date().toLocaleString("vi-VN");
      const cancelLog = `[HỦY ĐƠN lúc ${timestamp} bởi ${session.name}]: ${validated.cancelReason.trim()}`;
      adminNotesUpdate = adminNotesUpdate
        ? `${cancelLog}\n${adminNotesUpdate}`
        : cancelLog;
    }

    await prisma.order.update({
      where: { id: validated.orderId },
      data: {
        status: validated.status,
        adminNotes: adminNotesUpdate || undefined,
      },
    });

    // 5. Revalidate affected pages
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${validated.orderId}`);
    revalidatePath("/admin");

    return {
      success: true,
      message: `Đã cập nhật trạng thái đơn sang "${getStatusLabel(validated.status)}"`,
    };
  } catch (err: unknown) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
    };
  }
}
```

### Action 2: `updateOrderNotesAction`
```typescript
const updateOrderNotesSchema = z.object({
  orderId: z.string().min(1, "Thiếu mã đơn hàng"),
  adminNotes: z.string().max(2000, "Ghi chú tối đa 2000 ký tự"),
});

export type UpdateOrderNotesInput = z.infer<typeof updateOrderNotesSchema>;

export async function updateOrderNotesAction(input: UpdateOrderNotesInput): Promise<OrderActionResult> {
  try {
    // 1. RBAC check (ADMIN or STAFF)
    await requireRole(["ADMIN", "STAFF"]);

    // 2. Validate input
    const validated = updateOrderNotesSchema.parse(input);

    // 3. Update DB
    await prisma.order.update({
      where: { id: validated.orderId },
      data: {
        adminNotes: validated.adminNotes.trim(),
      },
    });

    // 4. Revalidate
    revalidatePath(`/admin/orders/${validated.orderId}`);

    return {
      success: true,
      message: "Đã lưu ghi chú nội bộ thành công",
    };
  } catch (err: unknown) {
    console.error("Lỗi khi lưu ghi chú đơn hàng:", err);
    if (err instanceof z.ZodError) {
      return { success: false, error: err.issues.map((e) => e.message).join(", ") };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra",
    };
  }
}
```

---

## 6. Validation Architecture & Nyquist Verification Plan

### Test Strategy
Following the pattern established in `scripts/test-cart-order.ts` and `scripts/test-catalog.ts`, an automated test suite `scripts/test-order-admin.ts` will execute against the Prisma database.

### Automated Test Cases (`scripts/test-order-admin.ts`)
1. **Test 1 - Zod Schema Validation:**
   - Validates `updateOrderStatusSchema` and `updateOrderNotesSchema`.
   - Rejects invalid statuses (e.g. `INVALID_STATUS`).
   - Rejects excessively long notes (>2000 chars).
2. **Test 2 - RBAC Enforcement:**
   - Verifies unauthenticated invocations fail with `UNAUTHORIZED`.
   - Verifies valid session roles (`ADMIN`, `STAFF`) are permitted.
3. **Test 3 - Full Order Status Lifecycle Transition:**
   - Seeds a test order with status `PENDING`.
   - Transitions sequentially: `PENDING` → `CONTACTED` → `SHIPPING` → `COMPLETED`.
   - Verifies database row reflects each status correctly.
4. **Test 4 - Safe Order Cancellation & Reason Logging:**
   - Transitions an order to `CANCELLED` with reason "Khách hàng đổi ý mua gear khác".
   - Verifies status becomes `CANCELLED` and `adminNotes` contains the audit log.
5. **Test 5 - Independent Admin Notes Isolation:**
   - Updates `adminNotes` on an order with existing `customerNotes`.
   - Asserts `customerNotes` remains completely unmodified and intact.
6. **Test 6 - Analytics Aggregations Correctness:**
   - Calculates completed revenue, pending revenue, and pending counts from DB.
   - Verifies the sum matches the expected seeded amounts.
7. **Test 7 - 7-Day Revenue Grouping Integrity:**
   - Verifies `computeDailyRevenue` produces exactly 7 consecutive days ending today without gaps.

### Build & Typecheck Verification
- `npx prisma db push` succeeds and regenerates `@prisma/client`.
- `npx tsc --noEmit` exits with code 0.
- `npm run build` succeeds and confirms route generation for `/admin`, `/admin/orders`, and `/admin/orders/[id]`.

### Manual / UAT Checklist
- [ ] Dashboard `/admin` displays 4 stat cards (Completed Revenue, Pending Revenue, New Orders, Products).
- [ ] SVG Bar chart renders cleanly with solid `#111` bars, zero libraries, and responsive layout.
- [ ] Order list `/admin/orders` filters by status tabs (`PENDING`, `CONTACTED`, `SHIPPING`, `COMPLETED`, `CANCELLED`).
- [ ] Instant search by order code (`#DH-...`), phone, and customer name.
- [ ] Quick status update dropdown works directly on table row.
- [ ] Cancelling an order displays the confirmation dialog.
- [ ] Order detail page `/admin/orders/[id]` renders customer info, product list, totals.
- [ ] 1-click action buttons work: `tel:` link and `https://zalo.me/[phone]`.
- [ ] Staff can save internal notes independently from customer notes.
- [ ] Print preview (`Ctrl+P` or "In phiếu") displays only the receipt, hiding admin sidebar, header, and buttons.

---

## 7. Migration & Step-by-Step Execution Plan

1. **Step 1: Schema Update & Migration**
   - Add `adminNotes String?` to `Order` model in `prisma/schema.prisma`.
   - Run `npx prisma db push` to update SQLite schema and generate Prisma client.

2. **Step 2: Server Actions & Helpers**
   - Add `updateOrderStatusAction` and `updateOrderNotesAction` to `src/app/actions/order.ts`.
   - Add `OrderStatusBadge` component in `src/components/admin/order-status-badge.tsx` with clean semantic colors.

3. **Step 3: Dashboard Analytics Update (`/admin`)**
   - Implement `computeDailyRevenue` helper.
   - Build `RevenueBarChart` pure SVG component in `src/components/admin/revenue-bar-chart.tsx`.
   - Update `src/app/admin/(dashboard)/page.tsx` with completed/pending revenue stat cards, 7-day bar chart, and recent orders table.

4. **Step 4: Order List Page (`/admin/orders`)**
   - Create `src/components/admin/order-table.tsx` with status tabs, search input, pagination, and quick-status selector.
   - Create `src/components/admin/cancel-order-dialog.tsx` for safe cancellation confirmation.
   - Create `src/app/admin/(dashboard)/orders/page.tsx` connecting search params to database queries.

5. **Step 5: Order Detail Page (`/admin/orders/[id]`)**
   - Create `src/app/admin/(dashboard)/orders/[id]/page.tsx` with product table, customer details, status stepper, 1-click call/Zalo actions, admin notes form, and `@media print` layout.
   - Add `print:hidden` to `AdminSidebar` and `AdminHeader`.

6. **Step 6: Automated Testing & Verification**
   - Create `scripts/test-order-admin.ts`.
   - Run test suite with `npx tsx scripts/test-order-admin.ts`.
   - Run `npm run build` to verify type safety and bundling.
