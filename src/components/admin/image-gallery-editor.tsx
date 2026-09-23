"use client";

import { useState } from "react";
import { Plus, Trash2, Star, Image as ImageIcon, ArrowUp, ArrowDown, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/image-uploader";

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
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleUploadSuccess = (uploadedUrls: string[]) => {
    const updated = [...images];
    let addedCount = 0;
    for (const url of uploadedUrls) {
      if (!updated.includes(url)) {
        updated.push(url);
        addedCount++;
      }
    }
    onChange(updated);
  };

  const handleAddImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = newUrl.trim();
    if (!raw) return;

    if (!raw.startsWith("http://") && !raw.startsWith("https://") && !raw.startsWith("/")) {
      toast.error("Vui lòng nhập đường dẫn URL hợp lệ (bắt đầu bằng http://, https:// hoặc /uploads/)");
      return;
    }

    const url = normalizeImageUrl(raw);

    if (images.includes(url)) {
      toast.error("Hình ảnh này đã có trong bộ sưu tập");
      return;
    }

    onChange([...images, url]);
    setNewUrl("");

    if (raw.includes("drive.google.com") || raw.includes("docs.google.com")) {
      toast.success("Đã tự động chuyển đổi link Google Drive thành link ảnh trực tiếp!");
    } else {
      toast.success("Đã thêm ảnh vào bộ sưu tập");
    }
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
      {/* 1. Khu vực Kéo thả & Tải ảnh từ máy trực tiếp vào VPS */}
      <ImageUploader
        onUploadSuccess={handleUploadSuccess}
        multiple={true}
        disabled={disabled}
      />

      {/* 2. Nút toggle / Nhập link ảnh bên ngoài (Google Drive, v.v.) */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-[#555] hover:text-[#111] flex items-center gap-1.5 font-medium transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {showUrlInput ? "Ẩn nhập link ảnh bên ngoài" : "+ Thêm ảnh bằng liên kết (Google Drive, Unsplash, Imgur...)"}
        </button>

        {images.length > 0 && (
          <ImageUploader
            onUploadSuccess={handleUploadSuccess}
            multiple={true}
            compact={true}
            buttonText="Tải thêm ảnh từ máy"
            disabled={disabled}
          />
        )}
      </div>

      {showUrlInput && (
        <div className="space-y-2 p-3 bg-[#F7F7F5] rounded-xl border border-[#E7E7E3] animate-in fade-in duration-150">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Dán link ảnh (Google Drive, Imgur, Postimages, Cloudinary, Unsplash...)"
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
              Thêm link
            </Button>
          </div>
          <p className="text-[11px] text-[#74746E]">
            💡 Hỗ trợ dán link Google Drive chia sẻ (hệ thống tự động chuyển đổi sang ảnh xem trực tiếp).
          </p>
        </div>
      )}

      {/* 3. Danh sách ảnh trong Gallery */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[#E7E7E3] bg-[#FAFAFA] text-[#74746E]">
          <ImageIcon className="w-8 h-8 mb-2 text-zinc-400" />
          <p className="text-xs">Chưa có hình ảnh nào. Hãy chọn file từ máy hoặc dán link để thêm vào sản phẩm.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#74746E] px-1">
            <span>Đã có <strong>{images.length}</strong> hình ảnh (Kéo hoặc bấm sao để đổi ảnh đại diện)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, idx) => {
              const isMain = idx === 0;
              return (
                <div
                  key={url + idx}
                  className={`group relative rounded-xl overflow-hidden border bg-white transition-all ${
                    isMain
                      ? "border-[#111] ring-2 ring-cyan-500/30 shadow-sm"
                      : "border-[#E7E7E3] hover:border-[#D5D5D0]"
                  }`}
                >
                  {/* Image Aspect ratio container */}
                  <div className="aspect-square w-full relative overflow-hidden bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizeImageUrl(url)}
                      alt={`Sản phẩm ảnh ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x400/18181b/a1a1aa?text=Ảnh+lỗi";
                      }}
                    />

                    {/* Main badge */}
                    {isMain && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-cyan-500 text-zinc-950 px-2 py-0.5 text-[10px] font-bold shadow-sm">
                        <Star className="w-3 h-3 fill-current" />
                        Ảnh đại diện
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

                      <div className="flex items-center justify-between text-[11px] text-[#A3A39D] font-mono">
                        <span>#{idx + 1}</span>
                        <div className="flex gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMove(idx, "up")}
                              disabled={disabled}
                              title="Di chuyển lên trước"
                              className="p-1 rounded bg-[#222] text-white hover:bg-zinc-700"
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
                              className="p-1 rounded bg-[#222] text-white hover:bg-zinc-700"
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
        </div>
      )}
    </div>
  );
}
