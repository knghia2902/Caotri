"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShoppingBag,
  BarChart3,
  BookOpen,
  Calendar,
} from "lucide-react";
import type {
  FinanceAnalyticsResult,
  CashflowLedgerResult,
} from "@/lib/finance-analytics";
import type { FinancePeriod } from "@/lib/date-vn";
import { Button } from "@/components/ui/button";
import {
  OfflineOrderModal,
  type OfflineProductOption,
} from "@/components/admin/offline-order-modal";
import {
  CashflowEntryModal,
  type CashflowEntryModalData,
} from "@/components/admin/cashflow-entry-modal";
import { FinanceAnalyticsView } from "@/components/admin/finance-analytics-view";
import { CashflowLedgerView } from "@/components/admin/cashflow-ledger-view";

export interface FinanceShellProps {
  tab: "analytics" | "cashflow";
  period: FinancePeriod;
  todayKey: string;
  analytics: FinanceAnalyticsResult;
  ledger: CashflowLedgerResult;
  ledgerFilters: {
    type: string;
    category: string;
    paymentMethod: string;
    q: string;
  };
  products: OfflineProductOption[];
}

const PERIOD_OPTIONS: { value: FinancePeriod; label: string }[] = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
];

export function FinanceShell({
  tab,
  period,
  todayKey,
  analytics,
  ledger,
  ledgerFilters,
  products,
}: FinanceShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [offlineModalOpen, setOfflineModalOpen] = useState(false);
  const [cashflowModalOpen, setCashflowModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] =
    useState<CashflowEntryModalData | null>(null);

  const navigateWithParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenNewCashflow = () => {
    setEditingEntry(null);
    setCashflowModalOpen(true);
  };

  const handleEditCashflow = (entry: CashflowEntryModalData) => {
    setEditingEntry(entry);
    setCashflowModalOpen(true);
  };

  const { range } = analytics;

  return (
    <div className="space-y-6">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111] flex items-center gap-2.5 tracking-tight">
            <Wallet className="w-6 h-6 text-[#111]" />
            Dòng tiền
          </h1>
          <p className="text-xs text-[#74746E] mt-1">
            Theo dõi doanh thu, giá vốn, lợi nhuận ròng và sổ quỹ thu/chi theo
            thời gian thực (giờ Việt Nam).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => setOfflineModalOpen(true)}
            className="h-9 px-3.5 rounded-[8px] bg-white text-[#111] border border-[#D5D5D0] hover:bg-[#F7F7F5] hover:border-[#111] text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />+ Tạo đơn bán ngoài
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleOpenNewCashflow}
            className="h-9 px-3.5 rounded-[8px] bg-[#111] hover:bg-black text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Ghi Thu / Chi
          </Button>
        </div>
      </div>

      {/* Tabs + Period Switcher Toolbar */}
      <div className="rounded-[10px] bg-white border border-[#E7E7E3] p-3 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* URL-synced Tabs */}
        <div className="inline-flex rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] p-1 self-start">
          <button
            type="button"
            onClick={() => navigateWithParams({ tab: "analytics" })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              tab === "analytics"
                ? "bg-[#111] text-white"
                : "text-[#74746E] hover:text-[#111]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Doanh thu &amp; Lợi nhuận
          </button>
          <button
            type="button"
            onClick={() => navigateWithParams({ tab: "cashflow" })}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              tab === "cashflow"
                ? "bg-[#111] text-white"
                : "text-[#74746E] hover:text-[#111]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sổ Quỹ &amp; Dòng tiền
          </button>
        </div>

        {/* Period Switcher + Prev/Next/Today + Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ngày | Tuần | Tháng */}
          <div className="inline-flex rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => navigateWithParams({ period: opt.value })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === opt.value
                    ? "bg-white text-[#111] shadow-sm"
                    : "text-[#74746E] hover:text-[#111]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Prev / Current Label / Next */}
          <div className="inline-flex items-center rounded-lg border border-[#E7E7E3] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() =>
                navigateWithParams({ date: range.prevAnchorKey })
              }
              className="h-8 w-8 flex items-center justify-center text-[#555550] hover:bg-[#F7F7F5] hover:text-[#111] transition-colors"
              title="Kỳ trước"
              aria-label="Kỳ trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-[#111] whitespace-nowrap">
              {range.label}
            </span>
            <button
              type="button"
              onClick={() =>
                navigateWithParams({ date: range.nextAnchorKey })
              }
              className="h-8 w-8 flex items-center justify-center text-[#555550] hover:bg-[#F7F7F5] hover:text-[#111] transition-colors"
              title="Kỳ sau"
              aria-label="Kỳ sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hiện tại */}
          <button
            type="button"
            onClick={() => navigateWithParams({ date: todayKey })}
            className="h-8 px-3 rounded-lg border border-[#D5D5D0] bg-white text-xs font-medium text-[#111] hover:bg-[#F7F7F5] transition-colors"
          >
            Hiện tại
          </button>

          {/* Date Picker */}
          <label className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[#74746E] absolute left-2.5 pointer-events-none" />
            <input
              type="date"
              value={range.anchorKey}
              onChange={(e) => {
                if (e.target.value) {
                  navigateWithParams({ date: e.target.value });
                }
              }}
              aria-label="Chọn ngày mốc"
              className="h-8 pl-8 pr-2.5 rounded-lg border border-[#D5D5D0] bg-white text-xs font-medium text-[#111] focus:outline-none focus:border-[#111]"
            />
          </label>
        </div>
      </div>

      {/* Main Content View */}
      {tab === "analytics" ? (
        <FinanceAnalyticsView analytics={analytics} />
      ) : (
        <CashflowLedgerView
          ledger={ledger}
          filters={ledgerFilters}
          onEditEntry={handleEditCashflow}
        />
      )}

      {/* Modals */}
      <OfflineOrderModal
        open={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        products={products}
      />

      <CashflowEntryModal
        open={cashflowModalOpen}
        onClose={() => {
          setCashflowModalOpen(false);
          setEditingEntry(null);
        }}
        entry={editingEntry}
      />
    </div>
  );
}
