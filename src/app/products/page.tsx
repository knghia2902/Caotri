import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogFilter } from "@/components/storefront/catalog-filter";
import { ChevronRight, Package, ArrowUpDown } from "lucide-react";

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

  // Nạp dữ liệu
  const [products, categories, settingsRecords] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settings: Record<string, string> = {};
  for (const s of settingsRecords) {
    settings[s.key] = s.value;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500 selection:text-zinc-950">
      <StorefrontHeader categories={categories} hotline={settings.hotline} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-semibold">Tất cả sản phẩm</span>
          {categorySlug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-cyan-400">
                {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
              </span>
            </>
          )}
          {search && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              <span className="text-cyan-400">Tìm kiếm: &quot;{search}&quot;</span>
            </>
          )}
        </nav>

        {/* Top Header & Sort Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {search
                ? `Kết quả tìm kiếm cho "${search}"`
                : categorySlug
                ? categories.find((c) => c.slug === categorySlug)?.name || "Danh mục sản phẩm"
                : "Tất Cả Sản Phẩm Gaming Gear"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Tìm thấy <span className="text-cyan-400 font-semibold">{products.length}</span> sản phẩm phù hợp
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" /> Sắp xếp:
            </span>
            <form method="GET" className="inline-block">
              {search && <input type="hidden" name="search" value={search} />}
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
              {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
              {inStockOnly && <input type="hidden" name="inStock" value="true" />}
              <select
                name="sort"
                defaultValue={sort}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(e: any) => e.target.form.submit()}
                className="h-9 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="newest">Mới nhất</option>
                <option value="featured">Sản phẩm nổi bật</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </form>
          </div>
        </div>

        {/* 2-Column Catalog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1">
            <CatalogFilter
              categories={categories}
              currentCategorySlug={categorySlug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
            />
          </div>

          {/* Right Column: Products Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
                <Package className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                <h3 className="text-base font-semibold text-zinc-300">
                  Không tìm thấy sản phẩm nào phù hợp
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Thử điều chỉnh lại khoảng giá hoặc tìm kiếm với từ khóa khác để có kết quả tốt hơn.
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-4 text-xs font-semibold text-cyan-400 hover:underline"
                >
                  Xóa tất cả bộ lọc
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
