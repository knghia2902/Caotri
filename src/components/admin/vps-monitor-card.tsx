"use client";

import { useState, useEffect } from "react";
import {
  HardDrive,
  Cpu,
  Server,
  Activity,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { getVpsMetricsAction, VpsMetrics } from "@/app/actions/system";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function VpsMonitorCard() {
  const [metrics, setMetrics] = useState<VpsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await getVpsMetricsAction();
      if (res.success && res.data) {
        setMetrics(res.data);
        if (isManual) toast.success("Đã làm mới thông số VPS!");
      } else if (isManual) {
        toast.error(res.error || "Không thể tải thông số VPS");
      }
    } catch {
      if (isManual) toast.error("Lỗi kết nối khi lấy thông số VPS");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Tự động cập nhật mỗi 30 giây
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-[#E7E7E3] animate-pulse">
        <div className="h-6 w-48 bg-zinc-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-zinc-100 rounded-xl" />
          <div className="h-28 bg-zinc-100 rounded-xl" />
          <div className="h-28 bg-zinc-100 rounded-xl" />
          <div className="h-28 bg-zinc-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-rose-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStatusBadge = (percent: number) => {
    if (percent >= 90) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Cảnh báo đầy
        </span>
      );
    }
    if (percent >= 75) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Khá cao
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Ổn định
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E7E7E3] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111]">Giám sát Tài nguyên VPS</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-[#74746E] mt-0.5">
              {metrics.system.distro} • Node {metrics.system.nodeVersion} • Uptime: {metrics.system.uptimeFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metrics.pm2Process && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#74746E] bg-[#FAFAFA] border border-[#E7E7E3] px-2.5 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PM2: <strong>{metrics.pm2Process.name}</strong> ({metrics.pm2Process.memoryFormatted})</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchMetrics(true)}
            disabled={refreshing}
            className="h-8 gap-1.5 text-xs border-[#E7E7E3]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Grid 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Ổ đĩa Disk */}
        <div className="p-4 rounded-xl border border-[#E7E7E3] bg-[#FAFAFA] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#74746E]">
              <HardDrive className="w-4 h-4 text-cyan-600" />
              <span>Ổ cứng (Disk)</span>
            </div>
            {getStatusBadge(metrics.disk.percent)}
          </div>

          <div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#111]">{metrics.disk.usedFormatted}</span>
              <span className="text-xs text-[#74746E]">/ {metrics.disk.totalFormatted}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(metrics.disk.percent)}`}
                style={{ width: `${metrics.disk.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#74746E] mt-2">
              <span>Còn trống: <strong className="text-emerald-700">{metrics.disk.freeFormatted}</strong></span>
              <span className="font-semibold">{metrics.disk.percent}%</span>
            </div>
          </div>
        </div>

        {/* 2. Bộ nhớ RAM */}
        <div className="p-4 rounded-xl border border-[#E7E7E3] bg-[#FAFAFA] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#74746E]">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Bộ nhớ (RAM)</span>
            </div>
            {getStatusBadge(metrics.memory.percent)}
          </div>

          <div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#111]">{metrics.memory.usedFormatted}</span>
              <span className="text-xs text-[#74746E]">/ {metrics.memory.totalFormatted}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(metrics.memory.percent)}`}
                style={{ width: `${metrics.memory.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#74746E] mt-2">
              <span>Khả dụng: <strong className="text-emerald-700">{metrics.memory.freeFormatted}</strong></span>
              <span className="font-semibold">{metrics.memory.percent}%</span>
            </div>
          </div>
        </div>

        {/* 3. CPU & Tải hệ thống */}
        <div className="p-4 rounded-xl border border-[#E7E7E3] bg-[#FAFAFA] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#74746E]">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Vi xử lý (CPU)</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-700 bg-zinc-200/80 px-2 py-0.5 rounded-full">
              {metrics.cpu.cores} Cores
            </span>
          </div>

          <div>
            <div className="mt-1">
              <span className="text-xl font-bold text-[#111]">{metrics.cpu.loadAvg[0] ?? 0}</span>
              <span className="text-xs text-[#74746E] ml-1.5">(Load 1m)</span>
            </div>

            <p className="text-[11px] text-[#74746E] truncate mt-2" title={metrics.cpu.model}>
              {metrics.cpu.model}
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#74746E] mt-2 pt-1 border-t border-zinc-200">
              <span>Load 5m: <strong>{metrics.cpu.loadAvg[1] ?? 0}</strong></span>
              <span>Load 15m: <strong>{metrics.cpu.loadAvg[2] ?? 0}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. Thư mục Hình ảnh Web */}
        <div className="p-4 rounded-xl border border-[#E7E7E3] bg-[#FAFAFA] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#74746E]">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Dung lượng Ảnh</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              WebP tối ưu
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold text-[#111]">{metrics.uploads.totalFormatted}</span>
              <span className="text-xs text-[#74746E]">/public/uploads</span>
            </div>

            <div className="w-full bg-zinc-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{
                  width: `${Math.min(100, Math.max(5, (metrics.uploads.totalBytes / (1024 * 1024 * 1024 * 2)) * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#74746E] mt-2">
              <span>Tổng cộng: <strong className="text-[#111]">{metrics.uploads.totalFiles} ảnh</strong></span>
              <span className="text-emerald-700 font-medium">Nén Sharp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
