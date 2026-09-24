"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Phone,
  Menu,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstantSearch } from "@/components/storefront/instant-search";
import { useCartHydrated } from "@/stores/cart-store";
import { MegaMenu, CategoryHeaderItem } from "@/components/storefront/mega-menu";
import { getMegaMenuConfig } from "@/lib/mega-menu-data";

export type { CategoryHeaderItem };

interface StorefrontHeaderProps {
  categories?: CategoryHeaderItem[];
  hotline?: string;
  logoUrl?: string;
  shopName?: string;
  searchSlot?: React.ReactNode;
}

export function StorefrontHeader({
  categories = [],
  hotline = "0987.654.321",
  logoUrl = "/logo.png",
  shopName = "TringuyenGear",
  searchSlot,
}: StorefrontHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const { totalItems } = useCartHydrated();

  const toggleMobileCategory = (slug: string) => {
    setExpandedMobileCategory(expandedMobileCategory === slug ? null : slug);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E7E3] bg-[#FFFFFF]">
      {/* Main navigation bar */}
      <div className="max-w-[1360px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl || "/logo.png"}
                alt={shopName || "TringuyenGear"}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-[#111]">
                {shopName || "TringuyenGear"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links with Mega Menu */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#111]">
            <Link
              href="/"
              className="hover:text-[#74746E] transition-colors py-1"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              prefetch={false}
              className="hover:text-[#74746E] transition-colors py-1"
            >
              Tất cả sản phẩm
            </Link>

            {/* Mega Menu Dropdown */}
            <MegaMenu categories={categories} />
          </nav>
        </div>

        {/* Center Section: Search Slot */}
        <div className="flex-1 max-w-lg mx-2 lg:mx-6 hidden md:block">
          {searchSlot || <InstantSearch />}
        </div>

        {/* Right Section: Actions: Hotline & Cart */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Hotline Quick Call */}
          <a
            href={`tel:${hotline.replace(/[^0-9]/g, "")}`}
            className="hidden sm:inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[#D5D5D0] bg-white hover:border-[#111] transition-colors text-sm text-[#74746E]"
          >
            <Phone className="w-3.5 h-3.5 text-[#111] stroke-[1.5px]" />
            <span className="font-semibold text-[#111]">{hotline}</span>
          </a>

          {/* Cart Icon */}
          <Link href="/cart" prefetch={false} className="relative inline-flex items-center justify-center">
            <Button
              variant="outline"
              className="h-10 w-10 p-0 rounded-xl border-[#D5D5D0] hover:border-[#111] bg-white text-[#111]"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.5px]" />
            </Button>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#111] text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-[#D5D5D0] text-[#111] hover:bg-[#FAFAFA] focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5px]" /> : <Menu className="w-5 h-5 stroke-[1.5px]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E7E7E3] bg-[#FFFFFF] px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="md:hidden">
            {searchSlot || <InstantSearch />}
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111] hover:bg-[#FAFAFA]"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111] hover:bg-[#FAFAFA]"
            >
              Tất cả sản phẩm
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E7E7E3]">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#8E8E87] mb-2">
              Danh mục & Nhóm sản phẩm
            </p>
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const subConfig = getMegaMenuConfig(cat.slug);
                const isExpanded = expandedMobileCategory === cat.slug;
                return (
                  <div key={cat.id} className="rounded-xl border border-[#EBEBEB] overflow-hidden bg-[#FAFAFA]">
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-sm font-semibold text-[#111] hover:text-[#E11D48] flex-1"
                      >
                        {cat.name}
                      </Link>
                      {subConfig && (
                        <button
                          type="button"
                          onClick={() => toggleMobileCategory(cat.slug)}
                          className="p-1 rounded-md text-[#74746E] hover:text-[#111] focus:outline-none"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-[#111]" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Collapsible Mobile Sub-items */}
                    {isExpanded && subConfig && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#EAEAE7] bg-white space-y-3">
                        <Link
                          href={subConfig.allHref}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#E11D48]"
                        >
                          <span>Xem tất cả {cat.name}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>

                        {subConfig.columns.map((col, cIdx) =>
                          col.groups.map((group, gIdx) => (
                            <div key={`${cIdx}-${gIdx}`} className="space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E87] block">
                                {group.title}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {group.items.map((item, iIdx) => (
                                  <Link
                                    key={iIdx}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-xs text-[#4B5563] bg-[#F7F7F5] px-2 py-1 rounded-md hover:text-[#E11D48]"
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
