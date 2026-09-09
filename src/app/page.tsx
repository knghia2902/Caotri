import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { HeroBannerSlider } from "@/components/storefront/hero-banner-slider";
import { CategoryRibbon } from "@/components/storefront/category-ribbon";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Star, Sparkles, ArrowRight, ShieldCheck, Zap, Headphones, Keyboard, Mouse } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Nạp đồng thời dữ liệu từ CSDL Prisma
  const [banners, categories, featuredProducts, newProducts, settingsRecords] =
    await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.category.findMany({
        orderBy: { orderIndex: "asc" },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { isFeatured: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { isNew: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
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
      {/* Header */}
      <StorefrontHeader
        categories={categories}
        hotline={settings.hotline}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-12">
        {/* 1. Hero Banner Slider */}
        {banners.length > 0 && (
          <section>
            <HeroBannerSlider banners={banners} />
          </section>
        )}

        {/* 2. Category Ribbon */}
        <CategoryRibbon categories={categories} />

        {/* 3. Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Sản Phẩm Nổi Bật
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Những dòng gear được cộng đồng game thủ săn đón nhiều nhất
                </p>
              </div>
              <Link
                href="/products?featured=true"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Xem thêm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Promotional Banner Strip */}
        <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-900 via-cyan-950/30 to-zinc-900 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-cyan-950/20">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Chốt Đơn Liền Tay • Tư Vấn 1-1
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Cần Tư Vấn Cấu Hình Gaming Setup Chuẩn Pro?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl">
              Đội ngũ kỹ thuật viên của CaoTrí Gear sẵn sàng hỗ trợ bạn chọn chuột, bàn phím cơ phù hợp với form tay và sở thích cá nhân qua Zalo ngay!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={settings.zalo || "https://zalo.me/0987654321"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="neon" size="lg" className="gap-2">
                Chat Zalo Tư Vấn Ngay
              </Button>
            </a>
          </div>
        </section>

        {/* 5. New Arrivals Section */}
        {newProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Hàng Mới Về
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Cập nhật liên tục các siêu phẩm gear công nghệ vừa cập bến
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <StorefrontFooter settings={settings} />
    </div>
  );
}
