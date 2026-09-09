"use client";

import { useState } from "react";
import { DailyRevenuePoint } from "@/lib/order-analytics";
import { formatPrice } from "@/lib/utils";

interface RevenueBarChartProps {
  data: DailyRevenuePoint[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Tính giá trị lớn nhất của trục Y (làm tròn lên nấc chẵn triệu)
  const maxVal = Math.max(...data.map((d) => d.totalRevenue), 1_000_000);
  const chartMax = Math.ceil(maxVal / 1_000_000) * 1_000_000;

  const width = 650;
  const height = 220;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const numGridLines = 4;
  const gridSteps = Array.from({ length: numGridLines + 1 }, (_, i) => i);

  const columnWidth = chartWidth / data.length;
  const barWidth = 34;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Lưới ngang (Grid lines) & Nhãn trục Y */}
          {gridSteps.map((step) => {
            const ratio = step / numGridLines;
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const val = chartMax * ratio;
            const label =
              val === 0
                ? "0"
                : val >= 1_000_000
                ? `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`
                : `${Math.round(val / 1_000)}k`;

            return (
              <g key={step}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E7E7E3"
                  strokeWidth="1"
                  strokeDasharray={step === 0 ? undefined : "3 3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#74746E"
                  className="font-mono"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Các cột dữ liệu 7 ngày */}
          {data.map((point, index) => {
            const x = paddingLeft + index * columnWidth + (columnWidth - barWidth) / 2;
            const barHeight = chartMax > 0 ? (point.totalRevenue / chartMax) * chartHeight : 0;
            const completedBarHeight =
              chartMax > 0 ? (point.completedRevenue / chartMax) * chartHeight : 0;
            const y = paddingTop + chartHeight - barHeight;
            const completedY = paddingTop + chartHeight - completedBarHeight;

            const isHovered = hoveredIndex === index;

            return (
              <g
                key={point.date}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Baseline nếu không có doanh thu */}
                {barHeight < 3 && (
                  <rect
                    x={x}
                    y={paddingTop + chartHeight - 3}
                    width={barWidth}
                    height={3}
                    rx="1.5"
                    fill="#E7E7E3"
                  />
                )}

                {/* Cột Tổng doanh thu (Đang xử lý / Tiềm năng) */}
                {barHeight >= 3 && (
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={isHovered ? "#555555" : "#74746E"}
                    className="transition-colors duration-200"
                    opacity={0.4}
                  />
                )}

                {/* Cột Doanh thu thực tế (COMPLETED) */}
                {completedBarHeight >= 3 && (
                  <rect
                    x={x}
                    y={completedY}
                    width={barWidth}
                    height={completedBarHeight}
                    rx="4"
                    fill={isHovered ? "#000000" : "#111111"}
                    className="transition-colors duration-200"
                  />
                )}

                {/* Nhãn trục X: Ngày tháng & Thứ */}
                <text
                  x={x + barWidth / 2}
                  y={height - 20}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight={point.dayOfWeek === "Hôm nay" ? "600" : "500"}
                  fill={point.dayOfWeek === "Hôm nay" ? "#111111" : "#74746E"}
                >
                  {point.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight={point.dayOfWeek === "Hôm nay" ? "600" : "400"}
                  fill={point.dayOfWeek === "Hôm nay" ? "#111111" : "#999994"}
                >
                  {point.dayOfWeek}
                </text>

                {/* Tooltip khi hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(width - 150, x - 50))}
                      y={Math.max(5, y - 55)}
                      width={140}
                      height={48}
                      rx="6"
                      fill="#111111"
                      className="shadow-xl"
                    />
                    <text
                      x={Math.max(10, Math.min(width - 150, x - 50)) + 70}
                      y={Math.max(5, y - 55) + 18}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {formatPrice(point.totalRevenue)}
                    </text>
                    <text
                      x={Math.max(10, Math.min(width - 150, x - 50)) + 70}
                      y={Math.max(5, y - 55) + 36}
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize="9.5"
                    >
                      {point.orderCount} đơn · Đã thu: {formatPrice(point.completedRevenue)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Chú thích biểu đồ (Legend) */}
        <div className="flex items-center justify-end gap-5 mt-2 text-xs text-[#74746E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#111111]" />
            <span>Doanh thu thực tế (COMPLETED)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#74746E] opacity-40" />
            <span>Doanh thu đang xử lý</span>
          </div>
        </div>
      </div>
    </div>
  );
}
