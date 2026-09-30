import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getBackupConfigAction, getBackupListAction } from "@/app/actions/backup";
import { BackupManager } from "@/components/admin/backup-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sao lưu & Khôi phục dữ liệu | Admin TringuyenGear",
  description: "Quản lý sao lưu dữ liệu tự động, liên kết Google Drive và lưu trữ an toàn",
};

export default async function BackupsPage() {
  const session = await getCurrentSession();

  // Chỉ ADMIN mới có quyền truy cập trang quản lý Sao lưu
  if (!session || session.role !== "ADMIN") {
    redirect("/admin?error=forbidden");
  }

  const [initialConfig, initialBackups] = await Promise.all([
    getBackupConfigAction(),
    getBackupListAction(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Sao lưu & Dữ liệu đám mây
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Thiết lập lịch tự động sao lưu dữ liệu, giới hạn số bản lưu trữ và liên kết Google Drive
        </p>
      </div>

      {/* Main Backup Manager Component */}
      <BackupManager
        initialConfig={initialConfig}
        initialBackups={initialBackups}
      />
    </div>
  );
}
