"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { normalizeImageUrl } from "@/lib/utils";

export interface BannerFormData {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  orderIndex?: number;
  isActive?: boolean;
}

export async function createBanner(data: BannerFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.title || !data.title.trim()) {
      return { success: false, error: "Tiêu đề banner không được để trống" };
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      return { success: false, error: "URL hình ảnh banner không được để trống" };
    }

    const banner = await prisma.banner.create({
      data: {
        title: data.title.trim(),
        imageUrl: normalizeImageUrl(data.imageUrl.trim()),
        linkUrl: data.linkUrl?.trim() || null,
        orderIndex: Number(data.orderIndex) || 0,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tạo banner" };
  }
}

export async function updateBanner(id: string, data: BannerFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.title || !data.title.trim()) {
      return { success: false, error: "Tiêu đề banner không được để trống" };
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      return { success: false, error: "URL hình ảnh banner không được để trống" };
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title.trim(),
        imageUrl: normalizeImageUrl(data.imageUrl.trim()),
        linkUrl: data.linkUrl?.trim() || null,
        orderIndex: Number(data.orderIndex) || 0,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi xóa banner" };
  }
}

export async function toggleBannerActive(id: string, currentStatus: boolean) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const newStatus = !currentStatus;
    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive: newStatus },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, isActive: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi đổi trạng thái banner" };
  }
}
