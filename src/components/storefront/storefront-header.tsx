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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md text-zinc-100">
      {/* Top micro bar */}
      <div className="border-b border-zinc-900 bg-zinc-950 px-4 py-1.5 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-zinc-500">
              ⚡ Gaming Gear & Phụ kiện công nghệ chính hãng 100%
            </span>
            <span className="text-cyan-400 font-medium flex items-center gap-1">
              <Phone className="w-3 h-3" /> Hotline: {hotline}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-zinc-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Quản trị viên</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-zinc-100 group-hover:text-cyan-400 transition-colors">
              CAOTRI<span className="text-cyan-400">GEAR</span>
            </span>
            <span className="block text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
              Pro Gaming Setup
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-300">
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors py-1"
          >
            Trang chủ
          </Link>
          <Link
            href="/products"
            className="hover:text-cyan-400 transition-colors py-1"
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
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors py-1"
            >
              <span>Danh mục gear</span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>

            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-56 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-cyan-500" />
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Search Slot */}
        <div className="flex-1 max-w-md hidden md:block">
          {searchSlot || <InstantSearch />}
        </div>

        {/* Right actions: Hotline & Cart */}
        <div className="flex items-center gap-3">
          {/* Hotline Quick Call */}
          <a
            href={`tel:${hotline.replace(/[^0-9]/g, "")}`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors text-xs text-zinc-300"
          >
            <Phone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-semibold">{hotline}</span>
          </a>

          {/* Cart Icon */}
          <Link href="/cart" className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0 rounded-xl border-zinc-800 hover:border-cyan-500/50 hover:text-cyan-400 text-zinc-200"
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center shadow-md">
              0
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-zinc-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="md:hidden">
            {searchSlot || <InstantSearch />}
          </div>

          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900 hover:text-cyan-400"
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900 hover:text-cyan-400"
            >
              Tất cả sản phẩm
            </Link>
          </div>

          <div className="pt-2 border-t border-zinc-900">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Danh mục sản phẩm
            </p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 transition-colors"
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
