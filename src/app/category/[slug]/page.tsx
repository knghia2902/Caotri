import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogFilter } from "@/components/storefront/catalog-filter";
import { CatalogSortSelect } from "@/components/storefront/catalog-sort-select";
import { CategorySubNav } from "@/components/storefront/category-sub-nav";
import {
  getStorefrontCategories,
  getStorefrontSettings,
  extractMegaMenuOverrides,
} from "@/lib/storefront-data";
import { Package, X } from "lucide-react";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
    search?: string;
    q?: string;
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
  const searchQuery = sParams.search?.trim() || sParams.q?.trim();

  // Nạp danh mục và cấu hình từ cache
  const [categories, settings] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontSettings(),
  ]);

  // Tìm danh mục hiện tại từ cache trước
  let currentCategory = categories.find((c) => c.slug === slug);
  if (!currentCategory) {
    currentCategory =
      (await prisma.category.findUnique({
        where: { slug },
      })) || undefined;
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

  if (searchQuery) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: searchQuery } },
          { slug: { contains: searchQuery } },
          { description: { contains: searchQuery } },
          { specs: { contains: searchQuery } },
        ],
      },
    ];
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

  const megaMenuOverrides = extractMegaMenuOverrides(settings);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
      <StorefrontHeader
        categories={categories}
        hotline={settings.hotline}
        logoUrl={settings.logo_url || settings.logoUrl}
        shopName={settings.shop_name || settings.shopName}
        megaMenuOverrides={megaMenuOverrides}
      />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-8 md:py-10 space-y-8">
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
          <span className="text-[#111] font-medium">{currentCategory.name}</span>
        </nav>

        {/* In-page Category Sub-nav Card matching user screenshot layout */}
        <CategorySubNav
          categorySlug={currentCategory.slug}
          categoryName={currentCategory.name}
          overrides={megaMenuOverrides}
        />

        {/* Category Header & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E7E7E3]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#111] tracking-tight">
                {currentCategory.name}
              </h1>
              <span className="text-sm font-semibold bg-[#EBEBE8] text-[#111] px-2.5 py-0.5 rounded-full">
                {products.length} sản phẩm
              </span>
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-[#74746E]">Đang lọc theo:</span>
                <span className="inline-flex items-center gap-1.5 bg-[#111] text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  <span>&quot;{searchQuery}&quot;</span>
                  <Link
                    href={`/category/${currentCategory.slug}`}
                    className="hover:text-red-300 ml-1"
                    title="Xóa bộ lọc này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Link>
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#74746E]">Sắp xếp:</span>
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
              <div className="py-20 text-center rounded-2xl border border-dashed border-[#D5D5D0] bg-white p-8">
                <Package className="w-12 h-12 mx-auto mb-4 text-[#A3A39D]" />
                <h3 className="text-lg font-bold text-[#111]">
                  Chưa có sản phẩm nào phù hợp
                </h3>
                <p className="text-sm text-[#74746E] mt-2 max-w-sm mx-auto">
                  {searchQuery
                    ? `Không tìm thấy sản phẩm khớp với "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                    : "Thử điều chỉnh lại khoảng giá hoặc xem các danh mục thiết bị khác."}
                </p>
                <Link
                  href={`/category/${currentCategory.slug}`}
                  className="inline-flex items-center justify-center h-10 px-5 mt-6 text-sm font-medium text-white bg-[#111] rounded-xl hover:opacity-90 transition-opacity"
                >
                  Xóa bộ lọc & Xem tất cả
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
