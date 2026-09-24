"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FolderTree,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userRole: UserRole;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Danh mục",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: ImageIcon,
    adminOnly: true,
  },
  {
    title: "Cài đặt Shop",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
  },
];

export function AdminSidebar({
  userRole,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111111] border-r border-[#111111] text-white">
      {/* Header Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-white/10 transition-all duration-200",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TringuyenGear" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none whitespace-nowrap">
              <span className="font-semibold text-base tracking-wide text-white">
                TringuyenGear
              </span>
              <span className="text-[10px] text-white/50 tracking-wider mt-1 uppercase">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {/* Nút đóng trên mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-white/70 hover:text-white rounded-lg"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/70 group-hover:text-white"
                )}
              />
              {!isCollapsed && <span>{item.title}</span>}

              {/* Tooltip khi thu gọn */}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-white text-[#111] text-xs font-medium rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E7E7E3] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Nút Toggle thu gọn/mở rộng sidebar (Desktop only) */}
      <div className="hidden lg:flex p-3 border-t border-white/10 justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full py-2 px-3 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-30 print:hidden",
          isCollapsed ? "w-20" : "w-[220px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden fade-in duration-200 print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-[220px] z-50 lg:hidden transition-transform duration-300 ease-in-out print:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
