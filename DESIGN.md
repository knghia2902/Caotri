# Caotri Gear — Design System & UI Specification

## 1. Tổng quan

**Caotri Gear** là website thương mại điện tử bán gear công nghệ/gaming gồm chuột, bàn phím, tai nghe, pad, màn hình và phụ kiện.

Thiết kế theo hướng **minimal / editorial commerce**:

- Tối giản, sạch, ít màu.
- Ưu tiên khoảng trắng lớn.
- Typography rõ, mạnh.
- Hình sản phẩm là điểm nhấn chính.
- Hạn chế gradient, glow, hiệu ứng gaming đại trà.
- Giao diện khách hàng và admin dùng chung một hệ thiết kế.
- Cảm giác hiện đại, cao cấp, dễ đọc và dễ sử dụng.

---

# 2. Design Direction

## 2.1. Từ khóa thiết kế

- Minimal
- Monochrome
- Editorial
- Premium
- Functional
- Product-focused
- Clean grid
- Quiet UI

## 2.2. Nguyên tắc

1. **Nội dung quan trọng hơn trang trí.**
2. Không dùng quá nhiều màu.
3. Không dùng shadow nặng.
4. Không dùng quá nhiều border radius.
5. Không nhồi quá nhiều component vào một khu vực.
6. Mỗi section phải có khoảng thở rõ ràng.
7. CTA chính luôn nổi bật bằng màu đen.
8. Ảnh sản phẩm nên có nền sáng, đơn giản.
9. Layout ưu tiên grid thẳng và khoảng cách đều.
10. Tránh phong cách gaming neon phổ thông.

---

# 3. Color System

## 3.1. Neutral

```css
--color-black: #111111;
--color-black-soft: #1A1A1A;

--color-white: #FFFFFF;
--color-background: #F7F7F5;
--color-surface: #FFFFFF;

--color-gray-50: #FAFAFA;
--color-gray-100: #F3F3F1;
--color-gray-200: #E7E7E3;
--color-gray-300: #D5D5D0;
--color-gray-400: #A3A39D;
--color-gray-500: #74746E;
--color-gray-600: #555550;
--color-gray-700: #3A3A36;
--color-gray-900: #181816;
```

## 3.2. Semantic

```css
--color-success: #21A366;
--color-warning: #D99A24;
--color-danger: #D94A4A;
--color-info: #3B82F6;
```

## 3.3. Quy tắc sử dụng màu

- Nền website: `#F7F7F5`
- Card: `#FFFFFF`
- Text chính: `#111111`
- Text phụ: `#74746E`
- Border: `#E7E7E3`
- CTA chính: nền đen, chữ trắng
- CTA phụ: nền trắng, border xám
- Không sử dụng màu thương hiệu quá mạnh trên diện tích lớn.

---

# 4. Typography

## Font đề xuất

Ưu tiên:

```text
Inter
Manrope
Geist
SF Pro Display
```

Fallback:

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Type Scale

### Display

```css
font-size: 56px;
line-height: 1.05;
font-weight: 600;
letter-spacing: -0.04em;
```

### H1

```css
font-size: 40px;
line-height: 1.1;
font-weight: 600;
letter-spacing: -0.03em;
```

### H2

```css
font-size: 28px;
line-height: 1.2;
font-weight: 600;
```

### H3

```css
font-size: 20px;
line-height: 1.3;
font-weight: 600;
```

### Body Large

```css
font-size: 16px;
line-height: 1.6;
font-weight: 400;
```

### Body

```css
font-size: 14px;
line-height: 1.55;
font-weight: 400;
```

### Caption

```css
font-size: 12px;
line-height: 1.4;
font-weight: 500;
```

---

# 5. Spacing

Sử dụng hệ spacing theo bội số 4.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

Section trên desktop:

```text
Padding vertical: 64–96px
Padding horizontal: 32–48px
```

---

# 6. Border & Radius

## Border

```css
border: 1px solid #E7E7E3;
```

## Radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
```

Không dùng radius quá tròn.

---

# 7. Shadow

Ưu tiên không dùng shadow.

Khi thực sự cần:

```css
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
```

Không dùng glow.

---

# 8. Layout

## Desktop

```text
Max width: 1440px
Content width: 1280–1360px
```

Container:

```css
max-width: 1360px;
margin: 0 auto;
padding: 0 32px;
```

## Grid

### Product grid desktop

```text
4 columns
gap: 16–24px
```

### Tablet

```text
2–3 columns
```

### Mobile

```text
2 columns
```

---

# 9. Header

Header tối giản.

## Desktop

Bố cục:

```text
[Caotri Gear]  [Sản phẩm] [Bộ sưu tập] [Về chúng tôi] [Liên hệ]
                                        [Search] [Account] [Cart]
