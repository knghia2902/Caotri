"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Search,
  ShoppingBag,
  Phone,
  Menu,
  X,
  Layers,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstantSearch } from "@/components/storefront/instant-search";
import { useCartHydrated } from "@/stores/cart-store";

export interface CategoryHeaderItem {
  id: string;
  name: string;
  slug: string;
}

interface StorefrontHeaderProps {
  categories?: CategoryHeaderItem[];
  hotline?: string;
  searchSlot?: React.ReactNode;
}

export function StorefrontHeader({
  categories = [],
  hotline = "0987.654.321",
  searchSlot,
}: StorefrontHeaderProps) {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCartHydrated();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E7E7E3] bg-[#FFFFFF]">
      {/* Top micro bar */}
      <div className="border-b border-[#E7E7E3] bg-[#FAFAFA] px-4 py-1.5 text-xs text-[#74746E]">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              ⚡ Gaming Gear & Phụ kiện công nghệ chính hãng 100%
            </span>
            <span className="text-[#111] font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" /> Hotline: {hotline}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hover:text-[#111] transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Quản trị viên</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-[1360px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 flex items-center justify-center text-[#111]">
              <Gamepad2 className="w-6 h-6 stroke-[1.5px]" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-[#111]">
                Caotri Gear
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#111]">
            <Link
              href="/"
              className="hover:text-[#74746E] transition-colors py-1"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="hover:text-[#74746E] transition-colors py-1"
            >
              Tất cả sản phẩm
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryDropdownOpen(true)}
              onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-[#74746E] transition-colors py-1 px-1 rounded-md focus:outline-none"
              >
                <span>Danh mục gear</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 w-56 rounded-lg bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-2 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[#111] hover:text-[#74746E] hover:bg-[#FAFAFA] transition-colors"
                    >
                      <Layers className="w-4 h-4 stroke-[1.5px]" />
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
          <Link href="/cart" className="relative inline-flex items-center justify-center">
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
        <div className="lg:hidden border-t border-[#E7E7E3] bg-[#FFFFFF] px-4 py-4 space-y-4">
          <div className="md:hidden">
            {searchSlot || <InstantSearch />}
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111] hover:bg-[#FAFAFA] hover:text-[#74746E]"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#111] hover:bg-[#FAFAFA] hover:text-[#74746E]"
            >
              Tất cả sản phẩm
            </Link>
          </div>

          <div className="pt-2 border-t border-[#E7E7E3]">
            <p className="px-3 text-xs font-semibold uppercase tracking-tight text-[#A3A39D] mb-1">
              Danh mục sản phẩm
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-sm text-[#74746E] hover:text-[#111] hover:bg-[#FAFAFA] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
