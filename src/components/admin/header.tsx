"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SessionPayload } from "@/types";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions/auth";
import {
  Menu,
  ExternalLink,
  LogOut,
  User,
  ChevronRight,
} from "lucide-react";

interface AdminHeaderProps {
  session: SessionPayload;
  onMenuClick: () => void;
}

const pathTitles: Record<string, string> = {
  "/admin": "Tổng quan Dashboard",
  "/admin/orders": "Quản lý Đơn hàng",
  "/admin/products": "Quản lý Sản phẩm",
  "/admin/categories": "Quản lý Danh mục",
  "/admin/banners": "Quản lý Banners",
  "/admin/settings": "Cài đặt Cửa hàng",
};

export function AdminHeader({ session, onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  // Tìm tiêu đề breadcrumb tương ứng với route hiện tại
  const currentTitle =
    pathTitles[pathname] ||
    (pathname.startsWith("/admin/products/")
      ? "Chi tiết Sản phẩm"
      : pathname.startsWith("/admin/orders/")
      ? "Chi tiết Đơn hàng"
      : "Quản trị hệ thống");

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-900 border border-zinc-800"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Link href="/admin" className="hover:text-zinc-200 transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-200 font-medium truncate max-w-[150px] sm:max-w-none">
            {currentTitle}
          </span>
        </nav>
      </div>

      {/* Right: Actions & User info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Nút Xem Cửa Hàng ngoài storefront */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 transition-all"
        >
          <span>Xem Cửa hàng</span>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
        </Link>

        {/* User profile & Role Badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-zinc-800/80">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
            <User className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
              {session.name}
            </span>
            <span className="text-[10px] text-zinc-500 truncate max-w-[120px]">
              {session.email}
            </span>
          </div>

          <Badge
            variant={session.role === "ADMIN" ? "neon" : "secondary"}
            className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2"
          >
            {session.role}
          </Badge>

          {/* Nút Đăng xuất */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors ml-1"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
