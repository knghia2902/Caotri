"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/app/actions/auth";
import { Shield, UserCheck, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(null, formData);
      if (result.success) {
        router.push(redirectUrl);
        router.refresh();
      } else {
        setError(result.error || "Đăng nhập không thành công.");
      }
    } catch {
      setError("Đã xảy ra sự cố trong quá trình kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="w-full space-y-6">
      {error && (
        <div className="flex items-center gap-3 p-3.5 text-sm text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Email quản trị
          </label>
          <Input
            type="email"
            placeholder="admin@caotri.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Mật khẩu
            </label>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-950/50 transition-all duration-150"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            <>
              Đăng nhập hệ thống
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Credentials Quick-fill */}
      <div className="pt-4 border-t border-zinc-800/80">
        <p className="text-xs text-zinc-500 mb-3 text-center">
          Tài khoản kiểm thử nhanh (1-Click Test):
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickFill("admin@caotri.vn", "admin123@")}
            className="flex flex-col items-start p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-cyan-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Admin Demo</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-0.5">Toàn quyền hệ thống</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("staff@caotri.vn", "staff123@")}
            className="flex flex-col items-start p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all text-left group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Staff Demo</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-0.5">Đơn hàng & Sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
