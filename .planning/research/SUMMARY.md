# Project Research Summary

**Project:** Gaming Gear & Tech Accessories E-Commerce
**Domain:** E-Commerce / Computer Peripherals & Gaming Gear
**Researched:** 2026-09-09
**Confidence:** HIGH

## Executive Summary

Hệ thống Website bán linh kiện & Gaming Gear được xây dựng theo mô hình Fullstack tinh gọn dựa trên Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM và PostgreSQL (Supabase). Kiến trúc này kết hợp sức mạnh SEO và tốc độ tải trang cực nhanh của Server Components cho phía khách hàng (Storefront), cùng khả năng quản trị tương tác tức thì cho bảng điều khiển Admin (Dashboard, Products, Orders, Categories, Banners, RBAC).

Quy trình chốt đơn được thiết kế phù hợp tối đa với thói quen mua sắm gaming gear tại thị trường Việt Nam: Khách hàng điền thông tin giao hàng nhanh không cần tài khoản, hệ thống ghi nhận đơn hàng và tạo mã định danh, sau đó hỗ trợ 1-click chuyển tiếp thông tin đơn hàng sang chat Zalo / Facebook Messenger để shop tư vấn cấu hình, chốt đơn và gửi hàng.

Rủi ro kỹ thuật chính gồm lỗi Hydration mismatch khi đồng bộ giỏ hàng từ LocalStorage, sai số thập phân tiền tệ và việc tải chậm hình ảnh gaming gear phân giải cao đã được đề ra phương án phòng ngừa triệt để ngay từ thiết kế schema và kiến trúc thư viện.

## Key Findings

### Recommended Stack

Xem chi tiết tại [.planning/research/STACK.md](STACK.md).

**Core technologies:**
- **Next.js (App Router)**: Framework React fullstack hỗ trợ Server Components tối ưu SEO sản phẩm và Server Actions xử lý dữ liệu an toàn.
- **TypeScript**: Type-safety toàn diện từ Database (Prisma) tới UI components.
- **Tailwind CSS**: Dễ dàng tạo phong cách Gaming UI hiện đại, responsive hoàn hảo trên mọi thiết bị.
- **Prisma ORM & PostgreSQL**: Lưu trữ dữ liệu quan hệ chặt chẽ cho Danh mục, Sản phẩm, Đơn hàng, Phân quyền người dùng.
- **Zustand & LocalStorage**: Quản lý trạng thái giỏ hàng nhẹ nhàng, mượt mà trên client.
- **NextAuth / Auth.js**: Xác thực và phân quyền RBAC phân cấp rõ rệt giữa Quản trị viên (ADMIN) và Nhân viên (STAFF).

### Expected Features

Xem chi tiết tại [.planning/research/FEATURES.md](FEATURES.md).

**Must have (table stakes):**
- **Storefront**: Trang chủ (Hero Banner, Featured, New), Danh mục sản phẩm (Chuột, Phím, Tai nghe, Pad, Màn hình,...), Tìm kiếm & Lọc giá, Chi tiết sản phẩm & Thư viện ảnh, Giỏ hàng, Form đặt hàng nhanh.
- **Admin**: Dashboard tổng quan, Quản lý sản phẩm (CRUD, nhiều ảnh, giá, danh mục), Quản lý đơn hàng (xem chi tiết, cập nhật trạng thái), Quản lý danh mục, Quản lý Banner/Nội dung liên hệ, Phân quyền Admin/Staff.

**Should have (differentiators):**
- **1-Click Chốt đơn Zalo/Facebook**: Tự động mở chat với nội dung đơn hàng soạn sẵn sau khi đặt hàng.
- **Floating Contact Bar**: Nút gọi Hotline và chat Zalo/FB luôn hiển thị ở góc màn hình.
- **Gaming Aesthetic**: Giao diện tông tối hiện đại tôn vinh vẻ đẹp góc cạnh và LED RGB của gear.

**Defer (v2+):**
- Cổng thanh toán online tự động (VNPay/MoMo) và Đăng ký thành viên tích điểm (để tối giản rào cản mua sắm ở giai đoạn đầu).

### Architecture Approach

Xem chi tiết tại [.planning/research/ARCHITECTURE.md](ARCHITECTURE.md).

**Major components:**
1. **Storefront (`/src/app/(store)`)**: Phục vụ trải nghiệm xem và mua sắm của khách hàng, render tĩnh và động linh hoạt tối ưu SEO.
2. **Admin Panel (`/src/app/admin`)**: Giao diện quản trị nghiệp vụ với bảo mật Middleware và phân quyền Role.
3. **Database & Services Layer (`/src/lib`)**: Prisma client, storage upload (Cloudinary/Supabase), utils xử lý tiền tệ VNĐ và slug.

### Critical Pitfalls

Xem chi tiết tại [.planning/research/PITFALLS.md](PITFALLS.md).

