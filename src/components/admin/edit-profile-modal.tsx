"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/app/actions/auth";
import { SessionPayload } from "@/types";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionPayload;
}

export function EditProfileModal({ isOpen, onClose, session }: EditProfileModalProps) {
  const router = useRouter();
  const [name, setName] = useState(
    session.name === "Quản trị viên CaoTri" ? "Admin" : session.name || "Admin"
  );
  const [email, setEmail] = useState(session.email || "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setName(session.name === "Quản trị viên CaoTri" ? "Admin" : session.name || "Admin");
      setEmail(session.email || "");
    }
  }, [isOpen, session]);

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

    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);

      const res = await updateProfileAction(null, formData);
      if (res.success) {
        toast.success(res.message || "Cập nhật hồ sơ thành công!");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Không thể cập nhật hồ sơ");
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
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#111]">
              Chỉnh sửa hồ sơ
            </h2>
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
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                <User className="w-4 h-4" />
              </div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isPending}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#555]">
              Địa chỉ Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888]">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="pl-9"
              />
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
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
