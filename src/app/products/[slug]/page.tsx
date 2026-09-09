import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductGalleryViewer } from "@/components/storefront/product-gallery-viewer";
import { ProductActions } from "@/components/storefront/product-actions";
import { ProductTabs } from "@/components/storefront/product-tabs";
import { ProductCard } from "@/components/storefront/product-card";
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | CaoTri Gear",
    };
  }

  return {
    title: `${product.name} | CaoTri Gaming Gear`,
    description: product.description ? product.description.slice(0, 160) : "Sản phẩm gaming gear chính hãng",
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // 1. Nạp chi tiết sản phẩm
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Nạp dữ liệu bổ trợ song song (Categories, Related Products, Settings)
  const [categories, relatedProducts, settingsList] = await Promise.all([
    prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
    }),
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: {
        category: true,
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settings: Record<string, string> = {};
  settingsList.forEach((s) => {
    settings[s.key] = s.value;
  });

  // Parse mảng ảnh an toàn
  let imageList: string[] = [];
  try {
    const parsed = JSON.parse(product.images);
    if (Array.isArray(parsed)) {
      imageList = parsed.filter((url) => typeof url === "string" && url.trim().length > 0);
    }
  } catch {
    imageList = [];
  }

  // Tính phần trăm tiết kiệm nếu có originalPrice
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-300">
      <StorefrontHeader categories={categories} hotline={settings.hotline} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:py-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Đường dẫn trang" className="flex items-center gap-2 text-xs text-zinc-400 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
          <Link href="/products" className="hover:text-cyan-400 transition-colors">
            Sản phẩm
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-cyan-400 transition-colors"
          >
            {product.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
          <span className="text-zinc-200 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Cột trái: Bộ sưu tập ảnh (5/12) */}
          <div className="lg:col-span-6 xl:col-span-5 lg:sticky lg:top-24">
            <ProductGalleryViewer images={imageList} title={product.name} />
          </div>

          {/* Cột phải: Thông tin & Mua hàng (7/12) */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/category/${product.category.slug}`}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 border border-zinc-800 text-cyan-400 hover:border-cyan-500/50 transition-colors"
              >
                {product.category.name}
              </Link>

              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5" />
                  Nổi bật
                </span>
              )}

              {product.isNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Hàng mới
                </span>
              )}

              <div className="ml-auto flex items-center gap-1.5 text-xs text-zinc-400">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-semibold text-zinc-200">5.0</span>
                <span className="text-zinc-600">|</span>
                <span>Gaming Tested</span>
              </div>
            </div>

            {/* Tên sản phẩm */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Khối Giá & Tiết Kiệm */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-wrap items-baseline gap-3.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                {formatVND(product.price)}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base sm:text-lg text-zinc-500 line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                  {discountPercent && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      Tiết kiệm {discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Tóm tắt sản phẩm ngắn */}
            <p className="text-xs sm:text-sm text-zinc-400 line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Khung Tương tác Mua hàng & Thêm giỏ hàng */}
            <ProductActions
              productId={product.id}
              productName={product.name}
              price={product.price}
              inStock={product.inStock}
              zaloUrl={settings.zalo}
            />

            {/* Hộp Cam Kết Dịch Vụ Khách Hàng (Assurance Box) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Chính hãng 100%</h4>
                  <p className="text-[11px] text-zinc-500">Bảo hành 1 đổi 1</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                <Truck className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Giao nhanh 24h</h4>
                  <p className="text-[11px] text-zinc-500">Toàn quốc an toàn</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                <RotateCcw className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Đổi trả 7 ngày</h4>
                  <p className="text-[11px] text-zinc-500">Nếu lỗi kỹ thuật</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Mô tả chi tiết & Thông số kỹ thuật Zebra-Striped */}
        <div className="pt-6">
          <ProductTabs
            description={product.description || ""}
            specsJson={product.specs}
          />
        </div>

        {/* Sản phẩm tương tự (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="pt-10 border-t border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-100 flex items-center gap-2.5">
                  <span className="w-2 h-5 rounded-full bg-cyan-400" />
                  Sản Phẩm Tương Tự Cùng Danh Mục
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Khám phá thêm các tùy chọn {product.category.name.toLowerCase()} khác dành cho bạn
                </p>
              </div>
              <Link
                href={`/category/${product.category.slug}`}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Xem tất cả
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StorefrontFooter settings={settings} />
    </div>
  );
}
