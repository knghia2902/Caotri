import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";

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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Danh Mục Thiết Bị
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Phân loại gear chuyên nghiệp cho góc setup gaming
          </p>
        </div>
        <Link
          href="/products"
          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="group relative rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-4 flex flex-col items-center text-center hover:border-cyan-500/50 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            {/* Category Icon / Image */}
            <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center mb-3 group-hover:border-cyan-500/40 group-hover:scale-110 transition-all duration-300">
              {cat.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Layers className="w-6 h-6 text-cyan-400" />
              )}
            </div>

            {/* Name */}
            <span className="font-semibold text-xs text-zinc-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
              {cat.name}
            </span>

            {/* Product count if available */}
            {cat._count?.products !== undefined && (
              <span className="text-[10px] text-zinc-500 font-mono mt-1">
                {cat._count.products} sản phẩm
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
