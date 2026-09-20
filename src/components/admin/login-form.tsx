"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction, changePasswordAction } from "@/app/actions/auth";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [activeTab, setActiveTab] = useState<"login" | "change_password">("login");

  // State cho form Đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State cho form Đổi mật khẩu
  const [changeEmail, setChangeEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  // Xử lý submit Đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
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
      setError("Đã xảy ra sự cố kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit Đổi mật khẩu
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPassword.length < 6) {
      setChangeError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setIsChanging(true);

    const formData = new FormData();
    formData.append("email", changeEmail);
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    try {
      const result = await changePasswordAction(null, formData);
      if (result.success) {
        setChangeSuccess(result.message || "Đổi mật khẩu thành công!");
        // Tự động điền email và mật khẩu mới sang form đăng nhập
        setEmail(changeEmail);
        setPassword(newPassword);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Sau 1.8 giây chuyển mượt về tab Đăng nhập
        setTimeout(() => {
          setActiveTab("login");
          setChangeSuccess(null);
        }, 1800);
      } else {
        setChangeError(result.error || "Không thể đổi mật khẩu.");
      }
    } catch {
      setChangeError("Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Tab Điều Hướng Đăng Nhập / Đổi Mật Khẩu */}
      <div className="grid grid-cols-2 p-1 bg-[#F4F4F2] rounded-xl border border-[#E7E7E3]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setError(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "login"
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#74746E] hover:text-[#111]"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("change_password");
            setChangeEmail(email || "admin@caotri.vn");
            setChangeError(null);
            setChangeSuccess(null);
          }}
          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "change_password"
              ? "bg-white text-[#111] shadow-sm"
              : "text-[#74746E] hover:text-[#111]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Đổi mật khẩu</span>
        </button>
      </div>

      {/* ================= TAB 1: ĐĂNG NHẬP ================= */}
      {activeTab === "login" && (
        <div className="space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-3.5 text-sm text-[#D94A4A] bg-[#D94A4A]/10 border border-[#D94A4A]/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D94A4A]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#74746E]" />
                <span>Email quản trị</span>
              </label>
              <Input
                type="email"
                placeholder="admin@caotri.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#74746E]" />
                  <span>Mật khẩu</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("change_password");
                    setChangeEmail(email || "admin@caotri.vn");
                  }}
                  className="text-xs text-[#74746E] hover:text-[#111] hover:underline transition-colors"
                >
                  Đổi mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 pr-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] p-1 transition-colors"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#111] hover:bg-black text-white font-medium rounded-xl transition-all duration-150 shadow-sm"
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

          {/* Quick-fill chỉ cho Admin duy nhất (Không có Staff) */}
          <div className="pt-3 border-t border-[#E7E7E3] text-center">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@caotri.vn");
                setPassword("admin123@");
                setError(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-[#74746E] hover:text-[#111] bg-[#F7F7F5] hover:bg-[#EFEFEA] border border-[#E7E7E3] rounded-lg transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#111] group-hover:rotate-12 transition-transform" />
              <span>Điền nhanh tài khoản Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ĐỔI MẬT KHẨU ================= */}
      {activeTab === "change_password" && (
        <div className="space-y-5">
          {changeError && (
            <div className="flex items-center gap-3 p-3.5 text-sm text-[#D94A4A] bg-[#D94A4A]/10 border border-[#D94A4A]/20 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#D94A4A]" />
              <span>{changeError}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="flex items-center gap-3 p-3.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{changeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#74746E]" />
                <span>Email tài khoản quản trị</span>
              </label>
              <Input
                type="email"
                placeholder="admin@caotri.vn"
                value={changeEmail}
                onChange={(e) => setChangeEmail(e.target.value)}
                required
                disabled={isChanging}
                className="h-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#74746E]" />
                <span>Mật khẩu hiện tại</span>
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu đang dùng"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isChanging}
                  className="h-11 pr-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] p-1 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#74746E]" />
                <span>Mật khẩu mới (tối thiểu 6 ký tự)</span>
              </label>
              <div className="relative">
                <Input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isChanging}
                  className="h-11 pr-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] p-1 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#74746E]" />
                <span>Xác nhận mật khẩu mới</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isChanging}
                  className="h-11 pr-11 bg-[#FAFAFA] border-[#D5D5D0] text-[#111] placeholder:text-[#A3A39D] focus:bg-white focus:border-[#111] rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] p-1 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isChanging}
              className="w-full h-11 bg-[#111] hover:bg-black text-white font-medium rounded-xl transition-all duration-150 shadow-sm"
            >
              {isChanging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật mật khẩu...
                </>
              ) : (
                <>
                  Xác nhận đổi mật khẩu
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setChangeError(null);
                setChangeSuccess(null);
              }}
              className="text-xs text-[#74746E] hover:text-[#111] hover:underline transition-colors"
            >
              ← Quay lại màn hình Đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
