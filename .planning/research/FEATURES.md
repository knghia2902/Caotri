# Features Research

**Domain:** Gaming Gear & Computer Accessories E-Commerce
**Researched:** 2026-09-09
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Must Have)

Những tính năng bắt buộc phải có của một website bán phụ kiện / gaming gear hiện đại:

| Feature | Complexity | Why Expected | Dependencies |
|---------|------------|--------------|--------------|
| **Trang chủ & Banner Slider** | Medium | Trưng bày chiến dịch khuyến mãi, sản phẩm tiêu biểu, tạo ấn tượng ban đầu đậm chất gaming | Banner Management API |
| **Phân loại danh mục đa dạng** | Low | Khách hàng cần tìm nhanh theo nhóm linh kiện: Chuột, Bàn phím, Tai nghe, Lót chuột, Màn hình,... | Category Model |
| **Tìm kiếm & Bộ lọc thông minh** | Medium | Lọc theo danh mục, lọc theo tầm giá (dưới 500k, 500k-1tr, 1tr-3tr, trên 3tr), sắp xếp giá tăng/giảm | Search index / DB queries |
| **Chi tiết sản phẩm & Thư viện ảnh** | Medium | Gaming gear yêu cầu nhìn rõ góc cạnh, đèn LED/RGB, phím switch cơ, thông số kỹ thuật (DPI, Polling rate,...) | Image Gallery Component |
| **Giỏ hàng tiện lợi** | Low | Thêm sản phẩm nhanh từ danh sách hoặc trang chi tiết, sửa số lượng, xóa sản phẩm, lưu giỏ khi F5 | Zustand / LocalStorage |
| **Đặt hàng & Chốt đơn tức thì** | Medium | Điền thông tin giao hàng (Tên, SĐT, Địa chỉ, Ghi chú), lưu đơn vào DB và hiển thị nút "Chốt đơn qua Zalo / Facebook" | Order API, Order Model |
| **Admin Dashboard Thống kê** | Low | Đếm tổng số đơn hàng, tổng sản phẩm, đơn hàng mới cần xử lý | Aggregation queries |
| **Admin Quản lý Sản phẩm** | High | Thêm, sửa, xóa, tải lên nhiều hình ảnh, thiết lập giá gốc/giá sale, gán danh mục, bật/tắt "Nổi bật" | Product CRUD + Cloudinary/Storage |
| **Admin Quản lý Đơn hàng** | Medium | Xem danh sách đơn, chi tiết người đặt và danh sách món hàng, cập nhật trạng thái đơn (Mới, Đã liên hệ, Đang giao, Hoàn thành, Hủy) | Order CRUD |
| **Admin Quản lý Danh mục** | Low | Quản lý tên danh mục, slug, thứ tự ưu tiên | Category CRUD |
| **Admin Banner & Cấu hình shop** | Low | Thay đổi banner trang chủ, cập nhật SĐT Hotline, link Zalo OA, link Fanpage Facebook | SiteConfig / Banner Model |
| **Phân quyền Admin & Staff** | Medium | Tài khoản quản trị Admin (toàn quyền) và Nhân viên (chỉ xử lý đơn hàng và cập nhật tồn kho/sản phẩm) | NextAuth RBAC Middleware |

### Differentiators (Competitive Advantage)

Những tính năng giúp tăng tỷ lệ chốt đơn và trải nghiệm người dùng vượt trội:

| Feature | Complexity | Value Proposition | Dependencies |
|---------|------------|-------------------|--------------|
| **1-Click Chuyển thông tin đơn sang Zalo** | Low | Sau khi đặt hàng thành công, 1 nút bấm tự động mở Zalo chat với tin nhắn soạn sẵn: *"Chào shop, mình vừa đặt đơn hàng #DH1002 (Chuột Logitech G Pro X...). Nhờ shop chốt đơn giúp mình!"* giúp giảm 90% độ trễ xử lý đơn | Zalo Deep Link (`zalo.me/...`) |
| **Floating Quick-Contact Dock** | Low | Thanh liên hệ nổi ở góc màn hình gồm Hotline, Zalo, Facebook Messenger luôn hiện diện giúp khách chat hỏi tư vấn kỹ thuật ngay | UI Component |
| **Gaming UI Aesthetic (Dark/Light)** | Medium | Giao diện tối hiện đại, điểm nhấn màu sắc gaming (Cyberpunk / Neon / Sleek Minimalist) làm nổi bật ảnh sản phẩm RGB | Tailwind Theme Config |
| **Đặt hàng không cần tài khoản (Guest Checkout)** | Low | Khách chỉ cần nhập Tên + SĐT + Địa chỉ là đặt được ngay, không bắt buộc đăng ký/đăng nhập rườm rà | Checkout Flow |

### Anti-Features (Deliberately NOT Built in v1)

Những tính năng chủ động loại bỏ để tránh lãng phí thời gian và làm phức tạp hóa hệ thống:

| Feature | Why to Avoid | What to Do Instead |
|---------|--------------|--------------------|
| Cổng thanh toán trực tuyến tự động (MoMo, VNPay, Stripe) | Thủ tục giấy phép doanh nghiệp phức tạp, rủi ro hủy giao dịch, phí merchant cao | Khách đặt hàng -> Shop liên hệ chốt đơn -> Giao hàng COD hoặc Chuyển khoản trực tiếp (Zalo/QR) |
| Bắt buộc đăng ký tài khoản mới được mua hàng | Tạo rào cản khiến 60%+ khách hàng rời bỏ giỏ hàng | Cho phép Guest Checkout siêu nhanh |
| Quản lý kho đa chi nhánh (Multi-warehouse) | Quá phức tạp cho quy mô cửa hàng giai đoạn đầu | Quản lý số lượng tồn kho tập trung hoặc trạng thái "Còn hàng / Hết hàng" |
| Đánh giá & Bình luận có kiểm duyệt đa cấp | Tốn công vận hành chống spam ở giai đoạn đầu | Hiển thị thông số và tư vấn qua Zalo trực tiếp |

## Feature Dependencies

```
[Category Management] ───► [Product Management] ───► [Storefront Listing & Search]
                                   │                              │
                                   ▼                              ▼
                             [Stock Status]                [Shopping Cart]
                                                                  │
                                                                  ▼
                                                      [Checkout & Order Creation]
                                                                  │
                                                                  ▼
                                                       [Admin Order Management]
                                                                  │
                                                                  ▼
                                                      [1-Click Zalo/FB Contact]
```

---
*Features research for: Gaming Gear & Tech Accessories E-Commerce*
*Researched: 2026-09-09*
