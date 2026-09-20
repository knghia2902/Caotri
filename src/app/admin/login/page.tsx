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
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#111] selection:text-white">
      {/* Nút quay về storefront */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#74746E] hover:text-[#111] bg-white border border-[#E7E7E3] px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ Cửa hàng</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#111] text-white shadow-xl mb-4 ring-4 ring-[#E7E7E3]">
          <Gamepad2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111]">
          Cao Trí Gaming Gear
        </h1>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E7E7E3] rounded-full text-xs font-semibold text-[#74746E] mt-3 shadow-xs">
          <Shield className="w-3.5 h-3.5 text-[#111]" />
          <span>Cổng Quản Trị Hệ Thống</span>
        </div>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-[460px]">
        <div className="bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#E7E7E3] rounded-2xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-[#74746E] text-sm">
                Đang tải biểu mẫu bảo mật...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center text-xs text-[#74746E] flex items-center justify-center gap-2">
          <span>Chuẩn bảo mật JWT HttpOnly Cookie</span>
          <span>•</span>
          <span>Dành cho Quản trị viên</span>
        </div>
      </div>
    </div>
  );
}
