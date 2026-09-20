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
    <div className="min-h-screen bg-[#F8F9FA] text-[#111] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#111] selection:text-white">
      {/* Nút quay về storefront */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#74746E] hover:text-[#111] bg-white border border-[#E7E7E3] px-3.5 py-2 rounded-xl shadow-xs hover:border-[#111]/30 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-[420px]">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#111] text-white shadow-md mb-4 ring-4 ring-[#E7E7E3]/60">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111]">
            Đăng nhập Quản trị
          </h1>
          <p className="text-sm text-[#74746E] mt-1.5">
            Cao Trí Gaming Gear
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E7E7E3] rounded-2xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-[#74746E] text-sm">
                Đang tải biểu mẫu...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
