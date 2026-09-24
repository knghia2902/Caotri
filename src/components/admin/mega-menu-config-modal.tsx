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
  DollarSign,
  Link as LinkIcon,
  Tag,
  Sparkles,
  Info,
  Check,
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

// Preset các mốc giá nhanh
const QUICK_PRICES = [
  { label: "Dưới 500 nghìn", maxPrice: "500000", minPrice: "" },
  { label: "500k - 1 triệu", minPrice: "500000", maxPrice: "1000000" },
  { label: "1 triệu - 2 triệu", minPrice: "1000000", maxPrice: "2000000" },
  { label: "2 triệu - 3 triệu", minPrice: "2000000", maxPrice: "3000000" },
  { label: "3 triệu - 4 triệu", minPrice: "3000000", maxPrice: "4000000" },
  { label: "Trên 2 triệu", minPrice: "2000000", maxPrice: "" },
  { label: "Trên 3 triệu", minPrice: "3000000", maxPrice: "" },
  { label: "Trên 4 triệu", minPrice: "4000000", maxPrice: "" },
];

export function MegaMenuConfigModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: MegaMenuConfigModalProps) {
  const [config, setConfig] = useState<CategoryMegaMenuConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, startSaving] = useTransition();

  // State to toggle URL details for a specific item
  const [expandedUrlKey, setExpandedUrlKey] = useState<string | null>(null);

  // Quick price picker popover state: key = `${colIdx}-${grpIdx}`
  const [activePricePicker, setActivePricePicker] = useState<string | null>(null);

  // Load config when opening modal
  useEffect(() => {
    if (isOpen && category) {
      setIsLoading(true);
      setExpandedUrlKey(null);
      setActivePricePicker(null);
      getMegaMenuConfigAction(category.slug, category.name)
        .then((res) => {
          // Đảm bảo luôn có đủ 4 cột
          const loaded = res.config || {
            slug: category.slug,
            title: category.name,
            allHref: `/category/${category.slug}`,
            columns: [],
          };
          while (loaded.columns.length < 4) {
            loaded.columns.push({ groups: [] });
          }
          setConfig(loaded);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setConfig(null);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  // 1. Cập nhật Tiêu đề nhóm (ví dụ: "Thương hiệu tai nghe", "Tai nghe theo giá"...)
  const handleUpdateGroupTitle = (colIdx: number, grpIdx: number, newTitle: string) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    if (next.columns[colIdx]?.groups[grpIdx]) {
      next.columns[colIdx].groups[grpIdx].title = newTitle;
      setConfig(next);
    }
  };

  // 2. Cập nhật Tên mục hiển thị (ví dụ: "ASUS", "Razer"...) -> Tự động cập nhật link tìm kiếm
  const handleUpdateItemLabel = (
    colIdx: number,
    grpIdx: number,
    itemIdx: number,
    newLabel: string
  ) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    const item = next.columns[colIdx]?.groups[grpIdx]?.items[itemIdx];
    if (item) {
      item.label = newLabel;
      // Nếu link hiện tại là link tìm kiếm hoặc chưa có link, tự động cập nhật theo tên luôn!
      if (!item.href || item.href.includes("search=") || !item.href.includes("?")) {
        item.href = newLabel.trim()
          ? `/category/${category.slug}?search=${encodeURIComponent(newLabel.trim())}`
          : `/category/${category.slug}`;
      }
      setConfig(next);
    }
  };

  // 3. Cập nhật Link thủ công (chỉ khi người dùng muốn sửa link sâu)
  const handleUpdateItemHref = (
    colIdx: number,
    grpIdx: number,
    itemIdx: number,
    newHref: string
  ) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    const item = next.columns[colIdx]?.groups[grpIdx]?.items[itemIdx];
    if (item) {
      item.href = newHref;
      setConfig(next);
    }
  };

  // 4. Thêm mục con mới (chỉ cần gõ tên là có link ngay)
  const handleAddItem = (colIdx: number, grpIdx: number, defaultLabel = "Mục mới") => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    const grp = next.columns[colIdx]?.groups[grpIdx];
    if (grp) {
      grp.items.push({
        label: defaultLabel,
        href: `/category/${category.slug}?search=${encodeURIComponent(defaultLabel)}`,
      });
      setConfig(next);
    }
  };

  // 5. Thêm mốc giá nhanh
  const handleAddPricePreset = (
    colIdx: number,
    grpIdx: number,
    preset: typeof QUICK_PRICES[0]
  ) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    const grp = next.columns[colIdx]?.groups[grpIdx];
    if (grp) {
      const params = new URLSearchParams();
      if (preset.minPrice) params.set("minPrice", preset.minPrice);
      if (preset.maxPrice) params.set("maxPrice", preset.maxPrice);
      grp.items.push({
        label: preset.label,
        href: `/category/${category.slug}?${params.toString()}`,
      });
      setConfig(next);
      setActivePricePicker(null);
    }
  };

  // 6. Xóa mục con
  const handleRemoveItem = (colIdx: number, grpIdx: number, itemIdx: number) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    next.columns[colIdx]?.groups[grpIdx]?.items.splice(itemIdx, 1);
    setConfig(next);
  };

  // 7. Thêm nhóm mới vào cột
  const handleAddGroup = (colIdx: number, title = "Nhóm tiêu đề mới") => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    if (!next.columns[colIdx]) {
      next.columns[colIdx] = { groups: [] };
    }
    next.columns[colIdx].groups.push({
      title,
      href: `/category/${category.slug}`,
      items: [
        {
          label: "Mục 1",
          href: `/category/${category.slug}?search=Mục 1`,
        },
      ],
    });
    setConfig(next);
  };

  // 8. Xóa cả nhóm
  const handleRemoveGroup = (colIdx: number, grpIdx: number) => {
    if (!config) return;
    const next = JSON.parse(JSON.stringify(config)) as CategoryMegaMenuConfig;
    next.columns[colIdx]?.groups.splice(grpIdx, 1);
    setConfig(next);
  };

  // 9. Lưu cấu hình
  const handleSave = () => {
    if (!config) return;

    startSaving(async () => {
      const res = await saveMegaMenuConfigAction(category.slug, config);
      if (res.success) {
        toast.success(`Đã lưu cấu hình menu con cho "${category.name}"`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Không thể lưu cấu hình");
      }
    });
  };

  // 10. Khôi phục mặc định
  const handleReset = () => {
    if (
      !confirm(
        `Khôi phục toàn bộ menu con của "${category.name}" về thiết lập mặc định chuẩn của hệ thống?`
      )
    ) {
      return;
    }

    startSaving(async () => {
      const res = await resetMegaMenuConfigAction(category.slug, category.name);
      if (res.success && res.config) {
        const loaded = res.config;
        while (loaded.columns.length < 4) {
          loaded.columns.push({ groups: [] });
        }
        setConfig(loaded);
        toast.success("Đã khôi phục về thiết lập mặc định");
        if (onSuccess) onSuccess();
      } else {
        toast.error("Không thể khôi phục mặc định");
      }
    });
  };

  const columns = config?.columns || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="w-full max-w-[1240px] bg-white border border-[#E5E5E1] rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 text-[#111]">
        {/* Header - Sáng sủa, thân thiện */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EBEBE8] bg-[#FAFAFA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E11D48] border border-red-100 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111] flex items-center gap-2">
                <span>Chỉnh sửa Menu con:</span>
                <span className="text-[#E11D48] underline underline-offset-4 font-semibold">
                  {category.name}
                </span>
              </h2>
              <p className="text-xs text-[#74746E] mt-0.5">
                Bảng 4 cột bên dưới mô phỏng <strong>y hệt menu hiển thị ngoài trang chủ</strong>. Bạn chỉ cần bấm vào ô để sửa chữ, hệ thống tự lo phần liên kết!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#74746E] hover:text-[#111] hover:bg-[#EFEFEF] transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Giao diện 4 cột trực quan mô phỏng menu thật */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F7F7F5] space-y-4">
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3 text-[#74746E]">
              <Loader2 className="w-8 h-8 animate-spin text-[#E11D48]" />
              <p className="text-sm font-medium">Đang tải cấu hình menu...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Dòng hướng dẫn nhanh dễ hiểu */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Mẹo:</strong> Bấm vào chữ để sửa tên nhóm hoặc tên hãng. Khi gõ tên mới (vd: <em>Sony</em>, <em>Logitech</em>, <em>Không dây</em>), link tìm kiếm sản phẩm sẽ được <strong>tự động tạo ngay lập tức</strong> mà bạn không cần phải gõ đường dẫn URL nào cả.
                </span>
              </div>

              {/* 4 Cột mô phỏng trực tiếp menu thật */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                {[0, 1, 2, 3].map((colIdx) => {
                  const col = columns[colIdx] || { groups: [] };

                  return (
                    <div
                      key={colIdx}
                      className="bg-white rounded-2xl border border-[#E5E5E1] p-4 shadow-sm space-y-4 min-h-[460px] flex flex-col"
                    >
                      {/* Tiêu đề Cột */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0EE]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                          <span className="text-xs font-bold uppercase tracking-wider text-[#111]">
                            Cột {colIdx + 1}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#8E8E87] bg-[#F5F5F3] px-2 py-0.5 rounded-md">
                          {col.groups.length} nhóm
                        </span>
                      </div>

                      {/* Danh sách các nhóm trong Cột này */}
                      <div className="space-y-4 flex-1">
                        {col.groups.length === 0 ? (
                          <div className="py-12 text-center border-2 border-dashed border-[#EBEBE8] rounded-xl px-3 space-y-2">
                            <p className="text-xs text-[#8E8E87]">Cột này hiện chưa có nhóm nào</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddGroup(colIdx, "Nhóm mới")}
                              className="text-xs h-8 border-[#D5D5D0] hover:border-[#111] bg-white"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              <span>Thêm nhóm</span>
                            </Button>
                          </div>
                        ) : (
                          col.groups.map((group, grpIdx) => {
                            const pickerKey = `${colIdx}-${grpIdx}`;
                            const isPickerOpen = activePricePicker === pickerKey;

                            return (
                              <div
                                key={grpIdx}
                                className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-3 space-y-3 relative group/card hover:border-[#D5D5D0] transition-colors"
                              >
                                {/* Tiêu đề nhóm: ô nhập trực quan */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E87]">
                                      Tiêu đề nhóm:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveGroup(colIdx, grpIdx)}
                                      className="text-[#A3A39D] hover:text-red-600 p-0.5 rounded transition-colors"
                                      title="Xóa nhóm này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <Input
                                    value={group.title}
                                    onChange={(e) =>
                                      handleUpdateGroupTitle(colIdx, grpIdx, e.target.value)
                                    }
                                    placeholder="Vd: Thương hiệu, Lọc theo giá..."
                                    className="h-8.5 text-xs font-bold text-[#111] bg-white border-[#D5D5D0] focus:border-[#111]"
                                  />
                                </div>

                                {/* Danh sách các mục con */}
                                <div className="space-y-1.5 pt-1 border-t border-[#EAEAE8]">
                                  <div className="text-[10px] font-semibold text-[#8E8E87] uppercase tracking-wider mb-1">
                                    Các mục con:
                                  </div>

                                  {group.items.length === 0 ? (
                                    <p className="text-[11px] text-[#A3A39D] italic py-1 text-center">
                                      Chưa có mục nào
                                    </p>
                                  ) : (
                                    group.items.map((item, itemIdx) => {
                                      const urlKey = `${colIdx}-${grpIdx}-${itemIdx}`;
                                      const isUrlOpen = expandedUrlKey === urlKey;

                                      return (
                                        <div
                                          key={itemIdx}
                                          className="bg-white rounded-lg border border-[#E5E5E1] p-1.5 space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                        >
                                          <div className="flex items-center gap-1.5">
                                            {/* Input Tên mục hiển thị */}
                                            <input
                                              type="text"
                                              value={item.label}
                                              onChange={(e) =>
                                                handleUpdateItemLabel(
                                                  colIdx,
                                                  grpIdx,
                                                  itemIdx,
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Nhập tên..."
                                              className="flex-1 text-xs font-medium text-[#111] bg-transparent border-0 px-1 py-0.5 focus:outline-none focus:bg-[#F7F7F5] rounded"
                                            />

                                            {/* Nút xem/sửa link chi tiết nếu cần */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setExpandedUrlKey(isUrlOpen ? null : urlKey)
                                              }
                                              className={`p-1 rounded text-[#8E8E87] hover:text-[#111] hover:bg-[#F3F3F1] transition-colors ${
                                                isUrlOpen ? "text-[#E11D48] bg-red-50" : ""
                                              }`}
                                              title={isUrlOpen ? "Thu gọn link" : "Xem/sửa đường dẫn nâng cao"}
                                            >
                                              <LinkIcon className="w-3 h-3" />
                                            </button>

                                            {/* Nút Xóa mục */}
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveItem(colIdx, grpIdx, itemIdx)
                                              }
                                              className="p-1 rounded text-[#A3A39D] hover:text-red-600 hover:bg-red-50 transition-colors"
                                              title="Xóa mục này"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>

                                          {/* Hiển thị link mở rộng khi người dùng bấm vào biểu tượng link */}
                                          {isUrlOpen && (
                                            <div className="pt-1 border-t border-[#F0F0EE] space-y-1">
                                              <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-[#8E8E87] font-mono shrink-0">
                                                  Link:
                                                </span>
                                                <input
                                                  type="text"
                                                  value={item.href}
                                                  onChange={(e) =>
                                                    handleUpdateItemHref(
                                                      colIdx,
                                                      grpIdx,
                                                      itemIdx,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-1 text-[11px] font-mono text-[#4B5563] bg-[#F7F7F5] border border-[#D5D5D0] px-1.5 py-0.5 rounded focus:outline-none focus:border-[#111]"
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>

                                {/* Các nút thêm nhanh bên dưới nhóm */}
                                <div className="pt-1 flex items-center justify-between gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleAddItem(colIdx, grpIdx, "Mục mới")}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-[#111] hover:text-[#E11D48] bg-white border border-[#D5D5D0] hover:border-[#111] px-2 py-1 rounded-md transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Thêm mục</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActivePricePicker(isPickerOpen ? null : pickerKey)
                                    }
                                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md transition-colors border ${
                                      isPickerOpen
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                    }`}
                                    title="Thêm mốc lọc theo giá"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    <span>Chọn mốc giá</span>
                                  </button>
                                </div>

                                {/* Menu chọn mốc giá nhanh xuất hiện ngay tại nhóm */}
                                {isPickerOpen && (
                                  <div className="bg-white border border-emerald-300 rounded-xl p-2.5 shadow-lg space-y-2 mt-2 animate-in fade-in-0 duration-150 z-10">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                                      <span>Click chọn mốc giá để thêm:</span>
                                      <button
                                        type="button"
                                        onClick={() => setActivePricePicker(null)}
                                        className="text-[#8E8E87] hover:text-[#111]"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1">
                                      {QUICK_PRICES.map((p, pIdx) => (
                                        <button
                                          key={pIdx}
                                          type="button"
                                          onClick={() => handleAddPricePreset(colIdx, grpIdx, p)}
                                          className="text-left text-[11px] p-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-900 border border-transparent hover:border-emerald-200 transition-colors"
                                        >
                                          + {p.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Nút thêm nhóm vào cột này */}
                      <button
                        type="button"
                        onClick={() => handleAddGroup(colIdx, "Nhóm tiêu đề mới")}
                        className="w-full py-2 border border-dashed border-[#D5D5D0] hover:border-[#111] hover:bg-[#FAFAFA] rounded-xl text-xs font-semibold text-[#74746E] hover:text-[#111] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm nhóm vào Cột {colIdx + 1}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EBEBE8] bg-[#FAFAFA]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="text-xs text-[#74746E] hover:text-[#111] hover:bg-[#EFEFEF]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            <span>Khôi phục về mặc định gốc</span>
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-[#D5D5D0] bg-white text-[#111] hover:bg-[#F3F3F1] text-xs h-9 px-4 rounded-xl"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-[#111] hover:bg-black text-white font-semibold text-xs h-9 px-5 rounded-xl shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
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
