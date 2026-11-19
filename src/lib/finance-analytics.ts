import { prisma } from "@/lib/prisma";
import {
  getPeriodRange,
  getVnDateKey,
  type FinancePeriod,
  type PeriodRange,
} from "@/lib/date-vn";
import {
  getChannelLabel,
  OPERATING_EXPENSE_CATEGORIES,
} from "@/lib/finance-schema";

export interface FinanceSeriesPoint {
  key: string; // "YYYY-MM-DD"
  label: string; // "DD/MM"
  revenue: number;
  webRevenue: number;
  offlineRevenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  otherIncome: number;
  netProfit: number;
  cashIn: number;
  cashOut: number;
  netCashflow: number;
  ordersCount: number;
}

export interface ChannelMixItem {
  channel: string;
  label: string;
  revenue: number;
  ordersCount: number;
  sharePct: number;
}

export interface FinanceAnalyticsResult {
  range: PeriodRange;
  prevRange: PeriodRange;
  revenue: number;
  prevRevenue: number;
  revenueChangePct: number | null;
  webRevenue: number;
  offlineRevenue: number;
  ordersCount: number;
  webOrdersCount: number;
  offlineOrdersCount: number;
  cogs: number;
  missingCostItemsCount: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  otherIncome: number;
  inventoryImportOut: number;
  netProfit: number;
  prevNetProfit: number;
  netProfitChangePct: number | null;
  netMarginPct: number;
  cashIn: number;
  cashOut: number;
  netCashflow: number;
  channelMix: ChannelMixItem[];
  series: FinanceSeriesPoint[];
}

export interface CashflowLedgerFilters {
  startKey?: string;
  endKey?: string;
  type?: string;
  category?: string;
  paymentMethod?: string;
  q?: string;
}

export interface CashflowLedgerEntry {
  id: string;
  type: string;
  category: string;
  amount: number;
  paymentMethod: string;
  occurredAt: Date;
  dateKey: string;
  note: string | null;
  orderId: string | null;
  order: {
    id: string;
    orderNumber: string;
    channel: string;
    customerName: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
  } | null;
  runningBalance: number;
  createdAt: Date;
}

export interface CashflowLedgerSummary {
  totalIn: number;
  totalOut: number;
  netCashflow: number;
  cashIn: number;
  cashOut: number;
  bankIn: number;
  bankOut: number;
  inventoryImportOut: number;
  count: number;
}

export interface CashflowLedgerResult {
  summary: CashflowLedgerSummary;
  entries: CashflowLedgerEntry[];
}

export interface DashboardFinanceSnapshot {
  today: {
    dateKey: string;
    revenue: number;
    webRevenue: number;
    offlineRevenue: number;
    netProfit: number;
    netCashflow: number;
    ordersCount: number;
    offlineOrdersCount: number;
    missingCostItemsCount: number;
  };
  thisMonth: {
    label: string;
    revenue: number;
    webRevenue: number;
    offlineRevenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    netCashflow: number;
    ordersCount: number;
    offlineOrdersCount: number;
    missingCostItemsCount: number;
  };
}

interface OrderForFinance {
  id: string;
  channel: string;
  totalAmount: number;
  soldAt: Date | null;
  updatedAt: Date;
  items: {
    costPrice: number | null;
    quantity: number;
  }[];
}

interface CashflowForFinance {
  type: string;
  category: string;
  amount: number;
  dateKey: string;
}

function getOrderEffectiveDateKey(order: {
  soldAt: Date | null;
  updatedAt: Date;
}): string {
  return getVnDateKey(order.soldAt ?? order.updatedAt);
}

