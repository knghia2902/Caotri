# Phase 2: Authentication & Admin RBAC - Research

**Researched:** 2026-09-09
**Domain:** Next.js 15 App Router Authentication, Custom JWT Session via `jose`, Edge Middleware & RBAC
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Sử dụng **Custom JWT Session** với thư viện `jose` và **Cookie httpOnly** (`secure`, `sameSite: 'lax'`, `path: '/'`). Không dùng Auth.js/NextAuth v5 beta để tránh breaking changes trên Next.js 15 + React 19.
- **D-02:** Thời hạn phiên: **7 ngày** (áp dụng Sliding Session tự động gia hạn khi có hoạt động).
- **D-03:** Giao diện đăng nhập `/admin/login` dạng **Split Screen 2 cột** (Cột trái artwork gaming gear + branding, cột phải form Clean Tech).
- **D-04:** Tích hợp nút **1-click Quick-fill demo credentials** cho tài khoản Admin và Staff.
- **D-05:** **Sidebar điều hướng có thể thu gọn (Collapsible)**: 260px desktop $\leftrightarrow$ 64px icon-only, drawer trượt trên Mobile.
- **D-06:** **Header trên cùng** có breadcrumbs, nút "Xem Cửa hàng", thông tin tài khoản + Role Badge, nút Đăng xuất.
- **D-07:** **Quy tắc phân quyền (RBAC)**: `ADMIN` toàn quyền; `STAFF` quản lý đơn hàng + xem/sửa sản phẩm/danh mục; chặn truy cập Banners và Cài đặt.
- **D-08:** Khi Staff cố truy cập URL cấm: tự động chuyển hướng về `/admin/dashboard` kèm thông báo Toast cảnh báo.
- **D-09:** **Bảo mật 2 lớp (Defense-in-depth)**: Ẩn menu UI + kiểm tra ở Middleware và Server Actions/APIs.

### the agent's Discretion
- Cài đặt thư viện `jose` (phiên bản 5.x) cho JWT mã hóa Web Crypto API.
- Cài đặt thư viện `sonner` cho toast notifications đẹp mắt, đồng bộ phong cách Dark/Clean Tech.
- Cấu trúc module `src/lib/auth.ts` và `src/middleware.ts` tối ưu tốc độ thực thi.

### Deferred Ideas (OUT OF SCOPE)
- Đăng nhập OAuth bên thứ ba (Google Login).
- Quên mật khẩu qua email & mã OTP.

</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Login Form & Quick-fill | Browser/Client | — | Quản lý form state, tương tác 1-click điền demo và gửi yêu cầu đăng nhập |
| Xác thực Mật khẩu (bcrypt) | API / Server Action | Database | So khớp hash mật khẩu bằng `bcryptjs` an toàn trên Node.js runtime |
| Ký & Xác thực JWT Token | Frontend Server | Edge Middleware | Sử dụng `jose` tương thích cả Node runtime và Edge runtime |
| Quản lý Cookie Session | Frontend Server (Next.js cookies) | Browser (HTTP-only) | Đặt cookie an toàn ngăn chặn tấn công XSS |
| Route Guarding & RBAC | Edge Middleware | Server Actions | Middleware chuyển hướng người dùng chưa đăng nhập; Server Actions chặn data tampering |
| Admin Layout & Navigation | Frontend Server / Client | — | Server Components nạp thông tin user, Client Components xử lý collapse sidebar |

</architectural_responsibility_map>

<research_summary>
## Summary

Trong hệ sinh thái Next.js 15 App Router và React 19, giải pháp xác thực bằng **Custom JWT Session kết hợp thư viện `jose`** là tiêu chuẩn được khuyến nghị cao nhất đối với các hệ thống quản trị chuyên biệt (Backoffice / Admin Dashboard). `jose` không có dependency ngoài, sử dụng chuẩn Web Crypto API có sẵn trên mọi môi trường (Edge runtime của Middleware và Node.js runtime của Server Actions).

Giải pháp này hoàn toàn loại bỏ rủi ro xung đột peer dependencies của NextAuth v5 với React 19, đồng thời cho phép kiểm soát 100% payload phiên, cơ chế sliding session và logic phân quyền chi tiết (RBAC).

**Primary recommendation:**
1. Cài đặt `jose` và `sonner`.
2. Tạo module `src/lib/auth.ts` đóng gói các hàm: `signJWT`, `verifyJWT`, `setSessionCookie`, `getSessionCookie`, `clearSessionCookie`, `requireAuth`, `requireRole`.
3. Tạo file `src/middleware.ts` ở thư mục gốc để chặn mọi truy cập `/admin/*` khi chưa có cookie hợp lệ, và kiểm tra quyền của Staff trước các trang nhạy cảm (`/admin/banners`, `/admin/settings`).
4. Xây dựng Server Actions `loginAction` và `logoutAction` trong `src/app/actions/auth.ts`.
5. Tạo giao diện `/admin/login` (Split Screen) và `/admin/layout.tsx` (Collapsible Sidebar + Top Header).

