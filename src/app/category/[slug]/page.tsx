import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogFilter } from "@/components/storefront/catalog-filter";
import { CatalogSortSelect } from "@/components/storefront/catalog-sort-select";
import {
  getStorefrontCategories,
  getStorefrontSettings,
} from "@/lib/storefront-data";
import { Package } from "lucide-react";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sParams = await searchParams;

  const minPrice = sParams.minPrice ? Number(sParams.minPrice) : undefined;
  const maxPrice = sParams.maxPrice ? Number(sParams.maxPrice) : undefined;
  const inStockOnly = sParams.inStock === "true";
  const sort = sParams.sort || "newest";

  // Nạp danh mục và cấu hình từ cache
  const [categories, settings] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontSettings(),
  ]);

  // Tìm danh mục hiện tại từ cache trước
  let currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory) {
    currentCategory = await prisma.category.findUnique({
      where: { slug },
    }) || undefined;
  }

  if (!currentCategory) {
    notFound();
  }

  // Điều kiện lọc
  const where: any = {
    categoryId: currentCategory.id,
  };

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (inStockOnly) {
    where.inStock = true;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "featured") {
    orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }

  // Nạp sản phẩm cho danh mục
  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
      <StorefrontHeader categories={categories} hotline={settings.hotline} />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-8 py-10 space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-[#74746E]">
          <Link href="/" className="hover:text-[#111] transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#111] transition-colors">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-[#111]">{currentCategory.name}</span>
        </nav>

        {/* Category Header & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-3xl font-semibold text-[#111] tracking-tight">
              {currentCategory.name}
            </h1>
            {currentCategory.description ? (
              <p className="text-sm text-[#74746E] mt-2 max-w-2xl">
                {currentCategory.description}
              </p>
            ) : (
              <p className="text-sm text-[#74746E] mt-2">
                Tổng cộng {products.length} sản phẩm
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#74746E]">Sắp xếp theo</span>
            <CatalogSortSelect currentSort={sort} />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[240px] shrink-0">
            <CatalogFilter
              categories={categories}
              currentCategorySlug={currentCategory.slug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
            />
          </div>

          <div className="flex-1">
            {products.length === 0 ? (
              <div className="py-20 text-center rounded-lg border border-dashed border-[#D5D5D0] bg-white">
                <Package className="w-12 h-12 mx-auto mb-4 text-[#A3A39D]" />
                <h3 className="text-lg font-medium text-[#111]">
                  Chưa có sản phẩm nào phù hợp trong danh mục này
                </h3>
                <p className="text-sm text-[#74746E] mt-2 max-w-sm mx-auto">
                  Thử điều chỉnh lại khoảng giá hoặc xem các danh mục thiết bị khác.
                </p>
                <Link
                  href={`/category/${currentCategory.slug}`}
                  className="inline-flex items-center justify-center h-10 px-4 mt-6 text-sm font-medium text-[#111] bg-white border border-[#D5D5D0] rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  Xóa bộ lọc giá
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <StorefrontFooter settings={settings} />
    </div>
  );
}
