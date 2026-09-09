# Phase 3: Admin Catalog & Content Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 03-admin-catalog-content-management
**Areas discussed:** Giải pháp Upload & Lưu trữ hình ảnh, Cơ chế nhập Thông số kỹ thuật (Tech Specs) sản phẩm, Giao diện CRUD Danh mục & Sản phẩm, Quản lý Banner trang chủ & Cài đặt thông tin liên hệ

---

## Giải pháp Upload & Lưu trữ hình ảnh

| Option | Description | Selected |
|--------|-------------|:--------:|
| Lưu đĩa cục bộ public/uploads/ | Đơn giản cho dev nhưng không tương thích với Cloudflare Pages | |
| Quản lý ảnh qua URL trực tiếp từ CDN + Cloudflare R2 / Cloudinary | Tương thích 100% với Cloudflare Pages và Edge runtimes, hoàn toàn không ghi đĩa local | ✓ |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Quản lý bộ sưu tập nhiều ảnh (Multiple images gallery) | Ảnh đầu tiên làm thumbnail chính, các ảnh sau làm gallery/slider chi tiết | ✓ |
| Chỉ 1 ảnh đại diện duy nhất | Hạn chế trải nghiệm xem gear của khách hàng | |

**User's choice:** "sau này triển khai trên clauflare page cho nên không lưu local" $\rightarrow$ Quản lý ảnh qua URL trực tiếp (từ CDN/R2/Cloudinary) + hỗ trợ gallery nhiều ảnh.

---

## Cơ chế nhập Thông số kỹ thuật (Tech Specs) sản phẩm

| Option | Description | Selected |
|--------|-------------|:--------:|
| Bảng Key-Value động kèm Preset gợi ý theo Danh mục | Chọn Chuột -> gợi ý Sensor, DPI, Switch, Trọng lượng; Chọn Phím -> Switch, Keycap, Hotswap; tùy ý thêm/xóa dòng | ✓ |
| Bảng Key-Value trống hoàn toàn | Phải gõ tay cả tên thông số và giá trị, tốn công sức | |
| Khung Textarea nhập tự do | Khó chuẩn hóa dữ liệu hiển thị dạng bảng | |

**User's choice:** Bảng Key-Value động kết hợp Preset gợi ý theo Danh mục.

---

## Giao diện CRUD Danh mục & Sản phẩm

| Option | Description | Selected |
|--------|-------------|:--------:|
| Sản phẩm dùng trang riêng (/admin/products/new & edit), Danh mục dùng Modal Dialog | Phù hợp với độ phức tạp của từng đối tượng: Sản phẩm nhiều trường dùng trang riêng rộng rãi, Danh mục ít trường dùng Modal nhanh gọn | ✓ |
| Tất cả dùng trang riêng biệt | Quá nhiều trang phụ cho các thao tác nhỏ | |
| Tất cả dùng Modal Dialog | Modal bị chật chội khi nhập nhiều ảnh và thông số kỹ thuật sản phẩm | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Bật/tắt nhanh ngay trên bảng (Quick-Toggle) | 1-click chuyển trạng thái Nổi bật / Còn hàng trực tiếp trên bảng, tự động lưu DB tức thì | ✓ |
| Chỉ bật/tắt trong form chỉnh sửa | Bất tiện khi cần gỡ/bật nhanh sản phẩm | |

**User's choice:** Sản phẩm dùng trang riêng (`new` & `edit`) + Modal cho Danh mục + Quick-Toggle 1-click trên bảng.

---

## Quản lý Banner trang chủ & Cài đặt thông tin liên hệ

| Option | Description | Selected |
|--------|-------------|:--------:|
| Danh sách dạng Card Grid trực quan | Ảnh preview lớn, nút toggle isActive, chỉnh sửa link và order trực quan | ✓ |
| Bảng Table tiêu chuẩn | Không xem trước được ảnh banner rõ nét | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Form chia nhóm trực quan | Nhóm Hotline, Zalo OA, Fanpage; Nhóm Tên shop, Địa chỉ, Email kèm 1 nút Lưu thay đổi | ✓ |
| Bảng Key-Value đơn giản | Kém trực quan | |

**User's choice:** Card Grid trực quan cho Banners + Form chia nhóm cho Cài đặt cửa hàng.

---

## the agent's Discretion

- Tự động sinh `slug` thân thiện SEO từ tên tiếng Việt (slugify).
- Tách bạch các Server Actions theo từng domain: `category.ts`, `product.ts`, `banner.ts`, `setting.ts`.
- Sử dụng Sonner Toast phản hồi trạng thái các thao tác CRUD.

## Deferred Ideas

- Upload ảnh trực tiếp lên Cloudflare R2 qua Presigned URL (cấu hình biến môi trường khi triển khai Cloudflare production).
- Phân trang nâng cao (Pagination controls).
