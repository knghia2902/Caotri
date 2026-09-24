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

  // Load config when opening modal
  useEffect(() => {
    if (isOpen && category) {
      setIsLoading(true);
      setJsonError(null);
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

  // Helper: Update item label & href
  const handleUpdateItem = (
    colIdx: number,
    grpIdx: number,
    itemIdx: number,
    field: "label" | "href",
    val: string
  ) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].items[itemIdx][field] = val;
    setConfig(newConfig);
  };

  // Helper: Add item
  const handleAddItem = (colIdx: number, grpIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].items.push({
      label: "Mục mới",
      href: `/category/${category.slug}?search=`,
    });
    setConfig(newConfig);
  };

  // Helper: Remove item
  const handleRemoveItem = (colIdx: number, grpIdx: number, itemIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    newConfig.columns[colIdx].groups[grpIdx].items.splice(itemIdx, 1);
    setConfig(newConfig);
  };

  // Helper: Add group
  const handleAddGroup = (colIdx: number) => {
    if (!config) return;
    const newConfig = { ...config };
    if (!newConfig.columns[colIdx]) {
      newConfig.columns[colIdx] = { groups: [] };
    }
    newConfig.columns[colIdx].groups.push({
      title: "Nhóm tiêu đề mới",
      href: `/category/${category.slug}`,
      items: [
        {
          label: "Ví dụ 1",
          href: `/category/${category.slug}?search=`,
        },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
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
              <p className="text-xs text-zinc-400">
                Chỉnh sửa các nhóm tiêu đề, mục con và liên kết trong menu Mega của danh mục này
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
                <span>Trực quan</span>
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
              <p className="text-sm">Đang tải dữ liệu cấu hình...</p>
            </div>
          ) : editMode === "json" ? (
            /* JSON Code Editor Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Chỉnh sửa trực tiếp cấu hình dưới dạng JSON (dành cho quản trị viên nâng cao)</span>
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
                      onClick={() => setActiveColIndex(colIndex)}
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
                  <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                    <p className="text-sm text-zinc-400 mb-3">
                      Cột {activeColIndex + 1} chưa có nhóm mục nào.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddGroup(activeColIndex)}
                      className="border-zinc-700 bg-zinc-800 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-400"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>Thêm nhóm đầu tiên vào Cột {activeColIndex + 1}</span>
                    </Button>
                  </div>
                ) : (
                  currentCol.groups.map((group, grpIdx) => (
                    <div
                      key={grpIdx}
                      className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4 shadow-sm"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 mb-1 block">
                            Tiêu đề nhóm (ví dụ: Thương hiệu, Theo giá, Kiểu kết nối...)
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
                            placeholder="Nhập tên tiêu đề nhóm..."
                            className="bg-zinc-900 border-zinc-700 font-semibold text-zinc-100"
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveGroup(activeColIndex, grpIdx)
                          }
                          className="text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mt-5"
                          title="Xóa nhóm này"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span>Xóa nhóm</span>
                        </Button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          Danh sách mục con trong nhóm:
                        </label>

                        <div className="space-y-2">
                          {group.items.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/80"
                            >
                              <div className="w-1/3">
                                <Input
                                  value={item.label}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      activeColIndex,
                                      grpIdx,
                                      itemIdx,
                                      "label",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Tên mục (vd: ASUS)"
                                  className="h-9 bg-zinc-900 border-zinc-700 text-xs"
                                />
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={item.href}
                                  onChange={(e) =>
                                    handleUpdateItem(
                                      activeColIndex,
                                      grpIdx,
                                      itemIdx,
                                      "href",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Đường dẫn (vd: /category/tai-nghe?search=ASUS)"
                                  className="h-9 bg-zinc-900 border-zinc-700 text-xs font-mono text-zinc-300"
                                />
                              </div>
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
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Add Item Button */}
                        <div className="pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleAddItem(activeColIndex, grpIdx)
                            }
                            className="border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                            <span>Thêm mục con</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Add new group button */}
                {currentCol.groups.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddGroup(activeColIndex)}
                    className="w-full border-dashed border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/40 py-5 rounded-2xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>Thêm nhóm tiêu đề mới vào Cột {activeColIndex + 1}</span>
                  </Button>
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
