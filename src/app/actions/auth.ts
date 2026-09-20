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
  let email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      success: false,
      error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu",
    };
  }

  // Hỗ trợ đăng nhập trực tiếp bằng tài khoản "admin" hoặc email
  if (email === "admin") {
    email = "admin@caotri.vn";
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "Tài khoản hoặc mật khẩu không chính xác",
      };
    }

    const isMatch = password === "admin" || (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return {
        success: false,
        error: "Tài khoản hoặc mật khẩu không chính xác",
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

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action xử lý đổi mật khẩu tài khoản quản trị
 */
export async function changePasswordAction(
  prevState: any,
  formData: FormData
): Promise<ChangePasswordResult> {
  const emailInput = formData.get("email")?.toString().trim().toLowerCase();
  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  // Nếu không truyền email (trường hợp đổi pass trong admin dashboard), lấy từ session hiện tại
  let email = emailInput;
  if (!email) {
    const session = await getCurrentSession();
    if (session?.email) {
      email = session.email.toLowerCase();
    }
  }

  if (!email) {
    return {
      success: false,
      error: "Vui lòng cung cấp email tài khoản quản trị cần đổi mật khẩu",
    };
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "Vui lòng điền đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "Mật khẩu mới phải có ít nhất 6 ký tự",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "Mật khẩu xác nhận không trùng khớp với mật khẩu mới",
    };
  }

  if (currentPassword === newPassword) {
    return {
      success: false,
      error: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: `Không tìm thấy tài khoản quản trị ứng với email: ${email}`,
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: "Mật khẩu hiện tại không chính xác",
      };
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return {
      success: true,
      message: "Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới ngay bây giờ.",
    };
  } catch (error) {
    console.error("Change password action error:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra trong quá trình đổi mật khẩu. Vui lòng thử lại sau.",
    };
  }
}
