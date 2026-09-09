# Phase 4: Storefront Discovery & Browsing Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 4-Storefront Discovery & Browsing Experience
**Areas discussed:** Storefront Theme & Hero Banner Slider, Price Range Filter & Search UX, Product Detail Page Layout & Tech Specs, Floating Quick-Contact Dock

---

## 1. Storefront Theme & Hero Banner Slider

| Option | Description | Selected |
|--------|-------------|----------|
| Dark Gaming Sleek | Nền tối zinc-950, bo viền zinc-800 sắc nét, điểm nhấn Neon Cyan đặc trưng game thủ, đồng bộ toàn diện với Admin Dashboard | ✓ |
| Light Minimalist | Nền sáng slate-50/trắng, phong cách tối giản thanh lịch, các thẻ card viền xám nhẹ | |

| Option | Description | Selected |
|--------|-------------|----------|
| Hero Banner Slider toàn chiều rộng | Tự động chuyển slide sau 5 giây (pause khi rê chuột), có nút mũi tên điều hướng và chấm tròn chỉ số trang | ✓ |
| Slider 3D Carousel | Dạng lượn thẻ bài 3D hiển thị banner trung tâm kèm 2 góc banner lân cận | |

**User's choice:** Dark Gaming Sleek cho theme và Banner Slider toàn chiều rộng với Autoplay 5s.

---

## 2. Price Range Filter & Search UX

| Option | Description | Selected |
|--------|-------------|----------|
| 4 mốc chuẩn gaming gear | Dưới 500k, 500k - 1.5tr, 1.5tr - 3tr, Trên 3tr | |
| 5 mốc chi tiết | Dưới 300k, 300k - 800k, 800k - 1.5tr, 1.5tr - 3tr, Trên 3tr | |
| Thanh trượt giá (Price Range Slider) | 2 đầu kéo từ giá thấp nhất đến cao nhất kèm ô nhập trực tiếp | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Instant Search Popover | Gõ từ khóa trên Header hiện popup kết quả nhanh (ảnh nhỏ, tên, giá, danh mục), Enter chuyển tới trang danh sách | ✓ |
| Tìm kiếm truyền thống | Nhập từ khóa rồi bấm Enter hoặc kính lúp để chuyển thẳng sang trang `/products?search=...` | |

**User's choice:** Thanh trượt giá (Price Range Slider) 2 đầu kéo và Instant Search Popover xổ nhanh kết quả trên Header.

---

## 3. Product Detail Page Layout & Tech Specs

| Option | Description | Selected |
|--------|-------------|----------|
| Bố cục 2 cột + Tabs bên dưới | Ảnh lớn bên trái kèm dải thumbnail cuộn bên dưới; cột phải hiển thị Tên, Giá bán, Giá gốc, Tồn kho, Nút Mua ngay / Thêm giỏ, Nút Chat Zalo; bên dưới là Tabs Mô tả & Bảng Thông số kỹ thuật (Tech Specs) Clean Tech kẻ sọc xen kẽ | ✓ |
| Tech specs đặt bên phải | Đặt bảng thông số kỹ thuật trực tiếp ngay ở cột phải bên dưới nút Mua hàng | |

**User's choice:** Bố cục 2 cột với Gallery thumbnail cuộn ngang và Tabs Mô tả + Bảng Tech Specs kẻ sọc Clean Tech phía dưới.

---

## 4. Floating Quick-Contact Dock

| Option | Description | Selected |
|--------|-------------|----------|
| 3 nút tròn tách biệt xếp dọc | Nổi cố định góc phải dưới: 3 nút tròn xếp dọc (Zalo chat, Facebook Messenger, Gọi Hotline) có hiệu ứng lan tỏa sóng (Pulse), click mở ngay app Zalo/Messenger/quay số điện thoại | ✓ |
| Bottom Dock bar ngang | Thanh Dock cố định ở mép dưới màn hình | |
| 1 nút 'Liên hệ' bung menu | Click vào mới bung menu tròn các kênh liên hệ | |

**User's choice:** 3 nút tròn tách biệt xếp dọc cố định ở góc phải dưới (Zalo, Messenger, Hotline) có hiệu ứng lan tỏa sóng (Pulse), nạp dữ liệu từ bảng `SiteSetting`.

---

## the agent's Discretion

- Thiết kế component `ProductCard` dùng chung cho toàn bộ Storefront.
- Cấu trúc thư mục `src/components/storefront/` khoa học.
- Tối ưu SEO cho các trang sản phẩm và danh mục với metadata Next.js.

## Deferred Ideas

- Giỏ hàng tương tác chi tiết & checkout chốt đơn: Dành cho Phase 5.
- Đánh giá bình luận và thành viên tích điểm: Dành cho v2.
