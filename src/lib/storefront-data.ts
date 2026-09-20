import { prisma } from "@/lib/prisma";

// In-memory cache for ultra-fast response times (<1ms) within worker isolate
interface CacheHolder<T> {
  data: T | null;
  expiresAt: number;
}

const TTL_MS = 60 * 1000; // 60 seconds TTL

let settingsCache: CacheHolder<Record<string, string>> = { data: null, expiresAt: 0 };
let categoriesCache: CacheHolder<any[]> = { data: null, expiresAt: 0 };
let bannersCache: CacheHolder<any[]> = { data: null, expiresAt: 0 };
let featuredProductsCache: CacheHolder<any[]> = { data: null, expiresAt: 0 };
let newProductsCache: CacheHolder<any[]> = { data: null, expiresAt: 0 };

/**
 * Xóa toàn bộ bộ nhớ đệm in-memory khi có thao tác thêm/sửa/xóa từ Admin
 */
export function invalidateStorefrontCache() {
  settingsCache = { data: null, expiresAt: 0 };
  categoriesCache = { data: null, expiresAt: 0 };
  bannersCache = { data: null, expiresAt: 0 };
  featuredProductsCache = { data: null, expiresAt: 0 };
  newProductsCache = { data: null, expiresAt: 0 };
}

/**
 * Lấy cấu hình website (Hotline, Zalo, Tên shop...)
 */
export async function getStorefrontSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (settingsCache.data && now < settingsCache.expiresAt) {
    return settingsCache.data;
  }
  try {
    const records = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of records) {
      map[s.key] = s.value;
    }
    settingsCache = { data: map, expiresAt: now + TTL_MS };
    return map;
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return settingsCache.data || {};
  }
}

/**
 * Lấy danh mục sản phẩm kèm số lượng sản phẩm
 */
export async function getStorefrontCategories() {
  const now = Date.now();
  if (categoriesCache.data && now < categoriesCache.expiresAt) {
    return categoriesCache.data;
  }
  try {
    const data = await prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    categoriesCache = { data, expiresAt: now + TTL_MS };
    return data;
  } catch (error) {
    console.error("Failed to load categories:", error);
    return categoriesCache.data || [];
  }
}

/**
 * Lấy danh sách banner trang chủ đang kích hoạt
 */
export async function getStorefrontBanners() {
  const now = Date.now();
  if (bannersCache.data && now < bannersCache.expiresAt) {
    return bannersCache.data;
  }
  try {
    const data = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });
    bannersCache = { data, expiresAt: now + TTL_MS };
    return data;
  } catch (error) {
    console.error("Failed to load banners:", error);
    return bannersCache.data || [];
  }
}

/**
 * Lấy danh sách sản phẩm nổi bật cho trang chủ
 */
export async function getFeaturedProducts(take = 8) {
  const now = Date.now();
  if (featuredProductsCache.data && now < featuredProductsCache.expiresAt) {
    return featuredProductsCache.data;
  }
  try {
    const data = await prisma.product.findMany({
      where: { isFeatured: true },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    featuredProductsCache = { data, expiresAt: now + TTL_MS };
    return data;
  } catch (error) {
    console.error("Failed to load featured products:", error);
    return featuredProductsCache.data || [];
  }
}

/**
 * Lấy danh sách sản phẩm mới về cho trang chủ
 */
export async function getNewProducts(take = 8) {
  const now = Date.now();
  if (newProductsCache.data && now < newProductsCache.expiresAt) {
    return newProductsCache.data;
  }
  try {
    const data = await prisma.product.findMany({
      where: { isNew: true },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    newProductsCache = { data, expiresAt: now + TTL_MS };
    return data;
  } catch (error) {
    console.error("Failed to load new products:", error);
    return newProductsCache.data || [];
  }
}
