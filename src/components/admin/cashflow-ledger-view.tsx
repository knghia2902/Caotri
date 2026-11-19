"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Lock,
  Pencil,
  Trash2,
  X,
  Wallet,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { CashflowLedgerResult } from "@/lib/finance-analytics";
import {
  CASHFLOW_CATEGORIES,
  CASHFLOW_IN_CATEGORIES,
  CASHFLOW_OUT_CATEGORIES,
  CASHFLOW_CATEGORY_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  getCashflowCategoryLabel,
  getPaymentMethodLabel,
} from "@/lib/finance-schema";
import { VN_OFFSET_MS } from "@/lib/date-vn";
import { formatPrice } from "@/lib/utils";
import { deleteCashflowEntryAction } from "@/app/actions/cashflow";
import type { CashflowEntryModalData } from "@/components/admin/cashflow-entry-modal";

interface CashflowLedgerViewProps {
  ledger: CashflowLedgerResult;
  filters: {
    type: string;
    category: string;
    paymentMethod: string;
    q: string;
  };
  onEditEntry: (entry: CashflowEntryModalData) => void;
}

function formatVnDateTime(input: Date | string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  const vn = new Date(d.getTime() + VN_OFFSET_MS);
  const dd = String(vn.getUTCDate()).padStart(2, "0");
  const mm = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = vn.getUTCFullYear();
  const hh = String(vn.getUTCHours()).padStart(2, "0");
  const mi = String(vn.getUTCMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export function CashflowLedgerView({
  ledger,
  filters,
  onEditEntry,
}: CashflowLedgerViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.q);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { summary, entries } = ledger;

  const updateQuery = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "cashflow");
    for (const [k, v] of Object.entries(patch)) {
      if (!v || v === "ALL") {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ q: searchInput.trim() || null });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    updateQuery({
      type: null,
      category: null,
      paymentMethod: null,
      q: null,
    });
  };

  const handleDelete = (entryId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa phiếu thu/chi thủ công này?")) {
      return;
    }
    setDeletingId(entryId);
    startTransition(async () => {
      const res = await deleteCashflowEntryAction(entryId);
      setDeletingId(null);
      if (res.success) {
        toast.success(res.message || "Đã xóa phiếu thu/chi");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa phiếu thu/chi");
      }
    });
  };

  const hasActiveFilter =
    filters.type !== "ALL" ||
    filters.category !== "ALL" ||
    filters.paymentMethod !== "ALL" ||
    Boolean(filters.q);

  const categoryOptions =
    filters.type === "IN"
      ? CASHFLOW_IN_CATEGORIES
      : filters.type === "OUT"
      ? CASHFLOW_OUT_CATEGORIES
      : CASHFLOW_CATEGORIES;

  // Tỷ lệ Tiền mặt vs Chuyển khoản (tính theo tổng lưu lượng Thu + Chi của 2 kênh)
  const cashNet = summary.cashIn - summary.cashOut;
  const bankNet = summary.bankIn - summary.bankOut;
  const cashVolume = summary.cashIn + summary.cashOut;
  const bankVolume = summary.bankIn + summary.bankOut;
  const totalMethodVol = cashVolume + bankVolume;
  const cashPct = totalMethodVol > 0 ? (cashVolume / totalMethodVol) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng Thu */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Tổng Thu (IN)
            </span>
            <span className="w-7 h-7 rounded-md bg-emerald-50 text-[#21A366] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-[#21A366] mt-2">
            +{formatPrice(summary.totalIn)}
          </div>
          <div className="text-[11px] text-[#74746E] mt-2">
            TM: {formatPrice(summary.cashIn)} · CK: {formatPrice(summary.bankIn)}
          </div>
        </div>

        {/* Tổng Chi */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Tổng Chi (OUT)
            </span>
            <span className="w-7 h-7 rounded-md bg-red-50 text-[#D94A4A] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-[#D94A4A] mt-2">
            -{formatPrice(summary.totalOut)}
          </div>
          <div className="text-[11px] text-[#74746E] mt-2">
            {summary.inventoryImportOut > 0 ? (
              <span>
                Gồm nhập hàng:{" "}
                <strong className="text-[#111]">
                  {formatPrice(summary.inventoryImportOut)}
                </strong>
              </span>
            ) : (
              <span>
                TM: {formatPrice(summary.cashOut)} · CK:{" "}
                {formatPrice(summary.bankOut)}
              </span>
            )}
          </div>
        </div>

        {/* Dòng tiền ròng */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Dòng tiền ròng
            </span>
            <Wallet className="w-4 h-4 text-[#A3A39D]" />
          </div>
          <div
            className={`text-xl font-bold mt-2 ${
              summary.netCashflow >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
            }`}
          >
            {summary.netCashflow > 0 ? "+" : ""}
            {formatPrice(summary.netCashflow)}
          </div>
          <div className="text-[11px] text-[#74746E] mt-2">
            Tổng cộng {summary.count} giao dịch trong kỳ
          </div>
        </div>

        {/* Tiền mặt vs Chuyển khoản split bar */}
        <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
            Tiền mặt vs Chuyển khoản
          </div>
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#555550]">Tiền mặt (ròng)</span>
              <span className="font-mono font-semibold text-[#111]">
                {cashNet > 0 ? "+" : ""}
                {formatPrice(cashNet)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#555550]">Chuyển khoản (ròng)</span>
              <span className="font-mono font-semibold text-[#111]">
                {bankNet > 0 ? "+" : ""}
                {formatPrice(bankNet)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E7E7E3] overflow-hidden flex">
              <div
                className="h-full bg-[#111111]"
                style={{ width: `${cashPct}%` }}
                title={`Tiền mặt: ${cashPct.toFixed(0)}%`}
              />
              <div
                className="h-full bg-[#3B82F6]"
                style={{ width: `${100 - cashPct}%` }}
                title={`Chuyển khoản: ${(100 - cashPct).toFixed(0)}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#74746E]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                TM {totalMethodVol > 0 ? `${cashPct.toFixed(0)}%` : "0%"}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                CK {totalMethodVol > 0 ? `${(100 - cashPct).toFixed(0)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) =>
              updateQuery({ type: e.target.value, category: null })
            }
            className="h-9 rounded-lg bg-white border border-[#D5D5D0] px-3 text-xs font-medium text-[#111] focus:outline-none focus:border-[#111]"
          >
            <option value="ALL">Tất cả loại phiếu</option>
            <option value="IN">Chỉ Phiếu Thu (+)</option>
            <option value="OUT">Chỉ Phiếu Chi (-)</option>
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => updateQuery({ category: e.target.value })}
            className="h-9 rounded-lg bg-white border border-[#D5D5D0] px-3 text-xs font-medium text-[#111] focus:outline-none focus:border-[#111] max-w-[220px]"
          >
            <option value="ALL">Tất cả hạng mục</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {CASHFLOW_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>

          {/* Payment Method */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => updateQuery({ paymentMethod: e.target.value })}
            className="h-9 rounded-lg bg-white border border-[#D5D5D0] px-3 text-xs font-medium text-[#111] focus:outline-none focus:border-[#111]"
          >
            <option value="ALL">Tất cả phương thức</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {PAYMENT_METHOD_LABELS[pm]}
              </option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-medium text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Xóa lọc
            </button>
          )}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center w-full lg:w-72"
        >
          <Search className="w-4 h-4 text-[#74746E] absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm diễn giải, mã đơn, tên khách..."
            className="w-full h-9 pl-9 pr-14 rounded-lg bg-white border border-[#D5D5D0] text-xs text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111]"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-1 rounded-md bg-[#111] text-white text-[11px] font-medium hover:bg-black"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Ledger Table */}
      <div className="rounded-[10px] bg-white border border-[#E7E7E3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E7E7E3] text-[11px] font-semibold uppercase tracking-wider text-[#74746E]">
                <th className="py-3 px-4 whitespace-nowrap">Thời gian</th>
                <th className="py-3 px-3 whitespace-nowrap">Loại</th>
                <th className="py-3 px-4">Danh mục &amp; Diễn giải</th>
                <th className="py-3 px-3 whitespace-nowrap">Phương thức</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Số tiền
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Số dư lũy kế
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F3F1]">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 px-4 text-center text-sm text-[#74746E]"
                  >
                    Không có giao dịch thu/chi nào trong khoảng thời gian và bộ
                    lọc hiện tại.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isIn = entry.type === "IN";
                  const isOrderLinked = Boolean(entry.orderId);
                  const isDeleting = deletingId === entry.id && isPending;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#FAFAFA] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-[#555550] font-mono">
                        {formatVnDateTime(entry.occurredAt)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isIn
                              ? "bg-emerald-50 text-[#21A366]"
                              : "bg-red-50 text-[#D94A4A]"
                          }`}
                        >
                          {isIn ? "+ Thu" : "- Chi"}
                        </span>
                      </td>

                      <td className="py-3 px-4 min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#111]">
                            {getCashflowCategoryLabel(entry.category)}
                          </span>
                          {entry.order && (
                            <Link
                              href={`/admin/orders/${entry.order.id}`}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#F3F3F1] hover:bg-[#111] hover:text-white text-[11px] font-mono font-semibold text-[#111] transition-colors"
                            >
                              #{entry.order.orderNumber}
                            </Link>
                          )}
                        </div>
                        {entry.note && (
                          <div className="text-xs text-[#74746E] mt-0.5 line-clamp-2">
                            {entry.note}
                          </div>
                        )}
                        {entry.createdBy && (
                          <div className="text-[11px] text-[#A3A39D] mt-0.5">
                            Bởi {entry.createdBy.name}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F3F3F1] text-[#555550]">
                          {getPaymentMethodLabel(entry.paymentMethod)}
                        </span>
                      </td>

                      <td
                        className={`py-3 px-4 text-right whitespace-nowrap font-mono text-xs font-bold ${
                          isIn ? "text-[#21A366]" : "text-[#D94A4A]"
                        }`}
                      >
                        {isIn ? "+" : "-"}
                        {formatPrice(entry.amount)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right whitespace-nowrap font-mono text-xs font-semibold ${
                          entry.runningBalance >= 0
                            ? "text-[#111]"
                            : "text-[#D94A4A]"
                        }`}
                      >
                        {entry.runningBalance > 0 ? "+" : ""}
                        {formatPrice(entry.runningBalance)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isOrderLinked ? (
                          <span
                            title="Phiếu tự động đồng bộ từ đơn hàng — chỉnh sửa trạng thái trực tiếp trên đơn"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F7F7F5] border border-[#E7E7E3] text-[11px] text-[#74746E]"
                          >
                            <Lock className="w-3 h-3" />
                            Tự động
                          </span>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                onEditEntry({
                                  id: entry.id,
                                  type: entry.type,
                                  category: entry.category,
                                  amount: entry.amount,
                                  paymentMethod: entry.paymentMethod,
                                  occurredAt: entry.occurredAt,
                                  note: entry.note,
                                })
                              }
                              className="p-1.5 rounded-lg text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] transition-colors"
                              title="Chỉnh sửa phiếu"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 rounded-lg text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Xóa phiếu"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
