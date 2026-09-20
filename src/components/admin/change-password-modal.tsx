"use client";

import { useState, useTransition, useEffect } from "react";
import { KeyRound, Lock, Eye, EyeOff, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/app/actions/auth";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp");
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
        toast.success(res.message || "Đổi mật khẩu thành công!");
        onClose();
      } else {
        toast.error(res.error || "Không thể đổi mật khẩu");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E7E7E3] overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111] text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111]">
                Đổi mật khẩu
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#74746E] hover:text-[#111] hover:bg-[#F4F4F2] transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
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
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] transition-colors"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
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
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] transition-colors"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
              Xác nhận mật khẩu mới
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
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] transition-colors"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E7E7E3]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-9 px-4 text-xs font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 px-4 text-xs font-medium bg-[#111] hover:bg-black text-white gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cập nhật mật khẩu
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
