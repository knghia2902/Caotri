"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
      className="group relative w-full rounded-2xl md:rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl aspect-[16/8] sm:aspect-[21/9] md:aspect-[24/9]"
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
            src={b.imageUrl}
            alt={b.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/1200x500/18181b/a1a1aa?text=CaoTri+Gaming+Gear";
            }}
          />

          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

          {/* Banner Title Caption */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 z-20 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md mb-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Sự Kiện Hot • Ưu Đãi Mùa Này
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
              {b.title}
            </h2>
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-zinc-950/70 border border-zinc-700/80 text-zinc-200 hover:text-cyan-400 hover:border-cyan-500 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Slide trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full bg-zinc-950/70 border border-zinc-700/80 text-zinc-200 hover:text-cyan-400 hover:border-cyan-500 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Slide sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-6 z-30 flex items-center gap-1.5">
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
                    ? "w-6 h-2 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    : "w-2 h-2 bg-zinc-600 hover:bg-zinc-400"
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
