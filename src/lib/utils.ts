import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | bigint | null | undefined): string {
  if (price === null || price === undefined) return "0 ₫";
  const num = typeof price === "string" ? parseFloat(price) : Number(price);
  if (isNaN(num)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export const formatVND = formatPrice;

export function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "CONTACTED":
      return "Đã liên hệ";
    case "SHIPPING":
      return "Đang giao";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

/**
 * Tự động chuẩn hóa và chuyển đổi các link chia sẻ đám mây (Google Drive, Dropbox...)
 * thành link ảnh CDN trực tiếp để hiển thị mượt mà trên website
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  let cleanUrl = url.trim();

  // 1. Google Drive share link -> Google UserContent direct image CDN
  if (cleanUrl.includes("drive.google.com") || cleanUrl.includes("docs.google.com")) {
    const match =
      cleanUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/) ||
      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
  }

  // 2. Dropbox share link -> direct download link
  if (cleanUrl.includes("dropbox.com")) {
    cleanUrl = cleanUrl.replace(/[?&]dl=0/, "?raw=1");
    if (!cleanUrl.includes("raw=1") && !cleanUrl.includes("dl=1")) {
      cleanUrl += cleanUrl.includes("?") ? "&raw=1" : "?raw=1";
    }
    return cleanUrl;
  }

  return cleanUrl;
}

