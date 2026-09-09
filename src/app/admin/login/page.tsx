import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { ArrowLeft, Gamepad2 } from "lucide-react";

export const metadata = {
  title: "Đăng nhập Quản trị | CaoTri Gaming Gear",
  description: "Trang đăng nhập phân hệ quản trị CaoTri Gaming Gear",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#74746E] hover:text-[#111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ Storefront</span>
        </Link>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-[10px] bg-white border border-[#E7E7E3] flex items-center justify-center text-[#111]">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#111]">
          Đăng nhập Quản trị
        </h2>
        <p className="mt-2 text-center text-sm text-[#74746E]">
          Nhập email và mật khẩu của bạn để truy cập hệ thống
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-[#E7E7E3] rounded-[10px] sm:px-10">
          <Suspense fallback={<div className="text-center text-[#74746E] text-sm">Đang tải biểu mẫu...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-6 text-center text-xs text-[#74746E]">
          Bảo mật bởi chuẩn mã hóa JWT & Cookie HttpOnly an toàn
        </div>
      </div>
    </div>
  );
}
