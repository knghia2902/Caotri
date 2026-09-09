import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole, SessionPayload } from "@/types";

export const COOKIE_NAME = "caotri_session";
const JWT_SECRET = process.env.JWT_SECRET || "caotri-gaming-gear-jwt-secret-2026-secure-key";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/**
 * Tạo và ký JWT Token với thời hạn 7 ngày
 */
export async function signJWT(
  payload: Omit<SessionPayload, "expiresAt">
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

/**
 * Xác thực và giải mã JWT Token
 * Hoạt động mượt mà cả trên Edge Runtime (Middleware) và Node.js
 */
export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Đặt cookie session HTTP-only an toàn
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày (giây)
  });
}

/**
 * Đọc token từ cookie hiện tại
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Xóa cookie session khi đăng xuất
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Lấy thông tin phiên làm việc hiện tại
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return verifyJWT(token);
}

/**
 * Kiểm tra người dùng đã đăng nhập chưa (dùng cho Server Actions / Components)
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Yêu cầu đăng nhập quản trị");
  }
  return session;
}

/**
 * Kiểm tra người dùng có đúng vai trò được cho phép không
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN: Bạn không có quyền thực hiện thao tác này");
  }
  return session;
}
