"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Loader2,
  Sliders,
  Code,
  List,
  AlertCircle,
  Search,
  DollarSign,
  Link as LinkIcon,
  HelpCircle,
  Tag,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CategoryMegaMenuConfig,
  SubMenuGroup,
  SubMenuLink,
} from "@/lib/mega-menu-data";
import {
  getMegaMenuConfigAction,
  saveMegaMenuConfigAction,
  resetMegaMenuConfigAction,
} from "@/app/actions/mega-menu";

interface MegaMenuConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  onSuccess?: () => void;
}

// Preset các mốc giá phổ biến cho gaming gear
const PRICE_PRESETS = [
  { label: "Dưới 500 nghìn", maxPrice: "500000", minPrice: "", desc: "Dưới 500.000đ" },
  { label: "500 nghìn đến 1 triệu", minPrice: "500000", maxPrice: "1000000", desc: "500.000đ - 1.000.000đ" },
  { label: "1 triệu đến 2 triệu", minPrice: "1000000", maxPrice: "2000000", desc: "1.000.000đ - 2.000.000đ" },
  { label: "2 triệu đến 3 triệu", minPrice: "2000000", maxPrice: "3000000", desc: "2.000.000đ - 3.000.000đ" },
  { label: "3 triệu đến 4 triệu", minPrice: "3000000", maxPrice: "4000000", desc: "3.000.000đ - 4.000.000đ" },
  { label: "Trên 2 triệu", minPrice: "2000000", maxPrice: "", desc: "Từ 2.000.000đ trở lên" },
  { label: "Trên 3 triệu", minPrice: "3000000", maxPrice: "", desc: "Từ 3.000.000đ trở lên" },
  { label: "Trên 4 triệu", minPrice: "4000000", maxPrice: "", desc: "Từ 4.000.000đ trở lên" },
];

/**
 * Phân tích URL để hiển thị trực quan cho người dùng không cần biết code
 */
function inspectLink(href: string, categorySlug: string, label: string) {
  if (!href) {
    return {
      type: "search" as const,
      summary: `Tự động tìm kiếm sản phẩm chứa: "${label || "..."}"`,
      param: label,
    };
  }

  try {
    if (href.includes("minPrice") || href.includes("maxPrice")) {
      const u = new URL(href, "http://localhost");
      const min = u.searchParams.get("minPrice");
      const max = u.searchParams.get("maxPrice");
      let priceText = "";
      if (min && max) {
        priceText = `${Number(min).toLocaleString("vi-VN")}đ - ${Number(max).toLocaleString("vi-VN")}đ`;
      } else if (min) {
        priceText = `Từ ${Number(min).toLocaleString("vi-VN")}đ trở lên`;
      } else if (max) {
        priceText = `Dưới ${Number(max).toLocaleString("vi-VN")}đ`;
      }
      return {
        type: "price" as const,
        summary: `Lọc sản phẩm theo giá: ${priceText}`,
        min: min || "",
        max: max || "",
      };
    }

    if (href.includes("search=")) {
      const u = new URL(href, "http://localhost");
      const q = u.searchParams.get("search") || "";
      return {
        type: "search" as const,
        summary: `Tìm kiếm sản phẩm chứa từ khóa: "${q}"`,
        param: q,
      };
    }

    return {
      type: "custom" as const,
      summary: `Đường dẫn riêng: ${href}`,
      url: href,
    };
  } catch {
    return {
      type: "custom" as const,
      summary: href,
      url: href,
    };
  }
}

