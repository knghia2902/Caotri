"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatVND } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { createOrderAction } from "@/app/actions/order";

export function CheckoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const totalPrice = getTotalPrice();

  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerNotes: "",
  });

  const [errors, setErrors] = useState<{
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    general?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      errs.customerName = "Họ và tên cần tối thiểu 2 ký tự.";
    }

    const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;
    if (!formData.customerPhone.trim() || !phoneRegex.test(formData.customerPhone.trim())) {
      errs.customerPhone = "Số điện thoại không đúng định dạng (cần 10 chữ số).";
    }

    if (!formData.customerAddress.trim() || formData.customerAddress.trim().length < 5) {
      errs.customerAddress = "Vui lòng nhập địa chỉ nhận hàng chi tiết (số nhà, đường, quận/huyện).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại các thông tin nhận hàng!");
      return;
    }

    startTransition(async () => {
      setErrors({});
      const result = await createOrderAction({
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerNotes: formData.customerNotes || null,
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });

      if (!result.success || !result.orderNumber) {
        setErrors({ general: result.error || "Không thể đặt hàng, vui lòng thử lại!" });
        toast.error(result.error || "Đặt hàng thất bại!");
        return;
      }

      // Xóa giỏ hàng và điều hướng sang trang kết quả
      clearCart();
      toast.success("Đặt hàng thành công!");
      router.push(`/cart/success/${result.orderNumber}`);
    });
  };

  return (
    <div className="bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div>
        <h2 className="text-lg font-semibold text-[#111] tracking-tight">
          Thông Tin Giao Hàng
        </h2>
        <p className="text-xs text-[#74746E] mt-1">
          Điền thông tin nhận hàng nhanh chóng mà không cần đăng nhập tài khoản.
        </p>
      </div>

      {errors.general && (
        <div className="p-3 bg-[#FFF1F0] border border-[#FFA39E] text-[#D94A4A] rounded-lg text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Họ và tên */}
        <div>
          <label className="block text-xs font-medium text-[#555550] mb-1.5">
            Họ và tên người nhận <span className="text-[#D94A4A]">*</span>
          </label>
          <Input
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Ví dụ: Nguyễn Văn A"
            className="h-11 rounded-lg border-[#D5D5D0] bg-white text-sm focus:border-[#111]"
            disabled={isPending}
          />
          {errors.customerName && (
            <p className="text-xs text-[#D94A4A] mt-1">{errors.customerName}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-xs font-medium text-[#555550] mb-1.5">
            Số điện thoại nhận hàng <span className="text-[#D94A4A]">*</span>
          </label>
          <Input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            placeholder="Ví dụ: 0912345678"
            className="h-11 rounded-lg border-[#D5D5D0] bg-white text-sm focus:border-[#111]"
            disabled={isPending}
          />
          {errors.customerPhone && (
            <p className="text-xs text-[#D94A4A] mt-1">{errors.customerPhone}</p>
          )}
        </div>

        {/* Địa chỉ giao hàng */}
        <div>
          <label className="block text-xs font-medium text-[#555550] mb-1.5">
            Địa chỉ nhận hàng chi tiết <span className="text-[#D94A4A]">*</span>
          </label>
          <Input
            value={formData.customerAddress}
            onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
            className="h-11 rounded-lg border-[#D5D5D0] bg-white text-sm focus:border-[#111]"
            disabled={isPending}
          />
          {errors.customerAddress && (
            <p className="text-xs text-[#D94A4A] mt-1">{errors.customerAddress}</p>
          )}
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-xs font-medium text-[#555550] mb-1.5">
            Ghi chú giao hàng (Tùy chọn)
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
            placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..."
            className="w-full rounded-lg border border-[#D5D5D0] bg-white p-3 text-sm text-[#111] placeholder:text-[#A3A39D] focus:border-[#111] focus:outline-none min-h-[70px]"
            disabled={isPending}
          />
        </div>

        {/* Bảng tính tổng tiền */}
        <div className="pt-4 border-t border-[#E7E7E3] space-y-2.5">
          <div className="flex justify-between text-sm text-[#74746E]">
            <span>Tạm tính</span>
            <span className="font-medium text-[#111]">{formatVND(totalPrice)}</span>
          </div>

          <div className="flex justify-between text-sm text-[#74746E]">
            <span>Phí vận chuyển</span>
            <span className="font-medium text-[#21A366]">Miễn phí</span>
          </div>

          <div className="pt-3 border-t border-[#E7E7E3] flex justify-between items-baseline">
            <span className="text-base font-semibold text-[#111]">Tổng thanh toán</span>
            <span className="text-xl font-bold text-[#111]">{formatVND(totalPrice)}</span>
          </div>
        </div>

        {/* Nút gửi đơn */}
        <Button
          type="submit"
          disabled={isPending || items.length === 0}
          className="w-full h-12 rounded-lg bg-[#111] text-white hover:bg-[#222] font-medium text-sm flex items-center justify-center gap-2 mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Đang tạo đơn hàng...
            </>
          ) : (
            <>
              Đặt Hàng Ngay
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </form>

      {/* Cam kết mua sắm */}
      <div className="pt-4 border-t border-[#E7E7E3] space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#74746E]">
          <ShieldCheck className="w-4 h-4 text-[#74746E] flex-shrink-0" />
          <span>Hàng chính hãng 100%, bảo hành 1 đổi 1.</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#74746E]">
          <Truck className="w-4 h-4 text-[#74746E] flex-shrink-0" />
          <span>Giao hàng toàn quốc, thanh toán khi nhận (COD).</span>
        </div>
      </div>
    </div>
  );
}
