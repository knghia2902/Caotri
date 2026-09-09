"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  signJWT,
  setSessionCookie,
  clearSessionCookie,
  getCurrentSession,
} from "@/lib/auth";
import { UserRole, SessionPayload } from "@/types";
import { redirect } from "next/navigation";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: SessionPayload;
}

/**
 * Server Action xử lý đăng nhập tài khoản quản trị
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      success: false,
      error: "Vui lòng nhập đầy đủ email và mật khẩu",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác",
      };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Email hoặc mật khẩu không chính xác",
      };
    }

    const payload: Omit<SessionPayload, "expiresAt"> = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    };

    const token = await signJWT(payload);
    await setSessionCookie(token);

    return {
      success: true,
      user: {
        ...payload,
      },
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.",
    };
  }
}

/**
 * Server Action xử lý đăng xuất
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getCurrentUserAction(): Promise<SessionPayload | null> {
  return getCurrentSession();
}
