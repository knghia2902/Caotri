"use client";

import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";
import { type CartItem, useCartStore } from "@/stores/cart-store";
import { formatVND } from "@/lib/utils";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const fallbackImage = "https://placehold.co/400x400/F3F3F1/A3A39D?text=No+Image";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-[#E7E7E3] last:border-b-0">
      {/* Product Media & Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative w-20 h-20 bg-[#F3F3F1] rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image || fallbackImage}
            alt={item.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium text-[#111] hover:text-[#74746E] transition-colors line-clamp-2"
          >
            {item.name}
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#111]">
              {formatVND(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-[#A3A39D] line-through">
                {formatVND(item.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stepper Quantity & Subtotal & Delete */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-[#D5D5D0] rounded-lg bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-8 h-8 flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] transition-colors disabled:opacity-30"
            disabled={item.quantity <= 1}
            aria-label="Giảm số lượng"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center text-sm font-medium text-[#111]">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] transition-colors disabled:opacity-30"
            disabled={item.quantity >= 99}
            aria-label="Tăng số lượng"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Amount */}
        <div className="text-right min-w-[100px]">
          <span className="text-sm font-semibold text-[#111]">
            {formatVND(item.price * item.quantity)}
          </span>
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="p-2 text-[#74746E] hover:text-[#D94A4A] rounded-lg hover:bg-[#F3F3F1] transition-colors"
          title="Xóa sản phẩm"
          aria-label="Xóa sản phẩm"
        >
          <Trash2 className="w-4 h-4 stroke-[1.5px]" />
        </button>
      </div>
    </div>
  );
}
