export interface DailyRevenuePoint {
  date: string;       // "YYYY-MM-DD"
  label: string;      // "DD/MM"
  dayOfWeek: string;  // "Th 2", "Th 3", ..., "CN"
  completedRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeDailyRevenue(
  orders: { totalAmount: number; createdAt: Date; status: string }[]
): DailyRevenuePoint[] {
  const result: DailyRevenuePoint[] = [];
  const daysOfWeekMap = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    const label = `${day}/${month}`;
    const dayOfWeek = i === 0 ? "Hôm nay" : daysOfWeekMap[d.getDay()];

    const matchingOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const oYear = orderDate.getFullYear();
      const oMonth = String(orderDate.getMonth() + 1).padStart(2, "0");
      const oDay = String(orderDate.getDate()).padStart(2, "0");
      return `${oYear}-${oMonth}-${oDay}` === dateKey;
    });

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
