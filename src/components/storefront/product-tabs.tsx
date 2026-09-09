"use client";

import { useState } from "react";
import { FileText, Cpu } from "lucide-react";

interface ProductTabsProps {
  description: string;
  specsJson?: string | null;
}

export function ProductTabs({ description, specsJson }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs">("desc");

  // Parse specs an toàn
  let specsList: [string, string][] = [];
  if (specsJson) {
    try {
      const parsed = JSON.parse(specsJson);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        specsList = Object.entries(parsed).map(([k, v]) => [k, String(v)]);
      } else if (Array.isArray(parsed)) {
        specsList = parsed.map((item, idx) => [
          item.key || item.name || `Thông số ${idx + 1}`,
          item.value || String(item),
        ]);
      }
    } catch {
      // Nếu không parse được dạng JSON, xem như chuỗi text
      if (specsJson.trim()) {
        specsList = [["Chi tiết kỹ thuật", specsJson]];
      }
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-2 sm:px-6 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("desc")}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "desc"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mô Tả Sản Phẩm</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === "specs"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Thông Số Kỹ Thuật</span>
          {specsList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-800 text-zinc-300">
              {specsList.length}
            </span>
          )}
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="p-6 sm:p-8">
        {activeTab === "desc" ? (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-cyan-400" />
              Tổng quan sản phẩm
            </h3>
            <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line space-y-4">
              {description}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-cyan-400" />
              Bảng thông số kỹ thuật chi tiết
            </h3>

            {specsList.length > 0 ? (
              <div className="rounded-xl border border-zinc-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody>
                    {specsList.map(([key, val], index) => (
                      <tr
                        key={index}
                        className="even:bg-zinc-900/60 odd:bg-zinc-950/40 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 sm:px-6 w-1/3 sm:w-2/5 font-medium text-zinc-400 border-r border-zinc-800/60">
                          {key}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-zinc-100 font-medium">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
                Thông số kỹ thuật chi tiết của sản phẩm này đang được nhân viên kỹ thuật cập nhật. Quý khách vui lòng liên hệ Zalo hoặc Hotline để được hỗ trợ tức thì!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