function calcChangePct(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

function isOperatingExpense(category: string): boolean {
  return (OPERATING_EXPENSE_CATEGORIES as readonly string[]).includes(category);
}

function aggregateWindow(
  orders: OrderForFinance[],
  cashflows: CashflowForFinance[],
  startKey: string,
  endKey: string
) {
  let revenue = 0;
  let webRevenue = 0;
  let offlineRevenue = 0;
  let ordersCount = 0;
  let webOrdersCount = 0;
  let offlineOrdersCount = 0;
  let cogs = 0;
  let missingCostItemsCount = 0;

  const channelMap = new Map<string, { revenue: number; ordersCount: number }>();

  for (const order of orders) {
    const dk = getOrderEffectiveDateKey(order);
    if (dk < startKey || dk > endKey) continue;

    revenue += order.totalAmount;
    ordersCount += 1;

    if (order.channel === "WEB") {
      webRevenue += order.totalAmount;
      webOrdersCount += 1;
    } else {
      offlineRevenue += order.totalAmount;
      offlineOrdersCount += 1;
    }

    const ch = order.channel || "WEB";
    const prevCh = channelMap.get(ch) ?? { revenue: 0, ordersCount: 0 };
    prevCh.revenue += order.totalAmount;
    prevCh.ordersCount += 1;
    channelMap.set(ch, prevCh);

    for (const item of order.items) {
      if (item.costPrice === null || item.costPrice === undefined) {
        missingCostItemsCount += 1;
      } else {
        cogs += item.costPrice * item.quantity;
      }
    }
  }

  let otherIncome = 0;
  let operatingExpenses = 0;
  let inventoryImportOut = 0;
  let cashIn = 0;
  let cashOut = 0;

  for (const cf of cashflows) {
    if (cf.dateKey < startKey || cf.dateKey > endKey) continue;

    if (cf.type === "IN") {
      cashIn += cf.amount;
      if (cf.category === "OTHER_IN") {
        otherIncome += cf.amount;
      }
    } else if (cf.type === "OUT") {
      cashOut += cf.amount;
      if (cf.category === "INVENTORY_IMPORT") {
        inventoryImportOut += cf.amount;
      } else if (isOperatingExpense(cf.category)) {
        operatingExpenses += cf.amount;
      }
    }
  }

  const grossProfit = revenue - cogs;
  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netProfit = grossProfit + otherIncome - operatingExpenses;
  const netMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const netCashflow = cashIn - cashOut;

  const channelMix: ChannelMixItem[] = Array.from(channelMap.entries())
    .map(([channel, stats]) => ({
      channel,
      label: getChannelLabel(channel),
      revenue: stats.revenue,
      ordersCount: stats.ordersCount,
      sharePct: revenue > 0 ? (stats.revenue / revenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    revenue,
    webRevenue,
    offlineRevenue,
    ordersCount,
    webOrdersCount,
    offlineOrdersCount,
    cogs,
    missingCostItemsCount,
    grossProfit,
    grossMarginPct,
    operatingExpenses,
    otherIncome,
    inventoryImportOut,
    netProfit,
    netMarginPct,
    cashIn,
    cashOut,
    netCashflow,
    channelMix,
  };
}

/**
 * Thống kê Doanh thu, Giá vốn (COGS), Lợi nhuận gộp, Chi phí vận hành, Lợi nhuận ròng & Dòng tiền
 * theo Ngày / Tuần (T2-CN) / Tháng (giờ Việt Nam UTC+7).
 */
export async function getFinanceAnalytics(
  period: FinancePeriod,
  dateKey?: string
): Promise<FinanceAnalyticsResult> {
  const range = getPeriodRange(period, dateKey);
  const prevRange = getPeriodRange(period, range.prevAnchorKey);

  const earliestBucketStart =
    range.buckets.length > 0 ? range.buckets[0].start : range.start;
  const queryStart =
    prevRange.start < earliestBucketStart
      ? prevRange.start
      : earliestBucketStart;
  const queryEnd = range.end;

  const earliestKey =
    prevRange.startKey < (range.buckets[0]?.key ?? range.startKey)
      ? prevRange.startKey
      : range.buckets[0]?.key ?? range.startKey;

  const [completedOrders, cashflowEntries] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          { soldAt: { gte: queryStart, lte: queryEnd } },
          { soldAt: null, updatedAt: { gte: queryStart, lte: queryEnd } },
        ],
      },
      select: {
        id: true,
        channel: true,
        totalAmount: true,
        soldAt: true,
        updatedAt: true,
        items: {
          select: {
            costPrice: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.cashflowEntry.findMany({
      where: {
        dateKey: {
          gte: earliestKey,
          lte: range.endKey,
        },
      },
      select: {
        type: true,
        category: true,
        amount: true,
        dateKey: true,
      },
    }),
  ]);

  const current = aggregateWindow(
    completedOrders,
    cashflowEntries,
    range.startKey,
    range.endKey
  );
  const previous = aggregateWindow(
    completedOrders,
    cashflowEntries,
    prevRange.startKey,
    prevRange.endKey
  );

  // Gom nhóm theo từng ngày cho biểu đồ & bảng chi tiết
  const ordersByDay = new Map<string, OrderForFinance[]>();
  for (const order of completedOrders) {
    const dk = getOrderEffectiveDateKey(order);
    const list = ordersByDay.get(dk);
    if (list) list.push(order);
    else ordersByDay.set(dk, [order]);
  }

  const cashflowsByDay = new Map<string, CashflowForFinance[]>();
  for (const cf of cashflowEntries) {
    const list = cashflowsByDay.get(cf.dateKey);
    if (list) list.push(cf);
    else cashflowsByDay.set(cf.dateKey, [cf]);
  }

  const series: FinanceSeriesPoint[] = range.buckets.map((bucket) => {
    const dayOrders = ordersByDay.get(bucket.key) ?? [];
    const dayCashflows = cashflowsByDay.get(bucket.key) ?? [];
    const stats = aggregateWindow(dayOrders, dayCashflows, bucket.key, bucket.key);

    return {
      key: bucket.key,
      label: bucket.label,
      revenue: stats.revenue,
      webRevenue: stats.webRevenue,
      offlineRevenue: stats.offlineRevenue,
      cogs: stats.cogs,
      grossProfit: stats.grossProfit,
      operatingExpenses: stats.operatingExpenses,
      otherIncome: stats.otherIncome,
      netProfit: stats.netProfit,
      cashIn: stats.cashIn,
      cashOut: stats.cashOut,
      netCashflow: stats.netCashflow,
      ordersCount: stats.ordersCount,
    };
  });

  return {
    range,
    prevRange,
    revenue: current.revenue,
    prevRevenue: previous.revenue,
    revenueChangePct: calcChangePct(current.revenue, previous.revenue),
    webRevenue: current.webRevenue,
    offlineRevenue: current.offlineRevenue,
    ordersCount: current.ordersCount,
    webOrdersCount: current.webOrdersCount,
    offlineOrdersCount: current.offlineOrdersCount,
    cogs: current.cogs,
    missingCostItemsCount: current.missingCostItemsCount,
    grossProfit: current.grossProfit,
    grossMarginPct: current.grossMarginPct,
    operatingExpenses: current.operatingExpenses,
    otherIncome: current.otherIncome,
    inventoryImportOut: current.inventoryImportOut,
    netProfit: current.netProfit,
    prevNetProfit: previous.netProfit,
    netProfitChangePct: calcChangePct(current.netProfit, previous.netProfit),
    netMarginPct: current.netMarginPct,
    cashIn: current.cashIn,
    cashOut: current.cashOut,
    netCashflow: current.netCashflow,
    channelMix: current.channelMix,
    series,
  };
}

/**
 * Sổ quỹ thu/chi (Cashflow Ledger) kèm tổng hợp theo phương thức thanh toán và số dư lũy kế.
 */
export async function getCashflowLedger(
  filters: CashflowLedgerFilters = {}
): Promise<CashflowLedgerResult> {
  const where: Record<string, unknown> = {};

  if (filters.startKey || filters.endKey) {
    where.dateKey = {
      ...(filters.startKey ? { gte: filters.startKey } : {}),
      ...(filters.endKey ? { lte: filters.endKey } : {}),
    };
  }
  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }
  if (filters.category && filters.category !== "ALL") {
    where.category = filters.category;
  }
  if (filters.paymentMethod && filters.paymentMethod !== "ALL") {
    where.paymentMethod = filters.paymentMethod;
  }

  const trimmedQ = filters.q?.trim();
  if (trimmedQ) {
    where.OR = [
      { note: { contains: trimmedQ } },
      { order: { orderNumber: { contains: trimmedQ } } },
      { order: { customerName: { contains: trimmedQ } } },
    ];
  }

  const rawEntries = await prisma.cashflowEntry.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          channel: true,
          customerName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }],
  });

  let totalIn = 0;
  let totalOut = 0;
  let cashIn = 0;
  let cashOut = 0;
  let bankIn = 0;
  let bankOut = 0;
  let inventoryImportOut = 0;
  let running = 0;

  const entriesChronological: CashflowLedgerEntry[] = rawEntries.map((entry) => {
    if (entry.type === "IN") {
      totalIn += entry.amount;
      running += entry.amount;
      if (entry.paymentMethod === "CASH") cashIn += entry.amount;
      else if (entry.paymentMethod === "BANK_TRANSFER") bankIn += entry.amount;
    } else {
      totalOut += entry.amount;
      running -= entry.amount;
      if (entry.paymentMethod === "CASH") cashOut += entry.amount;
      else if (entry.paymentMethod === "BANK_TRANSFER") bankOut += entry.amount;
      if (entry.category === "INVENTORY_IMPORT") {
        inventoryImportOut += entry.amount;
      }
    }

    return {
      id: entry.id,
      type: entry.type,
      category: entry.category,
      amount: entry.amount,
      paymentMethod: entry.paymentMethod,
      occurredAt: entry.occurredAt,
      dateKey: entry.dateKey,
      note: entry.note,
      orderId: entry.orderId,
      order: entry.order,
      createdBy: entry.createdBy,
      runningBalance: running,
      createdAt: entry.createdAt,
    };
  });

  // Trả về thứ tự mới nhất trước để hiển thị bảng sổ quỹ
  const entries = entriesChronological.reverse();

  return {
    summary: {
      totalIn,
      totalOut,
      netCashflow: totalIn - totalOut,
      cashIn,
      cashOut,
      bankIn,
      bankOut,
      inventoryImportOut,
      count: entries.length,
    },
    entries,
  };
}

