"use client";

import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";

export interface CategoryRibbonItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  _count?: {
    products: number;
  };
}

interface CategoryRibbonProps {
  categories: CategoryRibbonItem[];
}

export function CategoryRibbon({ categories }: CategoryRibbonProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#111] tracking-tight">
          Danh Mục
        </h3>
        <Link
          href="/products"
          className="text-sm text-[#74746E] hover:text-[#111] transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center text-center p-4 rounded-lg hover:bg-[#F3F3F1] transition-colors bg-[#FAFAFA]"
          >
            {/* Category Icon / Image */}
            <div className="w-12 h-12 flex items-center justify-center mb-3">
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <Layers className="w-6 h-6 text-[#111] stroke-[1.5px]" />
              )}
            </div>

            {/* Name */}
            <span className="font-medium text-sm text-[#111] mb-1">
              {cat.name}
            </span>

            {/* Product count if available */}
            {cat._count?.products !== undefined && (
              <span className="text-xs text-[#74746E]">
                {cat._count.products} sản phẩm
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
