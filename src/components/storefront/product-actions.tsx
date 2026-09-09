"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Zap, MessageSquare, Plus, Minus, CheckCircle, XCircle } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  productName: string;
  price: number;
  inStock: boolean;
  zaloUrl?: string;
}

export function ProductActions({
  productId,
  productName,
  price,
  inStock,
  zaloUrl = "https://zalo.me/0987654321",
}: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrease = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Sản phẩm hiện đang tạm hết hàng!");
      return;
    }
    toast.success(`Đã thêm ${quantity} x ${productName} vào giỏ hàng!`, {
      description: `Tổng tiền: ${formatVND(price * quantity)}`,
    });
  };

  const handleBuyNow = () => {
    if (!inStock) {
      toast.error("Sản phẩm hiện đang tạm hết hàng!");
      return;
    }
    toast.success(`Chuyển đến trang đặt hàng cho ${quantity} x ${productName}`, {
      description: "Tính năng thanh toán trực tiếp sẽ hoàn thiện trong Phase 5.",
    });
  };

  // Chuẩn bị URL Zalo kèm nội dung tư vấn
  let zaloLink = zaloUrl;
  if (!zaloLink.startsWith("http")) {
    const cleanNumber = zaloLink.replace(/[^0-9]/g, "");
    zaloLink = `https://zalo.me/${cleanNumber}`;
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Tình trạng kho & Chọn số lượng */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              Còn hàng (Sẵn sàng giao)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <XCircle className="w-3.5 h-3.5" />
              Tạm hết hàng
            </span>
          )}
        </div>

        {inStock && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-medium">Số lượng:</span>
            <div className="flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-0.5">
              <button
                type="button"
                onClick={decrease}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono text-sm font-semibold text-zinc-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increase}
                disabled={quantity >= 99}
                className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cụm Nút Mua hàng & Giỏ hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Thêm Vào Giỏ Hàng</span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Mua Ngay</span>
        </button>
      </div>

      {/* Nút Chat Zalo tư vấn nhanh 1-1 */}
      <a
        href={zaloLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-xs sm:text-sm bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 transition-all duration-200 group"
      >
        <MessageSquare className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
        <span>Chat Zalo để tư vấn cấu hình & ưu đãi riêng ngay lập tức</span>
      </a>
    </div>
  );
}