/**
 * Tóm tắt nhanh tài chính Hôm nay & Tháng này cho dải KPI trên /admin Dashboard.
 */
export async function getDashboardFinanceSnapshot(): Promise<DashboardFinanceSnapshot> {
  const todayKey = getVnDateKey(new Date());
  const monthRange = getPeriodRange("month", todayKey);

  const [monthOrders, monthCashflows] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          { soldAt: { gte: monthRange.start, lte: monthRange.end } },
          { soldAt: null, updatedAt: { gte: monthRange.start, lte: monthRange.end } },
        ],
      },
      select: {
        id: true,
        channel: true,
        totalAmount: true,
        soldAt: true,
        updatedAt: true,
        items: {
          select: {
            costPrice: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.cashflowEntry.findMany({
      where: {
        dateKey: {
          gte: monthRange.startKey,
          lte: monthRange.endKey,
        },
      },
      select: {
        type: true,
        category: true,
        amount: true,
        dateKey: true,
      },
    }),
  ]);

  const todayStats = aggregateWindow(monthOrders, monthCashflows, todayKey, todayKey);
  const monthStats = aggregateWindow(
    monthOrders,
    monthCashflows,
    monthRange.startKey,
    monthRange.endKey
  );

  return {
    today: {
      dateKey: todayKey,
      revenue: todayStats.revenue,
      webRevenue: todayStats.webRevenue,
      offlineRevenue: todayStats.offlineRevenue,
      netProfit: todayStats.netProfit,
      netCashflow: todayStats.netCashflow,
      ordersCount: todayStats.ordersCount,
      offlineOrdersCount: todayStats.offlineOrdersCount,
      missingCostItemsCount: todayStats.missingCostItemsCount,
    },
    thisMonth: {
      label: monthRange.label,
      revenue: monthStats.revenue,
      webRevenue: monthStats.webRevenue,
      offlineRevenue: monthStats.offlineRevenue,
      cogs: monthStats.cogs,
      grossProfit: monthStats.grossProfit,
      operatingExpenses: monthStats.operatingExpenses,
      netProfit: monthStats.netProfit,
      netCashflow: monthStats.netCashflow,
      ordersCount: monthStats.ordersCount,
      offlineOrdersCount: monthStats.offlineOrdersCount,
      missingCostItemsCount: monthStats.missingCostItemsCount,
    },
  };
}
