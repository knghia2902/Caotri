"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { UserRole } from "@/types";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 1. Lấy danh sách tài khoản người dùng / quản trị
 */
export async function getUsersAction(): Promise<UserItem[]> {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as UserRole,
    createdAt: u.createdAt.toISOString(),
  }));
}

/**
 * 2. Tạo tài khoản quản trị / nhân viên mới
 */
export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserActionResult> {
  await requireRole(["ADMIN"]);

  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password?.trim();
  const role = data.role === "ADMIN" ? "ADMIN" : "STAFF";

  if (!name || name.length < 2) {
    return { success: false, error: "Họ tên phải có ít nhất 2 ký tự." };
  }

  if (!email || !email.includes("@")) {
    return { success: false, error: "Vui lòng nhập địa chỉ email hợp lệ." };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Mật khẩu khởi tạo phải có tối thiểu 6 ký tự." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: `Email "${email}" đã tồn tại trong hệ thống. Vui lòng chọn email khác.`,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    revalidatePath("/admin/users");
    return {
      success: true,
      message: `Đã tạo tài khoản ${role === "ADMIN" ? "Quản trị viên" : "Nhân viên"} "${name}" thành công!`,
    };
  } catch (err: any) {
    console.error("Create user error:", err);
    return {
      success: false,
      error: err.message || "Lỗi khi tạo tài khoản người dùng.",
    };
  }
}

/**
 * 3. Cập nhật thông tin hoặc đổi mật khẩu tài khoản
 */
export async function updateUserAction(data: {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  newPassword?: string;
}): Promise<UserActionResult> {
  await requireRole(["ADMIN"]);

  const { id, newPassword } = data;
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();

  if (!name || name.length < 2) {
    return { success: false, error: "Họ tên phải có ít nhất 2 ký tự." };
  }

  if (!email || !email.includes("@")) {
    return { success: false, error: "Vui lòng nhập địa chỉ email hợp lệ." };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return { success: false, error: "Không tìm thấy tài khoản cần chỉnh sửa." };
    }

    // Kiểm tra trùng email nếu đổi email khác
    if (email !== targetUser.email.toLowerCase()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email },
      });
      if (emailConflict && emailConflict.id !== id) {
        return { success: false, error: `Email "${email}" đã được sử dụng bởi tài khoản khác.` };
      }
    }

    // Bảo vệ không cho hạ cấp Quản trị viên duy nhất
    if (data.role && data.role !== "ADMIN" && targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Không thể chuyển vai trò của Quản trị viên duy nhất còn lại trong hệ thống!",
        };
      }
    }

    const updatePayload: any = {
      name,
      email,
    };

    if (data.role) {
      updatePayload.role = data.role;
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return { success: false, error: "Mật khẩu mới phải có tối thiểu 6 ký tự." };
      }
      updatePayload.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    await prisma.user.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Đã cập nhật thông tin tài khoản thành công!" };
  } catch (err: any) {
    console.error("Update user error:", err);
    return {
      success: false,
      error: err.message || "Lỗi khi cập nhật tài khoản.",
    };
  }
}

/**
 * 4. Xóa tài khoản quản trị / nhân viên
 */
export async function deleteUserAction(id: string): Promise<UserActionResult> {
  const session = await requireRole(["ADMIN"]);

  if (session.userId === id) {
    return {
      success: false,
      error: "Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập!",
    };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return { success: false, error: "Tài khoản không tồn tại hoặc đã bị xóa trước đó." };
    }

    // Không cho phép xóa ADMIN cuối cùng
    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return {
          success: false,
          error: "Không thể xóa Quản trị viên duy nhất còn lại trong hệ thống!",
        };
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return {
      success: true,
      message: `Đã xóa tài khoản "${targetUser.name}" (${targetUser.email}) thành công!`,
    };
  } catch (err: any) {
    console.error("Delete user error:", err);
    return {
      success: false,
      error: err.message || "Lỗi khi xóa tài khoản.",
    };
  }
}
