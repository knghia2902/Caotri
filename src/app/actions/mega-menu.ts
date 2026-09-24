"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateStorefrontCache } from "@/lib/storefront-data";
import { CategoryMegaMenuConfig, getMegaMenuConfig } from "@/lib/mega-menu-data";

/**
 * Lấy cấu hình Mega Menu cho 1 category (từ SiteSetting hoặc mặc định)
 */
export async function getMegaMenuConfigAction(
  slug: string,
  categoryName?: string
): Promise<{ success: boolean; config: CategoryMegaMenuConfig }> {
  try {
    const key = `mega_menu_${slug}`;
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      return { success: true, config: parsed };
    }

    // Nếu chưa có cấu hình tùy chỉnh, lấy cấu hình mặc định từ hệ thống
    const defaultConfig = getMegaMenuConfig(slug, categoryName) || {
      slug,
      title: categoryName || "Danh mục",
      allHref: `/category/${slug}`,
      columns: [
        {
          groups: [
            {
              title: "Thương hiệu nổi bật",
              href: `/category/${slug}`,
              items: [],
            },
          ],
        },
      ],
    };

    return { success: true, config: defaultConfig };
  } catch (error) {
    console.error("getMegaMenuConfigAction error:", error);
    const fallback = getMegaMenuConfig(slug, categoryName) || {
      slug,
      title: categoryName || "Danh mục",
      allHref: `/category/${slug}`,
      columns: [],
    };
    return { success: false, config: fallback };
  }
}

/**
 * Lưu cấu hình Mega Menu tùy chỉnh vào SiteSetting
 */
export async function saveMegaMenuConfigAction(
  slug: string,
  config: CategoryMegaMenuConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const key = `mega_menu_${slug}`;
    const value = JSON.stringify(config);

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    // Xóa bộ nhớ đệm in-memory và revalidate toàn bộ trang Storefront
    invalidateStorefrontCache();
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    console.error("saveMegaMenuConfigAction error:", error);
    return { success: false, error: error?.message || "Không thể lưu cấu hình" };
  }
}

/**
 * Khôi phục cấu hình Mega Menu về mặc định của hệ thống
 */
export async function resetMegaMenuConfigAction(
  slug: string,
  categoryName?: string
): Promise<{ success: boolean; config?: CategoryMegaMenuConfig; error?: string }> {
  try {
    const key = `mega_menu_${slug}`;
    await prisma.siteSetting.deleteMany({
      where: { key },
    });

    invalidateStorefrontCache();
    revalidatePath("/", "layout");

    const defaultConfig = getMegaMenuConfig(slug, categoryName);
    return { success: true, config: defaultConfig };
  } catch (error: any) {
    console.error("resetMegaMenuConfigAction error:", error);
    return { success: false, error: error?.message || "Không thể khôi phục mặc định" };
  }
}
