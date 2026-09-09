# Phase 2: Authentication & Admin RBAC - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 02-authentication-admin-rbac
**Areas discussed:** Cơ chế Auth & Session, Giao diện trang Đăng nhập /admin/login, Bố cục Admin Layout & Sidebar, Chính sách xử lý khi Nhân viên (Staff) truy cập trang bị hạn chế quyền

---

## Cơ chế Auth & Session

| Option | Description | Selected |
|--------|-------------|:--------:|
| Custom JWT Session bằng thư viện 'jose' + cookie httpOnly | Tương thích 100% với Next.js 15 & React 19, chạy mượt trên Edge Middleware, không phụ thuộc adapter cồng kềnh | ✓ |
| Dùng Auth.js (NextAuth v5 beta) với Prisma Adapter | Thư viện phổ biến nhưng có breaking change và cảnh báo peer dependency với React 19 | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| 7 ngày và tự động làm mới | Sliding session tiện lợi cho người quản trị cửa hàng | ✓ |
| 24 giờ | Hết hạn sau 1 ngày, yêu cầu đăng nhập lại thường xuyên | |
| 30 ngày | Lưu phiên dài hạn | |

**User's choice:** Custom JWT Session bằng `jose` + cookie httpOnly, thời hạn 7 ngày sliding session.

---

## Giao diện trang Đăng nhập /admin/login

| Option | Description | Selected |
|--------|-------------|:--------:|
| Split Screen 2 cột | Một bên ảnh artwork Gaming Gear / Tech ấn tượng, một bên là form đăng nhập | ✓ |
| Centered Card tối giản | Hộp đăng nhập nổi bật ở giữa màn hình nền tối | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Có nút 1-click điền tài khoản mẫu | 1 bấm tự điền tài khoản Admin hoặc Staff để tiện test và quản trị nhanh | ✓ |
| Chỉ hiển thị form trống tiêu chuẩn | Bảo mật truyền thống, không kèm nút test tài khoản | |

**User's choice:** Split Screen 2 cột kèm nút 1-click Quick-fill demo credentials.

---

## Bố cục Admin Layout & Sidebar

| Option | Description | Selected |
|--------|-------------|:--------:|
| Sidebar cố định có thể thu gọn | Collapsible Sidebar 260px -> 64px icon-only, kèm drawer trượt trên Mobile | ✓ |
| Sidebar cố định độ rộng 260px | Đơn giản, độ rộng cố định | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Đầy đủ tính năng | Breadcrumbs, Nút 'Xem Shop' ra storefront, User info & Badge Role nổi bật, Nút Đăng xuất | ✓ |
| Tối giản | Chỉ hiển thị User Profile & Nút Đăng xuất | |

**User's choice:** Collapsible Sidebar (260px/64px) + Top Header đầy đủ (Breadcrumbs, Nút Xem Shop, User info, Badge Role, Nút Đăng xuất).

---

## Chính sách xử lý khi Nhân viên (Staff) truy cập trang bị hạn chế quyền

| Option | Description | Selected |
|--------|-------------|:--------:|
| Tự động chuyển hướng về /admin/dashboard kèm thông báo Toast cảnh báo | Cảnh báo 'Bạn không có quyền truy cập trang này' thân thiện, không đứt gãy luồng công việc | ✓ |
| Hiển thị trang 403 'Truy cập bị từ chối' | Màn hình lỗi tĩnh 403 | |

| Option | Description | Selected |
|--------|-------------|:--------:|
| Chặn 2 lớp (Defense-in-Depth) | Ẩn link trên giao diện + Validate chặt chẽ role 'ADMIN' trong Middleware và Server Actions | ✓ |
| Chỉ chặn ở tầng Middleware và UI | Dễ bị lách qua các request API trực tiếp | |

**User's choice:** Chặn 2 lớp (Defense-in-depth), tự động chuyển hướng về Dashboard kèm Toast cảnh báo nếu Staff gõ URL hạn chế.

---

## the agent's Discretion

- Tự chọn cài đặt gói `jose` phục vụ mã hóa / giải mã JWT.
- Thiết kế giao diện theo phong cách Clean Tech Gaming Gear kế thừa từ Phase 1.
- Cung cấp component thông báo Toast (`sonner`) cho trải nghiệm mượt mà.

## Deferred Ideas

- Đăng nhập qua OAuth bên thứ ba (Google Login cho Admin/Staff).
- Tính năng Quên mật khẩu & Gửi mã OTP qua Email.
