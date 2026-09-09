"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, RotateCcw, Check, Layers, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-8 lg:w-[240px]">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E7E7E3]">
        <div className="flex items-center gap-2 text-[#111] font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ Lọc</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-[#74746E] hover:text-[#111] transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E]">
          Danh mục thiết bị
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCategorySelect(null)}
            className={`w-full text-left py-1.5 text-sm flex items-center justify-between transition-colors ${
              !activeCategory
                ? "font-semibold text-[#111]"
                : "text-[#111] hover:text-[#74746E]"
            }`}
          >
            <span>Tất cả ngành hàng</span>
            {!activeCategory && <Check className="w-4 h-4" />}
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full text-left py-1.5 text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? "font-semibold text-[#111]"
                    : "text-[#111] hover:text-[#74746E]"
                }`}
              >
                <span>{cat.name}</span>
                {cat._count?.products !== undefined && (
                  <span className="text-xs text-[#A3A39D]">
                    {cat._count.products}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Price Range Slider */}
      <div className="pt-6 border-t border-[#E7E7E3]">
        <PriceRangeSlider
          min={0}
          max={10000000}
          currentMin={minPrice}
          currentMax={maxPrice}
          onApply={handlePriceApply}
        />
      </div>

      {/* 3. In Stock Only Checkbox */}
      <div className="pt-6 border-t border-[#E7E7E3]">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => handleToggleStock(e.target.checked)}
            className="w-4 h-4 rounded border-[#D5D5D0] text-[#111] accent-[#111] focus:ring-[#111]"
          />
          <span className="text-sm text-[#111]">
            Chỉ hiện sản phẩm còn hàng
          </span>
        </label>
      </div>
    </div>
  );
}
