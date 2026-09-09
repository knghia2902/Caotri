# DESIGN.md — Caotri Gear

## 1. Tổng quan

**Caotri Gear** là website bán phụ kiện công nghệ và gaming gear, gồm 2 khu vực chính:

- **Website khách hàng**: Trang chủ, danh mục sản phẩm, tìm kiếm & lọc, chi tiết sản phẩm, giỏ hàng, đặt hàng/liên hệ.
- **Trang quản trị Admin**: Dashboard, quản lý sản phẩm, đơn hàng, danh mục, banner/nội dung, người dùng và phân quyền.

Phong cách thiết kế hướng tới cảm giác **gaming hiện đại, sạch, chuyên nghiệp, dễ mua hàng**, ưu tiên trải nghiệm desktop nhưng vẫn cần responsive tốt trên tablet và mobile.

---

## 2. Design direction

### 2.1. Phong cách

- Modern e-commerce
- Gaming / technology
- Tối giản, rõ ràng
- Nội dung đặt trong các khối card sáng
- Header/footer sử dụng nền navy đậm để tạo nhận diện
- Accent chính là xanh dương tươi
- Hạn chế hiệu ứng neon quá mạnh; ưu tiên giao diện thực tế, dễ triển khai

### 2.2. Từ khóa hình ảnh

`Gaming` · `Technology` · `Clean UI` · `Modern` · `Navy` · `Blue Accent` · `White Cards` · `Sharp & Premium`

---

## 3. Design Tokens

### 3.1. Màu sắc

```css
:root {
  --color-primary: #1677FF;
  --color-primary-hover: #0F67E8;
  --color-primary-light: #EAF3FF;

  --color-dark-900: #0B1624;
  --color-dark-800: #111E2E;
  --color-dark-700: #18283A;

  --color-bg: #F5F7FA;
  --color-surface: #FFFFFF;
  --color-surface-soft: #F8FAFC;

  --color-text-primary: #172033;
  --color-text-secondary: #687386;
  --color-text-muted: #98A2B3;

  --color-border: #E5EAF0;
  --color-border-strong: #D5DCE5;

  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-info: #3B82F6;

  --color-price: #EF2D2D;
}
```

### 3.2. Nền

- Body khách hàng: `#F5F7FA` hoặc trắng.
- Header/footer: navy đậm `#0B1624`.
- Sidebar admin: `#0B1624`.
- Nội dung admin: `#F5F7FA`.
- Card/table/form: trắng.

### 3.3. Typography

Ưu tiên font dễ đọc, hỗ trợ tiếng Việt tốt:

```css
font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif;
```

Cấp chữ tham khảo:

| Loại | Size | Weight |
|---|---:|---:|
| Hero heading | 40–52px | 700–800 |
| Page title | 28–32px | 700 |
| Section title | 22–26px | 700 |
| Card title | 15–18px | 600 |
| Body | 14–16px | 400 |
| Small text | 12–13px | 400–500 |
| Price | 16–22px | 700 |

### 3.4. Border radius

```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 18px;
```

- Input/button: 6–8px
- Product card: 10–12px
- Main card: 12–16px
- Banner: 12–16px

### 3.5. Shadow

```css
--shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.08);
--shadow-md: 0 8px 24px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 14px 40px rgba(15, 23, 42, 0.12);
```

Không dùng shadow quá nặng.

### 3.6. Spacing

Dùng hệ 4px:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

Container desktop:

```css
max-width: 1440px;
margin: 0 auto;
padding: 0 24px;
```

---

# 4. Layout website khách hàng

## 4.1. Header

### Cấu trúc

1. Logo `Caotri Gear`
2. Navigation
3. Search box
4. User / account icon
5. Wishlist icon (optional)
6. Cart icon + badge số lượng

### Desktop

Chiều cao khoảng `64–72px`.

```text
[Logo] [Trang chủ] [Sản phẩm] [Danh mục] [Khuyến mãi] [Liên hệ]     [Search] [♡] [User] [Cart]
```

### Style

- Nền trắng ở khu vực content hoặc navy tùy phiên bản.
- Viền dưới mảnh.
- Search box rộng khoảng 260–360px.
- Cart badge dùng màu đỏ.

---

## 4.2. Hero Banner

Banner lớn nằm ngay dưới header.

