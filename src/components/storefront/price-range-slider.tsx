"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  currentMin?: number;
  currentMax?: number;
  onApply: (min: number, max: number) => void;
}

export function PriceRangeSlider({
  min = 0,
  max = 10000000,
  currentMin = 0,
  currentMax = 10000000,
  onApply,
}: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState<number>(currentMin);
  const [maxVal, setMaxVal] = useState<number>(currentMax);

  useEffect(() => {
    setMinVal(currentMin);
    setMaxVal(currentMax);
  }, [currentMin, currentMax]);

  const handleApply = () => {
    onApply(Math.min(minVal, maxVal), Math.max(minVal, maxVal));
  };

  const handlePreset = (pMin: number, pMax: number) => {
    setMinVal(pMin);
    setMaxVal(pMax);
    onApply(pMin, pMax);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#74746E]">
        <span className="uppercase tracking-wider">Khoảng giá</span>
      </div>

      {/* Dual Slider Input */}
      <div className="relative pt-2 pb-1">
        <input
          type="range"
          min={min}
          max={max}
          step={50000}
          value={minVal}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val <= maxVal) setMinVal(val);
          }}
          className="w-full accent-[#111] cursor-pointer h-1 bg-[#E7E7E3] rounded-full appearance-none"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50000}
          value={maxVal}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= minVal) setMaxVal(val);
          }}
          className="w-full accent-[#111] cursor-pointer h-1 bg-[#E7E7E3] rounded-full appearance-none mt-3"
        />
      </div>

      {/* Direct Value Inputs */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block text-xs text-[#74746E] mb-1.5">Từ (VNĐ)</label>
          <input
            type="number"
            value={minVal}
            onChange={(e) => setMinVal(Number(e.target.value) || 0)}
            step={50000}
            className="w-full h-10 px-3 rounded-lg bg-white border border-[#D5D5D0] text-[#111] text-sm focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-[#74746E] mb-1.5">Đến (VNĐ)</label>
          <input
            type="number"
            value={maxVal}
            onChange={(e) => setMaxVal(Number(e.target.value) || 0)}
            step={50000}
            className="w-full h-10 px-3 rounded-lg bg-white border border-[#D5D5D0] text-[#111] text-sm focus:outline-none focus:border-[#111] transition-colors"
          />
        </div>
      </div>

      {/* Quick Budget Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => handlePreset(0, 500000)}
          className="px-3 py-1.5 rounded-md border border-[#D5D5D0] text-[#555550] text-xs hover:bg-[#F3F3F1] active:bg-[#111] active:text-white transition-colors"
        >
          &lt; 500k
        </button>
        <button
          type="button"
          onClick={() => handlePreset(500000, 1500000)}
          className="px-3 py-1.5 rounded-md border border-[#D5D5D0] text-[#555550] text-xs hover:bg-[#F3F3F1] active:bg-[#111] active:text-white transition-colors"
        >
          500k - 1.5tr
        </button>
        <button
          type="button"
          onClick={() => handlePreset(1500000, 3000000)}
          className="px-3 py-1.5 rounded-md border border-[#D5D5D0] text-[#555550] text-xs hover:bg-[#F3F3F1] active:bg-[#111] active:text-white transition-colors"
        >
          1.5tr - 3tr
        </button>
        <button
          type="button"
          onClick={() => handlePreset(3000000, 10000000)}
          className="px-3 py-1.5 rounded-md border border-[#D5D5D0] text-[#555550] text-xs hover:bg-[#F3F3F1] active:bg-[#111] active:text-white transition-colors"
        >
          &gt; 3tr
        </button>
      </div>

      <button
        type="button"
        onClick={handleApply}
        className="w-full bg-[#111] text-white h-11 px-[18px] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity mt-2"
      >
        Áp dụng giá
      </button>
    </div>
  );
}
