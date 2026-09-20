"use client";

import { useState, useTransition } from "react";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/app/actions/auth";

interface ChangePasswordCardProps {
  userEmail: string;
}

export function ChangePasswordCard({ userEmail }: ChangePasswordCardProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", userEmail);
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
      formData.append("confirmPassword", confirmPassword);

      const res = await changePasswordAction(null, formData);
      if (res.success) {
        toast.success(res.message || "Đã đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.error || "Không thể đổi mật khẩu");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3 pb-3 border-b border-[#E7E7E3]">
        <div className="w-9 h-9 rounded-lg bg-[#111]/5 border border-[#111]/15 flex items-center justify-center text-[#111]">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#111]">
            Đổi mật khẩu tài khoản Quản trị
          </h2>
          <p className="text-xs text-[#74746E]">
            Tài khoản hiện tại: <strong className="text-[#111]">{userEmail}</strong> • Nên sử dụng mật khẩu mạnh kết hợp chữ và số
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mật khẩu hiện tại */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#74746E]" />
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <Input
                type={showCurrentPass ? "text" : "password"}
                placeholder="Nhập mật khẩu đang dùng"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isPending}
                className="pr-10"
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

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#74746E]" />
              Mật khẩu mới
            </label>
            <div className="relative">
              <Input
                type={showNewPass ? "text" : "password"}
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isPending}
                className="pr-10"
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

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#74746E]" />
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Input
                type={showConfirmPass ? "text" : "password"}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isPending}
                className="pr-10"
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
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button
            type="submit"
            className="bg-[#111] text-white rounded-lg h-10 px-5 gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Cập nhật mật khẩu mới
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
