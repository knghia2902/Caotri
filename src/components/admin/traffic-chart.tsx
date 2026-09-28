"use client";

import { useState } from "react";

export interface TrafficChartPoint {
  date: string;
  label: string;
  visitors: number;
  pageviews: number;
}

interface TrafficChartProps {
  data: TrafficChartPoint[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Tính giá trị lớn nhất của trục Y (ít nhất là 10 để lưới nhìn cân đối)
  const rawMax = Math.max(...data.map((d) => Math.max(d.visitors, d.pageviews)), 10);
  const chartMax = Math.ceil(rawMax / 10) * 10;

  const width = 650;
  const height = 230;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const numGridLines = 4;
  const gridSteps = Array.from({ length: numGridLines + 1 }, (_, i) => i);

  const columnWidth = chartWidth / data.length;
  const barWidth = 18; // chiều rộng của mỗi cột con
  const barGap = 4;

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
            const val = Math.round(chartMax * ratio);

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
                  {val}
                </text>
              </g>
            );
          })}

          {/* Các cột dữ liệu 7 ngày */}
          {data.map((point, index) => {
            const colCenterX = paddingLeft + index * columnWidth + columnWidth / 2;
            const visitorsX = colCenterX - barWidth - barGap / 2;
            const pageviewsX = colCenterX + barGap / 2;

            const visitorsHeight = chartMax > 0 ? (point.visitors / chartMax) * chartHeight : 0;
            const pageviewsHeight = chartMax > 0 ? (point.pageviews / chartMax) * chartHeight : 0;

            const visitorsY = paddingTop + chartHeight - visitorsHeight;
            const pageviewsY = paddingTop + chartHeight - pageviewsHeight;

            const isHovered = hoveredIndex === index;

            return (
              <g
                key={point.date}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Vùng cảm ứng hover rộng */}
                <rect
                  x={colCenterX - columnWidth / 2}
                  y={paddingTop}
                  width={columnWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Cột 1: Khách truy cập duy nhất (Unique Visitors) */}
                {visitorsHeight < 3 ? (
                  <rect
                    x={visitorsX}
                    y={paddingTop + chartHeight - 3}
                    width={barWidth}
                    height={3}
                    rx="1.5"
                    fill="#E7E7E3"
                  />
                ) : (
                  <rect
                    x={visitorsX}
                    y={visitorsY}
                    width={barWidth}
                    height={visitorsHeight}
                    rx="3"
                    fill={isHovered ? "#2563EB" : "#111111"}
                    className="transition-colors duration-150"
                  />
                )}

                {/* Cột 2: Lượt xem trang (Pageviews) */}
                {pageviewsHeight < 3 ? (
                  <rect
                    x={pageviewsX}
                    y={paddingTop + chartHeight - 3}
                    width={barWidth}
                    height={3}
                    rx="1.5"
                    fill="#E7E7E3"
                  />
                ) : (
                  <rect
                    x={pageviewsX}
                    y={pageviewsY}
                    width={barWidth}
                    height={pageviewsHeight}
                    rx="3"
                    fill={isHovered ? "#93C5FD" : "#A1A1AA"}
                    className="transition-colors duration-150"
                  />
                )}

                {/* Nhãn trục X: Ngày tháng */}
                <text
                  x={colCenterX}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={index === data.length - 1 ? "600" : "500"}
                  fill={index === data.length - 1 ? "#111111" : "#74746E"}
                >
                  {index === data.length - 1 ? "Hôm nay" : point.label}
                </text>

                {/* Tooltip khi hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.max(10, Math.min(width - 155, colCenterX - 75))}
                      y={Math.max(5, Math.min(visitorsY, pageviewsY) - 52)}
                      width={150}
                      height={46}
                      rx="6"
                      fill="#111111"
                      className="shadow-xl"
                    />
                    <text
                      x={Math.max(10, Math.min(width - 155, colCenterX - 75)) + 75}
                      y={Math.max(5, Math.min(visitorsY, pageviewsY) - 52) + 18}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {point.label} · {point.visitors} Khách duy nhất
                    </text>
                    <text
                      x={Math.max(10, Math.min(width - 155, colCenterX - 75)) + 75}
                      y={Math.max(5, Math.min(visitorsY, pageviewsY) - 52) + 34}
                      textAnchor="middle"
                      fill="#93C5FD"
                      fontSize="10"
                    >
                      {point.pageviews} Lượt xem trang
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
            <span>Khách duy nhất</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#A1A1AA]" />
            <span>Lượt xem trang</span>
          </div>
        </div>
      </div>
    </div>
  );
}
