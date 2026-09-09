"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, MessageSquare, Plus, Minus, CheckCircle, XCircle } from "lucide-react";
import { formatVND } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";

interface ProductActionsProps {
  productId: string;
  productName: string;
  slug?: string;
  price: number;
  originalPrice?: number | null;
  image?: string;
  inStock: boolean;
  zaloUrl?: string;
}

export function ProductActions({
  productId,
  productName,
  slug = "",
  price,
  originalPrice,
  image = "",
  inStock,
  zaloUrl = "https://zalo.me/0987654321",
}: ProductActionsProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrease = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("Sản phẩm hiện đang tạm hết hàng!");
      return;
    }

    addItem(
      {
        id: productId,
        name: productName,
        slug,
        price,
        originalPrice,
        image,
      },
      quantity
    );

    toast.success(`Đã thêm ${quantity}x "${productName}" vào giỏ hàng!`, {
      description: `Tổng tiền: ${formatVND(price * quantity)}`,
      action: {
        label: "Xem giỏ hàng",
        onClick: () => router.push("/cart"),
      },
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#21A366]">
              <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
              Còn hàng
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D94A4A]">
              <XCircle className="w-4 h-4" strokeWidth={1.5} />
              Hết hàng
            </span>
          )}
        </div>

        {inStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#74746E]">Số lượng:</span>
            <div className="flex items-center rounded-lg bg-white border border-[#D5D5D0] p-0.5">
              <button
                type="button"
                onClick={decrease}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Giảm số lượng"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center font-medium text-sm text-[#111]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increase}
                disabled={quantity >= 99}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Tăng số lượng"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cụm Nút Mua hàng & Giỏ hàng */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="w-full flex items-center justify-center gap-2 px-6 h-12 rounded-lg font-medium text-sm transition-all duration-200 bg-[#111] text-white hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
          <span>Thêm vào giỏ hàng</span>
        </button>

        {/* Nút Chat Zalo tư vấn nhanh */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 px-6 h-11 rounded-lg font-medium text-sm bg-white hover:bg-[#FAFAFA] text-[#111] border border-[#D5D5D0] transition-all duration-200"
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          <span>Chat Zalo tư vấn</span>
        </a>
      </div>
    </div>
  );
}
