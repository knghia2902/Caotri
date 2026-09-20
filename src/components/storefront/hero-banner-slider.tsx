"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeImageUrl } from "@/lib/utils";

export interface HeroBannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  orderIndex: number;
}

interface HeroBannerSliderProps {
  banners: HeroBannerItem[];
}

export function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const total = banners.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay 5 seconds
  useEffect(() => {
    if (total <= 1 || isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [total, isHovered, handleNext]);

  if (total === 0) return null;

  const currentBanner = banners[currentIndex];

  const content = (
    <div
      className="group relative w-full rounded-md overflow-hidden bg-[#F7F7F5] min-h-[400px] aspect-[16/8] sm:aspect-[21/9] md:aspect-[24/9]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner Images with Crossfade effect */}
      {banners.map((b, idx) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={normalizeImageUrl(b.imageUrl)}
            alt={b.title}
            referrerPolicy="no-referrer"
            loading={idx === 0 ? "eager" : "lazy"}
            fetchPriority={idx === 0 ? "high" : "auto"}
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/1200x500/F3F3F1/74746E?text=CaoTri+Gaming+Gear";
            }}
          />

          {/* Banner Title Caption */}
          <div className="absolute bottom-8 left-8 z-20 max-w-xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#111] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-md mb-4 inline-block">
              {b.title}
            </h2>
            {b.linkUrl && (
              <div>
                <span className="inline-flex items-center justify-center bg-[#111] text-white h-11 px-[18px] rounded-lg text-sm font-medium">
                  Xem ngay
                </span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Prev / Next Controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FAFAFA]"
            aria-label="Slide trước"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5px]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white border border-[#E7E7E3] text-[#111] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#FAFAFA]"
            aria-label="Slide sau"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5px]" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? "w-2.5 h-2.5 bg-[#111]"
                    : "w-2.5 h-2.5 bg-[#D5D5D0]"
                }`}
                aria-label={`Đi tới slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (currentBanner.linkUrl) {
    return (
      <Link href={currentBanner.linkUrl} className="block cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
