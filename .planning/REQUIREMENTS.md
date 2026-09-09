# Requirements: Gaming Gear & Tech Accessories E-Commerce

**Defined:** 2026-09-09
**Core Value:** Trải nghiệm mua hàng nhanh chóng, mượt mà: khách dễ dàng tìm kiếm, lọc sản phẩm theo nhu cầu và lên đơn tiện lợi chốt qua Zalo/Facebook; đồng thời Admin quản lý kho hàng, đơn hàng trực quan và phân quyền rõ ràng.

## v1 Requirements

### Foundation & Data Architecture (FOUND)

- [x] **FOUND-01**: Khởi tạo dự án Next.js (App Router, TypeScript, Tailwind CSS) với cấu hình responsive và dark/gaming theme.
- [x] **FOUND-02**: Thiết lập Prisma ORM kết nối cơ sở dữ liệu PostgreSQL (Supabase) với đầy đủ schema (User, Category, Product, Order, OrderItem, Banner, SiteSetting).
- [x] **FOUND-03**: Tạo kịch bản Seed Data phong phú cho các ngành hàng gaming gear mẫu (Chuột, Bàn phím cơ, Tai nghe, Lót chuột, Màn hình gaming) và tài khoản quản trị mẫu.

### Authentication & RBAC (AUTH)

- [x] **AUTH-01**: Admin và nhân viên (Staff) có thể đăng nhập bằng Email và Mật khẩu được mã hóa an toàn (bcrypt).
- [x] **AUTH-02**: Duy trì phiên đăng nhập bảo mật bằng Token/Session và tự động bảo vệ tất cả các route `/admin/*` qua Next.js Middleware.
- [x] **AUTH-03**: Phân quyền chi tiết: Tài khoản `ADMIN` có toàn quyền hệ thống (bao gồm quản lý người dùng, banner); tài khoản `STAFF` bị giới hạn ở quyền xử lý đơn hàng và cập nhật sản phẩm.

### Admin Catalog & Content Management (ADMIN)

- [ ] **ADMIN-01**: Quản trị viên có thể Thêm / Sửa / Xóa danh mục sản phẩm (tên, slug, hình đại diện, thứ tự hiển thị).
- [ ] **ADMIN-02**: Quản trị viên có thể Thêm / Sửa / Xóa sản phẩm với nhiều hình ảnh, giá niêm yết, giá khuyến mãi, danh mục và thông số kỹ thuật (specs).
- [ ] **ADMIN-03**: Tích hợp tải lên hình ảnh sản phẩm và banner lên Cloudinary / Supabase Storage với định dạng WebP/AVIF tối ưu.
- [ ] **ADMIN-04**: Quản trị viên có thể gắn cờ sản phẩm "Nổi bật" (Featured) hoặc "Hàng mới về" (New) để ưu tiên hiển thị ở trang chủ.
- [ ] **ADMIN-05**: Quản trị viên có thể quản lý Banner slider trang chủ và cập nhật thông tin liên hệ của shop (Hotline, link Zalo OA, link Facebook Fanpage).

### Storefront Discovery & Browsing (STORE)

- [ ] **STORE-01**: Trang chủ hiển thị banner slider động, khối danh mục sản phẩm, sản phẩm nổi bật và sản phẩm mới về.
- [ ] **STORE-02**: Khách hàng có thể duyệt danh sách sản phẩm theo từng danh mục cụ thể (Chuột, Phím, Tai nghe, Pad, Màn hình,...).
- [ ] **STORE-03**: Khách hàng có thể tìm kiếm sản phẩm theo tên với gợi ý tức thì.
- [ ] **STORE-04**: Khách hàng có thể lọc sản phẩm theo khoảng giá ngân sách và sắp xếp theo giá (tăng dần, giảm dần) hoặc sản phẩm mới nhất.
- [ ] **STORE-05**: Trang chi tiết sản phẩm hiển thị bộ sưu tập ảnh (slider/zoom), giá bán, giá gốc, trạng thái còn hàng, mô tả chi tiết và thông số kỹ thuật dạng bảng.
- [ ] **STORE-06**: Thanh tiện ích nổi (Floating dock) ở góc màn hình hỗ trợ gọi Hotline và chat Zalo/Messenger mọi lúc.

### Shopping Cart & Checkout Flow (CART)