### Nội dung

- Ảnh gaming setup / keyboard / mouse / monitor.
- Overlay tối nhẹ.
- Headline lớn.
- Subheading ngắn.
- CTA màu xanh dương.

Ví dụ nội dung:

```text
GEAR CHO MỌI CUỘC CHƠI
Hiệu năng vượt trội — Trải nghiệm khác biệt
[Khám phá ngay]
```

### Kích thước desktop

- Tỉ lệ khoảng `16:5` hoặc `16:6`.
- Border radius 12–16px.

---

## 4.3. Service highlights

Ngay dưới banner có 3–4 item:

- Sản phẩm chính hãng
- Giao hàng toàn quốc
- Tư vấn 24/7
- Thanh toán linh hoạt

Mỗi item gồm:

```text
[icon]  Tiêu đề
        Nội dung phụ
```

---

## 4.4. Danh mục sản phẩm

Hiển thị dạng icon card ngang.

Danh mục gợi ý:

- Chuột
- Bàn phím
- Tai nghe
- Lót chuột / Pad
- Màn hình
- Phụ kiện khác

Card:

- Icon/ảnh sản phẩm ở giữa.
- Tên danh mục phía dưới.
- Hover: border xanh + background `primary-light`.

---

## 4.5. Product sections

Trang chủ gồm tối thiểu:

- **Sản phẩm nổi bật**
- **Sản phẩm mới**

Mỗi section:

```text
[Tên section]                           [Xem tất cả →]
[Product] [Product] [Product] [Product] [Product]
```

### Product card

Cấu trúc:

```text
┌────────────────────────┐
│ Badge        ♡          │
│                        │
│      Product image     │
│                        │
│ Tên sản phẩm           │
│ ★★★★★ (optional)       │
│ 2.990.000đ             │
│                  [cart]│
└────────────────────────┘
```

Style:

- Nền trắng.
- Border `#E5EAF0`.
- Radius 10–12px.
- Không shadow hoặc shadow rất nhẹ.
- Hover: translateY(-2px), shadow-md.

Ảnh sản phẩm dùng nền trắng/sáng, object-fit `contain`.

### Badge

- `Mới`: xanh dương.
- `Bán chạy`: đỏ/cam.
- `% giảm`: đỏ.
- `Hết hàng`: xám.

---

# 5. Trang danh mục sản phẩm

## 5.1. Bố cục desktop

```text
┌──────────────┬──────────────────────────────────────────┐
│ FILTER       │ Tiêu đề danh mục         [Sort dropdown]│
│              │                                          │
│ Danh mục     │ [Product] [Product] [Product]           │
│ Khoảng giá   │ [Product] [Product] [Product]           │
│ Thương hiệu  │ [Product] [Product] [Product]           │
│ Tình trạng   │                                          │
│              │             Pagination                   │
└──────────────┴──────────────────────────────────────────┘
```

Sidebar khoảng `220–260px`.

Main content chiếm phần còn lại.

## 5.2. Filter

### Danh mục

Checkbox hoặc selectable item.

### Khoảng giá

- Range slider.
- 2 ô `Giá từ` / `Giá đến` nếu cần.

### Thương hiệu

- Logitech
- Razer
- HyperX
- Keychron
- SteelSeries
- Asus
- Khác

### Tình trạng

- Còn hàng
- Hết hàng

### Sort

Dropdown:

- Mặc định
- Giá thấp → cao
- Giá cao → thấp
- Mới nhất

---

# 6. Trang chi tiết sản phẩm

## 6.1. Layout

```text
Breadcrumb

┌──────────────────────────┬───────────────────────────────┐
│                          │ Tên sản phẩm                  │
│      Main product image  │ ★★★★★                         │
│                          │ Giá                           │
│ [thumb] [thumb] [thumb]  │ Mô tả ngắn                   │
│                          │                               │
│                          │ Màu sắc                       │
│                          │ Số lượng [-] 1 [+]           │
│                          │ [Thêm vào giỏ hàng]           │
│                          │                               │
│                          │ Facebook | Zalo | Gọi điện   │
└──────────────────────────┴───────────────────────────────┘
```

## 6.2. Product gallery

- Main image lớn.
- Thumbnail ở dưới hoặc bên trái.
- Thumbnail active có border xanh.

## 6.3. Product info

