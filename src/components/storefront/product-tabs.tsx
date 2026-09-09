"use client";

import { useState } from "react";

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
    <div className="w-full">
      {/* Header Tabs */}
      <div className="flex border-b border-[#E7E7E3]">
        <button
          type="button"
          onClick={() => setActiveTab("desc")}
          className={`flex items-center gap-2 px-6 py-4 text-sm transition-all duration-200 ${
            activeTab === "desc"
              ? "border-b-2 border-[#111] text-[#111] font-semibold"
              : "border-b-2 border-transparent text-[#74746E] hover:text-[#111]"
          }`}
        >
          <span>Mô tả</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-2 px-6 py-4 text-sm transition-all duration-200 ${
            activeTab === "specs"
              ? "border-b-2 border-[#111] text-[#111] font-semibold"
              : "border-b-2 border-transparent text-[#74746E] hover:text-[#111]"
          }`}
        >
          <span>Thông số kỹ thuật</span>
          {specsList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-[#F3F3F1] text-[#74746E]">
              {specsList.length}
            </span>
          )}
        </button>
      </div>

      {/* Nội dung Tab */}
      <div className="py-8">
        {activeTab === "desc" ? (
          <div className="space-y-4">
            <div className="text-sm text-[#555550] leading-relaxed whitespace-pre-line space-y-4">
              {description}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {specsList.length > 0 ? (
              <div className="w-full border border-[#E7E7E3] rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#FAFAFA] border-b border-[#E7E7E3]">
                    <tr>
                      <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-[#111] w-1/3 sm:w-2/5 border-r border-[#E7E7E3]">Thông số</th>
                      <th className="py-3 px-4 sm:px-6 text-xs font-semibold text-[#111]">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specsList.map(([key, val], index) => (
                      <tr
                        key={index}
                        className="even:bg-white odd:bg-[#FAFAFA] border-b border-[#E7E7E3] last:border-b-0"
                        style={{ height: '56px' }}
                      >
                        <td className="py-3 px-4 sm:px-6 w-1/3 sm:w-2/5 text-sm text-[#74746E] border-r border-[#E7E7E3]">
                          {key}
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-sm text-[#111] font-medium">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-[#74746E] text-sm">
                Thông số kỹ thuật chi tiết của sản phẩm này đang được cập nhật.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
