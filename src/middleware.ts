import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT, COOKIE_NAME } from "@/lib/auth";

const ADMIN_ONLY_ROUTES = ["/admin/banners", "/admin/settings"];

function getTargetUrl(path: string, req: NextRequest): URL {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || "";

  if (!host || host.includes("localhost") || host.includes("127.0.0.1")) {
    const baseUrl = process.env.NEXTAUTH_URL || "https://tringuyengear.com";
    return new URL(path, baseUrl);
  }

  // Đảm bảo luôn chuyển hướng về giao thức bảo mật HTTPS khi chạy với domain thật
  return new URL(path, `https://${host}`);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua các file static nội bộ của Next.js và API nếu có
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Xử lý các route quản trị /admin/*
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const isLoginPage = pathname === "/admin/login";

    if (!token) {
      if (isLoginPage) {
        return NextResponse.next();
      }
      const loginUrl = getTargetUrl("/admin/login", req);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifyJWT(token);

    if (!session) {
      if (isLoginPage) {
        return NextResponse.next();
      }
      const loginUrl = getTargetUrl("/admin/login", req);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Đã có session hợp lệ nhưng đang truy cập vào trang login -> chuyển thẳng về dashboard
    if (isLoginPage) {
      return NextResponse.redirect(getTargetUrl("/admin", req));
    }

    // Kiểm tra phân quyền: Staff bị chặn truy cập các trang chỉ dành cho Admin
    if (
      session.role === "STAFF" &&
      ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))
    ) {
      const forbiddenUrl = getTargetUrl("/admin", req);
      forbiddenUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