- Tên sản phẩm: 28–32px.
- Giá sale: màu đỏ.
- Giá cũ: xám + line-through.
- Discount badge nếu có.

### CTA

Primary:

```text
[ 🛒 Thêm vào giỏ hàng ]
```

Secondary contact buttons:

```text
[ Facebook ] [ Zalo ] [ Gọi điện ]
```

Facebook và Zalo có thể dùng outline blue; gọi điện outline green.

---

## 6.4. Tabs thông tin

Tabs dưới product detail:

- Mô tả
- Thông số kỹ thuật
- Đánh giá

Active tab:

- chữ đậm
- border-bottom xanh

---

# 7. Giỏ hàng

## 7.1. Layout

Desktop chia `70/30`:

```text
┌─────────────────────────────────┬──────────────────────┐
│ Giỏ hàng                        │ Tóm tắt đơn hàng     │
│                                 │                      │
│ Product row                     │ Tạm tính             │
│ Product row                     │ Giảm giá             │
│ Product row                     │ Tổng cộng            │
│                                 │                      │
│                                 │ [Liên hệ đặt hàng]   │
│                                 │ Facebook / Zalo / Tel│
└─────────────────────────────────┴──────────────────────┘
```

### Product row

- Ảnh 64–80px.
- Tên.
- Giá.
- Stepper số lượng.
- Tổng giá.
- Delete icon màu đỏ.

---

# 8. Đặt hàng / Liên hệ

Caotri Gear không cần bắt buộc checkout online phức tạp.

Khách có thể đặt hàng bằng:

- Facebook
- Zalo
- Điện thoại

Khi nhấn liên hệ, nên chuẩn bị sẵn nội dung đơn:

```text
Xin chào Caotri Gear,
Tôi muốn đặt:
- Logitech G Pro X × 1
- Keychron K8 Pro × 1

Tổng: 5.980.000đ
```

Có thể có trang xác nhận đơn đơn giản với:

- Mã đơn hàng.
- Số sản phẩm.
- Tổng tiền.
- Các nút liên hệ.

---

# 9. Footer

Footer nền navy đậm.

Chia 3–4 cột:

```text
Caotri Gear
Mô tả ngắn
Social icons

Về chúng tôi
- Giới thiệu
- Chính sách
- Điều khoản

Hỗ trợ khách hàng
- Hướng dẫn mua hàng
- Chính sách bảo hành
- Đổi trả

Liên hệ
- Facebook
- Zalo
- Hotline
- Email
```

Bottom footer:

```text
© 2026 Caotri Gear. All rights reserved.
```

---

# 10. Admin Design

## 10.1. Layout tổng

Desktop admin dùng layout sidebar cố định bên trái.

```text
┌───────────────┬──────────────────────────────────────────┐
│ SIDEBAR       │ TOPBAR                                   │
│               ├──────────────────────────────────────────┤
│ Dashboard     │                                          │
│ Sản phẩm      │             PAGE CONTENT                 │
│ Đơn hàng      │                                          │
│ Danh mục      │                                          │
│ Banner        │                                          │
│ Người dùng    │                                          │
│ Phân quyền    │                                          │
│ Cài đặt       │                                          │
└───────────────┴──────────────────────────────────────────┘
```

### Sidebar

- Width: `210–240px`.
- Background: `#0B1624`.
- Logo ở đầu.
- Menu item cao ~40–44px.
- Icon trái + label.
- Active item dùng background xanh `#1677FF`.

### Topbar

- Cao 56–64px.
- Nền trắng.
- Breadcrumb hoặc page title trái.
- Notification + avatar + account dropdown phải.

---

# 11. Admin Dashboard

## 11.1. KPI cards

4 card đầu trang:

- Tổng sản phẩm
- Tổng đơn hàng
- Doanh thu
- Khách hàng

Card structure:

```text
[icon] Label
       128
       ↑ 12%
```

Mỗi card có icon nền pastel nhẹ.

## 11.2. Chart

Line chart doanh thu / đơn hàng theo ngày.

- Card trắng.
- Gridline nhẹ.
- Line xanh dương.
- Có filter 7 ngày / 30 ngày / tháng.

---

# 12. Quản lý sản phẩm

## 12.1. Toolbar

