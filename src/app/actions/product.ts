"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { slugify } from "@/lib/slugify";
import { normalizeImageUrl } from "@/lib/utils";
import { invalidateStorefrontCache } from "@/lib/storefront-data";

export interface ProductFormData {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  specs?: Record<string, string>;
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  categoryId: string;
}

export async function createProduct(data: ProductFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Tên sản phẩm không được để trống" };
    }
    if (!data.categoryId) {
      return { success: false, error: "Vui lòng chọn danh mục cho sản phẩm" };
    }
    if (data.price === undefined || isNaN(data.price) || data.price < 0) {
      return { success: false, error: "Giá bán sản phẩm không hợp lệ" };
    }

    const finalSlug = (data.slug && data.slug.trim())
      ? slugify(data.slug.trim())
      : slugify(data.name.trim());

    if (!finalSlug) {
      return { success: false, error: "Không thể tạo slug từ tên sản phẩm" };
    }

    // Kiểm tra slug trùng lặp
    const existing = await prisma.product.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      return {
        success: false,
        error: `Đường dẫn (slug) "${finalSlug}" đã tồn tại trên sản phẩm khác`,
      };
    }

    // Làm sạch và chuẩn hóa mảng images (hỗ trợ Google Drive, Dropbox...)
    const cleanImages = (data.images || [])
      .map((url) => normalizeImageUrl(url.trim()))
      .filter((url) => url.length > 0);

    // Làm sạch specs
    const cleanSpecs: Record<string, string> = {};
    if (data.specs) {
      for (const [k, v] of Object.entries(data.specs)) {
        if (k.trim() && v.trim()) {
          cleanSpecs[k.trim()] = v.trim();
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        description: data.description?.trim() || null,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        images: JSON.stringify(cleanImages),
        specs: Object.keys(cleanSpecs).length > 0 ? JSON.stringify(cleanSpecs) : null,
        inStock: data.inStock ?? true,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? true,
        categoryId: data.categoryId,
      },
    });

    invalidateStorefrontCache();
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/");

    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tạo sản phẩm" };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Tên sản phẩm không được để trống" };
    }
    if (!data.categoryId) {
      return { success: false, error: "Vui lòng chọn danh mục cho sản phẩm" };
    }
    if (data.price === undefined || isNaN(data.price) || data.price < 0) {
      return { success: false, error: "Giá bán sản phẩm không hợp lệ" };
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      return { success: false, error: "Sản phẩm không tồn tại" };
    }

    const finalSlug = (data.slug && data.slug.trim())
      ? slugify(data.slug.trim())
      : slugify(data.name.trim());

    if (!finalSlug) {
      return { success: false, error: "Không thể tạo slug từ tên sản phẩm" };
    }

    if (finalSlug !== existingProduct.slug) {
      const conflict = await prisma.product.findUnique({
        where: { slug: finalSlug },
      });
      if (conflict) {
        return {
          success: false,
          error: `Đường dẫn (slug) "${finalSlug}" đã thuộc về sản phẩm khác`,
        };
      }
    }

    // Làm sạch và chuẩn hóa mảng images (hỗ trợ Google Drive, Dropbox...)
    const cleanImages = (data.images || [])
      .map((url) => normalizeImageUrl(url.trim()))
      .filter((url) => url.length > 0);

    const cleanSpecs: Record<string, string> = {};
    if (data.specs) {
      for (const [k, v] of Object.entries(data.specs)) {
        if (k.trim() && v.trim()) {
          cleanSpecs[k.trim()] = v.trim();
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug: finalSlug,
        description: data.description?.trim() || null,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        images: JSON.stringify(cleanImages),
        specs: Object.keys(cleanSpecs).length > 0 ? JSON.stringify(cleanSpecs) : null,
        inStock: data.inStock ?? true,
        isFeatured: data.isFeatured ?? false,
        isNew: data.isNew ?? false,
        categoryId: data.categoryId,
      },
    });

    invalidateStorefrontCache();
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidatePath("/admin/categories");
    revalidatePath("/");

    return { success: true, product: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật sản phẩm" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    await prisma.product.delete({
      where: { id },
    });

    invalidateStorefrontCache();
    revalidatePath("/admin/products");
    revalidatePath("/admin/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi xóa sản phẩm" };
  }
}

export async function toggleProductFeatured(id: string, currentStatus: boolean) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const newStatus = !currentStatus;
    await prisma.product.update({
      where: { id },
      data: { isFeatured: newStatus },
    });

    invalidateStorefrontCache();
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, isFeatured: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi đổi trạng thái nổi bật" };
  }
}

export async function toggleProductInStock(id: string, currentStatus: boolean) {
  try {
    await requireRole(["ADMIN", "STAFF"]);

    const newStatus = !currentStatus;
    await prisma.product.update({
      where: { id },
      data: { inStock: newStatus },
    });

    invalidateStorefrontCache();
    revalidatePath("/admin/products");
    revalidatePath("/");

    return { success: true, inStock: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi đổi trạng thái kho hàng" };
  }
}
