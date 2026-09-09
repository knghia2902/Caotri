"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface CancelOrderDialogProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending?: boolean;
}

const quickReasons = [
  "Khách đổi ý qua Zalo",
  "Không liên lạc được",
  "Trùng đơn hàng",
  "Sai số điện thoại/địa chỉ",
];

export function CancelOrderDialog({
  isOpen,
  orderNumber,
  onClose,
  onConfirm,
  isPending = false,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E7E7E3] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-2.5 text-[#D94A4A]">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#111]">
              Hủy đơn hàng #{orderNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-[#74746E] hover:text-[#111] p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[#74746E] leading-relaxed">
            Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang{" "}
            <span className="font-semibold text-[#D94A4A]">Đã hủy</span>? Hành
            động này sẽ lưu lý do vào nhật ký nội bộ của đơn hàng.
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#111]">
              Chọn nhanh lý do:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickReasons.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => setReason(qr)}
                  className="px-2.5 py-1 text-[11px] rounded-md border border-[#E7E7E3] hover:border-[#111] bg-[#F7F7F5] text-[#111] transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#111]">
              Ghi chú lý do hủy (tùy chọn):
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết để nhân viên khác cùng nắm thông tin..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E7E3] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-[#74746E] hover:text-[#111] rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D94A4A] hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              {isPending ? "Đang xử lý..." : "Xác nhận Hủy Đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
