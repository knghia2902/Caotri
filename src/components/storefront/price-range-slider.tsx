"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
        <span>Khoảng giá</span>
        <span className="font-mono text-cyan-400">
          {formatPrice(minVal)} - {formatPrice(maxVal)}
        </span>
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
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
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
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none mt-2"
        />
      </div>

      {/* Direct Value Inputs */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-[10px] text-zinc-500 mb-1">Từ (VNĐ)</label>
          <input
            type="number"
            value={minVal}
            onChange={(e) => setMinVal(Number(e.target.value) || 0)}
            step={50000}
            className="w-full h-8 px-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-zinc-500 mb-1">Đến (VNĐ)</label>
          <input
            type="number"
            value={maxVal}
            onChange={(e) => setMaxVal(Number(e.target.value) || 0)}
            step={50000}
            className="w-full h-8 px-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Quick Budget Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => handlePreset(0, 500000)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-400 hover:text-cyan-300 transition-colors"
        >
          &lt; 500k
        </button>
        <button
          type="button"
          onClick={() => handlePreset(500000, 1500000)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-400 hover:text-cyan-300 transition-colors"
        >
          500k - 1.5tr
        </button>
        <button
          type="button"
          onClick={() => handlePreset(1500000, 3000000)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-400 hover:text-cyan-300 transition-colors"
        >
          1.5tr - 3tr
        </button>
        <button
          type="button"
          onClick={() => handlePreset(3000000, 10000000)}
          className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-[10px] text-zinc-400 hover:text-cyan-300 transition-colors"
        >
          &gt; 3tr
        </button>
      </div>

      <Button
        type="button"
        size="sm"
        variant="neon"
        onClick={handleApply}
        className="w-full h-8 text-xs font-semibold mt-2"
      >
        Áp dụng lọc giá
      </Button>
    </div>
  );
}
