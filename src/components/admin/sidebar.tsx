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

  // Lọc bỏ các menu chỉ dành cho Admin nếu userRole là STAFF
  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/80 text-zinc-300">
      {/* Header Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-zinc-800/80 transition-all duration-200",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Gamepad2 className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col leading-none whitespace-nowrap">
              <span className="font-bold text-base tracking-wide text-zinc-100">
                CAOTRI <span className="text-cyan-400">GEAR</span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-wider mt-1 uppercase">
                Admin Panel
              </span>
            </div>
          )}
        </Link>

        {/* Nút đóng trên mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg"
          aria-label="Đóng menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto overflow-x-hidden">
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
                  ? "bg-cyan-950/50 text-cyan-300 border border-cyan-800/50 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 border border-transparent",
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-cyan-400" : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />
              {!isCollapsed && <span>{item.title}</span>}

              {/* Tooltip khi thu gọn */}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 text-zinc-200 text-xs font-medium rounded-md shadow-xl border border-zinc-800 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Nút Toggle thu gọn/mở rộng sidebar (Desktop only) */}
      <div className="hidden lg:flex p-3 border-t border-zinc-800/80 justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full py-2 px-3 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60 rounded-lg border border-zinc-800/60 transition-all"
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
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-30",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-72 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