```

Thông số:

```text
Height: 72px
Background: white
Border-bottom: #E7E7E3
Position: sticky
```

Logo:

- Wordmark đơn giản.
- Có thể kết hợp biểu tượng chữ `C`.
- Không dùng gradient.

---

# 10. Trang chủ

## 10.1 Hero

Hero dùng split layout.

```text
┌──────────────────┬──────────────────┐
│                  │                  │
│ Gear tốt         │   Product image  │
│ cho trải nghiệm  │                  │
│ thật.            │                  │
│                  │                  │
│ [Khám phá ngay]  │                  │
│                  │                  │
└──────────────────┴──────────────────┘
```

Desktop:

```text
50% text
50% image
min-height: 520px
```

Headline:

```text
Gear tốt
cho trải nghiệm
thật.
```

CTA:

```text
Background: black
Text: white
Height: 44px
Padding: 0 20px
```

## 10.2 Danh mục

Danh mục hiển thị dạng icon hoặc ảnh sản phẩm monochrome.

Danh mục:

- Chuột
- Phím
- Tai nghe
- Pad
- Màn hình
- Phụ kiện

Layout:

```text
6 columns desktop
3 columns tablet
3 columns mobile
```

Không cần card nặng.

---

# 11. Product Card

Thiết kế rất tối giản.

```text
┌───────────────────┐
│                   │
│   Product image   │
│                   │
├───────────────────┤
│ Logitech G Pro X  │
│ 2.590.000đ        │
└───────────────────┘
```

## Product image

```text
Aspect ratio: 1:1
Background: #F3F3F1
```

## Product info

Tên sản phẩm:

```text
14px / 500
```

Giá:

```text
14px / 600
```

Badge:

```text
Mới
Bán chạy
Hết hàng
```

Badge nhỏ, không quá nổi.

---

# 12. Trang danh mục

Layout desktop:

```text
┌──────────────┬────────────────────────────────────┐
│ Filters      │ Chuột                              │
│              │                                    │
│ Danh mục     │ [Product][Product][Product][Product]│
│ Khoảng giá   │ [Product][Product][Product][Product]│
│ Thương hiệu  │                                    │
│ Tình trạng   │                                    │
└──────────────┴────────────────────────────────────┘
```

Sidebar:

```text
Width: 220–240px
```

Không dùng sidebar card nổi.

Các filter:

### Danh mục

Checkbox.

### Khoảng giá

Slider + input min/max.

### Thương hiệu

Checkbox.

### Tình trạng

- Còn hàng
- Hết hàng

### Sort

Dropdown:

```text
Giá: thấp → cao
Giá: cao → thấp
Mới nhất
```

---

# 13. Search

Search ưu tiên dạng overlay hoặc page result.

Input:

```text
Height: 44px
Border: 1px solid #E7E7E3
Background: white
```

Placeholder:

```text
Tìm sản phẩm...
```

---

# 14. Product Detail

Desktop layout:

```text
┌─────────────────────────────┬──────────────────────────┐
│ Thumbnail │ Product Image   │ Product title            │
│           │                 │ Rating                   │
│           │                 │ Price                    │
│           │                 │ Stock                    │
│           │                 │ Description              │
│           │                 │ Quantity                 │
│           │                 │ [Thêm vào giỏ hàng]      │
└─────────────────────────────┴──────────────────────────┘
```

## Gallery

- Thumbnail bên trái.
- Main image lớn.
- Nền ảnh `#F7F7F5`.

## CTA

```text
Full width
Black background
White text
Height: 48px
```

## Service information

4 item ngang:

- Chính hãng
- Bảo hành
- Đổi trả
- Giao hàng

Icon outline.

---

# 15. Product Tabs

Tabs:

```text
Mô tả
Thông số kỹ thuật
Đánh giá
```

Active:

```text
Text: black
Border-bottom: 2px solid black
```

---

# 16. Cart

Layout:

```text
┌───────────────────────────────────┬───────────────┐
│ Cart Items                        │ Summary       │
│                                   │               │
│ Product 1                         │ Tổng tiền     │
│ Product 2                         │               │
│ Product 3                         │ [Đặt hàng]    │
│                                   │ Facebook      │
│                                   │ Zalo          │
│                                   │ Điện thoại    │
└───────────────────────────────────┴───────────────┘
```

