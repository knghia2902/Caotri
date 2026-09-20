import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/settings-form";
import { ChangePasswordCard } from "@/components/admin/change-password-card";
import { Sliders } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  // Kiểm tra phân quyền: Chỉ ADMIN mới được truy cập trang cài đặt
  if (session && session.role !== "ADMIN") {
    redirect("/admin?error=forbidden");
  }

  // Nạp toàn bộ cài đặt từ bảng SiteSetting
  const settingsRecords = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRecords) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Hệ thống & Cấu hình
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Cài đặt Cửa hàng & Bảo mật
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Thiết lập thông tin liên hệ Hotline, Zalo OA, Fanpage Facebook và đổi mật khẩu quản trị viên
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm initialSettings={settingsMap} />

      {/* Đổi mật khẩu tài khoản Admin */}
      <ChangePasswordCard userEmail={session?.email || "admin@caotri.vn"} />
    </div>
  );
}
