import type { Metadata } from "next";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { CartContent } from "@/components/cart/cart-content";
import {
  getStorefrontCategories,
  getStorefrontSettings,
  extractMegaMenuOverrides,
} from "@/lib/storefront-data";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Giỏ hàng & Đặt hàng | TringuyenGear",
  description: "Xác nhận giỏ hàng và đặt mua thiết bị gaming gear, phụ kiện công nghệ chính hãng nhanh chóng.",
};

export default async function CartPage() {
  let categories: any[] = [];
  let settings: Record<string, string> = {};

  try {
    const [fetchedCategories, fetchedSettings] = await Promise.all([
      getStorefrontCategories(),
      getStorefrontSettings(),
    ]);
    categories = fetchedCategories || [];
    settings = fetchedSettings || {};
  } catch (error) {
    console.error("CartPage data load error:", error);
  }

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

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <CartContent />
      </main>

      <StorefrontFooter settings={settings} />
    </div>
  );
}
