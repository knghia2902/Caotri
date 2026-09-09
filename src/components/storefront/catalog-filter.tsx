"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, RotateCcw, Check, Layers, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriceRangeSlider } from "@/components/storefront/price-range-slider";

export interface FilterCategoryItem {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

interface CatalogFilterProps {
  categories: FilterCategoryItem[];
  currentCategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export function CatalogFilter({
  categories,
  currentCategorySlug,
  minPrice = 0,
  maxPrice = 10000000,
  inStockOnly = false,
}: CatalogFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategorySelect = (slug: string | null) => {
    if (pathname.startsWith("/category/")) {
      // If we are on /category/[slug], selecting "All" navigates to /products
      if (!slug) {
        router.push("/products");
      } else {
        router.push(`/category/${slug}`);
      }
    } else {
      updateFilters({ category: slug });
    }
  };

  const handlePriceApply = (min: number, max: number) => {
    updateFilters({
      minPrice: min > 0 ? min.toString() : null,
      maxPrice: max < 10000000 ? max.toString() : null,
    });
  };

  const handleToggleStock = (checked: boolean) => {
    updateFilters({ inStock: checked ? "true" : null });
  };

  const handleReset = () => {
    if (pathname.startsWith("/category/")) {
      router.push(pathname);
    } else {
      router.push("/products");
    }
  };

  const activeCategory =
    currentCategorySlug || searchParams.get("category") || "";

  return (
    <div className="space-y-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-5">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Bộ Lọc Sản Phẩm</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Danh mục thiết bị
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
              !activeCategory
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
          >
            <span>Tất cả ngành hàng</span>
            {!activeCategory && <Check className="w-3.5 h-3.5" />}
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Slider */}
      <div className="pt-4 border-t border-zinc-800">
        <PriceRangeSlider
          min={0}
          max={10000000}
          currentMin={minPrice}
          currentMax={maxPrice}
          onApply={handlePriceApply}
        />
      </div>

      {/* 3. In Stock Only Checkbox */}
      <div className="pt-4 border-t border-zinc-800">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => handleToggleStock(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-cyan-500 focus:ring-cyan-500/30"
          />
          <span className="text-xs font-medium text-zinc-300">
            Chỉ hiện sản phẩm còn hàng
          </span>
        </label>
      </div>
    </div>
  );
}
