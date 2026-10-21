"use server";

import os from "os";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { requireRole } from "@/lib/auth";

const execAsync = promisify(exec);

export interface VpsMetrics {
  disk: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    percent: number;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    percent: number;
    totalFormatted: string;
    usedFormatted: string;
    freeFormatted: string;
  };
  cpu: {
    cores: number;
    model: string;
    loadAvg: number[];
  };
  system: {
    hostname: string;
    platform: string;
    distro: string;
    uptimeFormatted: string;
    uptimeSeconds: number;
    nodeVersion: string;
  };
  uploads: {
    totalFiles: number;
    totalBytes: number;
    totalFormatted: string;
  };
  pm2Process?: {
    name: string;
    status: string;
    memoryFormatted: string;
    uptimeFormatted: string;
    restarts: number;
  };
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (d > 0) parts.push(`${d} ngày`);
  if (h > 0) parts.push(`${h} giờ`);
  parts.push(`${m} phút`);
  return parts.join(" ");
}

export async function getVpsMetricsAction(): Promise<{ success: boolean; data?: VpsMetrics; error?: string }> {
  try {
    await requireRole(["ADMIN"]);

    // 1. Đo dung lượng Disk
    let totalDisk = 0;
    let freeDisk = 0;
    let usedDisk = 0;

    try {
      const rootPath = process.platform === "win32" ? process.cwd() : "/";
      const stats = await fs.promises.statfs(rootPath);
      totalDisk = stats.blocks * stats.bsize;
      freeDisk = stats.bavail * stats.bsize;
      usedDisk = totalDisk - (stats.bfree * stats.bsize);
    } catch {
      // Fallback df command nếu statfs gặp lỗi
      try {
        const { stdout } = await execAsync("df -B1 / | tail -n 1");
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 4) {
          totalDisk = parseInt(parts[1], 10) || 0;
          usedDisk = parseInt(parts[2], 10) || 0;
          freeDisk = parseInt(parts[3], 10) || 0;
        }
      } catch {
        // ignore
      }
    }

    const diskPercent = totalDisk > 0 ? Math.min(100, Math.round((usedDisk / totalDisk) * 100)) : 0;

    // 2. Đo dung lượng RAM
    const totalMem = os.totalmem();
    let freeMem = os.freemem();
    let usedMem = totalMem - freeMem;

    // Trên Linux, đọc /proc/meminfo để lấy MemAvailable chính xác (bao gồm buffers/cache có thể giải phóng)
    try {
      if (process.platform === "linux" && fs.existsSync("/proc/meminfo")) {
        const meminfo = fs.readFileSync("/proc/meminfo", "utf8");
        const match = meminfo.match(/MemAvailable:\s+(\d+)\s+kB/);
        if (match && match[1]) {
          const availBytes = parseInt(match[1], 10) * 1024;
          freeMem = availBytes;
          usedMem = totalMem - freeMem;
        }
      }
    } catch {
      // ignore
    }

    const memPercent = totalMem > 0 ? Math.min(100, Math.round((usedMem / totalMem) * 100)) : 0;

    // 3. Thông tin CPU & Uptime
    const cpus = os.cpus() || [];
    const cpuModel = cpus[0]?.model || "Unknown CPU";
    const cpuCores = cpus.length;
    const loadAvg = os.loadavg();
    const uptimeSec = Math.floor(os.uptime());

    // 4. Đo thư mục hình ảnh uploads (để người dùng nắm bắt dung lượng ảnh)
    let uploadFilesCount = 0;
    let uploadTotalBytes = 0;

    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (fs.existsSync(uploadDir)) {
        const files = await fs.promises.readdir(uploadDir);
        for (const file of files) {
          if (file === ".gitkeep") continue;
          try {
            const stat = await fs.promises.stat(path.join(uploadDir, file));
            if (stat.isFile()) {
              uploadFilesCount++;
              uploadTotalBytes += stat.size;
            }
          } catch {
            // ignore individual stat error
          }
        }
      }
    } catch {
      // ignore
    }

    // 5. Kiểm tra PM2 Process nếu có
    let pm2Info: VpsMetrics["pm2Process"] = undefined;
    try {
      if (process.platform === "linux") {
        const { stdout } = await execAsync("pm2 jlist 2>/dev/null || true");
        const list = JSON.parse(stdout);
        const app = list.find((p: any) => p.name === "caotri-gear" || p.name === "caotri");
        if (app) {
          const pmUptimeSec = Math.floor((Date.now() - (app.pm2_env?.pm_uptime || Date.now())) / 1000);
          pm2Info = {
            name: app.name,
            status: app.pm2_env?.status || "online",
            memoryFormatted: formatBytes(app.monit?.memory || 0),
            uptimeFormatted: formatUptime(pmUptimeSec),
            restarts: app.pm2_env?.restart_time || 0,
          };
        }
      }
    } catch {
      // ignore
    }

    // 6. Tên bản phân phối Linux
    let distro = `${os.type()} ${os.release()}`;
    try {
      if (fs.existsSync("/etc/os-release")) {
        const osRel = fs.readFileSync("/etc/os-release", "utf8");
        const prettyMatch = osRel.match(/PRETTY_NAME="([^"]+)"/);
        if (prettyMatch && prettyMatch[1]) {
          distro = prettyMatch[1];
        }
      }
    } catch {
      // ignore
    }

    return {
      success: true,
      data: {
        disk: {
          totalBytes: totalDisk,
          usedBytes: usedDisk,
          freeBytes: freeDisk,
          percent: diskPercent,
          totalFormatted: formatBytes(totalDisk),
          usedFormatted: formatBytes(usedDisk),
          freeFormatted: formatBytes(freeDisk),
        },
        memory: {
          totalBytes: totalMem,
          usedBytes: usedMem,
          freeBytes: freeMem,
          percent: memPercent,
          totalFormatted: formatBytes(totalMem),
          usedFormatted: formatBytes(usedMem),
          freeFormatted: formatBytes(freeMem),
        },
        cpu: {
          cores: cpuCores,
          model: cpuModel,
          loadAvg: loadAvg.map((n) => parseFloat(n.toFixed(2))),
        },
        system: {
          hostname: os.hostname(),
          platform: os.platform(),
          distro,
          uptimeFormatted: formatUptime(uptimeSec),
          uptimeSeconds: uptimeSec,
          nodeVersion: process.version,
        },
        uploads: {
          totalFiles: uploadFilesCount,
          totalBytes: uploadTotalBytes,
          totalFormatted: formatBytes(uploadTotalBytes),
        },
        pm2Process: pm2Info,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Không thể lấy thông số hệ thống",
    };
  }
}