- [ ] **CART-01**: Khách hàng có thể thêm sản phẩm vào giỏ hàng từ trang danh sách hoặc trang chi tiết sản phẩm.
- [ ] **CART-02**: Khách hàng có thể xem giỏ hàng, tăng/giảm số lượng sản phẩm, xóa món hàng hoặc làm trống giỏ hàng mà không bị lỗi hydration.
- [ ] **CART-03**: Giỏ hàng tự động tính toán tổng tiền và lưu giữ trạng thái trong LocalStorage khi tải lại trang.
- [ ] **CART-04**: Khách hàng có thể đặt hàng nhanh (Guest checkout) bằng form: Họ tên, Số điện thoại, Địa chỉ nhận hàng, Ghi chú.
- [ ] **CART-05**: Khi bấm Đặt hàng, hệ thống kiểm tra dữ liệu hợp lệ (Zod), tạo bản ghi Đơn hàng với mã Order ID duy nhất (ví dụ: `#DH-100234`) và lưu vào CSDL.
- [ ] **CART-06**: Màn hình hoàn tất đơn hàng hiển thị mã đơn, tóm tắt món hàng và nút **"Chốt đơn qua Zalo"** / **"Liên hệ Facebook"** tự động mở chat kèm nội dung soạn sẵn, đồng thời có nút **"Sao chép thông tin đơn"**.

### Admin Orders & Dashboard Analytics (ORDER)

- [ ] **ORDER-01**: Dashboard hiển thị các chỉ số tổng quan: Tổng số đơn hàng mới, tổng doanh thu dự kiến, tổng số lượng sản phẩm trong kho.
- [ ] **ORDER-02**: Trang danh sách đơn hàng cho phép lọc theo trạng thái (Chờ xử lý, Đã liên hệ, Đang giao, Hoàn thành, Hủy) và tìm kiếm theo mã đơn hoặc SĐT khách.
- [ ] **ORDER-03**: Xem chi tiết đơn hàng gồm thông tin người nhận, danh sách sản phẩm đặt mua, đơn giá và ghi chú khách hàng.
- [ ] **ORDER-04**: Quản trị viên hoặc nhân viên có thể cập nhật trạng thái đơn hàng (ví dụ: chuyển từ "Chờ xử lý" sang "Đã liên hệ").

## v2 Requirements

### Online Payments & Automation

- **PAY-01**: Tích hợp cổng thanh toán trực tuyến qua mã QR tự động VietQR / VNPay / MoMo.
- **PAY-02**: Tự động gửi email thông báo xác nhận đơn hàng cho khách hàng qua Resend / SendGrid.

### Member Accounts & Loyalty

- **MEM-01**: Khách hàng có thể đăng ký tài khoản thành viên để theo dõi lịch sử đơn hàng đã đặt.
- **MEM-02**: Hệ thống tích điểm đổi voucher giảm giá cho khách hàng thân thiết.

### Community & Feedback

- **REV-01**: Đánh giá sản phẩm kèm hình ảnh thực tế từ khách hàng đã mua hàng.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cổng thanh toán quốc tế (Stripe/PayPal) | Không phù hợp với thị trường gaming gear nội địa VN tại v1, chi phí cao |
| Bắt buộc đăng ký tài khoản khi mua hàng | Làm tăng tỷ lệ bỏ giỏ hàng; v1 ưu tiên checkout nhanh |
| Quản lý kho đa chi nhánh (Multi-warehouse) | Quy mô ban đầu quản lý kho tập trung |
| Ứng dụng di động Native (iOS/Android) | Giao diện Web Responsive PWA đã tối ưu mượt mà trên mobile browser |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| ADMIN-01 | Phase 3 | Pending |
| ADMIN-02 | Phase 3 | Pending |
| ADMIN-03 | Phase 3 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| ADMIN-05 | Phase 3 | Pending |
| STORE-01 | Phase 4 | Pending |
| STORE-02 | Phase 4 | Pending |
| STORE-03 | Phase 4 | Pending |
| STORE-04 | Phase 4 | Pending |
| STORE-05 | Phase 4 | Pending |
| STORE-06 | Phase 4 | Pending |
| CART-01 | Phase 5 | Pending |
| CART-02 | Phase 5 | Pending |
| CART-03 | Phase 5 | Pending |
| CART-04 | Phase 5 | Pending |
| CART-05 | Phase 5 | Pending |
| CART-06 | Phase 5 | Pending |
| ORDER-01 | Phase 6 | Pending |
| ORDER-02 | Phase 6 | Pending |
| ORDER-03 | Phase 6 | Pending |
| ORDER-04 | Phase 6 | Pending |

**Coverage:**

- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-09*
*Last updated: 2026-09-09 after initial definition*
