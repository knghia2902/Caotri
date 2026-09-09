# Phase 5: Shopping Cart, Checkout & 1-Click Zalo/FB Order Flow - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Giai đoạn này cung cấp toàn bộ luồng mua sắm từ Giỏ hàng đến Đặt hàng và Chốt đơn:
- Quản lý trạng thái giỏ hàng phía Client qua Zustand (LocalStorage an toàn, không lỗi hydration).
- Hiển thị badge số lượng món trong giỏ trên Header thời gian thực.
- Trang `/cart` kiểu **One-page Checkout**: cột trái hiển thị danh sách sản phẩm (stepper số lượng, xóa món, tổng tiền), cột phải là Form đặt hàng nhanh (Họ tên, SĐT, Địa chỉ, Ghi chú) không cần đăng nhập.
- Server Action xử lý xác thực Zod, tạo mã đơn hàng duy nhất (`#DH-xxxxxx`) và lưu bản ghi vào Prisma CSDL (`Order` + `OrderItem`).
- Trang hoàn tất đơn hàng (`/cart/success/[orderNumber]`): hiển thị tóm tắt đơn, nút sao chép thông tin và bộ nút 1-click mở **Zalo** hoặc **Facebook Messenger** với nội dung tin nhắn soạn sẵn đầy đủ thông tin đơn hàng để chốt đơn ngay lập tức.
- Phản hồi khi thêm vào giỏ: Toast thông báo góc kèm nút "Xem giỏ hàng" giữ khách ở lại trang duyệt tiếp.

</domain>

<decisions>
## Implementation Decisions

### Bố cục & Luồng Trang Giỏ hàng (Cart & Checkout Flow)
- **D-01 (One-page Checkout):** Tích hợp cả danh sách giỏ hàng và Form đặt hàng ngay trên 1 trang duy nhất `/cart`. Layout 2 cột trên desktop (Cột trái: Danh sách linh kiện kèm thumbnail, giá, stepper tăng giảm số lượng, nút xóa; Cột phải: Form thông tin người nhận + Tóm tắt thanh toán + Nút CTA "Đặt hàng").
- **D-02 (Empty Cart State):** Khi giỏ hàng trống, hiển thị màn hình thông báo tối giản với icon Package, text hướng dẫn và nút "Khám phá sản phẩm ngay" trỏ về `/products`.

### Trải nghiệm Thêm vào Giỏ (Add to Cart UX)
- **D-03 (Sonner Toast with Action):** Khi khách bấm "Thêm vào giỏ hàng" từ trang chi tiết hoặc danh mục, hiển thị Sonner toast thành công nhẹ nhàng (có tên sản phẩm, số lượng) và kèm nút "Xem giỏ hàng" dẫn sang `/cart`. Khách không bị gián đoạn hay chuyển trang cưỡng bức, thoải mái duyệt xem thêm các phụ kiện khác.
- **D-04 (Header Cart Badge):** Icon Cart trên StorefrontHeader tự động cập nhật số lượng badge theo thời gian thực khi store Zustand thay đổi; xử lý hydration an toàn bằng cờ mounted để tránh hydration mismatch giữa SSR và CSR.

### Đặt hàng & Xác thực Dữ liệu (Order Placement & Validation)
- **D-05 (Guest Checkout Form):** Form đặt hàng tinh gọn gồm:
  - Họ và tên (bắt buộc, tối thiểu 2 ký tự)
  - Số điện thoại (bắt buộc, regex kiểm tra định dạng SĐT Việt Nam 10 chữ số)
  - Địa chỉ nhận hàng (bắt buộc, số nhà, đường, quận/huyện, tỉnh/thành)
  - Ghi chú giao hàng (tùy chọn)
- **D-06 (Order ID Generation):** Sinh mã đơn hàng dạng `#DH-XXXXXX` (trong đó XXXXXX là 6 ký tự số/chữ hoa) đảm bảo tính duy nhất và chuyên nghiệp.
- **D-07 (Prisma Order Creation):** Server Action `createOrderAction` chạy transaction lưu `Order` và các `OrderItem` tương ứng vào CSDL SQLite/PostgreSQL, sau đó xóa giỏ hàng và điều hướng sang trang kết quả.

