"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MessageSquare, MessageCircle, Copy, Check, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils";

interface OrderSuccessActionsProps {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string | null;
  totalAmount: number;
  items: {
    productName: string;
    price: number;
    quantity: number;
  }[];
  zaloUrl?: string;
  facebookUrl?: string;
  hotline?: string;
}

export function OrderSuccessActions({
  orderNumber,
  customerName,
  customerPhone,
  customerAddress,
  customerNotes,
  totalAmount,
  items,
  zaloUrl = "https://zalo.me/0987654321",
  facebookUrl = "https://facebook.com/tringuyengear",
  hotline = "0987.654.321",
}: OrderSuccessActionsProps) {
  const [hasCopied, setHasCopied] = useState(false);

  // Soạn tin nhắn chốt đơn chi tiết và chuẩn mực tiếng Việt
  const buildOrderMessage = () => {
    const itemListStr = items
      .map(
        (i, idx) =>
          `  ${idx + 1}. ${i.quantity}x ${i.productName} (${formatVND(i.price)}) = ${formatVND(i.price * i.quantity)}`
      )
      .join("\n");

    const notesStr = customerNotes?.trim() ? `\n- Ghi chú: ${customerNotes.trim()}` : "";

    return `Xin chào TringuyenGear! Tôi muốn chốt đơn hàng vừa đặt trên website:
- Mã đơn: #${orderNumber}
- Khách hàng: ${customerName} - SĐT: ${customerPhone}
- Địa chỉ nhận: ${customerAddress}${notesStr}
- Danh sách sản phẩm:
${itemListStr}
- Tổng thanh toán: ${formatVND(totalAmount)}

Nhờ shop kiểm tra và xác nhận giúp tôi nhé! Cảm ơn shop!`;
  };

  const handleCopyOrderInfo = async () => {
    const message = buildOrderMessage();
    try {
      await navigator.clipboard.writeText(message);
      setHasCopied(true);
      toast.success("Đã sao chép thông tin đơn hàng vào bộ nhớ tạm!", {
        description: "Bạn có thể dán (Paste) vào Zalo, Messenger hoặc bất kỳ ứng dụng nào.",
      });
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      toast.error("Không thể tự động sao chép, vui lòng thử lại!");
    }
  };

  // Chuẩn hóa link Zalo
  let zaloLink = zaloUrl;
  if (!zaloLink.startsWith("http")) {
    const cleanNumber = zaloLink.replace(/[^0-9]/g, "");
    zaloLink = `https://zalo.me/${cleanNumber}`;
  }

  // Chuẩn hóa link Facebook
  let fbLink = facebookUrl;
  if (!fbLink.startsWith("http")) {
    fbLink = `https://${fbLink}`;
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nút 1: Chốt đơn qua Zalo */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-[#0068FF] text-white hover:bg-[#0052cc] font-medium text-sm transition-colors shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Chốt Đơn Qua Zalo
        </a>

        {/* Nút 2: Chat Facebook Messenger */}
        <a
          href={fbLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-lg bg-[#0084FF] text-white hover:bg-[#0070db] font-medium text-sm transition-colors shadow-sm"
        >
          <MessageSquare className="w-5 h-5" />
          Chat Facebook Messenger
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Nút 3: Sao chép thông tin đơn hàng */}
        <Button
          type="button"
          variant="outline"
          onClick={handleCopyOrderInfo}
          className="w-full sm:flex-1 h-11 rounded-lg border-[#D5D5D0] text-[#111] hover:bg-[#FAFAFA] text-sm flex items-center justify-center gap-2"
        >
          {hasCopied ? (
            <>
              <Check className="w-4 h-4 text-[#21A366]" />
              Đã sao chép thông tin!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Sao Chép Thông Tin Đơn Hàng
            </>
          )}
        </Button>

        {/* Nút 4: Tiếp tục mua sắm */}
        <Link href="/products" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto h-11 px-5 rounded-lg border-[#D5D5D0] text-[#111] hover:bg-[#FAFAFA] text-sm flex items-center justify-center gap-1.5"
          >
            Tiếp tục xem gear
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Hotline fallback */}
      <div className="pt-2 text-center">
        <p className="text-xs text-[#74746E]">
          Cần hỗ trợ đơn hàng khẩn cấp? Gọi ngay Hotline:{" "}
          <a
            href={`tel:${hotline.replace(/[^0-9]/g, "")}`}
            className="font-semibold text-[#111] hover:underline"
          >
            {hotline}
          </a>
        </p>
      </div>
    </div>
  );
}
