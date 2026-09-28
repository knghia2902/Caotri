"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getOrSetLocalVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let vid = localStorage.getItem("tg_vid");
    if (!vid || vid.length < 8) {
      vid = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem("tg_vid", vid);
    }
    return vid;
  } catch {
    return "";
  }
}

export function TrafficTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);
  const lastTrackedTime = useRef<number>(0);

  useEffect(() => {
    // 1. Không track các trang quản trị admin
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    const now = Date.now();
    // Chống duplicate kích hoạt lặp lại trong vòng 2 giây cho cùng 1 đường dẫn
    if (lastTrackedPath.current === pathname && now - lastTrackedTime.current < 2000) {
      return;
    }

    lastTrackedPath.current = pathname;
    lastTrackedTime.current = now;

    // 2. Chạy tracking ngầm qua requestIdleCallback hoặc setTimeout để 0ms ảnh hưởng tới tốc độ tải trang
    const trackTimer = setTimeout(() => {
      try {
        const vid = getOrSetLocalVisitorId();
        const payload = JSON.stringify({
          path: pathname,
          title: typeof document !== "undefined" ? document.title : "",
          visitorId: vid,
        });

        // Ưu tiên navigator.sendBeacon (không block browser lifecycle)
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/track", blob);
        } else {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Bỏ qua lỗi client-side
      }
    }, 400);

    return () => clearTimeout(trackTimer);
  }, [pathname]);

  return null;
}