Cart item:

- Thumbnail
- Tên
- Giá
- Quantity stepper
- Delete button

Không dùng background màu cho từng item.

Chỉ dùng divider.

---

# 17. Đặt hàng

Website không cần cổng thanh toán.

Khách hàng liên hệ qua:

- Facebook
- Zalo
- Điện thoại

CTA:

```text
Đặt hàng
```

Sau đó hiển thị:

```text
Liên hệ qua Facebook
Liên hệ qua Zalo
Gọi ngay
```

---

# 18. Footer

Minimal footer.

```text
Caotri Gear

Về chúng tôi
Chính sách
Bảo hành
Liên hệ

Facebook
Zalo
```

Nền:

```text
#111111
```

Text:

```text
white / muted gray
```

---

# 19. Admin Design

Admin sử dụng cùng visual language.

Layout:

```text
┌──────────────┬─────────────────────────────────────────┐
│ Sidebar      │ Header                                  │
│              ├─────────────────────────────────────────┤
│ Dashboard    │ Content                                 │
│ Products     │                                         │
│ Orders       │                                         │
│ Categories   │                                         │
│ Banner       │                                         │
│ Users        │                                         │
│ Settings     │                                         │
└──────────────┴─────────────────────────────────────────┘
```

---

# 20. Admin Sidebar

```text
Width: 220px
Background: #111111
Text: #FFFFFF
```

Menu:

- Dashboard
- Sản phẩm
- Đơn hàng
- Danh mục
- Banner & nội dung
- Người dùng
- Phân quyền
- Cài đặt

Active menu:

```text
background: rgba(255,255,255,0.10)
```

Không dùng màu xanh neon.

---

# 21. Admin Dashboard

Cards:

- Tổng doanh thu
- Tổng đơn hàng
- Sản phẩm
- Khách hàng

Card style:

```text
Background: white
Border: 1px solid #E7E7E3
Radius: 10px
```

Số liệu lớn.

Ví dụ:

```text
128.560.000đ
256
128
1.024
```

Chart:

- Line chart hoặc bar chart đơn sắc.
- Không gradient.

---

# 22. Product Management

Toolbar:

```text
Search
Danh mục
Trạng thái

[+ Thêm sản phẩm]
```

Table:

```text
Ảnh
Tên sản phẩm
Danh mục
Giá
Trạng thái
Thao tác
```

Actions:

- Edit
- Delete

Status:

```text
Còn hàng
Hết hàng
Ẩn
```

---

# 23. Product Form

Fields:

```text
Tên sản phẩm
Slug
Mô tả
Giá
Giá khuyến mãi
Danh mục
Thương hiệu
Tình trạng
Ảnh
Sản phẩm nổi bật
Sản phẩm mới
```

Layout desktop:

```text
2-column form
```

Save button:

```text
Black
```

---

# 24. Order Management

Table:

```text
Mã đơn
Khách hàng
Liên hệ
Tổng tiền
Trạng thái
Ngày đặt
Thao tác
```

Statuses:

```text
Chờ xử lý
Đang xử lý
Đang giao
Đã giao
Đã hủy
```

Status badge nên dùng màu semantic nhẹ.

---

# 25. Category Management

Table:

```text
Tên danh mục
Slug
Số sản phẩm
Trạng thái
Thao tác
```

Action:

```text
+ Thêm danh mục
```

---

# 26. Banner / Content Management

Cho phép quản lý:

- Hero banner.
- Collection banner.
- Featured products.
- New products.
- Homepage title.
- Homepage subtitle.
- Contact information.

Banner upload gồm:

```text
Image
Title
Subtitle
CTA label
CTA URL
Status
```

---

# 27. User Management

Table:

```text
Tên đăng nhập
Email
Vai trò
Trạng thái
Thao tác
```

Vai trò:

```text
Admin
Nhân viên
```

---

# 28. Permissions

## Admin

Toàn quyền:

```text
Dashboard
Products
Orders
Categories
Banner
Users
Permissions
Settings
```

## Nhân viên

Có thể giới hạn:

```text
View dashboard
Manage products
Manage orders
View categories
```

Không có quyền:

```text
Delete admin
Change role
Permission settings
System settings
```

---

# 29. Buttons

## Primary

```css
background: #111111;
color: #FFFFFF;
height: 44px;
padding: 0 18px;
border-radius: 8px;
```

