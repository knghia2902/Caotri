# Phase 5: Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow - Validation Strategy

**Created:** 2026-09-09
**Status:** Approved

## Validation Architecture

### Verification Layers

| Layer | Target | Tool / Method | Success Threshold |
|---|---|---|---|
| **Unit & Store** | Zustand Cart Store (add, remove, update, clear, total calculation) | TypeScript compilation & runtime checks | State updates properly, no hydration error |
| **Server Action** | `createOrderAction` & Zod validation | `scripts/test-cart-order.ts` | Validates VN phone numbers, creates Order in DB |
| **Database** | Prisma `Order` + `OrderItem` relations | SQLite verification in test script | Cascading relations, matching totalAmount |
| **Type & Build** | Next.js App Router compilation | `npm run build` | Zero type errors, `/cart` and `/cart/success/[orderNumber]` routes valid |
| **End-to-End** | Add to cart -> Checkout -> Success -> 1-Click Link | Interactive / Test script | Complete order lifecycle |

## Requirements Verification Matrix

| Requirement | Description | Plan | Verification Method |
|---|---|---|---|
| **CART-01** | Thêm sản phẩm vào giỏ từ chi tiết | 05-01 | `ProductActions` gọi `addItem()`, hiển thị Sonner toast |
| **CART-02** | Xem giỏ hàng, tăng/giảm số lượng, xóa món | 05-01, 05-02 | `CartItemRow` stepper và delete button cập nhật store |
| **CART-03** | Lưu giỏ hàng trong LocalStorage | 05-01 | Zustand persist middleware lưu key `caotri_cart_storage` |
| **CART-04** | Đặt hàng nhanh Guest checkout | 05-02 | `CheckoutForm` nhận thông tin không cần login |
| **CART-05** | Zod validation & tạo Order ID duy nhất | 05-02 | `createOrderAction` sinh `#DH-XXXXXX` và lưu Prisma |
| **CART-06** | Màn hình thành công & nút 1-click Zalo/FB | 05-03 | `/cart/success/[orderNumber]` + `OrderSuccessActions` |
