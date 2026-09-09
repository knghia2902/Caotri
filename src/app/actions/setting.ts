"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function updateSettings(data: Record<string, string>) {
  try {
    // Chỉ ADMIN mới có quyền sửa đổi cài đặt cửa hàng
    await requireRole(["ADMIN"]);

    const updates = Object.entries(data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value.trim() },
        create: { key, value: value.trim() },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật cài đặt cửa hàng" };
  }
}
