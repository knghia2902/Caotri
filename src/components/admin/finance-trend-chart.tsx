"use client";

import { useState } from "react";
import type { FinanceSeriesPoint } from "@/lib/finance-analytics";
import type { FinancePeriod } from "@/lib/date-vn";
import { formatPrice } from "@/lib/utils";

interface FinanceTrendChartProps {
  series: FinanceSeriesPoint[];
  period: FinancePeriod;
  anchorKey?: string;
}

type ChartMode = "pnl" | "cashflow";

function formatYAxis(val: number): string {
  if (val === 0) return "0";
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(val);
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)}k`;
  }
  return `${sign}${Math.round(abs)}`;
}

function niceCeil(val: number): number {
  if (val <= 0) return 1_000_000;
  if (val <= 500_000) return Math.ceil(val / 100_000) * 100_000;
  if (val <= 2_000_000) return Math.ceil(val / 500_000) * 500_000;
  if (val <= 10_000_000) return Math.ceil(val / 2_000_000) * 2_000_000;
  return Math.ceil(val / 5_000_000) * 5_000_000;
}

export function FinanceTrendChart({
  series,
  period,
  anchorKey,
}: FinanceTrendChartProps) {
  const [mode, setMode] = useState<ChartMode>("pnl");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const count = Math.max(series.length, 1);

  // Tính dải trục Y (hỗ trợ cả lợi nhuận ròng âm)
  let rawMax = 0;
  let rawMin = 0;
  for (const pt of series) {
    const v1 = mode === "pnl" ? pt.revenue : pt.cashIn;
    const v2 = mode === "pnl" ? pt.netProfit : pt.cashOut;
    if (v1 > rawMax) rawMax = v1;
    if (v2 > rawMax) rawMax = v2;
    if (v2 < rawMin) rawMin = v2;
  }

  const maxVal = niceCeil(rawMax);
  const minVal = rawMin < 0 ? -niceCeil(Math.abs(rawMin)) : 0;
  const totalSpan = maxVal - minVal || 1;

  // Chiều rộng động nếu nhiều ngày (VD: chế độ Tháng 28-31 ngày) để cuộn ngang mượt
  const isDense = count > 10;
  const paddingLeft = 56;
  const paddingRight = 20;
  const paddingTop = 28;
  const paddingBottom = 38;
  const height = 250;

  const slotWidth = isDense ? 34 : Math.max(70, Math.floor(600 / count));
  const width = Math.max(620, paddingLeft + paddingRight + count * slotWidth);
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const columnWidth = chartWidth / count;
  const barGap = isDense ? 2 : 5;
  const barWidth = isDense
    ? 10
    : Math.min(24, Math.max(12, Math.floor((columnWidth - 18) / 2)));

  const valueToY = (val: number) =>
    paddingTop + ((maxVal - val) / totalSpan) * chartHeight;
  const zeroY = valueToY(0);

  // Grid lines (4 bước phía trên 0, thêm 1 bước âm nếu minVal < 0)
  const gridValues: number[] = [];
  const posSteps = 4;
  for (let i = 0; i <= posSteps; i++) {
    gridValues.push((maxVal * i) / posSteps);
  }
  if (minVal < 0) {
    gridValues.unshift(minVal);
  }

  return (
    <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
      {/* Header + Metric toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#111]">
            {mode === "pnl"
              ? "Xu hướng Doanh thu & Lợi nhuận ròng"
              : "Xu hướng Dòng tiền Thu & Chi"}
          </h3>
          <p className="text-xs text-[#74746E] mt-0.5">
            {period === "day"
              ? "Diễn biến 7 ngày gần nhất kết thúc ở ngày đang chọn"
              : period === "week"
              ? "Diễn biến từng ngày trong tuần (Thứ 2 – Chủ Nhật)"
              : "Diễn biến từng ngày trong tháng (cuộn ngang để xem chi tiết)"}
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode("pnl")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "pnl"
                ? "bg-[#111] text-white"
                : "text-[#74746E] hover:text-[#111]"
            }`}
          >
            Doanh thu &amp; Lợi nhuận
          </button>
          <button
            type="button"
            onClick={() => setMode("cashflow")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === "cashflow"
                ? "bg-[#111] text-white"
                : "text-[#74746E] hover:text-[#111]"
            }`}
          >
            Thu &amp; Chi
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full overflow-x-auto pb-1">
        <div style={{ minWidth: isDense ? `${width}px` : "520px" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Gridlines & Y labels */}
            {gridValues.map((val, idx) => {
              const y = valueToY(val);
              const isZero = val === 0;
              return (
                <g key={`${val}-${idx}`}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={isZero ? "#D5D5D0" : "#E7E7E3"}
                    strokeWidth="1"
                    strokeDasharray={isZero ? undefined : "3 3"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#74746E"
                    className="font-mono"
                  >
                    {formatYAxis(val)}
                  </text>
                </g>
              );
            })}

            {/* Grouped Bars */}
            {series.map((point, index) => {
              const groupWidth = barWidth * 2 + barGap;
              const groupX =
                paddingLeft +
                index * columnWidth +
                (columnWidth - groupWidth) / 2;
              const bar1X = groupX;
              const bar2X = groupX + barWidth + barGap;

              const v1 = mode === "pnl" ? point.revenue : point.cashIn;
              const v2 = mode === "pnl" ? point.netProfit : point.cashOut;

              const y1 = valueToY(Math.max(0, v1));
              const h1 = Math.max(0, zeroY - y1);

              const y2 = v2 >= 0 ? valueToY(v2) : zeroY;
              const h2 = Math.abs(valueToY(v2) - zeroY);

              const isHovered = hoveredIndex === index;
              const isAnchor = period === "day" && anchorKey === point.key;

              const bar1Color =
                mode === "pnl"
                  ? isHovered
                    ? "#000000"
                    : "#111111"
                  : isHovered
                  ? "#188551"
                  : "#21A366";

              const bar2Color =
                mode === "pnl"
                  ? v2 >= 0
                    ? isHovered
                      ? "#188551"
                      : "#21A366"
                    : isHovered
                    ? "#B83737"
                    : "#D94A4A"
                  : isHovered
                  ? "#B83737"
                  : "#D94A4A";

              // X-axis label: ở chế độ tháng chỉ hiện các ngày lẻ/chẵn hợp lý hoặc DD
              const xLabel = isDense ? point.label.split("/")[0] : point.label;

              const tooltipWidth = 176;
              const tooltipHeight = 62;
              const tooltipX = Math.max(
                paddingLeft,
                Math.min(
                  width - paddingRight - tooltipWidth,
                  groupX + groupWidth / 2 - tooltipWidth / 2
                )
              );
              const topBarY = Math.min(y1, y2, zeroY);
              const tooltipY = Math.max(4, topBarY - tooltipHeight - 8);

              return (
                <g
                  key={point.key}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Hover column highlight */}
                  <rect
                    x={paddingLeft + index * columnWidth}
                    y={paddingTop}
                    width={columnWidth}
                    height={chartHeight}
                    fill={
                      isHovered
                        ? "#F3F3F1"
                        : isAnchor
                        ? "#F7F7F5"
                        : "transparent"
                    }
                    opacity={isHovered ? 0.75 : isAnchor ? 0.6 : 0}
                    rx="4"
                  />

                  {/* Bar 1 */}
                  {h1 >= 2 ? (
                    <rect
                      x={bar1X}
                      y={y1}
                      width={barWidth}
                      height={h1}
                      rx="3"
                      fill={bar1Color}
                      className="transition-colors duration-150"
                    />
                  ) : (
                    <rect
                      x={bar1X}
                      y={zeroY - 2}
                      width={barWidth}
                      height={2}
                      rx="1"
                      fill="#E7E7E3"
                    />
                  )}

                  {/* Bar 2 */}
                  {h2 >= 2 ? (
                    <rect
                      x={bar2X}
                      y={y2}
                      width={barWidth}
                      height={h2}
                      rx="3"
                      fill={bar2Color}
                      className="transition-colors duration-150"
                    />
                  ) : (
                    <rect
                      x={bar2X}
                      y={zeroY - 2}
                      width={barWidth}
                      height={2}
                      rx="1"
                      fill="#E7E7E3"
                    />
                  )}

                  {/* X-axis label */}
                  <text
                    x={groupX + groupWidth / 2}
                    y={height - 14}
                    textAnchor="middle"
                    fontSize={isDense ? "9.5" : "10.5"}
                    fontWeight={isAnchor || isHovered ? "600" : "500"}
                    fill={isAnchor || isHovered ? "#111111" : "#74746E"}
                  >
                    {xLabel}
                  </text>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <g pointerEvents="none">
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={tooltipWidth}
                        height={tooltipHeight}
                        rx="6"
                        fill="#111111"
                      />
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 16}
                        fill="#A3A39D"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {point.label} · {point.ordersCount} đơn
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 34}
                        fill="#FFFFFF"
                        fontSize="10.5"
                        fontWeight="600"
                      >
                        {mode === "pnl" ? "Doanh thu: " : "Tổng Thu: "}
                        {formatPrice(v1)}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 50}
                        fill={
                          mode === "pnl"
                            ? v2 >= 0
                              ? "#6EE7B7"
                              : "#FCA5A5"
                            : "#FCA5A5"
                        }
                        fontSize="10.5"
                        fontWeight="600"
                      >
                        {mode === "pnl" ? "Lợi nhuận: " : "Tổng Chi: "}
                        {formatPrice(v2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-end gap-4 mt-3 text-xs text-[#74746E]">
        {mode === "pnl" ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#111111]" />
              <span>Doanh thu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#21A366]" />
              <span>Lợi nhuận dương</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D94A4A]" />
              <span>Lợi nhuận âm</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#21A366]" />
              <span>Tổng Thu (IN)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D94A4A]" />
              <span>Tổng Chi (OUT)</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
