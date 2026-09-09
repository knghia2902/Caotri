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
        <div className="flex items-center gap-3 p-3.5 text-sm text-[#D94A4A] bg-[#D94A4A]/10 border border-[#D94A4A]/20 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#D94A4A]" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
            Email quản trị
          </label>
          <Input
            type="email"
            placeholder="admin@caotri.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-11 bg-white border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:border-[#111] rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
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
            className="h-11 bg-white border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:border-[#111] rounded-lg"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-[#111] hover:bg-black text-white font-medium rounded-lg transition-all duration-150"
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
      <div className="pt-4 border-t border-[#E7E7E3]">
        <p className="text-xs text-[#74746E] mb-3 text-center">
          Tài khoản kiểm thử nhanh (1-Click Test):
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickFill("admin@caotri.vn", "admin123@")}
            className="flex flex-col items-start p-2.5 rounded-lg border border-[#D5D5D0] bg-white hover:bg-[#FAFAFA] hover:border-[#111] transition-all text-left group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111]">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </div>
            <span className="text-[11px] text-[#74746E] mt-0.5">Toàn quyền hệ thống</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("staff@caotri.vn", "staff123@")}
            className="flex flex-col items-start p-2.5 rounded-lg border border-[#D5D5D0] bg-white hover:bg-[#FAFAFA] hover:border-[#111] transition-all text-left group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111]">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Demo</span>
            </div>
            <span className="text-[11px] text-[#74746E] mt-0.5">Đơn hàng & Sản phẩm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
