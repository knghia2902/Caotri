"use client";

import Link from "next/link";
import { formatPrice, normalizeImageUrl } from "@/lib/utils";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  images: string; // JSON
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  // Parse images
  const imageList: string[] = (() => {
    try {
      return JSON.parse(product.images || "[]");
    } catch {
      return [];
    }
  })();
  const rawImage = imageList[0];
  const mainImage = rawImage
    ? normalizeImageUrl(rawImage)
    : "https://placehold.co/400x400/F3F3F1/A3A39D?text=No+Image";

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
      {/* Top Media Area */}
      <div className="relative aspect-square w-full bg-[#F3F3F1] rounded-md overflow-hidden flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400/F3F3F1/A3A39D?text=CaoTri+Gear";
          }}
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-[#F3F3F1] text-[#555550] text-[10px] font-medium px-2 py-0.5 rounded-sm">
              Mới
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        {!product.inStock && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[#D94A4A] text-xs font-medium">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="flex flex-col gap-1">
        {/* Title */}
        <h3 className="font-medium text-sm text-[#111] line-clamp-2" title={product.name}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#111]">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-[#A3A39D] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
