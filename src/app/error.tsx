"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-[#E7E7E3] shadow-lg space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#111]">
            Đã có lỗi xảy ra
          </h2>
          <p className="text-xs text-[#74746E]">
            Phiên làm việc vừa được cập nhật hoặc kết nối tạm thời bị gián đoạn. Vui lòng tải lại trang để đồng bộ phiên bản mới nhất.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="h-10 bg-[#111] text-white hover:bg-black gap-2 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tải lại trang
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="h-10 border-[#E7E7E3] hover:bg-[#F7F7F5] gap-2 text-xs font-medium w-full"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
