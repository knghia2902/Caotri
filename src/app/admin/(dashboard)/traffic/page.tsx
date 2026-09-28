import { getTrafficOverview } from "@/lib/traffic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficChart } from "@/components/admin/traffic-chart";
import {
  Users,
  Eye,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  History,
  ShieldCheck,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Thống kê Lượt truy cập | TringuyenGear Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminTrafficPage() {
  const overview = await getTrafficOverview();

  // Tính % tăng/giảm giữa hôm nay và hôm qua
  const diffVisitors = overview.today.visitors - overview.yesterday.visitors;
  const percentChange =
    overview.yesterday.visitors > 0
      ? Math.round((diffVisitors / overview.yesterday.visitors) * 100)
      : overview.today.visitors > 0
      ? 100
      : 0;

  return (
    <div className="space-y-8">
      {/* Header Page */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E7E3] relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider text-[#111] font-semibold">
                Phân tích lưu lượng web
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Anti-Spam Deduplication ON
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111]">
              Lượt truy cập (Traffic Analytics)
            </h1>
            <p className="text-sm text-[#74746E] mt-1 max-w-3xl">
              Thống kê khách truy cập thực tế. Hệ thống khử trùng lặp theo Thiết bị (Cookie) và Địa chỉ IP:
              1 máy tính / 1 điện thoại / 1 IP tải lại web hoặc chuyển trang liên tục trong ngày chỉ tính là{" "}
              <strong className="text-[#111] font-medium">1 Khách duy nhất</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Khách hôm nay */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Khách truy cập hôm nay
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111] tracking-tight">
              {overview.today.visitors}
            </div>
            <div className="text-xs text-[#74746E] mt-2 flex items-center justify-between">
              <span>{overview.today.pageviews} lượt xem trang</span>
              {overview.yesterday.visitors > 0 && (
                <span
                  className={`inline-flex items-center text-[11px] font-medium ${
                    diffVisitors >= 0 ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {diffVisitors >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(percentChange)}% so hôm qua
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Khách hôm qua */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Khách truy cập hôm qua
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111] tracking-tight">
              {overview.yesterday.visitors}
            </div>
            <p className="text-xs text-[#74746E] mt-2">
              {overview.yesterday.pageviews} lượt xem trang trong ngày
            </p>
          </CardContent>
        </Card>

        {/* 3. 7 ngày qua */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              7 ngày gần nhất
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111] tracking-tight">
              {overview.last7Days.visitors}
            </div>
            <p className="text-xs text-[#74746E] mt-2">
              {overview.last7Days.pageviews} lượt xem trang tổng cộng
            </p>
          </CardContent>
        </Card>

        {/* 4. Toàn thời gian */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Tổng lượt truy cập toàn bộ
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#111] tracking-tight">
              {overview.allTime.visitors}
            </div>
            <p className="text-xs text-[#74746E] mt-2">
              {overview.allTime.pageviews} lượt xem tích lũy từ khi vận hành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Biểu đồ 7 ngày & Phân bổ thiết bị */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ 7 ngày (2/3 width) */}
        <Card className="lg:col-span-2 bg-white border-[#E7E7E3]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-[#111]">
                Biểu đồ lưu lượng 7 ngày gần nhất
              </CardTitle>
              <p className="text-xs text-[#74746E] mt-0.5">
                So sánh số khách duy nhất (Unique Visitors) và tổng số lượt xem trang (Pageviews).
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <TrafficChart data={overview.last7Days.chart} />
          </CardContent>
        </Card>

        {/* Phân bổ Thiết bị (1/3 width) */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#111]">
              Thiết bị truy cập
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Tỉ lệ khách sử dụng máy tính vs điện thoại trong 30 ngày qua.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Desktop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#111]" />
                  <span className="font-medium text-[#111]">Máy tính (Desktop)</span>
                </div>
                <span className="font-semibold text-[#111]">
                  {overview.devices.desktop.percent}% ({overview.devices.desktop.count})
                </span>
              </div>
              <div className="w-full h-2 bg-[#F7F7F5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#111] rounded-full transition-all duration-500"
                  style={{ width: `${overview.devices.desktop.percent}%` }}
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-[#111]">Điện thoại (Mobile)</span>
                </div>
                <span className="font-semibold text-[#111]">
                  {overview.devices.mobile.percent}% ({overview.devices.mobile.count})
                </span>
              </div>
              <div className="w-full h-2 bg-[#F7F7F5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${overview.devices.mobile.percent}%` }}
                />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Tablet className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-[#111]">Máy tính bảng (Tablet)</span>
                </div>
                <span className="font-semibold text-[#111]">
                  {overview.devices.tablet.percent}% ({overview.devices.tablet.count})
                </span>
              </div>
              <div className="w-full h-2 bg-[#F7F7F5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${overview.devices.tablet.percent}%` }}
                />
              </div>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-lg bg-[#F7F7F5] text-[11px] text-[#74746E] leading-relaxed">
              💡 Giúp bạn đánh giá khách thích xem trên máy tính hay điện thoại để ưu tiên tối ưu giao diện phù hợp.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Top Viewed Pages & Recent Visitor Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 8 Viewed Pages */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#111]">
              Trang & Sản phẩm xem nhiều nhất
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Các liên kết và sản phẩm thu hút nhiều sự quan tâm nhất trên shop.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {overview.topPages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#74746E]">
                Chưa có dữ liệu lượt xem trang.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-[#E7E7E3] bg-[#F7F7F5] text-[#74746E] font-medium">
                      <th className="py-2.5 px-4 w-12 text-center">#</th>
                      <th className="py-2.5 px-4">Đường dẫn / Trang</th>
                      <th className="py-2.5 px-4 text-right">Lượt xem</th>
                      <th className="py-2.5 px-4 text-center w-16">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E3]">
                    {overview.topPages.map((page, index) => (
                      <tr key={page.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                        <td className="py-3 px-4 text-center font-mono font-medium text-[#74746E]">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#111] max-w-[280px] truncate">
                            {page.title || (page.path === "/" ? "Trang chủ TringuyenGear" : page.path)}
                          </div>
                          <div className="text-[11px] text-[#74746E] font-mono truncate max-w-[280px]">
                            {page.path}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#111]">
                          {page.views.toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={page.path}
                            target="_blank"
                            className="inline-flex items-center justify-center w-7 h-7 rounded border border-[#E7E7E3] hover:border-[#111] bg-white text-[#74746E] hover:text-[#111] transition-colors"
                            title="Mở trang xem thử"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 10 Khách truy cập gần nhất */}
        <Card className="bg-white border-[#E7E7E3]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-[#111]">
              Khách truy cập gần đây
            </CardTitle>
            <p className="text-xs text-[#74746E] mt-0.5">
              Nhật ký các khách hàng vừa ghé thăm website và số trang họ đã xem.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {overview.recentVisitors.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#74746E]">
                Chưa có nhật ký khách truy cập hôm nay.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-y border-[#E7E7E3] bg-[#F7F7F5] text-[#74746E] font-medium">
                      <th className="py-2.5 px-4">Thời gian</th>
                      <th className="py-2.5 px-4">Thiết bị</th>
                      <th className="py-2.5 px-4">Trang xem cuối</th>
                      <th className="py-2.5 px-4 text-right">Số trang xem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E3]">
                    {overview.recentVisitors.map((v) => {
                      const timeStr = new Date(v.updatedAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const dateStr = new Date(v.updatedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      });

                      return (
                        <tr key={v.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono text-[#111] font-medium">{timeStr}</span>
                            <span className="text-[10px] text-[#74746E] block">{dateStr}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#F7F7F5] border border-[#E7E7E3] text-[#111]">
                              {v.deviceType === "Mobile" ? (
                                <Smartphone className="w-3 h-3 text-blue-600" />
                              ) : v.deviceType === "Tablet" ? (
                                <Tablet className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Monitor className="w-3 h-3 text-[#111]" />
                              )}
                              <span>{v.deviceType || "Desktop"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#74746E] font-mono text-[11px] max-w-[180px] truncate">
                            {v.lastPath || "/"}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-[#111]">
                            {v.pageviews} trang
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
      </div>
    </div>
  );
}
