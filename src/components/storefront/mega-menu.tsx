"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Headphones,
  Mouse,
  Keyboard,
  Square,
  Monitor,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  CategoryMegaMenuConfig,
  getMegaMenuConfig,
} from "@/lib/mega-menu-data";

export interface CategoryHeaderItem {
  id: string;
  name: string;
  slug: string;
}

interface MegaMenuProps {
  categories: CategoryHeaderItem[];
  onNavigate?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "chuot-gaming": <Mouse className="w-4 h-4 stroke-[1.75px]" />,
  "ban-phim-co": <Keyboard className="w-4 h-4 stroke-[1.75px]" />,
  "tai-nghe-audio": <Headphones className="w-4 h-4 stroke-[1.75px]" />,
  "lot-chuot-mousepad": <Square className="w-4 h-4 stroke-[1.75px]" />,
  "man-hinh-gia-do": <Monitor className="w-4 h-4 stroke-[1.75px]" />,
  "phu-kien-switch": <Sliders className="w-4 h-4 stroke-[1.75px]" />,
};

function getCategoryIcon(slug: string) {
  if (CATEGORY_ICONS[slug]) return CATEGORY_ICONS[slug];
  if (slug.includes("tai-nghe") || slug.includes("audio")) return <Headphones className="w-4 h-4 stroke-[1.75px]" />;
  if (slug.includes("chuot")) return <Mouse className="w-4 h-4 stroke-[1.75px]" />;
  if (slug.includes("ban-phim")) return <Keyboard className="w-4 h-4 stroke-[1.75px]" />;
  if (slug.includes("lot-chuot") || slug.includes("mousepad")) return <Square className="w-4 h-4 stroke-[1.75px]" />;
  if (slug.includes("man-hinh") || slug.includes("gia-do")) return <Monitor className="w-4 h-4 stroke-[1.75px]" />;
  return <Layers className="w-4 h-4 stroke-[1.75px]" />;
}

export function MegaMenu({ categories, onNavigate }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>(
    categories[0]?.slug || "tai-nghe-audio"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set default active to tai-nghe-audio if present for immediate preview matching user screenshot
  useEffect(() => {
    if (categories.length > 0) {
      const taiNghe = categories.find((c) => c.slug.includes("tai-nghe"));
      if (taiNghe) {
        setActiveSlug(taiNghe.slug);
      } else {
        setActiveSlug(categories[0].slug);
      }
    }
  }, [categories]);

  const handleMouseEnterTrigger = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeaveTrigger = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const activeConfig: CategoryMegaMenuConfig | undefined = getMegaMenuConfig(activeSlug, activeCategory?.name);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnterTrigger}
      onMouseLeave={handleMouseLeaveTrigger}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-sm font-semibold transition-all duration-150 focus:outline-none ${
          isOpen
            ? "bg-[#F3F3F1] text-[#111]"
            : "text-[#111] hover:text-[#74746E] hover:bg-[#F7F7F5]"
        }`}
      >
        <Layers className="w-4 h-4 stroke-[1.75px] text-[#111]" />
        <span>Danh mục</span>
        <ChevronDown
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Flyout Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 lg:-left-12 xl:left-0 pt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex bg-white rounded-2xl border border-[#E7E7E3] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden min-w-[920px] max-w-[1040px]">
            {/* Left Column: Category navigation list */}
            <div className="w-[230px] bg-[#FAFAFA] border-r border-[#EBEBEB] p-2.5 space-y-1 shrink-0">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8E8E87]">
                Tất cả danh mục
              </div>
              {categories.map((cat) => {
                const isActive = activeSlug === cat.slug;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveSlug(cat.slug)}
                    className="relative"
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        isActive
                          ? "bg-white text-[#111] font-semibold shadow-sm border border-[#E5E5E1]"
                          : "text-[#4B5563] hover:text-[#111] hover:bg-white/70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={isActive ? "text-[#111]" : "text-[#74746E]"}>
                          {getCategoryIcon(cat.slug)}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive
                            ? "text-[#111] translate-x-0.5"
                            : "text-[#C4C4BD]"
                        }`}
                      />
                    </Link>
                  </div>
                );
              })}

              {/* View all products link */}
              <div className="pt-2 border-t border-[#EBEBEB] mt-2">
                <Link
                  href="/products"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#74746E] hover:text-[#111] hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                    <span>Xem tất cả sản phẩm</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Area: Mega Sub-menu Panels (Styled identically to user screenshot) */}
            <div className="flex-1 p-7 bg-white min-h-[380px] flex flex-col justify-between">
              {activeConfig ? (
                <div className="space-y-6">
                  {/* Top Bar: Title & "Xem tất cả >" link */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#F0F0EE]">
                    <h3 className="text-xl font-bold text-[#111] tracking-tight">
                      {activeConfig.title}
                    </h3>
                    <Link
                      href={activeConfig.allHref}
                      onClick={handleLinkClick}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#E11D48] hover:text-red-700 transition-colors group"
                    >
                      <span>Xem tất cả</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* 4-Column Grid layout matching user screenshot */}
                  <div className="grid grid-cols-4 gap-6">
                    {activeConfig.columns.map((col, colIdx) => (
                      <div key={colIdx} className="space-y-6">
                        {col.groups.map((group, grpIdx) => (
                          <div key={grpIdx} className="space-y-2">
                            {/* Group Title with chevron */}
                            <Link
                              href={group.href || activeConfig.allHref}
                              onClick={handleLinkClick}
                              className="inline-flex items-center gap-1 font-bold text-[13.5px] text-[#111] hover:text-[#E11D48] transition-colors group"
                            >
                              <span>{group.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#E11D48] group-hover:translate-x-0.5 transition-all" />
                            </Link>

                            {/* Sub-item links */}
                            <ul className="space-y-1">
                              {group.items.map((item, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className="block text-[13px] text-[#4B5563] hover:text-[#E11D48] transition-colors py-0.5"
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Layers className="w-10 h-10 text-[#C4C4BD] mb-3" />
                  <p className="text-sm font-medium text-[#111]">
                    Chọn một danh mục để xem chi tiết
                  </p>
                  <Link
                    href={`/category/${activeSlug}`}
                    onClick={handleLinkClick}
                    className="mt-3 text-xs font-semibold text-[#E11D48] hover:underline"
                  >
                    Xem sản phẩm trong danh mục này &rarr;
                  </Link>
                </div>
              )}

              {/* Bottom Quick Help / Zalo Consultation Notice */}
              <div className="pt-4 mt-6 border-t border-[#F0F0EE] flex items-center justify-between text-xs text-[#74746E]">
                <span>
                  🔥 Cần tìm gear theo yêu cầu riêng? Liên hệ ngay để nhận tư vấn trực tiếp.
                </span>
                <span className="font-medium text-[#111]">
                  Giao nhanh toàn quốc • Bảo hành chính hãng
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
