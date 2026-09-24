import { cache } from "react";
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
  getStorefrontCategories,
  getStorefrontSettings,
} from "@/lib/storefront-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

// Deduplicate product lookup between generateMetadata and ProductDetailPage
const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
    },
  });
});

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

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

  // 1. Nạp chi tiết sản phẩm (sử dụng cache deduplication với generateMetadata)
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // 2. Nạp dữ liệu bổ trợ song song (Categories, Related Products, Settings)
  const [categories, relatedProducts, settings] = await Promise.all([
    getStorefrontCategories(),
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
    getStorefrontSettings(),
  ]);

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
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col">
      <StorefrontHeader categories={categories} hotline={settings.hotline} />

      <main className="flex-1 max-w-[1360px] mx-auto w-full px-4 sm:px-8 py-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Đường dẫn trang" className="flex items-center gap-2 text-sm text-[#74746E] overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#111] transition-colors">
            Trang chủ
          </Link>
          <span className="text-[#A3A39D]">/</span>
          <Link href="/products" className="hover:text-[#111] transition-colors">
            Sản phẩm
          </Link>
          <span className="text-[#A3A39D]">/</span>
          <Link
            href={`/category/${product.category.slug}`}
            className="hover:text-[#111] transition-colors"
          >
            {product.category.name}
          </Link>
          <span className="text-[#A3A39D]">/</span>
          <span className="text-[#111] font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>

        {/* 2-Column Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start bg-white p-6 sm:p-10 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          {/* Cột trái: Bộ sưu tập ảnh */}
          <div className="lg:sticky lg:top-24">
            <ProductGalleryViewer images={imageList} title={product.name} />
          </div>

          {/* Cột phải: Thông tin & Mua hàng */}
          <div className="space-y-8">
            {/* Category */}
            <div>
              <Link
                href={`/category/${product.category.slug}`}
                className="text-xs text-[#74746E] hover:text-[#111] transition-colors uppercase tracking-wider font-medium"
              >
                {product.category.name}
              </Link>
            </div>

            {/* Tên sản phẩm */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#111] tracking-tight">
              {product.name}
            </h1>

            {/* Khối Giá & Tiết Kiệm */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-[#111]">
                {formatVND(product.price)}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-[#A3A39D] line-through">
                    {formatVND(product.originalPrice)}
                  </span>
                  {discountPercent && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-[#F3F3F1] text-[#555550]">
                      Tiết kiệm {discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Tóm tắt sản phẩm ngắn */}
            <p className="text-sm text-[#74746E] line-clamp-3 leading-relaxed">
              {product.description}
            </p>

            {/* Khung Tương tác Mua hàng & Thêm giỏ hàng */}
            <div className="pt-2 border-t border-[#E7E7E3]">
              <ProductActions
                productId={product.id}
                productName={product.name}
                slug={product.slug}
                price={product.price}
                originalPrice={product.originalPrice}
                image={imageList[0] || ""}
                inStock={product.inStock}
                zaloUrl={settings.zalo || settings.zaloUrl}
              />
            </div>
          </div>
        </div>

        {/* Tabs: Mô tả chi tiết & Thông số kỹ thuật */}
        <div className="bg-white p-6 sm:p-10 rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <ProductTabs
            description={product.description || ""}
            specsJson={product.specs}
          />
        </div>

        {/* Sản phẩm tương tự (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="space-y-6 pt-4">
            <h2 className="text-xl font-semibold text-[#111]">
              Sản phẩm liên quan
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
