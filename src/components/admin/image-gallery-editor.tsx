"use client";

import { useState } from "react";
import { Plus, Trash2, Star, Image as ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageGalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ImageGalleryEditor({
  images,
  onChange,
  disabled = false,
}: ImageGalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");

  const handleAddImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Vui lòng nhập đường dẫn URL hợp lệ (bắt đầu bằng http:// hoặc https://)");
      return;
    }

    if (images.includes(url)) {
      toast.error("Hình ảnh này đã có trong bộ sưu tập");
      return;
    }

    onChange([...images, url]);
    setNewUrl("");
    toast.success("Đã thêm ảnh vào bộ sưu tập");
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
    toast.success("Đã đặt làm ảnh chính (Thumbnail)");
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Dán URL ảnh (Cloudflare R2, Cloudinary, Imgur, Supabase, Unsplash...)"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
            }}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddImage}
          disabled={disabled || !newUrl.trim()}
          variant="outline"
          className="border-[#D5D5D0] hover:border-[#111] hover:text-[#111] gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Thêm ảnh
        </Button>
      </div>

      <p className="text-[11px] text-[#74746E]">
        💡 Hệ thống hỗ trợ CDN trực tiếp không tốn dung lượng ổ đĩa hosting. Ảnh đầu tiên sẽ là ảnh đại diện chính của sản phẩm.
      </p>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[#E7E7E3] bg-[#111111]/40 text-[#74746E]">
          <ImageIcon className="w-10 h-10 mb-2 text-zinc-700" />
          <p className="text-xs">Chưa có hình ảnh nào. Dán URL để thêm ảnh sản phẩm.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, idx) => {
            const isMain = idx === 0;
            return (
              <div
                key={url + idx}
                className={`group relative rounded-xl overflow-hidden border bg-[#111111] transition-all ${
                  isMain
                    ? "border-[#111] ring-2 ring-cyan-500/30"
                    : "border-[#E7E7E3] hover:border-[#D5D5D0]"
                }`}
              >
                {/* Image Aspect ratio container */}
                <div className="aspect-square w-full relative overflow-hidden bg-white flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Sản phẩm ảnh ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x400/18181b/a1a1aa?text=Ảnh+lỗi";
                    }}
                  />

                  {/* Main badge */}
                  {isMain && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-cyan-500 text-zinc-950 px-2 py-0.5 text-[10px] font-bold ">
                      <Star className="w-3 h-3 fill-current" />
                      Ảnh chính
                    </div>
                  )}

                  {/* Overlay Controls on Hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-end gap-1">
                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMain(idx)}
                          disabled={disabled}
                          title="Đặt làm ảnh chính"
                          className="p-1.5 rounded-lg bg-[#FAFAFA]/90 text-[#111] hover:text-[#D99A24] hover:bg-zinc-700 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        disabled={disabled}
                        title="Xóa ảnh"
                        className="p-1.5 rounded-lg bg-rose-950/80 text-[#D94A4A] hover:bg-rose-900 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#74746E] font-mono">
                      <span>#{idx + 1}</span>
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "up")}
                            disabled={disabled}
                            title="Di chuyển lên trước"
                            className="p-1 rounded bg-[#FAFAFA] text-[#111] hover:bg-zinc-700"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMove(idx, "down")}
                            disabled={disabled}
                            title="Di chuyển về sau"
                            className="p-1 rounded bg-[#FAFAFA] text-[#111] hover:bg-zinc-700"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
