"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wallet,
  Package,
  Receipt,
  ShoppingBag,
  BarChart3,
  Info,
} from "lucide-react";
import type { FinanceAnalyticsResult } from "@/lib/finance-analytics";
import { formatPrice } from "@/lib/utils";
import { FinanceTrendChart } from "@/components/admin/finance-trend-chart";

interface FinanceAnalyticsViewProps {
  analytics: FinanceAnalyticsResult;
}

function ChangeBadge({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3F3F1] text-[#74746E]">
        Mới
      </span>
    );
  }
  const isUp = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
        isUp
          ? "bg-emerald-50 text-[#21A366]"
          : "bg-red-50 text-[#D94A4A]"
      }`}
    >
      {isUp ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isUp ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

const CHANNEL_BAR_COLORS: Record<string, string> = {
  WEB: "#111111",
  OFFLINE: "#21A366",
  ZALO: "#3B82F6",
  FACEBOOK: "#555550",
  OTHER: "#A3A39D",
};

export function FinanceAnalyticsView({ analytics }: FinanceAnalyticsViewProps) {
  const { range, series, channelMix } = analytics;

  // Tổng hợp dòng footer cho bảng chi tiết theo từng ngày
  const tableTotals = series.reduce(
    (acc, row) => ({
      ordersCount: acc.ordersCount + row.ordersCount,
      webRevenue: acc.webRevenue + row.webRevenue,
      offlineRevenue: acc.offlineRevenue + row.offlineRevenue,
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      grossProfit: acc.grossProfit + row.grossProfit,
      operatingExpenses: acc.operatingExpenses + row.operatingExpenses,
      netProfit: acc.netProfit + row.netProfit,
    }),
    {
      ordersCount: 0,
      webRevenue: 0,
      offlineRevenue: 0,
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0,
    }
  );

  const tableNetMargin =
    tableTotals.revenue > 0
      ? (tableTotals.netProfit / tableTotals.revenue) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Doanh thu thuần */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Doanh thu thuần
            </span>
            <ChangeBadge pct={analytics.revenueChangePct} />
          </div>
          <div className="text-2xl font-bold text-[#111] tracking-tight tabular-nums mt-2">
            {formatPrice(analytics.revenue)}
          </div>
          <div className="flex items-center justify-between text-xs text-[#74746E] tabular-nums mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            <span>Web: {formatPrice(analytics.webRevenue)}</span>
            <span>Ngoài: {formatPrice(analytics.offlineRevenue)}</span>
          </div>
        </div>

        {/* 2. Giá vốn (COGS) */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Giá vốn hàng bán (COGS)
            </span>
            <Package className="w-4 h-4 text-[#A3A39D]" />
          </div>
          <div className="text-2xl font-bold text-[#111] tracking-tight tabular-nums mt-2">
            {formatPrice(analytics.cogs)}
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            {analytics.missingCostItemsCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-[#D99A24] text-[11px] font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Còn {analytics.missingCostItemsCount} dòng SP chưa nhập giá vốn
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#74746E]">
                Tất cả sản phẩm đã bán đều có giá vốn
              </span>
            )}
          </div>
        </div>

        {/* 3. Lãi gộp */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Lãi gộp
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums bg-[#F3F3F1] text-[#111]">
              Biên {analytics.grossMarginPct.toFixed(1)}%
            </span>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight tabular-nums mt-2 ${
              analytics.grossProfit >= 0 ? "text-[#111]" : "text-[#D94A4A]"
            }`}
          >
            {formatPrice(analytics.grossProfit)}
          </div>
          <div className="text-xs text-[#74746E] mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            Doanh thu thuần − Giá vốn hàng bán
          </div>
        </div>

        {/* 4. Chi phí vận hành */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Chi phí vận hành
            </span>
            <Receipt className="w-4 h-4 text-[#A3A39D]" />
          </div>
          <div className="text-2xl font-bold text-[#D94A4A] tracking-tight tabular-nums mt-2">
            {formatPrice(analytics.operatingExpenses)}
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-[#74746E] mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#A3A39D]" />
            <span className="tabular-nums">
              Nhập hàng ({formatPrice(analytics.inventoryImportOut)}) được theo
              dõi ở Sổ Quỹ, không tính trùng vào đây.
            </span>
          </div>
        </div>

        {/* 5. Lợi nhuận ròng */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Lợi nhuận ròng
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums bg-[#F3F3F1] text-[#111]">
                {analytics.netMarginPct.toFixed(1)}%
              </span>
              <ChangeBadge pct={analytics.netProfitChangePct} />
            </div>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight tabular-nums mt-2 ${
              analytics.netProfit >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
            }`}
          >
            {analytics.netProfit > 0 ? "+" : ""}
            {formatPrice(analytics.netProfit)}
          </div>
          <div className="flex items-center justify-between text-xs text-[#74746E] tabular-nums mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            <span>Kỳ trước: {formatPrice(analytics.prevNetProfit)}</span>
            {analytics.otherIncome > 0 && (
              <span>Thu khác: +{formatPrice(analytics.otherIncome)}</span>
            )}
          </div>
        </div>

        {/* 6. Tổng đơn hoàn thành */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Tổng đơn hoàn thành
            </span>
            <ShoppingBag className="w-4 h-4 text-[#A3A39D]" />
          </div>
          <div className="text-2xl font-bold text-[#111] tracking-tight tabular-nums mt-2">
            {analytics.ordersCount.toLocaleString("vi-VN")}{" "}
            <span className="text-sm font-medium text-[#74746E]">đơn</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#74746E] tabular-nums mt-2.5 pt-2.5 border-t border-[#F3F3F1]">
            <span>
              Web:{" "}
              <strong className="text-[#111]">{analytics.webOrdersCount}</strong>
            </span>
            <span>
              Bán ngoài:{" "}
              <strong className="text-[#111]">
                {analytics.offlineOrdersCount}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Chart (2 cols) + Channel Mix (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FinanceTrendChart
            series={series}
            period={range.period}
            anchorKey={range.anchorKey}
          />
        </div>

        <div className="lg:col-span-1 rounded-[10px] bg-white border border-[#E7E7E3] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#111]">
                Tỷ trọng theo kênh bán
              </h3>
              <p className="text-xs text-[#74746E] mt-0.5">{range.label}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#74746E]" />
          </div>

          {channelMix.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="w-8 h-8 text-[#D5D5D0] mb-2" />
              <p className="text-xs text-[#74746E]">
                Chưa có đơn hàng hoàn thành trong kỳ này
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {channelMix.map((ch) => {
                const barColor = CHANNEL_BAR_COLORS[ch.channel] ?? "#111111";
                return (
                  <div key={ch.channel} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: barColor }}
                        />
                        <span className="font-semibold text-[#111] truncate">
                          {ch.label}
                        </span>
                        <span className="text-[#74746E]">
                          ({ch.ordersCount} đơn)
                        </span>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-[#111] shrink-0">
                        {ch.sharePct.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#F3F3F1] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(2, Math.min(100, ch.sharePct))}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div className="text-right text-[11px] font-medium tabular-nums text-[#74746E]">
                      {formatPrice(ch.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Cashflow note inside Channel Mix card */}
          <div className="mt-5 pt-4 border-t border-[#E7E7E3] flex items-center justify-between text-xs">
            <span className="text-[#74746E]">Dòng tiền ròng kỳ này</span>
            <span
              className={`font-bold tabular-nums ${
                analytics.netCashflow >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
              }`}
            >
              {analytics.netCashflow > 0 ? "+" : ""}
              {formatPrice(analytics.netCashflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown Table by Day/Bucket */}
      <div className="rounded-[10px] bg-white border border-[#E7E7E3] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E7E7E3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#111]">
              Bảng chi tiết Doanh thu &amp; Lợi nhuận theo ngày
            </h3>
            <p className="text-xs text-[#74746E] mt-0.5">
              {range.period === "day"
                ? "Hiển thị 7 ngày gần nhất để đối chiếu (ngày đang chọn được đánh dấu)"
                : `Tổng hợp chi tiết từng ngày trong ${range.label}`}
            </p>
          </div>
          <span className="text-xs text-[#74746E]">
            {series.length} ngày hiển thị
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E7E7E3] text-[11px] font-semibold uppercase tracking-wider text-[#74746E]">
                <th className="py-3 px-4 whitespace-nowrap">Thời gian</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Đơn</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  DT Web
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  DT Ngoài
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Doanh thu
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Giá vốn
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Lãi gộp
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Chi phí
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Lợi nhuận ròng
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Biên lãi %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F1]">
              {series.map((row) => {
                const margin =
                  row.revenue > 0 ? (row.netProfit / row.revenue) * 100 : 0;
                const isAnchor =
                  range.period === "day" && row.key === range.anchorKey;
                const hasActivity =
                  row.revenue > 0 ||
                  row.operatingExpenses > 0 ||
                  row.ordersCount > 0;

                return (
                  <tr
                    key={row.key}
                    className={`transition-colors hover:bg-[#FAFAFA] ${
                      isAnchor ? "bg-[#F7F7F5]" : ""
                    } ${!hasActivity ? "text-[#A3A39D]" : "text-[#111]"}`}
                  >
                    <td className="py-2.5 px-4 whitespace-nowrap font-medium">
                      <div className="flex items-center gap-2">
                        <span>{row.label}</span>
                        {isAnchor && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#111] text-white">
                            Đang xem
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                      {row.ordersCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                      {formatPrice(row.webRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                      {formatPrice(row.offlineRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs font-semibold">
                      {formatPrice(row.revenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-[#74746E]">
                      {formatPrice(row.cogs)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs">
                      {formatPrice(row.grossProfit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-xs text-[#D94A4A]">
                      {row.operatingExpenses > 0
                        ? `-${formatPrice(row.operatingExpenses)}`
                        : formatPrice(0)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono tabular-nums text-xs font-semibold ${
                        row.netProfit > 0
                          ? "text-[#21A366]"
                          : row.netProfit < 0
                          ? "text-[#D94A4A]"
                          : ""
                      }`}
                    >
                      {row.netProfit > 0 ? "+" : ""}
                      {formatPrice(row.netProfit)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs">
                      {row.revenue > 0 ? `${margin.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F7F7F5] border-t-2 border-[#E7E7E3] font-bold text-[#111]">
                <td className="py-3 px-4 whitespace-nowrap text-xs uppercase tracking-wider">
                  {range.period === "day" ? "Tổng 7 ngày" : "Tổng cộng"}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                  {tableTotals.ordersCount}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                  {formatPrice(tableTotals.webRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                  {formatPrice(tableTotals.offlineRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                  {formatPrice(tableTotals.revenue)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs text-[#555550]">
                  {formatPrice(tableTotals.cogs)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs">
                  {formatPrice(tableTotals.grossProfit)}
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-xs text-[#D94A4A]">
                  {tableTotals.operatingExpenses > 0
                    ? `-${formatPrice(tableTotals.operatingExpenses)}`
                    : formatPrice(0)}
                </td>
                <td
                  className={`py-3 px-3 text-right font-mono tabular-nums text-xs ${
                    tableTotals.netProfit >= 0
                      ? "text-[#21A366]"
                      : "text-[#D94A4A]"
                  }`}
                >
                  {tableTotals.netProfit > 0 ? "+" : ""}
                  {formatPrice(tableTotals.netProfit)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums text-xs">
                  {tableTotals.revenue > 0
                    ? `${tableNetMargin.toFixed(1)}%`
                    : "—"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
