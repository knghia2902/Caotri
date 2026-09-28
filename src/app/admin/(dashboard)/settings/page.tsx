import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/settings-form";

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
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Cài đặt Cửa hàng
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Thiết lập thông tin liên hệ Hotline, Zalo OA, Fanpage Facebook và địa chỉ cửa hàng
        </p>
      </div>

      {/* Settings Form */}
      <SettingsForm initialSettings={settingsMap} />
    </div>
  );
}
