"use client";

import Link from "next/link";
import { ShoppingBag, Eye, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

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
  const mainImage =
    imageList[0] ||
    "https://placehold.co/400x400/18181b/a1a1aa?text=No+Image";

  // Calculate discount percentage
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden flex flex-col shadow-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.12)]">
      {/* Top Media Area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full bg-zinc-950 overflow-hidden flex items-center justify-center p-4 block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x400/18181b/a1a1aa?text=CaoTri+Gear";
          }}
        />

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent !== null && discountPercent > 0 && (
            <Badge className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 border-none shadow-md">
              -{discountPercent}%
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-cyan-500 text-zinc-950 font-bold text-[10px] px-2 py-0.5 border-none shadow-md flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Mới
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-amber-500/90 text-zinc-950 font-bold text-[10px] px-2 py-0.5 border-none shadow-md flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" /> Hot
            </Badge>
          )}
        </div>

        {/* Stock Status Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-xs font-semibold">
              Tạm hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category */}
          <Link
            href={`/category/${product.category.slug}`}
            className="text-[11px] font-medium text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-wider block"
          >
            {product.category.name}
          </Link>

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="font-semibold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-2 mt-1"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between gap-2">
          <div>
            <div className="font-extrabold text-base text-cyan-400 font-mono">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-zinc-500 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-zinc-800 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400 text-zinc-300"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </Button>
            <Link href={`/products/${product.slug}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
