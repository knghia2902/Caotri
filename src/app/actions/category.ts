"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { normalizeImageUrl } from "@/lib/utils";

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  orderIndex?: number;
}

export async function createCategory(data: CategoryFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Tên danh mục không được để trống" };
    }

    const finalSlug = (data.slug && data.slug.trim())
      ? slugify(data.slug.trim())
      : slugify(data.name.trim());

    if (!finalSlug) {
      return { success: false, error: "Không thể tạo slug từ tên danh mục" };
    }

    // Kiểm tra slug đã tồn tại chưa
    const existing = await prisma.category.findUnique({
      where: { slug: finalSlug },
    });

    if (existing) {
      return {
        success: false,
        error: `Đường dẫn (slug) "${finalSlug}" đã tồn tại, vui lòng chọn tên hoặc slug khác`,
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl?.trim() ? normalizeImageUrl(data.imageUrl.trim()) : null,
        orderIndex: Number(data.orderIndex) || 0,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tạo danh mục" };
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Tên danh mục không được để trống" };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return { success: false, error: "Danh mục không tồn tại" };
    }

    const finalSlug = (data.slug && data.slug.trim())
      ? slugify(data.slug.trim())
      : slugify(data.name.trim());

    if (!finalSlug) {
      return { success: false, error: "Không thể tạo slug từ tên danh mục" };
    }

    // Nếu slug thay đổi, kiểm tra xem có trùng với danh mục khác không
    if (finalSlug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: finalSlug },
      });
      if (slugConflict) {
        return {
          success: false,
          error: `Đường dẫn (slug) "${finalSlug}" đã thuộc về danh mục khác`,
        };
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl?.trim() ? normalizeImageUrl(data.imageUrl.trim()) : null,
        orderIndex: Number(data.orderIndex) || 0,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, category: updatedCategory };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật danh mục" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return {
        success: false,
        error: `Không thể xóa danh mục này vì đang có ${productCount} sản phẩm liên kết. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi xóa danh mục" };
  }
}
