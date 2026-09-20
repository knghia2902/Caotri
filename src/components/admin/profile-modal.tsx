"use client";

import { useEffect } from "react";
import { SessionPayload } from "@/types";
import { User, X, Shield, Mail } from "lucide-react";
import { ChangePasswordCard } from "./change-password-card";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionPayload;
}

export function ProfileModal({ isOpen, onClose, session }: ProfileModalProps) {
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

  const displayName =
    session.name === "Quản trị viên CaoTri" ? "Admin" : session.name || "Admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E7E7E3] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E3] bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111]">
                Hồ sơ Quản trị viên
              </h2>
              <p className="text-xs text-[#74746E]">
                Thông tin tài khoản & Đổi mật khẩu đăng nhập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#74746E] hover:text-[#111] hover:bg-[#EAEAE6] transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F9FA] border border-[#E7E7E3]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-white border border-[#E7E7E3] flex items-center justify-center text-[#111] shadow-xs shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-[#111]">
                    {displayName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#111] text-white px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    Quản trị viên
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#74746E] mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{session.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ChangePasswordCard userEmail={session.email} />
          </div>
        </div>
      </div>
    </div>
  );
}
