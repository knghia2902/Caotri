# Domain Pitfalls Research

**Domain:** Gaming Gear & Computer Accessories E-Commerce
**Researched:** 2026-09-09
**Confidence:** HIGH

## Critical Pitfalls

### 1. Hydration Mismatch khi dùng LocalStorage cho Giỏ hàng
- **Vấn đề:** Khi render Next.js trên Server (SSR), giỏ hàng rỗng vì server không có `localStorage`. Khi xuống Client, `localStorage` có dữ liệu khiến HTML server và client lệch nhau, gây ra lỗi đỏ màn hình (Hydration Mismatch Error).
- **Dấu hiệu sớm:** Console báo `Warning: Text content did not match. Server: "0" Client: "3"`.
- **Cách phòng tránh:** Dùng Zustand store với `persist` middleware và gắn cờ `isHydrated` hoặc chỉ render số lượng giỏ hàng sau khi component mount (`useEffect` / dynamic import with `ssr: false`).
- **Giai đoạn xử lý:** Phase 5 (Cart & Checkout).

### 2. Lỗi làm tròn số tiền (Floating-Point Precision)
- **Vấn đề:** Dùng kiểu số `Float` hoặc `Number` của JavaScript để tính tiền tệ có thể gây sai số (ví dụ: `0.1 + 0.2 = 0.30000000000000004`), dẫn đến tổng đơn hàng bị lệch vài đồng hoặc hiển thị giá tiền dị biệt.
- **Dấu hiệu sớm:** Tổng tiền đơn hàng hiển thị lẻ số thập phân hoặc không khớp với tổng từng sản phẩm cộng lại.
- **Cách phòng tránh:** Trong Database, dùng kiểu `Decimal` hoặc `BigInt`/`Int` (lưu VNĐ nguyên tệ). Trong TypeScript, tính toán bằng số nguyên hoặc thư viện xử lý số tiền chuẩn.
- **Giai đoạn xử lý:** Phase 1 (Schema & DB) và Phase 5 (Cart & Orders).

### 3. Tải trang chậm do ảnh Gaming Gear dung lượng lớn
- **Vấn đề:** Ảnh gaming gear thường có độ phân giải cao, chụp nhiều góc cạnh và hiệu ứng đèn LED. Nếu upload trực tiếp ảnh gốc 5MB - 10MB mà không nén, trang danh sách sản phẩm sẽ giật lag, điểm Core Web Vitals (LCP) tụt dốc.
- **Dấu hiệu sớm:** Tốc độ tải trang chủ > 3s, ảnh load từng vệt từ trên xuống.
- **Cách phòng tránh:** Bắt buộc tích hợp Cloudinary hoặc Supabase Storage kèm tính năng tự động chuyển đổi sang định dạng WebP/AVIF và resize theo kích thước khung hình; luôn sử dụng Next.js `<Image>` component với thuộc tính `sizes` và `placeholder="blur"`.
- **Giai đoạn xử lý:** Phase 3 (Upload ảnh) & Phase 4 (Storefront).

### 4. Link chuyển tiếp sang Zalo / Facebook bị chặn hoặc lỗi font tiếng Việt
- **Vấn đề:** Khi bấm nút "Chốt đơn qua Zalo", chuỗi tin nhắn tiếng Việt chứa dấu cách và ký tự có dấu nếu không được mã hóa đúng sẽ bị lỗi hiển thị hoặc bị trình duyệt/ứng dụng Zalo từ chối mở.
- **Dấu hiệu sớm:** Bấm nút nhưng Zalo không mở tin nhắn soạn sẵn, hoặc nội dung tin nhắn bị biến dạng thành ký tự lạ (`%20`, `?`).
- **Cách phòng tránh:** Luôn dùng `encodeURIComponent()` để mã hóa thông điệp đơn hàng; đồng thời bổ sung thêm nút **"Sao chép thông tin đơn hàng"** (1-click copy) để khách hàng có thể dán trực tiếp vào bất kỳ ứng dụng chat nào (Zalo, Messenger, SMS).
- **Giai đoạn xử lý:** Phase 5 (Order Success & Contact Integration).

### 5. Hổng bảo mật phân quyền ở Server Actions
- **Vấn đề:** Chỉ ẩn nút "Xóa sản phẩm" trên giao diện Admin đối với nhân viên (Staff), nhưng không kiểm tra quyền trong Server Action hoặc Route Handler, dẫn đến việc người dùng có thể gửi request trực tiếp để thao tác trái phép.
- **Dấu hiệu sớm:** Staff có thể kích hoạt các API mutation của Admin bằng Postman hoặc DevTools.
- **Cách phòng tránh:** Áp dụng kiểm tra kép (Double-check): vừa bảo vệ Route bằng Middleware, vừa bọc logic kiểm tra `session.user.role === 'ADMIN'` ngay đầu mỗi Server Action nhạy cảm.
- **Giai đoạn xử lý:** Phase 2 (Auth & RBAC) và Phase 3 (Admin Management).

---
*Pitfalls research for: Gaming Gear & Tech Accessories E-Commerce*
*Researched: 2026-09-09*
