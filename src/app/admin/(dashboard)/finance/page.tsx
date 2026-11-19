import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPeriodRange,
  getVnDateKey,
  isValidDateKey,
  type FinancePeriod,
} from "@/lib/date-vn";
import {
  getFinanceAnalytics,
  getCashflowLedger,
} from "@/lib/finance-analytics";
import { FinanceShell } from "@/components/admin/finance-shell";
import type { OfflineProductOption } from "@/components/admin/offline-order-modal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tài chính & Dòng tiền | Admin TringuyenGear",
  description:
    "Phân tích doanh thu, giá vốn, lợi nhuận ròng và quản lý sổ quỹ thu/chi",
};

interface AdminFinancePageProps {
  searchParams: Promise<{
    tab?: string;
    period?: string;
    date?: string;
    type?: string;
    category?: string;
    paymentMethod?: string;
    q?: string;
  }>;
}

function parseFirstThumbnail(rawImages: string | null | undefined): string | null {
  if (!rawImages) return null;
  try {
    const parsed = JSON.parse(rawImages);
    if (Array.isArray(parsed) && typeof parsed[0] === "string" && parsed[0].trim()) {
      return parsed[0].trim();
    }
  } catch {
    // Bỏ qua nếu JSON lỗi
  }
  return null;
}

export default async function AdminFinancePage({
  searchParams,
}: AdminFinancePageProps) {
  const session = await getCurrentSession();

  // Chỉ ADMIN mới có quyền xem tài chính, lợi nhuận & sổ quỹ
  if (!session || session.role !== "ADMIN") {
    redirect("/admin");
  }

  const params = await searchParams;
  const tab: "analytics" | "cashflow" =
    params.tab === "cashflow" ? "cashflow" : "analytics";

  const period: FinancePeriod =
    params.period === "day" || params.period === "week" || params.period === "month"
      ? params.period
      : "month";

  const todayKey = getVnDateKey(new Date());
  const dateKey = isValidDateKey(params.date) ? params.date : todayKey;
  const range = getPeriodRange(period, dateKey);

  const ledgerFilters = {
    type: params.type?.trim().toUpperCase() || "ALL",
    category: params.category?.trim().toUpperCase() || "ALL",
    paymentMethod: params.paymentMethod?.trim().toUpperCase() || "ALL",
    q: params.q?.trim() || "",
  };

  const [analytics, ledger, rawProducts] = await Promise.all([
    getFinanceAnalytics(period, dateKey),
    getCashflowLedger({
      startKey: range.startKey,
      endKey: range.endKey,
      type: ledgerFilters.type,
      category: ledgerFilters.category,
      paymentMethod: ledgerFilters.paymentMethod,
      q: ledgerFilters.q || undefined,
    }),
    prisma.product.findMany({
      where: { isArchived: false },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        costPrice: true,
        inStock: true,
        images: true,
      },
    }),
  ]);

  const products: OfflineProductOption[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    costPrice: p.costPrice ?? null,
    inStock: p.inStock,
    thumbnail: parseFirstThumbnail(p.images),
  }));

  return (
    <FinanceShell
      tab={tab}
      period={period}
      todayKey={todayKey}
      analytics={analytics}
      ledger={ledger}
      ledgerFilters={ledgerFilters}
      products={products}
    />
  );
}
