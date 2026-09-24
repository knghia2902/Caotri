"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { normalizeImageUrl } from "@/lib/utils";
import { invalidateStorefrontCache } from "@/lib/storefront-data";

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

    if (!data.imageUrl || !data.imageUrl.trim()) {
      return { success: false, error: "URL hình ảnh banner không được để trống" };
    }

    const bannerTitle = data.title?.trim() || "Banner quảng cáo";

    const banner = await prisma.banner.create({
      data: {
        title: bannerTitle,
        imageUrl: normalizeImageUrl(data.imageUrl.trim()),
        linkUrl: data.linkUrl?.trim() || null,
        orderIndex: Number(data.orderIndex) || 0,
        isActive: data.isActive ?? true,
      },
    });

    invalidateStorefrontCache();
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

    if (!data.imageUrl || !data.imageUrl.trim()) {
      return { success: false, error: "URL hình ảnh banner không được để trống" };
    }

    const bannerTitle = data.title?.trim() || "Banner quảng cáo";

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: bannerTitle,
        imageUrl: normalizeImageUrl(data.imageUrl.trim()),
        linkUrl: data.linkUrl?.trim() || null,
        orderIndex: Number(data.orderIndex) || 0,
        isActive: data.isActive ?? true,
      },
    });

    invalidateStorefrontCache();
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

    invalidateStorefrontCache();
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

    invalidateStorefrontCache();
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return { success: true, isActive: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi đổi trạng thái banner" };
  }
}
