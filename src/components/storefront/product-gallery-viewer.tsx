"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ProductGalleryViewerProps {
  images: string[];
  title: string;
}

export function ProductGalleryViewer({ images, title }: ProductGalleryViewerProps) {
  const displayImages = images.length > 0 ? images : ["/placeholder-gear.svg"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasError, setHasError] = useState<Record<number, boolean>>({});

  const currentImage = displayImages[selectedIndex] || "/placeholder-gear.svg";
  const isCurrentError = hasError[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Khung ảnh lớn chính */}
      <div className="relative aspect-square w-full rounded-md bg-[#F7F7F5] overflow-hidden group">
        <Image
          src={isCurrentError ? "/placeholder-gear.svg" : currentImage}
          alt={`${title} - Ảnh ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4 sm:p-6"
          onError={() => setHasError((prev) => ({ ...prev, [selectedIndex]: true }))}
        />

        {/* Nút Previous & Next */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Badge số ảnh */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white border border-[#E7E7E3] text-[11px] text-[#74746E] flex items-center gap-1.5 shadow-sm">
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
                className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all duration-200 bg-[#F7F7F5] ${
                  isSelected
                    ? "border-2 border-[#111]"
                    : "border border-[#E7E7E3] opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={isThumbError ? "/placeholder-gear.svg" : img}
                  alt={`${title} thumb ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                  onError={() => setHasError((prev) => ({ ...prev, [idx]: true }))}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
