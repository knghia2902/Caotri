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
        <Search className="w-4 h-4 absolute left-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm chuột, phím cơ, tai nghe, màn hình..."
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
        {isPending ? (
          <Loader2 className="w-4 h-4 absolute right-3 text-cyan-400 animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-0.5 rounded text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Popover Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-zinc-900/95 border border-zinc-800 shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="p-2 divide-y divide-zinc-800/60">
            {results.length === 0 && !isPending ? (
              <div className="py-6 text-center text-zinc-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-xs font-medium">Không tìm thấy sản phẩm nào</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
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
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-cyan-500/40 transition-colors">
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
                        <Package className="w-4 h-4 text-zinc-600" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-cyan-400 transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase font-medium mt-0.5">
                        {product.category.name}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0 font-mono">
                      <span className="text-xs font-bold text-cyan-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="block text-[10px] text-zinc-500 line-through">
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
          <div className="bg-zinc-950/80 p-2.5 border-t border-zinc-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(
                  `/products?search=${encodeURIComponent(query.trim())}`
                );
              }}
              className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Xem tất cả kết quả cho &quot;{query}&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
