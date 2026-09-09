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
          <Wrench className="w-4 h-4 text-[#111]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
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
            className="text-xs border-[#111]/30 text-[#111] hover:bg-blue-50 gap-1.5 h-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#111]" />
            Nạp mẫu gợi ý
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddRow}
            disabled={disabled}
            className="text-xs border-[#D5D5D0] hover:border-zinc-500 text-[#111] gap-1 h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm dòng
          </Button>
        </div>
      </div>

      {/* Specs rows table */}
      {entries.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-[#E7E7E3] bg-[#F7F7F5] text-[#74746E] text-xs">
          Chưa có thông số kỹ thuật nào. Bấm &quot;Nạp mẫu gợi ý&quot; hoặc &quot;Thêm dòng&quot; để thiết lập thông số cho sản phẩm.
        </div>
      ) : (
        <div className="rounded-xl border border-[#E7E7E3] overflow-hidden bg-[#F7F7F5] divide-y divide-[#E7E7E3]">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-white text-[11px] font-semibold uppercase tracking-wider text-[#74746E] border-b border-[#E7E7E3]">
            <div className="col-span-5 sm:col-span-4">Tên thông số (Key)</div>
            <div className="col-span-6 sm:col-span-7">Giá trị (Value)</div>
            <div className="col-span-1 text-right">Xóa</div>
          </div>

          {entries.map(([k, v], index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 p-2 items-center hover:bg-white transition-colors"
            >
              <div className="col-span-5 sm:col-span-4">
                <Input
                  value={k}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  placeholder="VD: Cảm biến, DPI..."
                  disabled={disabled}
                  className="h-8 text-xs bg-white border-[#E7E7E3] font-medium text-[#111]"
                />
              </div>
              <div className="col-span-6 sm:col-span-7">
                <Input
                  value={v}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="VD: PAW3395 26000 DPI..."
                  disabled={disabled}
                  className="h-8 text-xs bg-white border-[#E7E7E3] text-[#111]"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemoveRow(k)}
                  disabled={disabled}
                  title="Xóa dòng"
                  className="p-1 rounded text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50 transition-colors"
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
