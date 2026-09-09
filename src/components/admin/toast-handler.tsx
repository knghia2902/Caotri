"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export function ToastHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "forbidden") {
      toast.error("Bạn không có quyền truy cập trang này", {
        description: "Tính năng này chỉ dành riêng cho tài khoản Quản trị viên (Admin).",
        duration: 4000,
      });

      // Dọn sạch query param trên URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl);
    }
  }, [searchParams, pathname, router]);

  return null;
}
