import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogFilter } from "@/components/storefront/catalog-filter";
import { ChevronRight, Package, ArrowUpDown, Layers } from "lucide-react";

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

  // Tìm danh mục
  const currentCategory = await prisma.category.findUnique({
    where: { slug },
  });

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
          <Link href="/products" className="hover:text-cyan-400 transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-cyan-400 font-semibold">{currentCategory.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Ngành Hàng Gaming Gear
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                {currentCategory.description}
              </p>
            )}
          </div>
          <div className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 font-mono flex-shrink-0">
            Tổng cộng <span className="text-cyan-400 font-bold">{products.length}</span> sản phẩm
          </div>
        </div>

        {/* Sort & Grid */}
        <div className="flex items-center justify-end pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" /> Sắp xếp:
            </span>
            <form method="GET" className="inline-block">
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

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CatalogFilter
              categories={categories}
              currentCategorySlug={currentCategory.slug}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
            />
          </div>

          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
                <Package className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
                <h3 className="text-base font-semibold text-zinc-300">
                  Chưa có sản phẩm nào phù hợp trong danh mục này
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Thử điều chỉnh lại khoảng giá hoặc xem các danh mục thiết bị khác.
                </p>
                <Link
                  href={`/category/${currentCategory.slug}`}
                  className="inline-block mt-4 text-xs font-semibold text-cyan-400 hover:underline"
                >
                  Xóa bộ lọc giá
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
