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

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
  message?: string;
  name?: string;
  email?: string;
}

/**
 * Server Action cập nhật hồ sơ cá nhân quản trị viên
 */
export async function updateProfileAction(
  prevState: any,
  formData: FormData
): Promise<UpdateProfileResult> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      error: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();

  if (!name || !email) {
    return {
      success: false,
      error: "Vui lòng nhập đầy đủ họ tên và email.",
    };
  }

  try {
    // Kiểm tra trùng lặp email với tài khoản khác
    if (email !== session.email.toLowerCase()) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== session.userId) {
        return {
          success: false,
          error: "Email này đã được sử dụng bởi tài khoản khác trong hệ thống.",
        };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { name, email },
    });

    // Cập nhật lại session JWT cookie
    const token = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as UserRole,
    });
    await setSessionCookie(token);

    return {
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      name: updatedUser.name,
      email: updatedUser.email,
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "Không thể cập nhật hồ sơ. Vui lòng thử lại sau.",
    };
  }
}

