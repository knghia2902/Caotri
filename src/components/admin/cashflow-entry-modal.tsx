"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { VN_OFFSET_MS } from "@/lib/date-vn";
import {
  CASHFLOW_IN_CATEGORIES,
  CASHFLOW_OUT_CATEGORIES,
  CASHFLOW_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  type CashflowType,
  type CashflowCategory,
  type PaymentMethod,
} from "@/lib/finance-schema";
import {
  createCashflowEntryAction,
  updateCashflowEntryAction,
} from "@/app/actions/cashflow";

export interface CashflowEntryModalData {
  id: string;
  type: string;
  category: string;
  amount: number;
  paymentMethod: string;
  occurredAt: Date | string;
  note: string | null;
}

export interface CashflowEntryModalProps {
  open: boolean;
  onClose: () => void;
  entry?: CashflowEntryModalData | null;
  onSuccess?: () => void;
}

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: PAYMENT_METHOD_LABELS.CASH },
  { value: "BANK_TRANSFER", label: PAYMENT_METHOD_LABELS.BANK_TRANSFER },
  { value: "COD", label: PAYMENT_METHOD_LABELS.COD },
  { value: "OTHER", label: PAYMENT_METHOD_LABELS.OTHER },
];

function toVnDateTimeLocal(input?: Date | string | null): string {
  const base = input ? new Date(input) : new Date();
  const safe = Number.isNaN(base.getTime()) ? new Date() : base;
  const vn = new Date(safe.getTime() + VN_OFFSET_MS);
  const yyyy = vn.getUTCFullYear();
  const mm = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vn.getUTCDate()).padStart(2, "0");
  const hh = String(vn.getUTCHours()).padStart(2, "0");
  const mi = String(vn.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function CashflowEntryModal({
  open,
  onClose,
  entry,
  onSuccess,
}: CashflowEntryModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(entry?.id);

  const [type, setType] = useState<CashflowType>("OUT");
  const [category, setCategory] = useState<CashflowCategory>("OPERATING");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [occurredAt, setOccurredAt] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    if (entry) {
      const nextType: CashflowType = entry.type === "IN" ? "IN" : "OUT";
      setType(nextType);
      setCategory(entry.category as CashflowCategory);
      setAmount(String(entry.amount));
      setPaymentMethod((entry.paymentMethod as PaymentMethod) || "CASH");
      setOccurredAt(toVnDateTimeLocal(entry.occurredAt));
      setNote(entry.note || "");
    } else {
      setType("OUT");
      setCategory("OPERATING");
      setAmount("");
      setPaymentMethod("CASH");
      setOccurredAt(toVnDateTimeLocal());
      setNote("");
    }
  }, [open, entry]);

  if (!open) return null;

  const availableCategories: readonly CashflowCategory[] =
    type === "IN" ? CASHFLOW_IN_CATEGORIES : CASHFLOW_OUT_CATEGORIES;

  const handleTypeSwitch = (nextType: CashflowType) => {
    if (nextType === type) return;
    setType(nextType);
    if (nextType === "IN") {
      setCategory("OTHER_IN");
    } else {
      setCategory("OPERATING");
    }
  };

  const parsedAmount = Number(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ lớn hơn 0");
      return;
    }

    startTransition(async () => {
      const res =
        isEditing && entry?.id
          ? await updateCashflowEntryAction({
              id: entry.id,
              type,
              category,
              amount: parsedAmount,
              paymentMethod,
              occurredAt: occurredAt || undefined,
              note: note.trim() || null,
            })
          : await createCashflowEntryAction({
              type,
              category,
              amount: parsedAmount,
              paymentMethod,
              occurredAt: occurredAt || undefined,
              note: note.trim() || null,
            });

      if (res.success) {
        toast.success(
          res.message ||
            (isEditing
              ? "Đã cập nhật phiếu thu/chi thành công"
              : "Đã ghi nhận phiếu thu/chi thành công")
        );
        onSuccess?.();
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Thao tác thất bại");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="relative w-full max-w-lg rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 text-[#111]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E7E7E3]">
          <div>
            <h3 className="text-base font-bold text-[#111]">
              {isEditing ? "Chỉnh sửa phiếu Thu / Chi" : "Ghi nhận phiếu Thu / Chi"}
            </h3>
            <p className="text-xs text-[#74746E] mt-0.5">
              {isEditing
                ? "Cập nhật thông tin giao dịch thủ công trong sổ quỹ"
                : "Ghi chép các khoản chi vận hành, nhập hàng hoặc thu nhập ngoài đơn"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 2-way toggle: Phiếu Thu (IN) vs Phiếu Chi (OUT) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTypeSwitch("IN")}
              className={`flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-semibold transition-colors ${
                type === "IN"
                  ? "bg-emerald-50 text-[#21A366] border-[#21A366]"
                  : "bg-white text-[#74746E] border-[#D5D5D0] hover:border-[#111] hover:text-[#111]"
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              + Phiếu Thu (IN)
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleTypeSwitch("OUT")}
              className={`flex items-center justify-center gap-2 h-11 rounded-lg border text-sm font-semibold transition-colors ${
                type === "OUT"
                  ? "bg-red-50 text-[#D94A4A] border-[#D94A4A]"
                  : "bg-white text-[#74746E] border-[#D5D5D0] hover:border-[#111] hover:text-[#111]"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              - Phiếu Chi (OUT)
            </button>
          </div>

          {/* Số tiền */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                Số tiền (VNĐ) <span className="text-[#D94A4A]">*</span>
              </label>
              {parsedAmount > 0 && !Number.isNaN(parsedAmount) && (
                <span
                  className={`text-xs font-semibold ${
                    type === "IN" ? "text-[#21A366]" : "text-[#D94A4A]"
                  }`}
                >
                  {type === "IN" ? "+" : "-"}
                  {formatPrice(parsedAmount)}
                </span>
              )}
            </div>
            <Input
              type="number"
              min={1}
              step={1000}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="VD: 500000"
              disabled={isPending}
              className="h-11 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-base font-semibold text-[#111]"
            />
          </div>

          {/* Danh mục */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Hạng mục {type === "IN" ? "thu" : "chi"}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CashflowCategory)}
              disabled={isPending}
              className="w-full h-11 rounded-lg bg-white border border-[#D5D5D0] px-3 text-sm text-[#111] focus:outline-none focus:border-[#111]"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {CASHFLOW_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            {category === "INVENTORY_IMPORT" && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] px-3 py-2 text-[11px] text-[#555550]">
                <Info className="w-3.5 h-3.5 text-[#74746E] shrink-0 mt-0.5" />
                <span>
                  Khoản <strong>Nhập hàng / Thu mua</strong> được theo dõi trong{" "}
                  <strong>Sổ Quỹ</strong> và không cộng vào Chi phí vận hành để
                  tránh tính trùng với Giá vốn hàng bán (COGS).
                </span>
              </div>
            )}
          </div>

          {/* Phương thức thanh toán */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2">
              Phương thức thanh toán
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHOD_OPTIONS.map((opt) => {
                const active = paymentMethod === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? "bg-[#111] text-white border-[#111]"
                        : "bg-white text-[#555550] border-[#D5D5D0] hover:border-[#111] hover:text-[#111]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thời gian phát sinh */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Thời gian phát sinh (giờ VN)
            </label>
            <Input
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              disabled={isPending}
              className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm text-[#111]"
            />
          </div>

          {/* Diễn giải / Ghi chú */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Diễn giải / Ghi chú
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                type === "IN"
                  ? "VD: Thu tiền vệ sinh bàn phím, thu khác..."
                  : "VD: Tiền điện tháng 11, nhập 5 chuột Logitech 2nd..."
              }
              rows={3}
              disabled={isPending}
              className="w-full rounded-lg bg-white border border-[#D5D5D0] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111] resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E7E7E3]">
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-white text-[#111] border border-[#D5D5D0] hover:bg-[#FAFAFA] rounded-lg h-10 px-4 text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px] bg-[#111] hover:bg-black text-white rounded-lg h-10 px-5 text-sm font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                "Cập nhật phiếu"
              ) : type === "IN" ? (
                "Lưu phiếu Thu"
              ) : (
                "Lưu phiếu Chi"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
