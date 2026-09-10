"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { searchProductsAction, type SearchProductResult } from "@/app/actions/search";

export function InstantSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProductResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchProductsAction(trimmed);
        setResults(data);
        setIsOpen(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        setIsOpen(false);
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-[#A3A39D] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm..."
          className="w-full bg-white border border-[#D5D5D0] h-10 rounded-xl px-3.5 pl-10 pr-9 text-sm text-[#111] placeholder:text-[#A3A39D] focus:border-[#111] focus:outline-none transition-all"
        />
        {isPending ? (
          <Loader2 className="w-4 h-4 absolute right-3 text-[#A3A39D] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded text-[#A3A39D] hover:text-[#111]"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Popover Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-2 divide-y divide-[#E7E7E3]">
            {results.length === 0 && !isPending ? (
              <div className="py-6 text-center text-[#74746E]">
                <Package className="w-8 h-8 mx-auto mb-2 text-[#A3A39D]" />
                <p className="text-sm font-medium">Không tìm thấy sản phẩm nào</p>
                <p className="text-xs text-[#A3A39D] mt-0.5">
                  Thử tìm với tên thiết bị hoặc danh mục khác
                </p>
              </div>
            ) : (
              results.map((product) => {
                let firstImg = "";
                try {
                  const arr = JSON.parse(product.images || "[]");
                  firstImg = arr[0] || "";
                } catch {
                  firstImg = "";
                }

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[#FAFAFA] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-md bg-[#F3F3F1] border border-[#E7E7E3] overflow-hidden flex items-center justify-center flex-shrink-0 transition-colors">
                      {firstImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstImg}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Package className="w-4 h-4 text-[#A3A39D]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111] transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-[#74746E] uppercase font-medium mt-0.5">
                        {product.category.name}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-[#111]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="block text-xs text-[#A3A39D] line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* View All Results Footer */}
          <div className="bg-[#FAFAFA] p-2.5 border-t border-[#E7E7E3] text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(
                  `/products?search=${encodeURIComponent(query.trim())}`
                );
              }}
              className="w-full py-2 px-3 rounded-md text-sm font-medium text-[#74746E] hover:text-[#111] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Xem tất cả kết quả</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

