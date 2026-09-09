"use client";

import { Plus, Trash2, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSpecsPresetForCategory } from "@/lib/presets";
import { toast } from "sonner";

interface SpecsEditorProps {
  specs: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
  categorySlug?: string;
  disabled?: boolean;
}

export function SpecsEditor({
  specs,
  onChange,
  categorySlug,
  disabled = false,
}: SpecsEditorProps) {
  // Chuyển object sang array các cặp [key, value] để dễ biên tập
  const entries = Object.entries(specs);

  const handleKeyChange = (index: number, newKey: string) => {
    const updatedEntries: [string, string][] = entries.map(([k, v], i) => {
      if (i === index) return [newKey, v];
      return [k, v];
    });
    // Build object
    const obj: Record<string, string> = {};
    for (const [k, v] of updatedEntries) {
      obj[k] = v;
    }
    onChange(obj);
  };

  const handleValueChange = (index: number, newValue: string) => {
    const updatedEntries: [string, string][] = entries.map(([k, v], i) => {
      if (i === index) return [k, newValue];
      return [k, v];
    });
    const obj: Record<string, string> = {};
    for (const [k, v] of updatedEntries) {
      obj[k] = v;
    }
    onChange(obj);
  };

  const handleAddRow = () => {
    const defaultKey = `Thông số ${entries.length + 1}`;
    onChange({ ...specs, [defaultKey]: "" });
  };

  const handleRemoveRow = (keyToRemove: string) => {
    const next = { ...specs };
    delete next[keyToRemove];
    onChange(next);
  };

  const handleApplyPreset = () => {
    if (!categorySlug) {
      toast.error("Vui lòng chọn danh mục ở cột bên phải trước để áp dụng mẫu phù hợp");
      return;
    }

    const preset = getSpecsPresetForCategory(categorySlug);
    // Hỏi xác nhận nếu đã có thông số
    if (entries.length > 0) {
      if (
        !window.confirm(
          "Áp dụng mẫu gợi ý sẽ thêm các trường thông số tiêu chuẩn của ngành hàng này. Bạn có muốn tiếp tục?"
        )
      ) {
        return;
      }
    }

    onChange({
      ...preset,
      ...specs, // Giữ lại những trường người dùng đã nhập
    });
    toast.success("Đã áp dụng mẫu thông số kỹ thuật tiêu chuẩn");
  };

  return (
    <div className="space-y-3">
      {/* Action header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Thông số kỹ thuật (Tech Specs)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleApplyPreset}
            disabled={disabled}
            className="text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 gap-1.5 h-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Nạp mẫu gợi ý
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddRow}
            disabled={disabled}
            className="text-xs border-zinc-700 hover:border-zinc-500 text-zinc-200 gap-1 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm dòng
          </Button>
        </div>
      </div>

      {/* Specs rows table */}
      {entries.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 text-zinc-500 text-xs">
          Chưa có thông số kỹ thuật nào. Bấm &quot;Nạp mẫu gợi ý&quot; hoặc &quot;Thêm dòng&quot; để thiết lập thông số cho sản phẩm.
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/60 divide-y divide-zinc-800/60">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-zinc-900/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <div className="col-span-5 sm:col-span-4">Tên thông số (Key)</div>
            <div className="col-span-6 sm:col-span-7">Giá trị (Value)</div>
            <div className="col-span-1 text-right">Xóa</div>
          </div>

          {entries.map(([k, v], index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-zinc-900/40 transition-colors"
            >
              <div className="col-span-5 sm:col-span-4">
                <Input
                  value={k}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  placeholder="VD: Cảm biến, DPI..."
                  disabled={disabled}
                  className="h-8 text-xs bg-zinc-900 border-zinc-700/60 font-medium text-zinc-200"
                />
              </div>
              <div className="col-span-6 sm:col-span-7">
                <Input
                  value={v}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="VD: PAW3395 26000 DPI..."
                  disabled={disabled}
                  className="h-8 text-xs bg-zinc-900 border-zinc-700/60 text-zinc-300"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(k)}
                  disabled={disabled}
                  title="Xóa dòng"
                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
