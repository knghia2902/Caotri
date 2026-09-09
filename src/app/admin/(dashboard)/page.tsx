import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { computeDailyRevenue } from "@/lib/order-analytics";
import { RevenueBarChart } from "@/components/admin/revenue-bar-chart";

export const metadata = {
  title: "Dashboard Quản trị | CaoTri Gaming Gear",
};

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();

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
    ordersIn7Days,
    recentOrders,
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

    // 4. Số sản phẩm trong kho đang kinh doanh
    prisma.product.count({
      where: { inStock: true },
    }),

    // 5. Đơn hàng trong 7 ngày gần nhất
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

    // 6. Bảng đơn hàng gần đây cần xử lý
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
  ]);

  const completedRevenue = completedRevenueAgg._sum.totalAmount || 0;
  const pendingRevenue = pendingRevenueAgg._sum.totalAmount || 0;

  // Tính toán dữ liệu 7 ngày cho biểu đồ SVG
  const dailyPoints = computeDailyRevenue(ordersIn7Days);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Chờ xử lý
          </span>
        );
      case "CONTACTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Đã liên hệ
          </span>
        );
      case "SHIPPING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            Đang giao
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E7E3] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-[#111] font-semibold">
                Bảng điều khiển trung tâm
              </span>
              <Badge
                variant={session?.role === "ADMIN" ? "default" : "secondary"}
                className="text-[10px] uppercase font-bold tracking-wider py-0.5"
              >
                {session?.role}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111]">
              Xin chào, {session?.name}!
            </h1>
            <p className="text-sm text-[#74746E] mt-1">
              Hệ thống vận hành phân hệ thương mại điện tử CaoTri Gaming Gear.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] hover:bg-black text-white text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Quản lý Đơn hàng</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Doanh thu thực tế (COMPLETED) */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Doanh thu thực tế
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111] tracking-tight">
              {formatPrice(completedRevenue)}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#21A366]" />
              <span className="text-[#21A366] font-medium">Đã thu hoàn tất (COMPLETED)</span>
            </p>
          </CardContent>
        </Card>

        {/* 2. Doanh thu đang xử lý (Tiềm năng) */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Doanh thu đang xử lý
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111] tracking-tight">
              {formatPrice(pendingRevenue)}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-600 font-medium">Đơn chờ chốt & đang giao</span>
            </p>
          </CardContent>
        </Card>

        {/* 3. Đơn mới cần xử lý (PENDING) */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Đơn mới cần xử lý
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111] tracking-tight">
              {pendingOrdersCount}
            </div>
            <div className="text-xs text-[#74746E] mt-1 flex items-center justify-between">
              <span className="text-amber-600 font-medium">Trạng thái Chờ xử lý</span>
              {pendingOrdersCount > 0 && (
                <Link
                  href="/admin/orders?status=PENDING"
                  className="inline-flex items-center gap-0.5 text-xs text-[#111] font-semibold hover:underline"
                >
                  <span>Xử lý ngay</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Sản phẩm đang kinh doanh */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Sản phẩm trong kho
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111] tracking-tight">
              {inStockProductsCount}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#21A366]" />
              <span>Sẵn sàng kinh doanh</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ Doanh thu 7 ngày gần nhất (Pure SVG Bar Chart) */}
      <Card className="bg-white border-[#E7E7E3]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-bold text-[#111]">
              Doanh thu 7 ngày gần nhất
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Thống kê doanh số thực tế đã hoàn thành và doanh số đang trong tiến trình xử lý.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <RevenueBarChart data={dailyPoints} />
        </CardContent>
      </Card>

      {/* Bảng Đơn hàng Gần đây (Recent Orders Table) */}
      <Card className="bg-white border-[#E7E7E3]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-[#111]">
              Đơn hàng gần đây
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Các đơn hàng mới phát sinh cần theo dõi và xử lý liên hệ với khách.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111] hover:underline"
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
                    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={order.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-[#111]">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="hover:underline text-[#111]"
                          >
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#111]">{order.customerName}</div>
                          <div className="text-[11px] text-[#74746E]">{order.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#74746E]">
                          <span>{totalQty} món</span>
                          <span className="text-[11px] block truncate max-w-[180px] text-[#999994]">
                            {order.items[0]?.productName}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#111]">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#74746E] font-mono text-[11px]">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#E7E7E3] hover:border-[#111] bg-white text-[#111] text-[11px] font-medium transition-colors"
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

      {/* Phân quyền hiện tại (RBAC Information Box) */}
      <div className="p-6 rounded-xl border border-[#E7E7E3] bg-white space-y-4">
        <div className="flex items-center gap-2">
          {session?.role === "ADMIN" ? (
            <ShieldCheck className="w-5 h-5 text-[#111]" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[#D99A24]" />
          )}
          <h3 className="font-semibold text-sm text-[#111]">
            Quyền hạn tài khoản hiện tại: {session?.role}
          </h3>
        </div>

        {session?.role === "ADMIN" ? (
          <div className="text-xs text-[#74746E] leading-relaxed space-y-1.5">
            <p>
              ✓ Toàn quyền quản trị hệ thống: Xử lý Đơn hàng, Thống kê Doanh số, CRUD Sản phẩm & Danh mục.
            </p>
            <p>
              ✓ Quản lý Banners trang chủ, Khuyến mãi & Cài đặt thông tin liên hệ cửa hàng (Hotline, Zalo OA, Fanpage).
            </p>
            <p>
              ✓ Toàn quyền phân cấp và quản lý người dùng hệ thống.
            </p>
          </div>
        ) : (
          <div className="text-xs text-[#74746E] leading-relaxed space-y-1.5">
            <p>
              ✓ Được phép: Xem & Cập nhật trạng thái Đơn hàng; xem và chỉnh sửa thông tin Sản phẩm & Danh mục.
            </p>
            <p className="text-[#D99A24]/90 font-medium">
              ⚠ Bị hạn chế: Không có quyền truy cập Quản lý Banners trang chủ hoặc Cài đặt hệ thống.
            </p>
            <p className="text-[#74746E]">
              (Hệ thống tự động ẩn các liên kết trên thanh Sidebar và bảo vệ chặt chẽ qua Middleware & Server Actions).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