```text
[Tìm kiếm sản phẩm...] [Danh mục ▼] [Trạng thái ▼]     [+ Thêm sản phẩm]
```

## 12.2. Table

Columns:

```text
Ảnh
Tên sản phẩm
Danh mục
Giá
Trạng thái
Thao tác
```

Actions:

- Edit: icon xanh.
- Delete: icon đỏ.

Status:

- `Còn hàng`: badge xanh lá.
- `Hết hàng`: badge đỏ/xám.

---

# 13. Form thêm / sửa sản phẩm

Dùng modal lớn hoặc trang riêng.

Fields:

- Tên sản phẩm
- Slug
- Danh mục
- Thương hiệu
- Giá
- Giá sale
- Tình trạng
- Ảnh sản phẩm
- Mô tả ngắn
- Mô tả chi tiết
- Thông số kỹ thuật
- Nổi bật
- Sản phẩm mới

Footer actions:

```text
[Hủy] [Lưu sản phẩm]
```

---

# 14. Quản lý đơn hàng

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

Status badge:

- Chờ xác nhận → cam.
- Đang xử lý → xanh dương.
- Đang giao → tím/xanh.
- Đã giao → xanh lá.
- Đã hủy → đỏ.

Click `Chi tiết` mở drawer/modal.

---

# 15. Quản lý danh mục

Table đơn giản:

```text
Tên danh mục
Slug
Số sản phẩm
Trạng thái
Thao tác
```

Ví dụ:

- Chuột
- Bàn phím
- Tai nghe
- Pad
- Màn hình
- Phụ kiện

CTA:

```text
[+ Thêm danh mục]
```

---

# 16. Banner & nội dung

Admin có khu vực quản lý:

- Hero banner.
- Banner phụ trang chủ.
- Section sản phẩm nổi bật.
- Section sản phẩm mới.
- Nội dung footer.
- Thông tin Facebook / Zalo / Hotline.

Banner form:

```text
Tiêu đề
Mô tả
Ảnh banner
CTA text
CTA link
Trạng thái hiển thị
Thứ tự
```

---

# 17. Người dùng & phân quyền

## Roles

### Admin

Có toàn quyền:

- Dashboard.
- Sản phẩm.
- Danh mục.
- Đơn hàng.
- Banner.
- Người dùng.
- Phân quyền.
- Cài đặt.

### Nhân viên

Quyền tùy cấu hình, ví dụ:

- Xem dashboard.
- Quản lý đơn hàng.
- Xem sản phẩm.
- Không được xóa sản phẩm.
- Không quản lý người dùng.
- Không thay đổi phân quyền.

## UI phân quyền

Có thể dùng checkbox matrix:

```text
                 Xem   Thêm   Sửa   Xóa
Sản phẩm          ✓     ✓      ✓     ✕
Đơn hàng          ✓     -      ✓     ✕
Danh mục          ✓     ✕      ✕     ✕
Banner            ✓     ✕      ✕     ✕
Người dùng        ✕     ✕      ✕     ✕
```

---

# 18. Buttons

## Primary

```css
background: #1677FF;
color: #FFFFFF;
border: none;
```

Hover:

```css
background: #0F67E8;
```

## Secondary

```css
background: #FFFFFF;
color: #172033;
border: 1px solid #D5DCE5;
```

## Danger

```css
color: #EF4444;
border-color: #FECACA;
background: #FFF5F5;
```

Button height:

- Small: 32px
- Normal: 40px
- Large CTA: 44–48px

---

# 19. Inputs

Input style:

```css
height: 40px;
border: 1px solid #D5DCE5;
border-radius: 8px;
background: #FFFFFF;
padding: 0 12px;
```

Focus:

```css
border-color: #1677FF;
box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12);
```

---

# 20. Tables

Admin table style:

- Header background `#F8FAFC`.
- Header text 12–13px / semibold.
- Row height 56–64px.
- Border-bottom mảnh.
- Hover row background `#F8FAFC`.
- Actions luôn nằm phía phải.

Pagination:

```text
[‹] [1] [2] [3] […] [›]
```

Active page xanh dương.

---

# 21. Icons

Ưu tiên icon outline hiện đại:

- Lucide Icons
- Heroicons
- Tabler Icons

Icon thickness đồng nhất khoảng 1.5–2px.

Các icon chính:

