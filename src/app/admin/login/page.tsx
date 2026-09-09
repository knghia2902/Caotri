import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import { Cpu, ShieldCheck, Zap, ArrowLeft, Gamepad2 } from "lucide-react";

export const metadata = {
  title: "Đăng nhập Quản trị | CaoTri Gaming Gear",
  description: "Trang đăng nhập phân hệ quản trị CaoTri Gaming Gear",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-zinc-950 text-zinc-100">
      {/* Cột 1: Branding & Artwork (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-zinc-950 via-zinc-900 to-cyan-950/40 border-r border-zinc-800/80 relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-zinc-100">
              CAOTRI <span className="text-cyan-400">GEAR</span>
            </h1>
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest">
              Backoffice Control Center
            </p>
          </div>
        </div>

        {/* Mid hero copy */}
        <div className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
            <Zap className="w-3.5 h-3.5" />
            <span>Clean Tech E-Commerce Architecture</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Quản trị cửa hàng trực quan, bảo mật & tốc độ cao.
          </h2>

          <p className="text-sm text-zinc-400 leading-relaxed">
            Hệ sinh thái thương mại điện tử chuyên biệt cho Gaming Gear. Quản lý danh mục, kiểm soát kho hàng, cập nhật đơn hàng và phân quyền tài khoản chặt chẽ.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
              <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="font-semibold text-xs text-zinc-200">Next.js 15 App Router</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Hiệu năng cao & SEO tối ưu</div>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="font-semibold text-xs text-zinc-200">Phân quyền 2 Lớp (RBAC)</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Bảo vệ Admin & Nhân viên</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-zinc-500">
          © 2026 CaoTri Gaming Gear. All rights reserved.
        </div>
      </div>

      {/* Cột 2: Form Đăng nhập */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về trang chủ Storefront</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-xl shadow-black/50 lg:hidden">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Đăng nhập Quản trị
            </h2>
            <p className="text-sm text-zinc-400 mt-1.5">
              Nhập email và mật khẩu của bạn để truy cập hệ thống
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-zinc-500 text-sm">Đang tải biểu mẫu...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="text-center text-xs text-zinc-600">
          Bảo mật bởi chuẩn mã hóa JWT & Cookie HttpOnly an toàn
        </div>
      </div>
    </div>
  );
}
