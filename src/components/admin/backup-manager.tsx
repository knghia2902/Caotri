"use client";

import { useState, useTransition } from "react";
import {
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  Trash2,
  RefreshCw,
  Save,
  Clock,
  Shield,
  FileArchive,
  Loader2,
  ExternalLink,
  X,
  Database,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BackupConfig,
  BackupItem,
  saveBackupConfigAction,
  runBackupNowAction,
  deleteBackupAction,
  saveGoogleDriveConfigAction,
  disconnectGoogleDriveAction,
  testGoogleDriveConnectionAction,
  getBackupListAction,
} from "@/app/actions/backup";

interface BackupManagerProps {
  initialConfig: BackupConfig;
  initialBackups: BackupItem[];
}

export function BackupManager({ initialConfig, initialBackups }: BackupManagerProps) {
  const [config, setConfig] = useState<BackupConfig>(initialConfig);
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isTestingDrive, setIsTestingDrive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [isSavingToken, setIsSavingToken] = useState(false);

  const [, startTransition] = useTransition();

  // 1. Lưu cấu hình
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await saveBackupConfigAction(config);
      if (res.success) {
        toast.success("Đã lưu chính sách sao lưu và cập nhật lịch trình thành công!");
      } else {
        toast.error(res.error || "Không thể lưu cài đặt sao lưu");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu cấu hình.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Chạy sao lưu ngay
  const handleRunBackupNow = async () => {
    setIsBackingUp(true);
    toast.info("Đang tiến hành sao lưu toàn bộ dữ liệu & hình ảnh...", { duration: 6000 });
    try {
      const res = await runBackupNowAction();
      if (res.success) {
        toast.success("Sao lưu hoàn tất thành công!");
        // Refresh danh sách
        const updatedList = await getBackupListAction();
        setBackups(updatedList);
      } else {
        toast.error(res.error || "Sao lưu thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối khi chạy sao lưu");
    } finally {
      setIsBackingUp(false);
    }
  };

  // 3. Xóa bản sao lưu
  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản sao lưu "${filename}" không?`)) return;

    try {
      const res = await deleteBackupAction(filename);
      if (res.success) {
        toast.success("Đã xóa bản sao lưu thành công");
        setBackups((prev) => prev.filter((b) => b.filename !== filename));
      } else {
        toast.error(res.error || "Không thể xóa bản sao lưu");
      }
    } catch {
      toast.error("Lỗi khi xóa bản sao lưu");
    }
  };

  // 4. Kiểm tra kết nối Google Drive
  const handleTestDrive = async () => {
    setIsTestingDrive(true);
    try {
      const res = await testGoogleDriveConnectionAction();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi kiểm tra kết nối Google Drive");
    } finally {
      setIsTestingDrive(false);
    }
  };

  // 5. Hủy liên kết Google Drive
  const handleDisconnectDrive = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy liên kết tài khoản Google Drive hiện tại không?")) return;

    try {
      const res = await disconnectGoogleDriveAction();
      if (res.success) {
        toast.success("Đã hủy liên kết Google Drive");
        setConfig((prev) => ({ ...prev, gdrive_connected: false, backup_upload_gdrive: false }));
      } else {
        toast.error(res.error || "Không thể hủy liên kết");
      }
    } catch {
      toast.error("Lỗi khi hủy liên kết");
    }
  };

  // 6. Lưu Token Google Drive từ Modal
  const handleSaveDriveToken = async () => {
    if (!tokenInput.trim()) {
      toast.error("Vui lòng nhập chuỗi JSON Token!");
      return;
    }

    setIsSavingToken(true);
    try {
      const res = await saveGoogleDriveConfigAction(tokenInput);
      if (res.success) {
        toast.success("Đã liên kết Google Drive thành công!");
        setConfig((prev) => ({ ...prev, gdrive_connected: true, backup_upload_gdrive: true }));
        setIsModalOpen(false);
        setTokenInput("");
      } else {
        toast.error(res.error || "Không thể kết nối với Google Drive");
      }
    } catch {
      toast.error("Lỗi khi xử lý token");
    } finally {
      setIsSavingToken(false);
    }
  };

  // Format ngày tạo từ tên file (caotri_backup_YYYYMMDD_HHMMSS.tar.gz) hoặc ISO
  const formatBackupDate = (filename: string, iso: string) => {
    const match = filename.match(/caotri_backup_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const [, y, m, d, h, min, s] = match;
      return `${d}/${m}/${y} ${h}:${min}:${s}`;
    }
    try {
      const date = new Date(iso);
      return date.toLocaleString("vi-VN");
    } catch {
      return filename;
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* 1. KHỐI GOOGLE DRIVE */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111]">Đám mây Google Drive</h2>
                {config.gdrive_connected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã kết nối
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Chưa kết nối
                  </span>
                )}
              </div>
              <p className="text-xs text-[#74746E] mt-0.5">
                {config.gdrive_connected
                  ? "Bản sao lưu sẽ được tự động đồng bộ vào thư mục Google Drive: CaoTri_Backups/"
                  : "Liên kết tài khoản Google Drive để tự động lưu trữ các bản sao lưu an toàn trên đám mây"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {config.gdrive_connected ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestDrive}
                  disabled={isTestingDrive}
                  className="h-9 text-xs rounded-xl border-[#E7E7E3]"
                >
                  {isTestingDrive ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Kiểm tra kết nối
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDisconnectDrive}
                  className="h-9 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl"
                >
                  Hủy liên kết
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
              >
                <Cloud className="w-3.5 h-3.5 mr-1.5" />
                Kết nối Google Drive
              </Button>
            )}
          </div>
        </div>

        {/* Thông tin thêm về Google Drive */}
        <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#74746E]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Mã hóa bảo vệ dữ liệu</span>
          </div>
          <div className="flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-blue-600" />
            <span>Thư mục đích: <strong>Google Drive / CaoTri_Backups</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Lưu trữ theo hạn mức tối đa quy định bên dưới</span>
          </div>
        </div>
      </div>

      {/* 2. KHỐI CHÍNH SÁCH VÀ CẤU HÌNH SAO LƯU */}
      <form onSubmit={handleSaveConfig} className="rounded-2xl border border-[#E7E7E3] bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111]">Chính sách & Lịch sao lưu tự động</h2>
              <p className="text-xs text-[#74746E]">
                Thiết lập giờ chạy, tần suất và giới hạn số bản lưu trữ để không đầy bộ nhớ
              </p>
            </div>
          </div>

          {/* Toggle Bật / Tắt */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.backup_enabled}
              onChange={(e) => setConfig({ ...config, backup_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111]"></div>
            <span className="ml-2.5 text-xs font-semibold text-[#111]">
              {config.backup_enabled ? "Đang bật tự động" : "Đang tắt"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Giờ sao lưu */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#111]">
              Giờ chạy sao lưu trong ngày
            </label>
            <select
              value={config.backup_time}
              onChange={(e) => setConfig({ ...config, backup_time: e.target.value })}
              className="w-full h-10 px-3 bg-white border border-[#E7E7E3] rounded-xl text-sm text-[#111] focus:outline-none focus:border-[#111]"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const hour = i.toString().padStart(2, "0");
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00 ({i < 12 ? `${i}h sáng` : i === 12 ? "12h trưa" : `${i - 12}h tối`})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-[#74746E]">
              Khuyên dùng lúc <strong>02:00 sáng</strong> khi ít người truy cập shop nhất
            </p>
          </div>

          {/* Tần suất */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#111]">
              Tần suất sao lưu
            </label>
            <select
              value={config.backup_frequency}
              onChange={(e) => setConfig({ ...config, backup_frequency: e.target.value as "daily" | "weekly" })}
              className="w-full h-10 px-3 bg-white border border-[#E7E7E3] rounded-xl text-sm text-[#111] focus:outline-none focus:border-[#111]"
            >
              <option value="daily">Hàng ngày (Daily - Khuyên dùng)</option>
              <option value="weekly">Hàng tuần (Vào Chủ Nhật)</option>
            </select>
            <p className="text-[11px] text-[#74746E]">
              Hệ thống sẽ chạy đúng theo giờ và chu kỳ đã chọn
            </p>
          </div>

          {/* Số lượng bản sao lưu tối đa */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#111]">
              Số bản lưu trữ tối đa (Bản)
            </label>
            <Input
              type="number"
              min={1}
              max={60}
              value={config.backup_max_copies}
              onChange={(e) => setConfig({ ...config, backup_max_copies: parseInt(e.target.value, 10) || 7 })}
              className="h-10 text-sm rounded-xl border-[#E7E7E3]"
            />
            <p className="text-[11px] text-[#74746E]">
              Khi vượt quá số lượng này, hệ thống sẽ tự động xóa bản cũ nhất
            </p>
          </div>
        </div>

        {/* Lựa chọn nội dung sao lưu */}
        <div className="pt-2 border-t border-[#E7E7E3] space-y-3">
          <label className="block text-xs font-semibold text-[#111]">
            Nội dung và Đích lưu trữ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8] cursor-pointer hover:border-[#111]/30 transition-all">
              <input
                type="checkbox"
                checked={config.backup_include_db}
                onChange={(e) => setConfig({ ...config, backup_include_db: e.target.checked })}
                className="mt-0.5 rounded text-[#111] focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-[#111] block">Cơ sở dữ liệu (SQLite & SQL Dump)</span>
                <span className="text-[11px] text-[#74746E]">Lưu toàn bộ sản phẩm, đơn hàng, tài khoản và lịch sử truy cập</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8] cursor-pointer hover:border-[#111]/30 transition-all">
              <input
                type="checkbox"
                checked={config.backup_include_uploads}
                onChange={(e) => setConfig({ ...config, backup_include_uploads: e.target.checked })}
                className="mt-0.5 rounded text-[#111] focus:ring-0"
              />
              <div>
                <span className="text-xs font-semibold text-[#111] block">Hình ảnh sản phẩm (/public/uploads)</span>
                <span className="text-[11px] text-[#74746E]">Toàn bộ 487+ hình ảnh tải lên của các sản phẩm trên shop</span>
              </div>
            </label>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#111]">
              <input
                type="checkbox"
                checked={config.backup_upload_gdrive}
                onChange={(e) => setConfig({ ...config, backup_upload_gdrive: e.target.checked })}
                disabled={!config.gdrive_connected}
                className="rounded text-blue-600 focus:ring-0 disabled:opacity-50"
              />
              <span>Tự động đồng bộ bản nén lên Google Drive sau khi tạo xong</span>
              {!config.gdrive_connected && (
                <span className="text-amber-600 text-[11px]">(Cần liên kết Google Drive trước)</span>
              )}
            </label>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 px-5 bg-[#111] hover:bg-black text-white text-xs font-medium rounded-xl shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Đang lưu cấu hình...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-2" />
                Lưu chính sách sao lưu
              </>
            )}
          </Button>
        </div>
      </form>

      {/* 3. KHỐI QUẢN LÝ CÁC BẢN SAO LƯU */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E3]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111]">Danh sách các bản sao lưu</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-[#555]">
                {backups.length} bản
              </span>
            </div>
            <p className="text-xs text-[#74746E] mt-0.5">
              Bạn có thể tải file `.tar.gz` về máy tính bất cứ lúc nào hoặc xóa bản không cần thiết
            </p>
          </div>

          <Button
            type="button"
            onClick={handleRunBackupNow}
            disabled={isBackingUp}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-xs shrink-0"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang nén & sao lưu...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Sao lưu ngay lập tức
              </>
            )}
          </Button>
        </div>

        {backups.length === 0 ? (
          <div className="py-12 text-center text-[#74746E] text-xs">
            Chưa có bản sao lưu nào. Hãy bấm <strong>&ldquo;Sao lưu ngay lập tức&rdquo;</strong> ở trên để tạo bản đầu tiên!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E7E7E3] text-[#74746E] font-semibold">
                  <th className="pb-3 pr-4">Tên file bản sao lưu</th>
                  <th className="pb-3 px-4">Thời gian tạo</th>
                  <th className="pb-3 px-4">Dung lượng</th>
                  <th className="pb-3 px-4">Nơi lưu trữ</th>
                  <th className="pb-3 pl-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E7E3]">
                {backups.map((item) => (
                  <tr key={item.filename} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-medium text-[#111]">
                      <div className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="truncate max-w-[280px]">{item.filename}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#555] whitespace-nowrap">
                      {formatBackupDate(item.filename, item.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#111] whitespace-nowrap">
                      {item.sizeFormatted}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {item.onVps && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                            <HardDrive className="w-3 h-3" />
                            VPS
                          </span>
                        )}
                        {item.onGdrive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
                            <Cloud className="w-3 h-3" />
                            Drive
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {item.onVps && (
                          <a
                            href={`/api/admin/backup/download/${item.filename}`}
                            download
                            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#E7E7E3] text-[#111] hover:bg-white hover:border-[#111]/40 text-xs font-medium transition-all"
                            title="Tải file về máy tính"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải về
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteBackup(item.filename)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-all"
                          title="Xóa bản sao lưu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL KẾT NỐI GOOGLE DRIVE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl border border-[#E7E7E3] max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Cloud className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#111]">Kết nối Google Drive</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#74746E] hover:text-[#111]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl space-y-2 text-[#444]">
                <p className="font-semibold text-blue-900">Cách liên kết Google Drive bằng Token:</p>
                <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                  <li>
                    Bấm vào liên kết ủy quyền của Google bên dưới để đăng nhập tài khoản Drive của bạn.
                  </li>
                  <li>
                    Cấp quyền cho ứng dụng và copy chuỗi JSON mã Token nhận được.
                  </li>
                  <li>
                    Dán chuỗi Token vào ô bên dưới và bấm <strong>&ldquo;Xác thực & Kết nối&rdquo;</strong>.
                  </li>
                </ol>
              </div>

              <div>
                <a
                  href="https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=202264815644.apps.googleusercontent.com&redirect_uri=http%3A%2F%2F127.0.0.1%3A53682%2F&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&prompt=consent"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full h-10 bg-white border border-[#E7E7E3] hover:border-[#111]/40 rounded-xl font-medium text-[#111] shadow-2xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  Mở trang đăng nhập tài khoản Google Drive
                </a>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-[#111]">
                  Dán chuỗi Token hoặc Cấu hình JSON vào đây:
                </label>
                <textarea
                  rows={5}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder='{"access_token":"ya29...","token_type":"Bearer","refresh_token":"1//...","expiry":"..."}'
                  className="w-full p-3 font-mono text-[11px] bg-[#FAFAF8] border border-[#E7E7E3] rounded-xl text-[#111] focus:outline-none focus:border-[#111]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7E7E3]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleSaveDriveToken}
                disabled={isSavingToken}
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                {isSavingToken ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  "Xác thực & Kết nối"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
