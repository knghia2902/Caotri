"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getMegaMenuConfig } from "@/lib/mega-menu-data";

interface CategorySubNavProps {
  categorySlug: string;
  categoryName: string;
}

export function CategorySubNav({ categorySlug, categoryName }: CategorySubNavProps) {
  const config = getMegaMenuConfig(categorySlug);
  if (!config) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F0EE]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#111] tracking-tight">
            {config.title || categoryName}
          </h2>
          <span className="text-xs font-medium text-[#74746E] bg-[#F3F3F1] px-2.5 py-0.5 rounded-full">
            Khám phá theo tiêu chí
          </span>
        </div>
        <Link
          href={config.allHref}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#E11D48] hover:text-red-700 transition-colors group"
        >
          <span>Xem tất cả</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {config.columns.map((col, colIdx) => (
          <div key={colIdx} className="space-y-5">
            {col.groups.map((group, grpIdx) => (
              <div key={grpIdx} className="space-y-2">
                <Link
                  href={group.href || config.allHref}
                  className="inline-flex items-center gap-1 font-bold text-[13px] text-[#111] hover:text-[#E11D48] transition-colors group"
                >
                  <span>{group.title}</span>
                  <ChevronRight className="w-3 h-3 text-[#9CA3AF] group-hover:text-[#E11D48] group-hover:translate-x-0.5 transition-all" />
                </Link>

                <div className="flex flex-wrap gap-1.5 md:flex-col md:gap-1">
                  {group.items.map((item, itemIdx) => (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className="text-xs text-[#4B5563] hover:text-[#E11D48] bg-[#F9F9F8] md:bg-transparent px-2 py-1 md:p-0 rounded-md transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
