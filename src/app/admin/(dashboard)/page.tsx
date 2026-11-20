import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Wallet,
  Users,
  TrendingUp,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, normalizeImageUrl } from "@/lib/utils";
import { computeDailyRevenue } from "@/lib/order-analytics";
import { RevenueBarChart } from "@/components/admin/revenue-bar-chart";
import { getTrafficOverview } from "@/lib/traffic";
import { VpsMonitorCard } from "@/components/admin/vps-monitor-card";
import { getDashboardFinanceSnapshot } from "@/lib/finance-analytics";
import { OfflineOrderTrigger } from "@/components/admin/offline-order-trigger";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import type { OfflineProductOption } from "@/components/admin/offline-order-modal";

export const metadata = {
  title: "Dashboard Quản trị | TringuyenGear",
};

function parseFirstThumbnail(images: string | null | undefined): string | null {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === "string"
    ) {
      return normalizeImageUrl(parsed[0]);
    }
  } catch {
    if (images.startsWith("http") || images.startsWith("/")) {
      return normalizeImageUrl(images);
    }
  }
  return null;
}

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  const isAdmin = session?.role === "ADMIN";

  // Mốc 6 ngày trước tính từ 00:00:00 để lấy trọn vẹn 7 ngày gần nhất
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Truy vấn đồng thời không waterfall
  const [
    completedRevenueAgg,
    pendingRevenueAgg,
    pendingOrdersCount,
    inStockProductsCount,
    totalProductsCount,
    inStockValueAgg,
    ordersIn7Days,
    recentOrders,
    trafficOverview,
    financeSnapshot,
    rawOfflineProducts,
  ] = await Promise.all([
    // 1. Doanh thu thực tế (COMPLETED)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    }),

    // 2. Doanh thu đang xử lý (Tiềm năng)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { in: ["PENDING", "CONTACTED", "SHIPPING"] },
      },
    }),

    // 3. Số đơn mới cần xử lý
    prisma.order.count({
      where: { status: "PENDING" },
    }),

    // 4. Số sản phẩm trong kho đang kinh doanh (không tính archived)
    prisma.product.count({
      where: { inStock: true, isArchived: false },
    }),

    // 5. Tổng số sản phẩm đang kinh doanh (không tính archived)
    prisma.product.count({
      where: { isArchived: false },
    }),

    // 6. Tổng giá trị sản phẩm còn hàng (không tính archived)
    prisma.product.aggregate({
      _sum: { price: true },
      where: { inStock: true, isArchived: false },
    }),

    // 7. Đơn hàng trong 7 ngày gần nhất
    prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true,
      },
    }),

    // 8. Bảng đơn hàng gần đây cần xử lý
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
          },
        },
      },
    }),

    // 9. Thống kê lưu lượng truy cập thực tế
    getTrafficOverview(),

    // 10. Snapshot tài chính (CHỈ ADMIN)
    isAdmin ? getDashboardFinanceSnapshot() : Promise.resolve(null),

    // 11. Danh sách sản phẩm cho modal tạo đơn bán ngoài (CHỈ ADMIN)
    isAdmin
      ? prisma.product.findMany({
          where: { isArchived: false },
          orderBy: [{ inStock: "desc" }, { updatedAt: "desc" }],
          select: {
            id: true,
            name: true,
            price: true,
            costPrice: true,
            inStock: true,
            images: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const offlineProducts: OfflineProductOption[] = isAdmin
    ? rawOfflineProducts.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        costPrice: p.costPrice,
        inStock: p.inStock,
        thumbnail: parseFirstThumbnail(p.images),
      }))
    : [];

  const completedRevenue = completedRevenueAgg._sum.totalAmount || 0;
  const pendingRevenue = pendingRevenueAgg._sum.totalAmount || 0;
  const inStockValue = inStockValueAgg._sum.price || 0;

  // Tính toán dữ liệu 7 ngày cho biểu đồ SVG
  const dailyPoints = computeDailyRevenue(ordersIn7Days);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner with Quick Actions */}
      <div className="p-6 rounded-[10px] bg-white border border-[#E7E7E3]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              Xin chào, {session?.name}!
            </h1>
            <p className="text-sm text-[#74746E] mt-1">
              Hệ thống vận hành phân hệ thương mại điện tử TringuyenGear.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] border border-[#E7E7E3] hover:border-[#111111] bg-white hover:bg-[#F7F7F5] text-[#111111] text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </Link>
            {isAdmin && (
              <OfflineOrderTrigger
                products={offlineProducts}
                variant="secondary"
              />
            )}
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#111111] hover:bg-black text-white text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Quản lý Đơn hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Clean 4-Column KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Doanh thu thực tế (COMPLETED) */}
        <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Doanh thu thực tế
            </CardTitle>
            <div className="w-8 h-8 rounded-[8px] bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111111] tracking-tight tabular-nums">
              {formatPrice(completedRevenue)}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#21A366]" />
              <span className="text-[#21A366] font-medium">
                Đã thu hoàn tất
              </span>
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Doanh thu đang xử lý */}
        <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Doanh thu đang xử lý
            </CardTitle>
            <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111111] tracking-tight tabular-nums">
              {formatPrice(pendingRevenue)}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-600 font-medium">
                Đơn chờ chốt &amp; đang giao
              </span>
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Đơn mới cần xử lý (PENDING) */}
        <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Đơn mới cần xử lý
            </CardTitle>
            <div className="w-8 h-8 rounded-[8px] bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111111] tracking-tight tabular-nums">
              {pendingOrdersCount}
            </div>
            <div className="text-xs text-[#74746E] mt-1 flex items-center justify-between gap-2">
              <span className="text-amber-600 font-medium">
                Trạng thái Chờ xử lý
              </span>
              {pendingOrdersCount > 0 && (
                <Link
                  href="/admin/orders?status=PENDING"
                  className="inline-flex items-center gap-0.5 text-xs text-[#111111] font-semibold hover:underline shrink-0"
                >
                  <span>Xử lý ngay</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Tồn kho sẵn bán (Merged Inventory Card) */}
        <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Tồn kho sẵn bán
            </CardTitle>
            <div className="w-8 h-8 rounded-[8px] bg-[#F3F3F0] text-[#111111] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111111] tracking-tight tabular-nums">
              {formatPrice(inStockValue)}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1 tabular-nums">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#21A366] shrink-0" />
              <span>
                <strong className="font-semibold text-[#111111]">
                  {inStockProductsCount}
                </strong>{" "}
                / {totalProductsCount} sản phẩm còn hàng
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. 2-Column Row: Dòng tiền (ADMIN) + Lượt truy cập hôm nay */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          isAdmin && financeSnapshot ? "lg:grid-cols-2" : ""
        }`}
      >
        {/* Snapshot Dòng tiền hôm nay & tháng này (ADMIN ONLY) */}
        {isAdmin && financeSnapshot && (
          <div className="p-5 rounded-[10px] bg-white border border-[#E7E7E3] flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[8px] bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#111111]">
                      Dòng tiền hôm nay &amp; tháng này
                    </h3>
                    {financeSnapshot.thisMonth.missingCostItemsCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 tabular-nums">
                        {financeSnapshot.thisMonth.missingCostItemsCount} món
                        thiếu giá vốn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#74746E] mt-0.5">
                    Tổng hợp doanh thu, lợi nhuận ròng và dòng tiền
                  </p>
                </div>
              </div>
              <Link
                href="/admin/finance"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline shrink-0"
              >
                <span>Chi tiết Dòng tiền</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 tabular-nums">
              <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
                <div className="text-[11px] text-[#74746E]">Hôm nay</div>
                <div className="text-base font-bold text-[#111111] mt-0.5">
                  {formatPrice(financeSnapshot.today.revenue)}
                </div>
                <div className="text-[11px] text-[#74746E] mt-1">
                  LN ròng:{" "}
                  <strong
                    className={
                      financeSnapshot.today.netProfit >= 0
                        ? "text-[#21A366]"
                        : "text-[#D94A4A]"
                    }
                  >
                    {formatPrice(financeSnapshot.today.netProfit)}
                  </strong>
                </div>
              </div>

              <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
                <div className="text-[11px] text-[#74746E]">Tháng này</div>
                <div className="text-base font-bold text-[#111111] mt-0.5">
                  {formatPrice(financeSnapshot.thisMonth.revenue)}
                </div>
                <div className="text-[11px] text-[#74746E] mt-1">
                  LN:{" "}
                  <strong
                    className={
                      financeSnapshot.thisMonth.netProfit >= 0
                        ? "text-[#21A366]"
                        : "text-[#D94A4A]"
                    }
                  >
                    {formatPrice(financeSnapshot.thisMonth.netProfit)}
                  </strong>
                  {" • "}
                  Dòng tiền:{" "}
                  <strong
                    className={
                      financeSnapshot.thisMonth.netCashflow >= 0
                        ? "text-[#21A366]"
                        : "text-[#D94A4A]"
                    }
                  >
                    {financeSnapshot.thisMonth.netCashflow > 0 ? "+" : ""}
                    {formatPrice(financeSnapshot.thisMonth.netCashflow)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Snapshot Lưu lượng truy cập hôm nay */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E7E7E3] flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Lượt truy cập hôm nay
                </h3>
                <p className="text-xs text-[#74746E] mt-0.5">
                  Lưu lượng khách truy cập thực tế trên Storefront
                </p>
              </div>
            </div>
            <Link
              href="/admin/traffic"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:underline shrink-0"
            >
              <span>Chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
            <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
              <div className="text-[11px] text-[#74746E]">Khách hôm nay</div>
              <div className="text-base font-bold text-[#111111] mt-0.5">
                {trafficOverview.today.visitors}
              </div>
            </div>
            <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
              <div className="text-[11px] text-[#74746E]">Lượt xem trang</div>
              <div className="text-base font-bold text-[#111111] mt-0.5">
                {trafficOverview.today.pageviews}
              </div>
            </div>
            <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
              <div className="text-[11px] text-[#74746E]">Hôm qua</div>
              <div className="text-base font-bold text-[#111111] mt-0.5">
                {trafficOverview.yesterday.visitors}
              </div>
            </div>
            <div className="rounded-[8px] bg-[#F7F7F5] border border-[#E7E7E3] p-3">
              <div className="text-[11px] text-[#74746E]">7 ngày qua</div>
              <div className="text-base font-bold text-[#111111] mt-0.5">
                {trafficOverview.last7Days.visitors}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Biểu đồ Doanh thu 7 ngày gần nhất */}
      <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold text-[#111111]">
              Doanh thu 7 ngày gần nhất
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Thống kê doanh số thực tế đã hoàn thành và doanh số đang trong tiến
              trình xử lý.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <RevenueBarChart data={dailyPoints} />
        </CardContent>
      </Card>

      {/* 5. Bảng Đơn hàng Gần đây */}
      <Card className="bg-white border-[#E7E7E3] rounded-[10px] shadow-none overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-[#111111]">
              Đơn hàng gần đây
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Các đơn hàng mới phát sinh cần theo dõi và xử lý liên hệ với khách.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#74746E]">
              Chưa có đơn hàng nào được tạo trong hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-y border-[#E7E7E3] bg-[#F7F7F5] text-[#74746E] font-medium">
                    <th className="py-3 px-4">Mã đơn</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Sản phẩm</th>
                    <th className="py-3 px-4 text-right">Tổng tiền</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Ngày đặt</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E7E3]">
                  {recentOrders.map((order) => {
                    const totalQty = order.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    const formattedDate = new Date(
                      order.createdAt
                    ).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-[#F7F7F5]/60 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#111111] tabular-nums">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="hover:underline text-[#111111]"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#111111]">
                            {order.customerName}
                          </div>
                          <div className="text-[11px] text-[#74746E] tabular-nums">
                            {order.customerPhone}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#74746E]">
                          <span className="tabular-nums">{totalQty} món</span>
                          <span className="text-[11px] block truncate max-w-[180px] text-[#999994]">
                            {order.items[0]?.productName}
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#111111] tabular-nums">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#74746E] font-mono text-[11px] tabular-nums">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#E7E7E3] hover:border-[#111111] bg-white text-[#111111] text-[11px] font-medium transition-colors"
                          >
                            <span>Chi tiết</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. VPS System Resource Monitor (Moved to bottom, ADMIN-only) */}
      {isAdmin && <VpsMonitorCard />}
    </div>
  );
}
