import Link from "next/link";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { HeroBannerSlider } from "@/components/storefront/hero-banner-slider";
import { CategoryRibbon } from "@/components/storefront/category-ribbon";
import { ProductCard } from "@/components/storefront/product-card";
import {
  getStorefrontBanners,
  getStorefrontCategories,
  getFeaturedProducts,
  getNewProducts,
  getStorefrontSettings,
} from "@/lib/storefront-data";

export const revalidate = 60;

export default async function HomePage() {
  // Nạp đồng thời dữ liệu từ cache tốc độ cao
  const [banners, categories, featuredProducts, newProducts, settings] =
    await Promise.all([
      getStorefrontBanners(),
      getStorefrontCategories(),
      getFeaturedProducts(8),
      getNewProducts(8),
      getStorefrontSettings(),
    ]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col">
      {/* Header */}
      <StorefrontHeader
        categories={categories}
        hotline={settings.hotline}
        logoUrl={settings.logo_url || settings.logoUrl}
        shopName={settings.shop_name || settings.shopName}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 pt-5 pb-16 space-y-12 md:space-y-16">
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
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-[#111] tracking-tight">
                Sản Phẩm Nổi Bật
              </h3>
              <Link
                href="/products?featured=true"
                className="text-sm text-[#74746E] hover:text-[#111] transition-colors"
              >
                Xem thêm
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}


        {/* 5. New Arrivals Section */}
        {newProducts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-[#111] tracking-tight">
                Hàng Mới Về
              </h3>
              <Link
                href="/products"
                className="text-sm text-[#74746E] hover:text-[#111] transition-colors"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
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
