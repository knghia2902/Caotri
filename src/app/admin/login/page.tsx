import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { ArrowLeft, Gamepad2, Shield } from "lucide-react";

export const metadata = {
  title: "Cổng Quản Trị | CaoTri Gaming Gear",
  description: "Trang đăng nhập và bảo mật phân hệ quản trị CaoTri Gaming Gear",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-[#111] selection:text-white">
      {/* Top navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#74746E] hover:text-[#111] bg-white border border-[#E7E7E3] px-3.5 py-2 rounded-xl shadow-xs hover:border-[#111]/30 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ Cửa hàng</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-[#74746E] font-medium bg-white/60 border border-[#E7E7E3] px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Máy chủ hoạt động bình thường</span>
        </div>
      </div>

      {/* Main card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px] my-auto py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-[#111] text-white shadow-lg mb-3.5 ring-4 ring-white">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111]">
            Cao Trí Gaming Gear
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E7E7E3] rounded-full text-xs font-medium text-[#555] mt-2.5 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-[#111]" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>
        </div>

        <div className="bg-white p-7 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#E7E7E3] rounded-2xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-[#74746E] text-sm">
                Đang tải biểu mẫu xác thực...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center text-[11px] text-[#888] flex items-center justify-center gap-2">
          <span>Chuẩn bảo mật SSL 256-bit</span>
          <span>•</span>
          <span>JWT HttpOnly Session</span>
          <span>•</span>
          <span>Khu vực Nội bộ</span>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mx-auto text-center text-[11px] text-[#A3A39D]">
        © {new Date().getFullYear()} Cao Trí Gaming Gear. All rights reserved.
      </div>
    </div>
  );
}
