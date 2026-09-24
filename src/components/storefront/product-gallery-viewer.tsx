"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ZoomIn,
  ZoomOut,
  X,
  Maximize2,
} from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils";

interface ProductGalleryViewerProps {
  images: string[];
  title: string;
}

export function ProductGalleryViewer({ images, title }: ProductGalleryViewerProps) {
  const normalizedImages = (images || []).map((img) => normalizeImageUrl(img)).filter(Boolean);
  const displayImages = normalizedImages.length > 0 ? normalizedImages : ["/placeholder-gear.svg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const currentImage = displayImages[selectedIndex] || "/placeholder-gear.svg";
  const isCurrentError = hasError[selectedIndex];

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
    setZoomScale(1);
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
    setZoomScale(1);
  }, [displayImages.length]);

  const toggleZoom = () => {
    setZoomScale((prev) => (prev === 1 ? 1.75 : prev === 1.75 ? 2.5 : 1));
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomScale(1);
  };

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className="space-y-4">
      {/* Khung ảnh lớn chính */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="relative aspect-square w-full rounded-2xl bg-[#F7F7F5] overflow-hidden group cursor-zoom-in border border-[#E7E7E3]"
        title="Bấm để phóng to xem chi tiết"
      >
        <Image
          src={isCurrentError ? "/placeholder-gear.svg" : currentImage}
          alt={`${title} - Ảnh ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-[1.02]"
          referrerPolicy="no-referrer"
          onError={() => setHasError((prev) => ({ ...prev, [selectedIndex]: true }))}
        />

        {/* Nút Previous & Next trên ảnh chính */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm z-10"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm z-10"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Hint phóng to khi hover */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Click phóng to</span>
        </div>

        {/* Badge số ảnh */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/90 border border-[#E7E7E3] text-[11px] font-medium text-[#74746E] flex items-center gap-1.5 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-[#74746E]" strokeWidth={1.5} />
            <span>
              {selectedIndex + 1} / {displayImages.length}
            </span>
          </div>
        )}
      </div>

      {/* Dải thumbnail nhỏ cuộn ngang bên dưới */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#D5D5D0] scrollbar-track-transparent">
          {displayImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            const isThumbError = hasError[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 bg-[#F7F7F5] ${
                  isSelected
                    ? "border-2 border-[#111] shadow-sm"
                    : "border border-[#E7E7E3] opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={isThumbError ? "/placeholder-gear.svg" : img}
                  alt={`${title} thumb ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                  referrerPolicy="no-referrer"
                  onError={() => setHasError((prev) => ({ ...prev, [idx]: true }))}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal Phóng to Toàn màn hình */}
      {isLightboxOpen && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
        >
          {/* Top Bar inside Lightbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-white w-full max-w-5xl mx-auto pb-3 z-20"
          >
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-white/90 truncate max-w-xs sm:max-w-md">
                {title}
              </h4>
              <p className="text-xs text-white/60">
                Ảnh {selectedIndex + 1} trên {displayImages.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom scale button */}
              <button
                type="button"
                onClick={toggleZoom}
                className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Phóng to / Thu nhỏ"
              >
                {zoomScale > 1 ? (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>{zoomScale}x</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>Phóng to</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Centered Large Image Area */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleZoom();
            }}
            className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center overflow-hidden cursor-pointer"
          >
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transition: "transform 0.25s ease-out",
              }}
              className="relative w-full h-full max-h-[75vh] flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isCurrentError ? "/placeholder-gear.svg" : currentImage}
                alt={`${title} - Phóng to`}
                className="max-h-[75vh] max-w-full object-contain drop-shadow-2xl"
              />
            </div>

            {/* Prev & Next in Lightbox */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-white text-white hover:text-[#111] flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-30"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-white text-white hover:text-[#111] flex items-center justify-center transition-all duration-200 backdrop-blur-sm z-30"
                  aria-label="Ảnh kế tiếp"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails inside Lightbox */}
          {displayImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-auto pt-3 flex items-center justify-center gap-2 overflow-x-auto z-20"
            >
              {displayImages.map((img, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedIndex(idx);
                      setZoomScale(1);
                    }}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      isSelected
                        ? "ring-2 ring-white scale-105"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
