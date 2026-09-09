import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { CartContent } from "@/components/cart/cart-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giỏ hàng & Đặt hàng | CaoTri Gaming Gear",
  description: "Xác nhận giỏ hàng và đặt mua thiết bị gaming gear, phụ kiện công nghệ chính hãng nhanh chóng.",
};

export default async function CartPage() {
  const [categories, settingsList] = await Promise.all([
    prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.siteSetting.findMany(),
  ]);

  const settings: Record<string, string> = {};
  settingsList.forEach((s) => {
    settings[s.key] = s.value;
  });

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
      <StorefrontHeader categories={categories} hotline={settings.hotline} />

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <CartContent />
      </main>

      <StorefrontFooter settings={settings} />
    </div>
  );
}
