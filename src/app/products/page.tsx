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
import { ChevronRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search?.trim();
  const categorySlug = params.category?.trim();
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const inStockOnly = params.inStock === "true";
  const sort = params.sort || "newest";

  // Xây dựng điều kiện lọc Prisma
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (inStockOnly) {
    where.inStock = true;
  }

  // Sắp xếp
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "featured") {
    orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }

  // Nạp dữ liệu song song (categories và settings lấy từ cache tốc độ cao)
  const [products, categories, settings] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    getStorefrontCategories(),
    getStorefrontSettings(),
  ]);

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
          <span className="text-[#111]">Sản phẩm</span>
          {categorySlug && (
            <>
              <span>/</span>
              <span className="text-[#111]">
                {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
              </span>
            </>
          )}
          {search && (
            <>
              <span>/</span>
              <span className="text-[#111]">Tìm kiếm: &quot;{search}&quot;</span>
            </>
          )}
        </nav>

        {/* Top Header & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-3xl font-semibold text-[#111] tracking-tight">
              {search
                ? `Kết quả tìm kiếm cho "${search}"`
                : categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name || "Danh mục sản phẩm"
                : "Tất Cả Sản Phẩm"}
            </h1>
            <p className="text-sm text-[#74746E] mt-2">
              Tìm thấy {products.length} sản phẩm phù hợp
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#74746E]">Sắp xếp theo</span>
            <CatalogSortSelect currentSort={sort} />
          </div>
        </div>

        {/* 2-Column Catalog Grid */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Filter Sidebar */}
          <div className="w-full lg:w-[240px] shrink-0">
            <CatalogFilter
              categories={categories}
              currentCategorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
            />
          </div>

          {/* Right Column: Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="py-20 text-center rounded-lg border border-dashed border-[#D5D5D0] bg-white">
                <Package className="w-12 h-12 mx-auto mb-4 text-[#A3A39D]" />
                <h3 className="text-lg font-medium text-[#111]">
                  Không tìm thấy sản phẩm nào phù hợp
                </h3>
                <p className="text-sm text-[#74746E] mt-2 max-w-sm mx-auto">
                  Thử điều chỉnh lại khoảng giá hoặc tìm kiếm với từ khóa khác để có kết quả tốt hơn.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-10 px-4 mt-6 text-sm font-medium text-[#111] bg-white border border-[#D5D5D0] rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  Xóa tất cả bộ lọc
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
