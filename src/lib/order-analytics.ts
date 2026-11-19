import {
  addDaysToDateKey,
  formatVnShortDate,
  getVnDateKey,
  getVnDayOfWeekLabel,
} from "@/lib/date-vn";

export interface DailyRevenuePoint {
  date: string;       // "YYYY-MM-DD" (theo múi giờ Việt Nam UTC+7)
  label: string;      // "DD/MM"
  dayOfWeek: string;  // "Th 2", "Th 3", ..., "CN", "Hôm nay"
  completedRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeDailyRevenue(
  orders: { totalAmount: number; createdAt: Date; status: string }[]
): DailyRevenuePoint[] {
  const result: DailyRevenuePoint[] = [];
  const todayKey = getVnDateKey(new Date());

  for (let i = 6; i >= 0; i--) {
    const dateKey = addDaysToDateKey(todayKey, -i);
    const label = formatVnShortDate(dateKey);
    const dayOfWeek = getVnDayOfWeekLabel(dateKey, todayKey);

    const matchingOrders = orders.filter(
      (o) => getVnDateKey(o.createdAt) === dateKey
    );

    const completedRevenue = matchingOrders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingRevenue = matchingOrders
      .filter((o) => ["PENDING", "CONTACTED", "SHIPPING"].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalRevenue = matchingOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    result.push({
      date: dateKey,
      label,
      dayOfWeek,
      completedRevenue,
      pendingRevenue,
      totalRevenue,
      orderCount: matchingOrders.length,
    });
  }

  return result;
}