export function MegaMenuConfigModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: MegaMenuConfigModalProps) {
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [editMode, setEditMode] = useState<"visual" | "json">("visual");
  const [config, setConfig] = useState<CategoryMegaMenuConfig | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSaving] = useTransition();

  // Expanded items for advanced custom URL editing
  const [expandedCustomUrls, setExpandedCustomUrls] = useState<Record<string, boolean>>({});

  // Price picker dropdown state
  const [pricePickerTarget, setPricePickerTarget] = useState<{
    colIdx: number;
    grpIdx: number;
    itemIdx?: number;
  } | null>(null);

  // Load config when opening modal
  useEffect(() => {
    if (isOpen && category) {
      setIsLoading(true);
      setJsonError(null);
      setExpandedCustomUrls({});
      setPricePickerTarget(null);
      getMegaMenuConfigAction(category.slug, category.name)
        .then((res) => {
          setConfig(res.config);
          setJsonText(JSON.stringify(res.config, null, 2));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setConfig(null);
      setJsonText("");
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  // Sync JSON when switching tabs
  const handleSwitchToJSON = () => {
    if (config) {
      setJsonText(JSON.stringify(config, null, 2));
      setJsonError(null);
    }
    setEditMode("json");
  };

  const handleSwitchToVisual = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
      setJsonError(null);
      setEditMode("visual");
    } catch (err: any) {
      setJsonError("Cú pháp JSON không hợp lệ: " + err.message);
    }
  };

  // Helper: Update group title
  const handleUpdateGroupTitle = (
    colIdx: number,
    grpIdx: number,
    title: string
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].title = title;
    setConfig(newConfig);
  };

  // Helper: Update item label - AUTO update search link if it's in search mode!
  const handleUpdateItemLabel = (
    colIdx: number,
    grpIdx: number,
    itemIdx: number,
    newLabel: string
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    const item = newConfig.columns[colIdx].groups[grpIdx].items[itemIdx];
    const prevInfo = inspectLink(item.href, category.slug, item.label);

    item.label = newLabel;

    // Nếu mục này đang dùng chế độ tìm kiếm theo tên, tự động cập nhật link luôn mà người dùng không cần gõ!
    if (prevInfo.type === "search" || !item.href) {
      item.href = newLabel.trim()
        ? `/category/${category.slug}?search=${encodeURIComponent(newLabel.trim())}`
        : `/category/${category.slug}`;
    }

    setConfig(newConfig);
  };

  // Helper: Manually update custom href
  const handleUpdateCustomHref = (
    colIdx: number,
    grpIdx: number,
    itemIdx: number,
    newHref: string
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].items[itemIdx].href = newHref;
    setConfig(newConfig);
  };

  // Helper: Add keyword/brand item
  const handleAddKeywordItem = (colIdx: number, grpIdx: number, presetName?: string) => {
    if (!config) return;
    const newConfig = { ...config };
    const label = presetName || "Mục mới";
    newConfig.columns[colIdx].groups[grpIdx].items.push({
      label,
      href: `/category/${category.slug}?search=${encodeURIComponent(label)}`,
    });
    setConfig(newConfig);
  };

  // Helper: Apply price preset to existing or new item
  const handleApplyPricePreset = (
    colIdx: number,
    grpIdx: number,
    preset: typeof PRICE_PRESETS[0],
    itemIdx?: number
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    const params = new URLSearchParams();
    if (preset.minPrice) params.set("minPrice", preset.minPrice);
    if (preset.maxPrice) params.set("maxPrice", preset.maxPrice);
    const href = `/category/${category.slug}?${params.toString()}`;

    if (itemIdx !== undefined && newConfig.columns[colIdx]?.groups[grpIdx]?.items[itemIdx]) {
      newConfig.columns[colIdx].groups[grpIdx].items[itemIdx].label = preset.label;
      newConfig.columns[colIdx].groups[grpIdx].items[itemIdx].href = href;
    } else {
      newConfig.columns[colIdx].groups[grpIdx].items.push({
        label: preset.label,
        href,
      });
    }

    setConfig(newConfig);
    setPricePickerTarget(null);
  };

  // Helper: Remove item
  const handleRemoveItem = (colIdx: number, grpIdx: number, itemIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].items.splice(itemIdx, 1);
    setConfig(newConfig);
  };

  // Helper: Add custom group
  const handleAddGroup = (colIdx: number, title = "Nhóm tiêu đề mới") => {
    if (!config) return;
    const newConfig = { ...config };
    if (!newConfig.columns[colIdx]) {
      newConfig.columns[colIdx] = { groups: [] };
    }
    newConfig.columns[colIdx].groups.push({
      title,
      href: `/category/${category.slug}`,
      items: [
        {
          label: "Ví dụ 1",
          href: `/category/${category.slug}?search=Ví dụ 1`,
        },
      ],
    });
    setConfig(newConfig);
  };

  // Helper: Add price group template
  const handleAddPriceGroupTemplate = (colIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    if (!newConfig.columns[colIdx]) {
      newConfig.columns[colIdx] = { groups: [] };
    }
    newConfig.columns[colIdx].groups.push({
      title: `${category.name} theo mức giá`,
      href: `/category/${category.slug}`,
      items: [
        { label: "Dưới 1 triệu", href: `/category/${category.slug}?maxPrice=1000000` },
        { label: "1 triệu đến 2 triệu", href: `/category/${category.slug}?minPrice=1000000&maxPrice=2000000` },
        { label: "2 triệu đến 3 triệu", href: `/category/${category.slug}?minPrice=2000000&maxPrice=3000000` },
        { label: "Trên 3 triệu", href: `/category/${category.slug}?minPrice=3000000` },
      ],
    });
    setConfig(newConfig);
  };

  // Helper: Remove group
  const handleRemoveGroup = (colIdx: number, grpIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups.splice(grpIdx, 1);
    setConfig(newConfig);
  };

  // Helper: Save config
  const handleSave = () => {
    let finalConfig = config;
    if (editMode === "json") {
      try {
        finalConfig = JSON.parse(jsonText);
      } catch (err: any) {
        toast.error("JSON không hợp lệ: " + err.message);
        return;
      }
    }

    if (!finalConfig) return;

    startSaving(async () => {
      const res = await saveMegaMenuConfigAction(category.slug, finalConfig!);
      if (res.success) {
        toast.success(`Đã lưu cấu hình menu con cho "${category.name}"`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Không thể lưu cấu hình");
      }
    });
  };

  // Helper: Reset config to system default
  const handleReset = () => {
    if (
      !confirm(
        `Khôi phục menu con của "${category.name}" về thiết lập mặc định ban đầu?`
      )
    ) {
      return;
    }

    startSaving(async () => {
      const res = await resetMegaMenuConfigAction(category.slug, category.name);
      if (res.success && res.config) {
        setConfig(res.config);
        setJsonText(JSON.stringify(res.config, null, 2));
        toast.success("Đã khôi phục về thiết lập mặc định");
        if (onSuccess) onSuccess();
      } else {
        toast.error("Không thể khôi phục mặc định");
      }
    });
  };

  // Ensure 4 columns exist
  const currentColumns = config?.columns || [];
  while (currentColumns.length < 4) {
    currentColumns.push({ groups: [] });
  }

  const currentCol = currentColumns[activeColIndex] || { groups: [] };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Cấu hình Menu con</span>
                <span className="text-cyan-400 font-normal text-sm">
                  ({category.name})
                </span>
              </h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Chỉ cần nhập tên nhãn / hãng, hệ thống sẽ <strong>tự động tạo đường dẫn</strong> chuẩn xác!</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700 text-xs">
              <button
                type="button"
                onClick={handleSwitchToVisual}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  editMode === "visual"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Dễ dùng</span>
              </button>
              <button
                type="button"
                onClick={handleSwitchToJSON}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  editMode === "json"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Mã JSON</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm">Đang nạp cấu hình menu con...</p>
            </div>
          ) : editMode === "json" ? (
            /* JSON Code Editor Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Chỉnh sửa trực tiếp dưới dạng JSON (dành cho người am hiểu kỹ thuật)</span>
                <span className="font-mono text-cyan-400">CategoryMegaMenuConfig</span>
              </div>
              {jsonError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={18}
                className="w-full font-mono text-xs p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          ) : (
            /* Visual Interactive Editor Tab */
            <div className="space-y-6">
              {/* Column selector tabs */}
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                {[0, 1, 2, 3].map((colIndex) => {
                  const grpCount = config?.columns[colIndex]?.groups.length || 0;
                  const isSelected = activeColIndex === colIndex;
                  return (
                    <button
                      key={colIndex}
                      type="button"
                      onClick={() => {
                        setActiveColIndex(colIndex);
                        setPricePickerTarget(null);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-zinc-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                      }`}
                    >
                      <span>Cột {colIndex + 1}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {grpCount} nhóm
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Groups in the active column */}
              <div className="space-y-6">
                {currentCol.groups.length === 0 ? (
                  <div className="p-10 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-4">
                    <p className="text-sm text-zinc-400">
                      Cột {activeColIndex + 1} hiện đang trống. Hãy chọn một mẫu nhóm bên dưới để thêm nhanh:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGroup(activeColIndex, "Thương hiệu nổi bật")}
                        className="border-zinc-700 bg-zinc-800 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-400 text-xs"
                      >
                        <Tag className="w-3.5 h-3.5 mr-1.5" />
                        <span>+ Thêm nhóm Thương hiệu</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPriceGroupTemplate(activeColIndex)}
                        className="border-zinc-700 bg-zinc-800 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400 text-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                        <span>+ Thêm nhóm Lọc theo mức giá</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddGroup(activeColIndex, "Kiểu kết nối")}
                        className="border-zinc-700 bg-zinc-800 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-400 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        <span>+ Thêm nhóm Kiểu kết nối</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentCol.groups.map((group, grpIdx) => (
                    <div
                      key={grpIdx}
                      className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4 shadow-sm"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
                        <div className="flex-1 max-w-lg">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                            <span>Tiêu đề nhóm</span>
                            <span className="text-zinc-500 font-normal lowercase">(hiển thị in đậm trên menu)</span>
                          </label>
                          <Input
                            value={group.title}
                            onChange={(e) =>
                              handleUpdateGroupTitle(
                                activeColIndex,
                                grpIdx,
                                e.target.value
                              )
                            }
                            placeholder="Ví dụ: Thương hiệu tai nghe, Tai nghe theo giá..."
                            className="bg-zinc-900 border-zinc-700 font-semibold text-zinc-100 text-sm h-10"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveGroup(activeColIndex, grpIdx)
                          }
                          className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-5 text-xs"
                          title="Xóa toàn bộ nhóm này"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span>Xóa nhóm</span>
                        </Button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            Các mục con ({group.items.length} mục):
                          </label>
                          <span className="text-[11px] text-zinc-500">
                            💡 Gõ tên nhãn bên dưới, link sẽ tự động cập nhật
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {group.items.map((item, itemIdx) => {
                            const linkInfo = inspectLink(item.href, category.slug, item.label);
                            const isUrlExpanded = expandedCustomUrls[`${activeColIndex}-${grpIdx}-${itemIdx}`];

                            return (
                              <div
                                key={itemIdx}
                                className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/90 space-y-2 hover:border-zinc-700 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {/* Item Label input */}
                                  <div className="flex-1">
                                    <Input
                                      value={item.label}
                                      onChange={(e) =>
                                        handleUpdateItemLabel(
                                          activeColIndex,
                                          grpIdx,
                                          itemIdx,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Tên mục hiển thị (vd: ASUS, Razer, Dưới 1 triệu...)"
                                      className="h-9 bg-zinc-950 border-zinc-700 text-sm font-medium text-zinc-100"
                                    />
                                  </div>

                                  {/* Quick Link Type Badge / Selector */}
                                  <div className="shrink-0 flex items-center gap-1.5">
                                    {/* Price preset button */}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setPricePickerTarget(
                                          pricePickerTarget?.itemIdx === itemIdx
                                            ? null
                                            : { colIdx: activeColIndex, grpIdx, itemIdx }
                                        )
                                      }
                                      className={`h-9 px-2.5 text-xs border-zinc-700 ${
                                        linkInfo.type === "price"
                                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                      }`}
                                      title="Chọn nhanh theo mức giá"
                                    >
                                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                                      <span>Chọn mức giá</span>
                                    </Button>

                                    {/* Toggle custom URL */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const key = `${activeColIndex}-${grpIdx}-${itemIdx}`;
                                        setExpandedCustomUrls({
                                          ...expandedCustomUrls,
                                          [key]: !isUrlExpanded,
                                        });
                                      }}
                                      className={`h-9 px-2 text-xs ${
                                        linkInfo.type === "custom" || isUrlExpanded
                                          ? "text-cyan-400 bg-cyan-500/10"
                                          : "text-zinc-500 hover:text-zinc-300"
                                      }`}
                                      title="Tùy chỉnh link thủ công nếu cần"
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                    </Button>

                                    {/* Delete item button */}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveItem(
                                          activeColIndex,
                                          grpIdx,
                                          itemIdx
                                        )
                                      }
                                      className="h-9 w-9 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                                      title="Xóa mục này"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Price presets picker popover */}
                                {pricePickerTarget?.colIdx === activeColIndex &&
                                  pricePickerTarget?.grpIdx === grpIdx &&
                                  pricePickerTarget?.itemIdx === itemIdx && (
                                    <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-2 animate-in fade-in-0 duration-150">
                                      <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                                        <span>Chọn nhanh mốc giá mong muốn:</span>
                                        <button
                                          type="button"
                                          onClick={() => setPricePickerTarget(null)}
                                          className="text-zinc-500 hover:text-zinc-300"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                        {PRICE_PRESETS.map((p, pIdx) => (
                                          <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() =>
                                              handleApplyPricePreset(
                                                activeColIndex,
                                                grpIdx,
                                                p,
                                                itemIdx
                                              )
                                            }
                                            className="px-2.5 py-1.5 text-xs text-left rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-zinc-200 transition-colors"
                                          >
                                            <div className="font-medium text-emerald-300">{p.label}</div>
                                            <div className="text-[10px] text-zinc-400">{p.desc}</div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {/* Friendly Human-Readable Link Summary */}
                                <div className="flex items-center justify-between text-xs px-1">
                                  <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="truncate">
                                      Khi khách bấm vào:{" "}
                                      <strong className="text-zinc-200">{linkInfo.summary}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Custom link input (only shown if expanded or already custom) */}
                                {(isUrlExpanded || linkInfo.type === "custom") && (
                                  <div className="pt-1 border-t border-zinc-800/80">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-zinc-500 font-mono shrink-0">Link:</span>
                                      <Input
                                        value={item.href}
                                        onChange={(e) =>
                                          handleUpdateCustomHref(
                                            activeColIndex,
                                            grpIdx,
                                            itemIdx,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Ví dụ: /category/tai-nghe?search=ASUS hoặc link ngoài"
                                        className="h-8 bg-zinc-950 border-zinc-700 text-xs font-mono text-cyan-300"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Item Actions */}
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddKeywordItem(activeColIndex, grpIdx)}
                            className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-cyan-400 text-xs h-8"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>+ Thêm mục (tự tạo link)</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPricePickerTarget(
                                pricePickerTarget?.itemIdx === undefined &&
                                  pricePickerTarget?.grpIdx === grpIdx
                                  ? null
                                  : { colIdx: activeColIndex, grpIdx }
                              )
                            }
                            className="border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-emerald-400 text-xs h-8"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            <span>+ Thêm nhanh mốc giá</span>
                          </Button>
                        </div>

                        {/* New Price Preset Picker */}
                        {pricePickerTarget?.colIdx === activeColIndex &&
                          pricePickerTarget?.grpIdx === grpIdx &&
                          pricePickerTarget?.itemIdx === undefined && (
                            <div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-2 mt-2">
                              <div className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                                <span>Bấm vào mốc giá để thêm ngay mục mới:</span>
                                <button
                                  type="button"
                                  onClick={() => setPricePickerTarget(null)}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                {PRICE_PRESETS.map((p, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() =>
                                      handleApplyPricePreset(
                                        activeColIndex,
                                        grpIdx,
                                        p
                                      )
                                    }
                                    className="px-2.5 py-1.5 text-xs text-left rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500 hover:bg-emerald-500/10 text-zinc-200 transition-colors"
                                  >
                                    <div className="font-medium text-emerald-300">{p.label}</div>
                                    <div className="text-[10px] text-zinc-400">{p.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                )}

                {/* Add new group buttons */}
                {currentCol.groups.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddGroup(activeColIndex)}
                      className="border-dashed border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40 text-xs h-10 px-4 rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>+ Thêm nhóm tùy chỉnh vào Cột {activeColIndex + 1}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddPriceGroupTemplate(activeColIndex)}
                      className="border-dashed border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 text-xs h-10 px-4 rounded-xl"
                    >
                      <DollarSign className="w-4 h-4 mr-1.5" />
                      <span>+ Thêm nhóm Lọc theo mức giá</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span>Khôi phục mặc định</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Lưu cấu hình</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
