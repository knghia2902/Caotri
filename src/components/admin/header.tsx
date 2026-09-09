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
    <header className="h-16 border-b border-[#E7E7E3] bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 print:hidden">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#74746E] hover:text-[#111] rounded-lg hover:bg-[#FAFAFA] border border-[#E7E7E3]"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[#74746E]">
          <Link href="/admin" className="hover:text-[#111] transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D5D5D0]" />
          <span className="text-[#111] font-medium truncate max-w-[150px] sm:max-w-none">
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
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#74746E] hover:text-[#111] bg-white hover:bg-[#FAFAFA] border border-[#D5D5D0] transition-all"
        >
          <span>Xem Cửa hàng</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User profile & Role Badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#E7E7E3]">
          <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#E7E7E3] flex items-center justify-center text-[#74746E] shrink-0">
            <User className="w-4 h-4" />
          </div>

          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-[#111] truncate max-w-[120px]">
              {session.name}
            </span>
            <span className="text-[10px] text-[#74746E] truncate max-w-[120px]">
              {session.email}
            </span>
          </div>

          <Badge
            variant={session.role === "ADMIN" ? "default" : "secondary"}
            className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-[#111] text-white hover:bg-[#111]"
          >
            {session.role}
          </Badge>

          {/* Nút Đăng xuất */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-2 text-[#74746E] hover:text-[#111] rounded-lg transition-colors ml-1"
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