1. **Hydration Mismatch Giỏ hàng**: Dùng Zustand store có cờ hydrate hoặc delay render sau khi mount để tránh lệch HTML server-client.
2. **Sai số tiền tệ Floating-Point**: Sử dụng kiểu `Decimal` hoặc `Int` lưu tiền VNĐ nguyên tệ trong DB và code xử lý.
3. **Ảnh Gear nặng làm chậm trang**: Bắt buộc chuẩn hóa ảnh qua CDN Cloudinary/Storage nén WebP và dùng Next.js `<Image>`.
4. **Bảo mật Server Actions**: Kiểm tra quyền `ADMIN` trực tiếp trong Server Action chứ không chỉ ẩn nút trên giao diện.

## Implications for Roadmap

Dựa trên nghiên cứu kiến trúc và tính phụ thuộc, lộ trình triển khai gồm 6 phases tiêu chuẩn:

### Phase 1: Nền tảng dự án, Schema Cơ sở dữ liệu & Seed Data
**Rationale:** Khởi tạo Next.js, cấu hình Tailwind gaming theme, tạo schema Prisma chuẩn xác (quan hệ Category, Product, Order, User) và seed dữ liệu mẫu phong phú để các phase sau phát triển độc lập và trực quan.
**Delivers:** Dự án Next.js sẵn sàng, Prisma schema hoàn chỉnh kết nối PostgreSQL/Supabase, seed data các danh mục gear (Chuột, Phím, Tai nghe,...) và sản phẩm demo.
**Avoids:** Lỗi sai số tiền tệ thập phân, cấu trúc dữ liệu thiếu nhất quán.

### Phase 2: Xác thực & Phân quyền Admin Dashboard (RBAC)
**Rationale:** Xây dựng khung quản trị an toàn trước khi bổ sung các module CRUD nghiệp vụ.
**Delivers:** Hệ thống đăng nhập bảo mật, Middleware bảo vệ route `/admin/*`, phân quyền 2 vai trò `ADMIN` và `STAFF`, layout trang quản trị responsive.
**Avoids:** Lỗ hổng bypass quyền hạn của nhân viên.

### Phase 3: Quản trị Sản phẩm, Danh mục & Banner
**Rationale:** Đảm bảo Admin có đầy đủ công cụ để nhập liệu, sửa ảnh, quản lý giá và cấu hình hiển thị trước khi hoàn thiện giao diện người dùng.
**Delivers:** CRUD Danh mục, CRUD Sản phẩm với upload nhiều ảnh, cấu hình thông số kỹ thuật (specs), quản lý Banner slider trang chủ & thông tin liên hệ Hotline/Zalo/FB.
**Avoids:** Ảnh sản phẩm quá nặng không qua tối ưu CDN.

### Phase 4: Giao diện Storefront (Trang chủ, Tìm kiếm, Bộ lọc & Chi tiết sản phẩm)
**Rationale:** Phục vụ trải nghiệm duyệt hàng và xem chi tiết sản phẩm của khách hàng dựa trên dữ liệu đã quản lý từ Phase 3.
**Delivers:** Trang chủ hấp dẫn (Banner slider, Featured, New arrivals), Trang danh mục & tìm kiếm có bộ lọc khoảng giá và sắp xếp giá, Trang chi tiết sản phẩm với thư viện ảnh và thông số gear.
**Avoids:** Tải trang chậm, UI vỡ trên thiết bị di động.

### Phase 5: Giỏ hàng, Đặt hàng & Tích hợp liên hệ Zalo/FB
**Rationale:** Hoàn thiện luồng chuyển đổi mua sắm cốt lõi (Core Value) của khách hàng.
**Delivers:** Giỏ hàng mượt mà (thêm/sửa/xóa), Form đặt hàng nhanh (Tên, SĐT, Địa chỉ), Lưu đơn hàng vào DB, Màn hình thành công có mã đơn và nút 1-click mở chat Zalo / Facebook Messenger kèm nội dung soạn sẵn.
**Avoids:** Hydration mismatch lỗi giỏ hàng, link Zalo lỗi font tiếng Việt.

### Phase 6: Quản lý Đơn hàng Admin, Dashboard Thống kê & Nghiệm thu
**Rationale:** Khép kín vòng đời đơn hàng và cung cấp báo cáo tổng quan cho chủ shop.
**Delivers:** Trang chi tiết đơn hàng cho Admin/Staff, đổi trạng thái đơn (Chờ xử lý, Đã liên hệ, Đang giao, Hoàn thành, Hủy), Dashboard thống kê số lượng đơn và doanh thu dự kiến, kiểm thử toàn diện end-to-end.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js App Router + Prisma + Tailwind là bộ công cụ e-commerce tiêu chuẩn công nghiệp |
| Features | HIGH | Đầy đủ tính năng thiết yếu, đã được người dùng xác nhận |
| Architecture | HIGH | Tinh gọn, dễ bảo trì, mở rộng tốt |
| Pitfalls | HIGH | Đã lường trước các vấn đề phổ biến của Next.js SSR và e-commerce tại VN |

**Overall confidence:** HIGH

---
*Research completed: 2026-09-09*
*Ready for roadmap: yes*
