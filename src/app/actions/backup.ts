"use server";

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const execAsync = promisify(exec);

const BACKUP_DIR = "/home/caotri/backups";
const SCRIPT_PATH = "/home/caotri/scripts/backup.sh";
const CONF_PATH = "/home/caotri/scripts/backup.conf";
const RCLONE_CONF_DIR = "/home/caotri/.config/rclone";
const RCLONE_CONF_FILE = path.join(RCLONE_CONF_DIR, "rclone.conf");

export interface BackupItem {
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  onVps: boolean;
  onGdrive: boolean;
}

export interface BackupConfig {
  backup_enabled: boolean;
  backup_time: string; // "02:00"
  backup_frequency: "daily" | "weekly";
  backup_max_copies: number; // 7
  backup_include_db: boolean;
  backup_include_uploads: boolean;
  backup_include_source: boolean;
  backup_upload_gdrive: boolean;
  gdrive_connected: boolean;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// 1. Lấy cấu hình Backup
export async function getBackupConfigAction(): Promise<BackupConfig> {
  await requireRole(["ADMIN"]);

  const settings = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "backup_" } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  // Kiểm tra rclone remote gdrive có tồn tại không
  let gdriveConnected = false;
  try {
    if (fs.existsSync(RCLONE_CONF_FILE)) {
      const confText = fs.readFileSync(RCLONE_CONF_FILE, "utf-8");
      if (confText.includes("[gdrive]") && confText.includes("type = drive")) {
        gdriveConnected = true;
      }
    }
  } catch {
    gdriveConnected = false;
  }

  return {
    backup_enabled: map["backup_enabled"] !== "false",
    backup_time: map["backup_time"] || "02:00",
    backup_frequency: (map["backup_frequency"] as "daily" | "weekly") || "daily",
    backup_max_copies: parseInt(map["backup_max_copies"] || "7", 10) || 7,
    backup_include_db: map["backup_include_db"] !== "false",
    backup_include_uploads: map["backup_include_uploads"] !== "false",
    backup_include_source: map["backup_include_source"] !== "false",
    backup_upload_gdrive: map["backup_upload_gdrive"] === "true",
    gdrive_connected: gdriveConnected,
  };
}

// 2. Lưu cấu hình Backup & đồng bộ Cronjob VPS
export async function saveBackupConfigAction(config: Partial<BackupConfig>) {
  await requireRole(["ADMIN"]);

  try {
    const keysToSave: Record<string, string> = {};
    if (config.backup_enabled !== undefined) keysToSave["backup_enabled"] = String(config.backup_enabled);
    if (config.backup_time !== undefined) keysToSave["backup_time"] = config.backup_time;
    if (config.backup_frequency !== undefined) keysToSave["backup_frequency"] = config.backup_frequency;
    if (config.backup_max_copies !== undefined) keysToSave["backup_max_copies"] = String(config.backup_max_copies);
    if (config.backup_include_db !== undefined) keysToSave["backup_include_db"] = String(config.backup_include_db);
    if (config.backup_include_uploads !== undefined) keysToSave["backup_include_uploads"] = String(config.backup_include_uploads);
    if (config.backup_include_source !== undefined) keysToSave["backup_include_source"] = String(config.backup_include_source);
    if (config.backup_upload_gdrive !== undefined) keysToSave["backup_upload_gdrive"] = String(config.backup_upload_gdrive);

    const ops = Object.entries(keysToSave).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await prisma.$transaction(ops);

    // Ghi file backup.conf trên VPS
    const maxCopies = config.backup_max_copies || 7;
    const includeDb = config.backup_include_db !== false;
    const includeUploads = config.backup_include_uploads !== false;
    const includeSource = config.backup_include_source !== false;
    const uploadGdrive = config.backup_upload_gdrive === true;

    const confContent = `MAX_COPIES=${maxCopies}\nINCLUDE_DB=${includeDb}\nINCLUDE_UPLOADS=${includeUploads}\nINCLUDE_SOURCE=${includeSource}\nUPLOAD_GDRIVE=${uploadGdrive}\n`;

    try {
      fs.writeFileSync(CONF_PATH, confContent, "utf-8");
    } catch (e) {
      console.warn("Could not write backup.conf:", e);
    }

    // Cập nhật crontab
    try {
      const isEnabled = config.backup_enabled !== false;
      const [hourStr, minStr] = (config.backup_time || "02:00").split(":");
      const hour = parseInt(hourStr || "2", 10) || 2;
      const min = parseInt(minStr || "0", 10) || 0;
      const frequency = config.backup_frequency || "daily";

      let cronTiming = `${min} ${hour} * * *`;
      if (frequency === "weekly") {
        cronTiming = `${min} ${hour} * * 0`; // Chủ nhật hàng tuần
      }

      const backupCmd = `${SCRIPT_PATH} >/home/caotri/backups/cron.log 2>&1`;

      if (isEnabled) {
        const updateCronCmd = `(crontab -l 2>/dev/null | grep -v "${SCRIPT_PATH}" ; echo "${cronTiming} ${backupCmd}") | crontab -`;
        await execAsync(updateCronCmd);
      } else {
        const removeCronCmd = `(crontab -l 2>/dev/null | grep -v "${SCRIPT_PATH}") | crontab -`;
        await execAsync(removeCronCmd);
      }
    } catch (e) {
      console.warn("Could not update crontab:", e);
    }

    revalidatePath("/admin/backups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lưu cấu hình sao lưu" };
  }
}