- Search
- User
- Heart
- Shopping Cart
- Mouse
- Keyboard
- Headphones
- Monitor
- Package
- Layout Dashboard
- Shopping Bag
- Clipboard List
- Folder
- Image
- Users
- Shield
- Settings
- Pencil
- Trash

---

# 22. Responsive

## Desktop ≥ 1200px

- Full nav.
- Product grid 4–5 columns.
- Category page có sidebar filter.
- Admin sidebar luôn hiển thị.

## Tablet 768–1199px

- Product grid 3 columns.
- Search nhỏ hơn.
- Admin sidebar có thể collapse.
- Filter chuyển thành drawer.

## Mobile < 768px

### Storefront

- Header dạng compact.
- Hamburger menu.
- Logo ở trái.
- Cart/search icon phải.
- Product grid 2 cột.
- Hero banner thấp hơn.
- Danh mục horizontal scroll.
- Filter mở bottom sheet/drawer.
- Detail product chuyển thành 1 column.
- Cart summary xuống dưới danh sách.

### Admin

- Sidebar thành drawer.
- Table có horizontal scroll hoặc chuyển card list.
- KPI card 2 cột hoặc 1 cột.

---

# 23. Recommended component structure

```text
components/
├── common/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Badge
│   ├── Modal
│   ├── Drawer
│   ├── Pagination
│   └── EmptyState
│
├── storefront/
│   ├── Header
│   ├── Footer
│   ├── HeroBanner
│   ├── ServiceHighlights
│   ├── CategoryCard
│   ├── ProductCard
│   ├── ProductGrid
│   ├── ProductFilters
│   ├── ProductGallery
│   ├── QuantitySelector
│   ├── CartItem
│   └── ContactOrderCard
│
└── admin/
    ├── AdminSidebar
    ├── AdminTopbar
    ├── StatCard
    ├── DataTable
    ├── ProductForm
    ├── OrderDetail
    ├── CategoryForm
    ├── BannerForm
    └── PermissionMatrix
```

---

# 24. Suggested pages / routes

## Customer

```text
/
/products
/products?category=mouse
/products/:slug
/cart
/order-success
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
/admin/roles
/admin/settings
```

---

# 25. UX states cần có

Mọi chức năng quan trọng cần thiết kế các trạng thái:

- Loading.
- Empty.
- Error.
- Success.
- Disabled.
- Hover.
- Focus.
- Selected.
- Out of stock.

Ví dụ empty cart:

```text
🛒
Giỏ hàng của bạn đang trống
Khám phá các sản phẩm phù hợp với bạn.
[Xem sản phẩm]
```

---

# 26. Nguyên tắc hình ảnh sản phẩm

- Ảnh rõ, nền sạch.
- Tỉ lệ thống nhất `1:1`.
- Product card dùng `object-fit: contain`.
- Padding ảnh 16–24px để sản phẩm không sát viền.
- Banner dùng ảnh gaming setup chất lượng cao, tỷ lệ ngang.

---

# 27. Animation & interaction

Animation nhẹ, nhanh:

```css
transition: all 160ms ease;
```

Recommended:

- Product hover: nâng nhẹ.
- Button hover: đổi màu.
- Drawer/modal: fade + slide.
- Cart badge: scale animation khi thêm hàng.
- Skeleton khi load sản phẩm.

Không dùng animation dài hoặc hiệu ứng gaming quá mạnh gây rối.

---

# 28. Accessibility

- Contrast text đạt WCAG AA khi có thể.
- Button/icon có `aria-label`.
- Keyboard navigation cho form/modal.
- Focus ring rõ ràng.
- Không dùng màu làm dấu hiệu trạng thái duy nhất; kết hợp text/icon.
- Ảnh sản phẩm có `alt`.

---

# 29. Mục tiêu cuối cùng

Giao diện Caotri Gear cần tạo cảm giác:

> **Một cửa hàng gaming gear hiện đại, đáng tin cậy, nhanh, rõ ràng và dễ mua hàng — với hệ thống Admin có cùng ngôn ngữ thiết kế để việc vận hành đơn giản và chuyên nghiệp.**

Thiết kế nên ưu tiên **usability trước hiệu ứng**, dùng nền trắng cho nội dung chính, navy cho khu vực nhận diện và xanh dương làm accent xuyên suốt toàn bộ hệ thống.
