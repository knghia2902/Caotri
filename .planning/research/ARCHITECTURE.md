# Architecture Research

**Domain:** Gaming Gear & Computer Accessories E-Commerce
**Researched:** 2026-09-09
**Confidence:** HIGH

## System Overview

Hệ thống được thiết kế theo kiến trúc Next.js App Router Fullstack (Monolith tinh gọn), gom chung Storefront và Admin Dashboard trong một repository để chia sẻ chung TypeScript types, Prisma schema và các hàm tiện ích mà vẫn phân tách rành mạch về UI và quyền hạn truy cập.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│                                                                        │
│   Storefront: (Khách hàng)                Admin Dashboard: (Quản trị) │
│   - Trang chủ & Banner                    - Thống kê Dashboard         │
│   - Danh mục, Lọc & Tìm kiếm              - CRUD Sản phẩm & Upload ảnh │
│   - Chi tiết Gear & Giỏ hàng              - Quản lý Đơn hàng           │
│   - Form Đặt hàng & Nút Zalo/FB           - Quản lý Danh mục & Banner  │
│                                           - Phân quyền Admin / Staff   │
└───────────────────▲────────────────────────────────────▲───────────────┘
                    │ HTTPS                              │ NextAuth Session
┌───────────────────┴────────────────────────────────────┴───────────────┐
│                        NEXT.JS APP ROUTER SERVER                       │
│                                                                        │
│   Routes Storefront:                      Routes Admin:                │
│   / (Home), /products, /cart, /order      /admin/login                 │
│                                           /admin/dashboard, products.. │
│                                                                        │
│   Middleware: Bảo vệ /admin/*, kiểm tra vai trò (ADMIN / STAFF)        │
│   Server Actions & Route Handlers: Xử lý Mutation & API upload         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma ORM (Type-Safe)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        POSTGRESQL DATABASE                             │
│   Tables: Users, Categories, Products, Orders, OrderItems,             │
│           Banners, SiteSettings                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ External Storage API
┌───────────────────────────────────▼────────────────────────────────────┐
│                    CLOUDINARY / SUPABASE STORAGE                       │
│   Lưu trữ hình ảnh sản phẩm chất lượng cao, tối ưu WebP/AVIF CDN      │
└────────────────────────────────────────────────────────────────────────┘
```

## Component Boundaries

### 1. Storefront Module (`/src/app/(store)`)
- **Trang chủ (`/`)**: Render Server Components lấy Banner, Sản phẩm nổi bật, Sản phẩm mới từ Prisma. Tốc độ tải trang tức thì, hỗ trợ SEO tối đa.
- **Trang sản phẩm & danh mục (`/products`, `/category/[slug]`)**: Nhận query params (search, category, priceMin, priceMax, sort) để lọc dữ liệu trực tiếp trên server hoặc hydrate cho client filter.
- **Trang chi tiết sản phẩm (`/product/[slug]`)**: Hiển thị ảnh gallery, thông số kỹ thuật (DPI, Switch, Kết nối dây/Wireless,...), nút thêm giỏ hàng.
- **Giỏ hàng & Đặt hàng (`/cart`, `/checkout`)**: Zustand Cart Store quản lý trạng thái client, form checkout submit qua Server Action tạo đơn hàng vào DB.
- **Trang hoàn tất đơn hàng (`/order/success/[id]`)**: Hiển thị mã đơn và nút chuyển tiếp sang Zalo chat tự động kèm nội dung đơn hàng.

### 2. Admin Module (`/src/app/admin`)
- **Xác thực (`/admin/login`)**: Xác thực tài khoản email/mật khẩu được mã hóa bcrypt, cấp session token.
- **Dashboard (`/admin/dashboard`)**: Card thống kê số lượng đơn mới, tổng sản phẩm, doanh thu dự tính.
- **Quản lý sản phẩm (`/admin/products`)**: Bảng danh sách, form tạo mới/chỉnh sửa với upload ảnh lên Cloudinary/Storage, chọn danh mục, cấu hình giá và thông số.
- **Quản lý đơn hàng (`/admin/orders`)**: Xem chi tiết đơn hàng, khách hàng, số điện thoại, địa chỉ nhận, danh sách hàng kèm số lượng; nút cập nhật trạng thái đơn (Mới -> Đã gọi điện -> Đang giao -> Hoàn thành -> Hủy).
- **Quản lý danh mục & Banner (`/admin/categories`, `/admin/banners`)**: Thêm/sửa/xóa danh mục và banner slider hiển thị ở trang chủ.
- **Phân quyền nhân viên (`/admin/users`)**: Chỉ tài khoản vai trò `ADMIN` mới có thể tạo/sửa tài khoản `STAFF`.

### 3. Shared Core (`/src/lib`)
- `prisma.ts`: Singleton Prisma client kết nối Database.
- `auth.ts`: Cấu hình NextAuth hoặc JWT verification.
- `storage.ts`: Hàm tiện ích tải ảnh lên Cloudinary / Supabase Storage.
- `utils.ts`: Định dạng tiền tệ VNĐ (`1.500.000 ₫`), tạo slug tiếng Việt chuẩn SEO.

## Database Schema Model (Prisma)

```prisma
enum Role {
  ADMIN
  STAFF
}

enum OrderStatus {
  PENDING
  CONTACTED
  SHIPPING
  COMPLETED
  CANCELLED
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  orderIndex  Int       @default(0)
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  description   String?     @db.Text
  price         Decimal     @db.Decimal(12, 2)
  originalPrice Decimal?    @db.Decimal(12, 2)
  images        String[]    // Array of image URLs
  specs         Json?       // e.g. { "DPI": "26000", "Switch": "Optical", "Weight": "63g" }
  inStock       Boolean     @default(true)
  isFeatured    Boolean     @default(false)
  isNew         Boolean     @default(true)
  categoryId    String
  category      Category    @relation(fields: [categoryId], references: [id])
  orderItems    OrderItem[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // e.g. DH-100234
  customerName    String
  customerPhone   String
  customerAddress String
  customerNotes   String?     @db.Text
  totalAmount     Decimal     @db.Decimal(12, 2)
  status          OrderStatus @default(PENDING)
  items           OrderItem[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  name        String
  price       Decimal  @db.Decimal(12, 2)
  quantity    Int      @default(1)
}

model Banner {
  id         String   @id @default(cuid())
  title      String
  imageUrl   String
  linkUrl    String?
  orderIndex Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
}

model SiteSetting {
  key       String   @id
  value     String   @db.Text
  updatedAt DateTime @updatedAt
}
```

## Recommended Build Order

1. **Phase 1: Project Scaffolding, Theme & Database Setup**
   - Khởi tạo Next.js App Router, Tailwind theme gaming gear, Prisma schema & kết nối Database, seed dữ liệu mẫu (danh mục & sản phẩm).
2. **Phase 2: Authentication & Admin Layout + RBAC**
   - Đăng nhập bảo mật, layout Admin responsive, middleware phân quyền Admin / Staff.
3. **Phase 3: Admin Catalog & Content Management**
   - CRUD Danh mục, CRUD Sản phẩm với upload ảnh, Quản lý Banner trang chủ & Cài đặt Hotline/Zalo/FB.
4. **Phase 4: Storefront Discovery & Browsing Experience**
   - Trang chủ (Banner, Featured, New), Trang danh mục, Tìm kiếm & Lọc giá, Trang chi tiết sản phẩm & Thư viện ảnh.
5. **Phase 5: Cart, Checkout & Order Flow**
   - Giỏ hàng (Zustand/LocalStorage), Form checkout đặt hàng, Lưu đơn hàng vào DB, Màn hình thành công kèm nút 1-click liên hệ Zalo/FB.
6. **Phase 6: Admin Order Fulfillment & Dashboard Analytics**
   - Thống kê Dashboard, Quản lý đơn hàng (xem chi tiết, cập nhật trạng thái đơn), nghiệm thu và hoàn thiện trải nghiệm.

---
*Architecture research for: Gaming Gear & Tech Accessories E-Commerce*
*Researched: 2026-09-09*