// 3. Lấy danh sách các bản sao lưu
export async function getBackupListAction(): Promise<BackupItem[]> {
  await requireRole(["ADMIN"]);

  const itemsMap: Map<string, BackupItem> = new Map();

  // Đọc danh sách trên VPS
  try {
    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR);
      for (const file of files) {
        if (file.startsWith("caotri_backup_") && file.endsWith(".tar.gz")) {
          const filePath = path.join(BACKUP_DIR, file);
          const stat = fs.statSync(filePath);
          itemsMap.set(file, {
            filename: file,
            size: stat.size,
            sizeFormatted: formatBytes(stat.size),
            createdAt: stat.mtime.toISOString(),
            onVps: true,
            onGdrive: false,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Error reading local backup files:", e);
  }

  // Đọc danh sách trên Google Drive (nếu rclone có kết nối)
  try {
    const { stdout } = await execAsync("rclone lsf --files-only gdrive:CaoTri_Backups/ 2>/dev/null || true");
    const gdriveFiles = stdout.split("\n").map((s) => s.trim()).filter(Boolean);

    for (const gfile of gdriveFiles) {
      if (gfile.startsWith("caotri_backup_") && gfile.endsWith(".tar.gz")) {
        const existing = itemsMap.get(gfile);
        if (existing) {
          existing.onGdrive = true;
        } else {
          // Chỉ có trên Google Drive
          itemsMap.set(gfile, {
            filename: gfile,
            size: 0,
            sizeFormatted: "Trên Cloud",
            createdAt: new Date().toISOString(),
            onVps: false,
            onGdrive: true,
          });
        }
      }
    }
  } catch {
    // rclone not configured or no connection
  }

  // Chuyển thành array sắp xếp mới nhất lên đầu
  const result = Array.from(itemsMap.values()).sort((a, b) => {
    return b.filename.localeCompare(a.filename);
  });

  return result;
}

// 4. Chạy sao lưu ngay lập tức
export async function runBackupNowAction() {
  await requireRole(["ADMIN"]);

  try {
    if (!fs.existsSync(SCRIPT_PATH)) {
      return { success: false, error: "Không tìm thấy file script sao lưu trên máy chủ!" };
    }

    // Thực thi script sao lưu
    const { stdout, stderr } = await execAsync(SCRIPT_PATH, { timeout: 300000 });
    revalidatePath("/admin/backups");
    return { success: true, message: "Đã tạo bản sao lưu thành công!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi thực hiện sao lưu" };
  }
}

// 5. Xóa bản sao lưu
export async function deleteBackupAction(filename: string) {
  await requireRole(["ADMIN"]);

  // Chống Directory Traversal
  if (!/^caotri_backup_\d+_\d+\.tar\.gz$/.test(filename)) {
    return { success: false, error: "Tên file không hợp lệ!" };
  }

  try {
    // Xóa file trên VPS
    const localPath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    // Xóa file trên Google Drive nếu có
    try {
      await execAsync(`rclone deletefile "gdrive:CaoTri_Backups/${filename}" 2>/dev/null || true`);
    } catch {
      // Ignore cloud delete error
    }

    revalidatePath("/admin/backups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Không thể xóa bản sao lưu" };
  }
}

// 6. Lưu cấu hình / Token Google Drive
export async function saveGoogleDriveConfigAction(input: string) {
  await requireRole(["ADMIN"]);

  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return { success: false, error: "Vui lòng nhập mã code hoặc token!" };
    }

    let tokenData: any = null;

    // Trường hợp 1: Nhập trực tiếp JSON Token (ví dụ từ rclone authorize)
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        tokenData = JSON.parse(trimmed);
      } catch {
        return { success: false, error: "Định dạng JSON Token không hợp lệ. Vui lòng kiểm tra lại!" };
      }
    } else {
      // Trường hợp 2: Người dùng copy cả link redirect URL hoặc mã code sau khi Google redirect
      let code = trimmed;
      if (trimmed.includes("code=")) {
        try {
          const url = new URL(trimmed.startsWith("http") ? trimmed : `http://127.0.0.1/?${trimmed}`);
          code = url.searchParams.get("code") || trimmed;
        } catch {
          const match = trimmed.match(/code=([^&]+)/);
          if (match) code = decodeURIComponent(match[1]);
        }
      }

      code = code.trim();

      // Đổi Authorization Code lấy OAuth Token từ Google API
      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code,
          client_id: "202264815644.apps.googleusercontent.com",
          client_secret: "X4Z3ca8xfWDb1Voo-F9a7ZxJ",
          redirect_uri: "http://127.0.0.1:53682/",
          grant_type: "authorization_code",
        }),
      });

      const tokenJson = await tokenResp.json();
      if (!tokenResp.ok || tokenJson.error) {
        const errMsg = tokenJson.error_description || tokenJson.error || "Mã code không hợp lệ hoặc đã hết hạn";
        return {
          success: false,
          error: `Google từ chối xác thực: ${errMsg}. Vui lòng bấm vào link đăng nhập lại để lấy mã mới!`,
        };
      }

      tokenData = {
        access_token: tokenJson.access_token,
        token_type: tokenJson.token_type || "Bearer",
        refresh_token: tokenJson.refresh_token,
        expiry: new Date(Date.now() + (tokenJson.expires_in || 3600) * 1000).toISOString(),
      };
    }

    if (!tokenData || (!tokenData.access_token && !tokenData.refresh_token)) {
      return { success: false, error: "Không tìm thấy access_token hoặc refresh_token trong dữ liệu xác thực." };
    }

    const rcloneConf = `[gdrive]\ntype = drive\nscope = drive\ntoken = ${JSON.stringify(tokenData)}\n`;

    if (!fs.existsSync(RCLONE_CONF_DIR)) {
      fs.mkdirSync(RCLONE_CONF_DIR, { recursive: true });
    }

    fs.writeFileSync(RCLONE_CONF_FILE, rcloneConf, "utf-8");

    // Kiểm tra kết nối
    try {
      await execAsync("rclone lsd gdrive: --timeout 10s");
    } catch (e: any) {
      return { success: false, error: "Đã lưu token nhưng không thể kết nối đến Google Drive. Vui lòng kiểm tra quyền truy cập!" };
    }

    await prisma.siteSetting.upsert({
      where: { key: "backup_upload_gdrive" },
      update: { value: "true" },
      create: { key: "backup_upload_gdrive", value: "true" },
    });

    revalidatePath("/admin/backups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cấu hình Google Drive" };
  }
}

// 7. Hủy liên kết Google Drive
export async function disconnectGoogleDriveAction() {
  await requireRole(["ADMIN"]);

  try {
    if (fs.existsSync(RCLONE_CONF_FILE)) {
      fs.unlinkSync(RCLONE_CONF_FILE);
    }

    await prisma.siteSetting.upsert({
      where: { key: "backup_upload_gdrive" },
      update: { value: "false" },
      create: { key: "backup_upload_gdrive", value: "false" },
    });

    revalidatePath("/admin/backups");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi hủy liên kết Google Drive" };
  }
}

// 8. Kiểm tra kết nối Google Drive
export async function testGoogleDriveConnectionAction() {
  await requireRole(["ADMIN"]);

  try {
    const { stdout } = await execAsync("rclone about gdrive: --json 2>/dev/null || rclone lsd gdrive: --timeout 10s");
    return { success: true, message: "Kết nối Google Drive hoạt động bình thường!" };
  } catch (error: any) {
    return { success: false, error: "Không thể kết nối đến Google Drive. Token có thể đã hết hạn hoặc bị hủy quyền." };
  }
}
