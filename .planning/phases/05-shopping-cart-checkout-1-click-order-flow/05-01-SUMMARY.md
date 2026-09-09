# Plan 05-01 Summary: Zustand Cart Store & Storefront Cart Integration

**Phase:** 05-shopping-cart-checkout-1-click-order-flow
**Plan:** 05-01
**Wave:** 1
**Status:** Completed
**Requirements Addressed:** CART-01, CART-02, CART-03

## Completed Work
1. **Zustand Cart Store (`src/stores/cart-store.ts`)**:
   - Khởi tạo store Zustand với `persist` middleware lưu vào `localStorage` (key: `caotri_cart_storage`).
   - Cung cấp đầy đủ actions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotalItems`, `getTotalPrice`.
   - Cung cấp hook `useCartHydrated` triệt tiêu lỗi SSR Hydration mismatch.

2. **Header Cart Integration (`src/components/storefront/storefront-header.tsx`)**:
   - Đấu nối realtime số lượng giỏ hàng (`totalItems`) lên badge của icon Cart.
   - Badge hiển thị phong cách Minimal Editorial nền đen `#111` chữ trắng, ẩn khi giỏ hàng trống và hiển thị `99+` khi vượt quá 99 món.

3. **Product Detail Add-to-Cart Action (`src/components/storefront/product-actions.tsx`)**:
   - Kết nối nút "Thêm vào giỏ hàng" với `cartStore.addItem()`.
   - Hiển thị Sonner Toast nhẹ nhàng góc màn hình kèm nút hành động "Xem giỏ hàng" trỏ về `/cart`.
   - Cập nhật trang `/products/[slug]` truyền đầy đủ `slug`, `image`, `originalPrice` vào `ProductActions`.

## Verification
- `npx tsc --noEmit`: Đạt (không lỗi type).
- Quản lý state giỏ hàng an toàn phía Client, đồng bộ qua LocalStorage.
