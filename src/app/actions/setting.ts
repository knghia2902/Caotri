"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function updateSettings(data: Record<string, string>) {
  try {
    // Chỉ ADMIN mới có quyền sửa đổi cài đặt cửa hàng
    await requireRole(["ADMIN"]);

    // Map đồng bộ cả 2 kiểu đặt tên key (camelCase và snake_case/short) để tương thích mọi component
    const mapped: Record<string, string> = { ...data };
    if (data.zalo !== undefined) mapped.zaloUrl = data.zalo;
    if (data.facebook !== undefined) mapped.facebookUrl = data.facebook;
    if (data.shop_name !== undefined) mapped.shopName = data.shop_name;
    if (data.shopName !== undefined) mapped.shop_name = data.shopName;
    if (data.zaloUrl !== undefined) mapped.zalo = data.zaloUrl;
    if (data.facebookUrl !== undefined) mapped.facebook = data.facebookUrl;

    const updates = Object.entries(mapped).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: value.trim() },
        create: { key, value: value.trim() },
      })
    );

    await prisma.$transaction(updates);

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/cart");
    revalidatePath("/products");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật cài đặt cửa hàng" };
  }
}