</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `jose` | ^5.9.6 | Ký và giải mã JWT token | Chuẩn Web Crypto API, chạy mượt trên cả Node.js và Edge runtime |
| `bcryptjs` | ^2.4.3 | Băm và so sánh mật khẩu | Đã cài đặt ở Phase 1, hoạt động ổn định trên mọi môi trường |
| Next.js App Router Cookies API | 15.x | Đọc/ghi HTTP-only cookies | Tích hợp sẵn trong `next/headers`, an toàn tối đa |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sonner` | ^1.7.0 | Thông báo Toast UI | Cảnh báo khi đăng nhập thất bại hoặc khi Staff bị từ chối truy cập |
| `lucide-react` | ^0.460+ | Icon điều hướng Admin | Đã cài đặt ở Phase 1 (LayoutDashboard, ShoppingBag, FolderTree, Image, Settings, Users, LogOut, ExternalLink, Menu, ChevronLeft) |

**Lệnh cài đặt:**
```bash
npm install jose sonner
```

</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Luồng Dữ Liệu Xác Thực & Phân Quyền (Auth Data Flow)

```
[Khách truy cập /admin/*]
           │
           ▼
   [src/middleware.ts] ──(Không có token / token lỗi)──► [Redirect /admin/login]
           │
           ├─(Có token hợp lệ + Role 'STAFF' + Route cấm)──► [Redirect /admin?forbidden=1]
           │
           ▼ (Token hợp lệ & đủ quyền)
   [src/app/admin/layout.tsx]
           │
           ▼
[Render Admin Sidebar + Header + Page Con]
           │
           ▼ (Gửi mutation Server Action)
   [src/app/actions/*] ──► [requireRole(['ADMIN'])] ──(Lỗi)──► [Throw Unauthorized]
```

### Triển khai Helper Session (`src/lib/auth.ts`)
```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'caotri-secret-key-gaming-gear-2026'
);

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  expiresAt: Date;
}

export async function signJWT(payload: Omit<SessionPayload, 'expiresAt'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
```

### Triển khai Middleware (`src/middleware.ts`)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const ADMIN_ONLY_ROUTES = ['/admin/banners', '/admin/settings'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua trang login và các asset tĩnh
  if (pathname === '/admin/login' || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('caotri_session')?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJWT(token);
    if (!session) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Kiểm tra quyền hạn nếu là Staff
    if (session.role === 'STAFF' && ADMIN_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
      const forbiddenUrl = new URL('/admin?error=forbidden', req.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

</architecture_patterns>

<validation_architecture>
## Validation Architecture

Để đảm bảo Phase 2 đạt tiêu chí nghiệm thu tự động, quy trình kiểm thử gồm:
1. **JWT Verification Script**: Kiểm tra hàm `signJWT` và `verifyJWT` xử lý đúng token, phát hiện token giả mạo, đọc đúng role.
2. **Password Verification Test**: Kiểm tra `bcrypt.compare` với mật khẩu demo admin và staff.
3. **RBAC Guard Test**: Kiểm tra hàm `requireRole` chặn thành công khi role không khớp và cho qua khi role hợp lệ.
4. **Next.js Production Build**: `npm run build` chạy thành công không có lỗi TypeScript hoặc linting trên toàn bộ routes `/admin/*`.

</validation_architecture>

<pitfalls>
## Common Pitfalls & Traps

1. **Bcrypt trong Edge Middleware**:
   - `bcrypt` / `bcryptjs` dùng CPU-intensive hashing không được khuyến nghị chạy trực tiếp trong Edge Middleware.
   - *Khắc phục:* Chỉ xác thực bcrypt trong Server Action (`/actions/auth.ts`), Middleware chỉ đọc và verify JWT token qua `jose` (nhẹ và siêu tốc).
2. **Next.js 15 Cookie Mutation**:
   - Trong Server Components, `cookies()` là read-only.
   - *Khắc phục:* Mọi thao tác set/delete cookie phải thực hiện trong Server Actions (`'use server'`) hoặc Route Handlers.
3. **Hydration Mismatch trên Collapsible Sidebar**:
   - Trạng thái sidebar (mở/thu gọn) nếu lưu trong localStorage có thể gây lệch HTML giữa Server và Client khi render lần đầu.
   - *Khắc phục:* Đặt state mặc định an toàn (`isOpen = true`) và chỉ đồng bộ client-side sau khi component mount (`useEffect`).

</pitfalls>

---

*Phase: 02-authentication-admin-rbac*
*Research completed: 2026-09-09*
*Ready for planning: yes*
