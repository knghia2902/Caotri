"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface CatalogSortSelectProps {
  currentSort: string;
}

export function CatalogSortSelect({ currentSort }: CatalogSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSortChange(e.target.value)}
      className="h-10 rounded-lg bg-white border border-[#D5D5D0] px-3 pr-8 text-sm text-[#111] focus:outline-none focus:border-[#111]"
    >
      <option value="newest">Mới nhất</option>
      <option value="featured">Sản phẩm nổi bật</option>
      <option value="price_asc">Giá tăng dần</option>
      <option value="price_desc">Giá giảm dần</option>
    </select>
  );
}