## Secondary

```css
background: #FFFFFF;
color: #111111;
border: 1px solid #D5D5D0;
```

## Danger

```css
color: #D94A4A;
```

Không cần button nền đỏ nếu chỉ là action nhỏ.

---

# 30. Inputs

```css
height: 44px;
background: #FFFFFF;
border: 1px solid #D5D5D0;
border-radius: 8px;
padding: 0 14px;
```

Focus:

```css
border-color: #111111;
outline: none;
```

---

# 31. Table

Table ưu tiên flat.

Header:

```text
Background: #FAFAFA
Font size: 12px
Font weight: 600
```

Row:

```text
Height: 56px
Border-bottom
```

Hover:

```text
#FAFAFA
```

Không dùng card bao quanh từng row.

---

# 32. Icons

Phong cách:

```text
Outline
1.5px stroke
```

Đề xuất:

```text
Lucide Icons
Heroicons
Phosphor Icons
```

Không trộn nhiều icon library.

---

# 33. Images

Ảnh sản phẩm:

- Background trắng hoặc xám rất nhạt.
- Sản phẩm đặt giữa.
- Không thêm glow.
- Không cần shadow mạnh.
- Cùng một tỷ lệ ảnh.

Hero image:

- Có thể dùng ảnh lifestyle tối.
- Không đặt quá nhiều text trên ảnh.

---

# 34. Responsive

## Desktop

```text
>= 1200px
```

Full layout.

## Tablet

```text
768px – 1199px
```

- Sidebar filter collapsible.
- Product grid 3 columns.
- Admin sidebar compact.

## Mobile

```text
< 768px
```

Header:

```text
Logo
Search
Cart
Menu
```

Product grid:

```text
2 columns
```

Product detail:

```text
Image
Info
CTA
Description
```

Cart:

```text
Single column
```

Admin:

```text
Sidebar → drawer
Table → horizontal scroll
```

---

# 35. Suggested Routes

## Customer

```text
/
 /products
 /products/:slug
 /category/:slug
 /search
 /cart
 /contact
```

## Admin

```text
/admin
/admin/products
/admin/products/create
/admin/products/:id/edit
/admin/orders
/admin/orders/:id
/admin/categories
/admin/banners
/admin/users
/admin/permissions
/admin/settings
```

---

# 36. Component Structure

```text
components/
│
├── layout/
│   ├── Header
│   ├── Footer
│   ├── Container
│   └── AdminSidebar
│
├── product/
│   ├── ProductCard
│   ├── ProductGrid
│   ├── ProductGallery
│   ├── ProductPrice
│   └── ProductFilter
│
├── cart/
│   ├── CartItem
│   ├── CartSummary
│   └── QuantityInput
│
├── admin/
│   ├── StatCard
│   ├── DataTable
│   ├── StatusBadge
│   └── AdminToolbar
│
└── ui/
    ├── Button
    ├── Input
    ├── Select
    ├── Checkbox
    ├── Modal
    ├── Badge
    ├── Pagination
    └── Tabs
```

---

# 37. UX Rules

1. Thêm vào giỏ phải phản hồi ngay.
2. Cart icon hiển thị số lượng.
3. Filter thay đổi kết quả nhanh.
4. URL phản ánh filter nếu có thể.
5. Search hỗ trợ debounce.
6. Form admin hiển thị validation rõ.
7. Delete phải có confirm.
8. Admin table có pagination.
9. Trạng thái đơn hàng dễ nhận biết.
10. Mobile không được ẩn CTA chính.

---

# 38. Không nên sử dụng

Tránh:

- Neon blue/purple phủ toàn website.
- Gradient gaming.
- Glassmorphism.
- Shadow dày.
- Border radius 20–30px.
- Background RGB.
- Animation liên tục.
- Text glow.
- Nhiều icon màu.
- Quá nhiều badge.
- Banner có quá nhiều chữ.
- Card trong card.

---

# 39. Design Summary

Caotri Gear nên tạo cảm giác:

> **Một cửa hàng gear hiện đại, tối giản và đáng tin cậy — nơi sản phẩm là trung tâm, không phải hiệu ứng đồ họa.**

Visual identity:

```text
Black
White
Warm gray
Large typography
Product photography
Strong grid
Minimal UI
```

Mục tiêu cuối cùng là tạo ra một website có cá tính riêng, cao cấp hơn các mẫu web bán gear gaming phổ thông nhưng vẫn thực dụng và dễ triển khai.
