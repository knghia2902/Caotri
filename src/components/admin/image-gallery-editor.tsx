"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Star,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Eye,
  Download,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { normalizeImageUrl } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/image-uploader";

interface ImageGalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  allowSetMain?: boolean;
}

export function ImageGalleryEditor({
  images,
  onChange,
  disabled = false,
  allowSetMain = true,
}: ImageGalleryEditorProps) {
  const [newUrl, setNewUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Lightbox Preview Modal State
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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
    if (previewIndex !== null) {
      if (previewIndex === index) {
        setPreviewIndex(null);
      } else if (previewIndex > index) {
        setPreviewIndex(previewIndex - 1);
      }
    }
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

  // Helper tải ảnh trực tiếp về máy tính
  const handleDownload = async (url: string, index: number) => {
    const cleanUrl = normalizeImageUrl(url);
    const filename = cleanUrl.split("/").pop()?.split("?")[0] || `anh-bao-hanh-${index + 1}.jpg`;

    try {
      // Nếu là ảnh upload trên server, thêm query ?download=1 để server trả về header Content-Disposition
      const downloadTarget = cleanUrl.startsWith("/uploads/")
        ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}download=1`
        : cleanUrl;

      // Thử dùng fetch Blob để lưu file trực tiếp
      const response = await fetch(downloadTarget, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Đã tải xuống: ${filename}`);
    } catch {
      // Fallback mở trực tiếp tab mới kèm thuộc tính download
      const a = document.createElement("a");
      a.href = cleanUrl.startsWith("/uploads/")
        ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}download=1`
        : cleanUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.info(`Đang tải file ${filename}...`);
    }
  };

  // Navigation handlers cho Lightbox
  const handleNextPreview = useCallback(() => {
    if (previewIndex !== null && previewIndex < images.length - 1) {
      setPreviewIndex(previewIndex + 1);
      setZoomLevel(1);
    }
  }, [previewIndex, images.length]);

  const handlePrevPreview = useCallback(() => {
    if (previewIndex !== null && previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
      setZoomLevel(1);
    }
  }, [previewIndex]);

  const handleClosePreview = useCallback(() => {
    setPreviewIndex(null);
    setZoomLevel(1);
  }, []);

  // Lắng nghe phím ESC, Mũi tên trái/phải để điều hướng Lightbox
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClosePreview();
      else if (e.key === "ArrowRight") handleNextPreview();
      else if (e.key === "ArrowLeft") handlePrevPreview();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, handleClosePreview, handleNextPreview, handlePrevPreview]);

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
            <span>
              Đã có <strong>{images.length}</strong> hình ảnh (Bấm vào ảnh để mở xem lớn hoặc tải về)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, idx) => {
              const isMain = allowSetMain && idx === 0;
              const cleanUrl = normalizeImageUrl(url);

              return (
                <div
                  key={url + idx}
                  className={`group relative rounded-xl overflow-hidden border bg-white transition-all shadow-sm flex flex-col ${
                    isMain
                      ? "border-[#111] ring-2 ring-cyan-500/30"
                      : "border-[#E7E7E3] hover:border-[#111]"
                  }`}
                >
                  {/* Image Aspect ratio container (Click to preview) */}
                  <div
                    onClick={() => {
                      setPreviewIndex(idx);
                      setZoomLevel(1);
                    }}
                    className="aspect-square w-full relative overflow-hidden bg-zinc-900 flex items-center justify-center cursor-pointer"
                    title="Bấm để xem ảnh phóng to chi tiết"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cleanUrl}
                      alt={`Sản phẩm ảnh ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/400x400/18181b/a1a1aa?text=Ảnh+lỗi";
                      }}
                    />

                    {/* Main badge (chỉ hiện khi cho phép đặt ảnh chính) */}
                    {isMain && (
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-md bg-cyan-500 text-zinc-950 px-2 py-0.5 text-[10px] font-bold shadow-sm pointer-events-none">
                        <Star className="w-3 h-3 fill-current" />
                        Ảnh đại diện
                      </div>
                    )}

                    {/* Hover Overlay with Action Buttons */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      {/* Top Row: View, Download, Open Link, Star, Delete */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {/* Nút Xem lớn */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewIndex(idx);
                              setZoomLevel(1);
                            }}
                            title="Mở xem phóng to"
                            className="p-1.5 rounded-lg bg-white/90 text-[#111] hover:bg-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Tải về máy */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(url, idx);
                            }}
                            title="Tải ảnh về máy"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {allowSetMain && !isMain && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMain(idx);
                              }}
                              disabled={disabled}
                              title="Đặt làm ảnh đại diện"
                              className="p-1.5 rounded-lg bg-zinc-800 text-amber-400 hover:bg-zinc-700 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            disabled={disabled}
                            title="Xóa ảnh này"
                            className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Move Up / Down */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono">
                        <span className="bg-black/60 px-1.5 py-0.5 rounded text-[10px]">
                          #{idx + 1}
                        </span>
                        <div className="flex gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(idx, "up");
                              }}
                              disabled={disabled}
                              title="Di chuyển lên trước"
                              className="p-1 rounded bg-zinc-800 text-white hover:bg-zinc-700"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(idx, "down");
                              }}
                              disabled={disabled}
                              title="Di chuyển về sau"
                              className="p-1 rounded bg-zinc-800 text-white hover:bg-zinc-700"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thanh công cụ tĩnh dưới ảnh (tiện lợi cho cả mobile/tablet) */}
                  <div className="px-2 py-1.5 bg-[#FAFAFA] border-t border-[#E7E7E3] flex items-center justify-between text-xs text-[#74746E]">
                    <span className="font-mono text-[11px]">#{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewIndex(idx);
                          setZoomLevel(1);
                        }}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-[#111] hover:bg-[#E7E7E3] transition-colors"
                        title="Mở xem phóng to"
                      >
                        <Eye className="w-3 h-3 text-[#111]" />
                        <span>Xem</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(url, idx)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Tải ảnh về máy"
                      >
                        <Download className="w-3 h-3" />
                        <span>Tải về</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. LIGHTBOX MODAL: XEM ẢNH PHÓNG TO, THU PHÓNG & TẢI VỀ MÁY */}
      {/* ========================================================================= */}
      {previewIndex !== null && images[previewIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-150"
          onClick={handleClosePreview}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white w-full max-w-5xl mx-auto z-10 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-xs font-semibold text-zinc-200">
                Ảnh {previewIndex + 1} / {images.length}
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline truncate max-w-xs font-mono">
                {normalizeImageUrl(images[previewIndex]).split("/").pop()}
              </span>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.25).toFixed(2))))}
                title="Thu nhỏ"
                className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Reset Zoom */}
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                title="Khôi phục kích thước 100%"
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition-colors"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                title="Phóng to"
                className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-6 bg-zinc-700 mx-1 hidden sm:block" />

              {/* Mở tab mới */}
              <a
                href={normalizeImageUrl(images[previewIndex])}
                target="_blank"
                rel="noopener noreferrer"
                title="Mở ảnh gốc trong tab mới"
                className="p-2 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Nút Tải về máy */}
              <button
                type="button"
                onClick={() => handleDownload(images[previewIndex], previewIndex)}
                title="Tải ảnh này về máy"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải về máy</span>
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={handleClosePreview}
                title="Đóng cửa sổ xem ảnh (ESC)"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Image Viewport */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
            {/* Prev Arrow */}
            {previewIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPreview();
                }}
                title="Ảnh trước (Mũi tên trái)"
                className="absolute left-2 sm:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-zinc-700 hover:border-zinc-500 backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            {/* Displayed Image */}
            <div
              className="relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-150 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => {
                e.stopPropagation();
                // Click ảnh để phóng to/thu nhỏ nhanh giữa 1x và 2x
                setZoomLevel((z) => (z === 1 ? 1.75 : 1));
              }}
              title="Click trực tiếp lên ảnh để phóng to / thu nhỏ nhanh"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(images[previewIndex])}
                alt={`Ảnh phóng to ${previewIndex + 1}`}
                referrerPolicy="no-referrer"
                className={`max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl ${
                  zoomLevel > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/800x600/18181b/a1a1aa?text=Ảnh+không+tồn+tại";
                }}
              />
            </div>

            {/* Next Arrow */}
            {previewIndex < images.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPreview();
                }}
                title="Ảnh tiếp theo (Mũi tên phải)"
                className="absolute right-2 sm:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-zinc-700 hover:border-zinc-500 backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="w-full max-w-3xl mx-auto z-10 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((imgUrl, thumbIdx) => {
              const isSelected = thumbIdx === previewIndex;
              return (
                <button
                  key={imgUrl + thumbIdx}
                  type="button"
                  onClick={() => {
                    setPreviewIndex(thumbIdx);
                    setZoomLevel(1);
                  }}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    isSelected
                      ? "border-emerald-500 ring-2 ring-emerald-500/40 scale-105"
                      : "border-zinc-700 opacity-60 hover:opacity-100 hover:border-zinc-500"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizeImageUrl(imgUrl)}
                    alt={`Thumbnail ${thumbIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