### Trang Thành công & Chốt đơn Đa kênh (Order Success & 1-Click Messaging)
- **D-08 (Order Success Page):** Trang `/cart/success/[orderNumber]` hiển thị lời cảm ơn, mã đơn hàng to bản nổi bật, trạng thái đơn ("Chờ xử lý"), địa chỉ nhận hàng và danh sách từng linh kiện đã đặt.
- **D-09 (Prefilled Message Format):** Nội dung tin nhắn soạn sẵn khi khách bấm nút "Chốt đơn qua Zalo" hoặc "Chat Facebook Messenger" được định dạng chuyên nghiệp:
  ```text
  Xin chào CaoTrí Gear! Tôi muốn chốt đơn hàng:
  - Mã đơn: #DH-123456
  - Khách hàng: [Họ tên] - [SĐT]
  - Địa chỉ: [Địa chỉ]
  - Sản phẩm:
    + 1x Logitech G Pro X Superlight 2 (2.590.000đ)
    + 1x Pad chuột Artisan Hayate Otsu (1.350.000đ)
  - Tổng tiền: 3.940.000đ
  - Ghi chú: [Ghi chú nếu có]
  Nhờ shop kiểm tra và xác nhận giúp tôi nhé!
  ```
- **D-10 (Deep-link Actions):**
  - Nút **"Chốt đơn qua Zalo"**: mở URL `https://zalo.me/[phone_or_zaloId]` (hoặc Zalo OA link từ SiteSetting).
  - Nút **"Chốt đơn qua Facebook"**: mở link Messenger `https://m.me/[pageId]` từ SiteSetting.
  - Nút **"Sao chép thông tin đơn"**: copy toàn bộ nội dung tin nhắn trên vào Clipboard kèm Toast thông báo "Đã sao chép thông tin đơn hàng!".

### Builder's Discretion
- Tạo helper `formatVND` nhất quán cho toàn bộ trang cart và checkout.
- Thiết kế giao diện tuân thủ chặt chẽ [DESIGN.md](file:///D:/Tools/CaoTri/DESIGN.md): nền `#F7F7F5`, card trắng viền `#E7E7E3`, CTA đen tuyền `#111111` chữ trắng, typography Inter rõ nét.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design & Architecture
- `DESIGN.md` §16 (Cart) & §17 (Đặt hàng) — Đặc tả layout Cart, Cart Item, CTA Đặt hàng và 3 kênh liên hệ
- `.planning/PROJECT.md` — Core value và phạm vi nghiệp vụ chốt đơn Zalo/FB
- `.planning/REQUIREMENTS.md` §Shopping Cart & Checkout Flow (CART-01 → CART-06) — 6 yêu cầu kỹ thuật chi tiết
- `prisma/schema.prisma` — Schema model `Order` và `OrderItem`
- `src/lib/utils.ts` — Tiện ích formatPrice / formatVND

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: Nút đen `#111` primary và nút trắng viền xám secondary
- `src/components/ui/badge.tsx`: Badge trạng thái PENDING
- `src/components/storefront/storefront-header.tsx`: Nơi tích hợp Cart Counter Badge
- `src/components/storefront/storefront-footer.tsx`: Layout footer cho trang `/cart`
- `src/lib/prisma.ts`: Database client cho Server Actions

### Established Patterns
- Server Actions với `useActionState` hoặc `useTransition` kết hợp `sonner` toast
- Phân tách Server Components (data fetching) và Client Components (interactive forms, Zustand store)
- TypeScript strict types trong `src/types/index.ts`

### Integration Points
- `src/stores/cart-store.ts` (mới): Quản lý Zustand cart store
- `src/app/cart/page.tsx` (mới): Trang Giỏ hàng & Checkout One-page
- `src/app/cart/success/[orderNumber]/page.tsx` (mới): Trang Order Success & Chốt đơn 1-Click
- `src/app/actions/order.ts` (mới): Server Action tạo đơn hàng vào CSDL

</code_context>

<specifics>
## Specific Ideas

- Nút sao chép nội dung đơn hàng để khách hàng có thể paste trực tiếp vào bất kỳ ứng dụng chat nào (Telegram, SMS, Zalo, v.v.).
- Sử dụng icon của Lucide (`ShoppingCart`, `Trash2`, `Plus`, `Minus`, `Copy`, `Check`, `ExternalLink`, `ShieldCheck`).

</specifics>

<deferred>
## Deferred Ideas

- Tích hợp cổng thanh toán trực tuyến tự động (VietQR / VNPay / MoMo) — thuộc Milestone v2.0 (PAY-01).
- Tích hợp tự động gửi email xác nhận qua Resend — thuộc Milestone v2.0 (PAY-02).
- Đăng ký tài khoản thành viên xem lịch sử đơn hàng — thuộc Milestone v2.0 (MEM-01).

</deferred>

---

*Phase: 05-shopping-cart-checkout-1-click-order-flow*
*Context gathered: 2026-09-09*
