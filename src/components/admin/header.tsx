"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SessionPayload } from "@/types";
import { logoutAction } from "@/app/actions/auth";
import { EditProfileModal } from "./edit-profile-modal";
import { ChangePasswordModal } from "./change-password-modal";
import {
  Menu,
  ExternalLink,
  LogOut,
  User,
  ChevronRight,
  KeyRound,
  UserPen,
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
  "/admin/profile": "Hồ sơ cá nhân",
};

export function AdminHeader({ session, onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName =
    session.name === "Quản trị viên CaoTri" || session.name === "Quản trị viên TringuyenGear" ? "Admin" : session.name || "Admin";

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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

        {/* User profile & Dropdown Menu */}
        <div className="relative pl-2 sm:pl-3 border-l border-[#E7E7E3]" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 -m-1 rounded-xl hover:bg-[#F4F4F2] transition-all group text-left cursor-pointer"
            title="Tùy chọn tài khoản"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#E7E7E3] group-hover:border-[#111] group-hover:bg-white flex items-center justify-center text-[#74746E] group-hover:text-[#111] shrink-0 transition-all shadow-2xs">
              <User className="w-4 h-4" />
            </div>

            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#111] group-hover:text-black truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#74746E] truncate max-w-[120px]">
                {session.email}
              </span>
            </div>
          </button>

          {/* 3-Item Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E7E7E3] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              {/* Mini User Info */}
              <div className="px-3.5 py-2 border-b border-[#E7E7E3]">
                <p className="text-xs font-semibold text-[#111] truncate">{displayName}</p>
                <p className="text-[11px] text-[#74746E] truncate">{session.email}</p>
              </div>

              {/* Mục 1: Chỉnh sửa hồ sơ */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsEditProfileOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#111] hover:bg-[#F4F4F2] transition-colors text-left cursor-pointer"
              >
                <UserPen className="w-4 h-4 text-[#74746E]" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>

              {/* Mục 2: Đổi mật khẩu */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsChangePasswordOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#111] hover:bg-[#F4F4F2] transition-colors text-left cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#74746E]" />
                <span>Đổi mật khẩu</span>
              </button>

              <div className="my-1 border-t border-[#E7E7E3]" />

              {/* Mục 3: Đăng xuất */}
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Chỉnh sửa hồ sơ */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        session={session}
      />

      {/* Modal 2: Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userEmail={session.email}
      />
    </header>
  );
}
