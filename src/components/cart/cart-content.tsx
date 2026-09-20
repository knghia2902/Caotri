"use client";

import Link from "next/link";
import { Package, ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartHydrated } from "@/stores/cart-store";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CheckoutForm } from "@/components/cart/checkout-form";

export function CartContent() {
  const { items, isHydrated, totalItems, clearCart } = useCartHydrated();

  // Loading skeleton while reading localStorage
  if (!isHydrated) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#74746E]">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-[#F3F3F1] rounded-full flex items-center justify-center mx-auto text-[#74746E]">
          <ShoppingBag className="w-10 h-10 stroke-[1.5px]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#111] tracking-tight">
            Giỏ hàng của bạn đang trống
          </h1>
          <p className="text-sm text-[#74746E]">
            Hiện tại bạn chưa chọn mua món phụ kiện hay thiết bị gaming gear nào. Hãy khám phá ngay các sản phẩm hot nhất nhé!
          </p>
        </div>

        <div>
          <Link href="/products">
            <Button className="h-11 px-6 rounded-lg bg-[#111] text-white hover:bg-[#222]">
              Khám Phá Sản Phẩm Ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Active Cart State (One-page Checkout)
  return (
    <div className="space-y-8">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-[#74746E] hover:text-[#111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tiếp tục xem sản phẩm
        </Link>

        <button
          type="button"
          onClick={() => {
            if (confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng?")) {
              clearCart();
            }
          }}
          className="inline-flex items-center gap-1 text-xs text-[#74746E] hover:text-[#D94A4A] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-baseline justify-between pb-4 border-b border-[#E7E7E3]">
            <h1 className="text-xl font-semibold text-[#111] tracking-tight">
              Giỏ Hàng
            </h1>
            <span className="text-xs text-[#74746E] font-medium">
              {totalItems} sản phẩm
            </span>
          </div>

          <div className="divide-y divide-[#E7E7E3]">
            {items.map((item) => (
              item?.id ? <CartItemRow key={item.id} item={item} /> : null
            ))}
          </div>
        </div>

        {/* Right Column: Checkout Form */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
