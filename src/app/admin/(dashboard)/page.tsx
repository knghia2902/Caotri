import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  FolderTree,
  ShoppingBag,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Quản trị | CaoTri Gaming Gear",
};

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();

  // Đếm dữ liệu thực tế từ database
  const [productCount, categoryCount, orderCount, bannerCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.banner.count(),
    ]);

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
              href="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] hover:bg-black text-white text-xs font-semibold  shadow-cyan-950/40 transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>Xem Sản phẩm</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white border-[#E7E7E3] ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Sản phẩm
            </CardTitle>
            <Package className="w-4 h-4 text-[#111]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#111]">
              {productCount}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#21A366]" />
              <span>Đang kinh doanh</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E7E7E3] ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Danh mục
            </CardTitle>
            <FolderTree className="w-4 h-4 text-[#111]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#111]">
              {categoryCount}
            </div>
            <p className="text-xs text-[#74746E] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#111]" />
              <span>Ngành hàng gaming</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E7E7E3] ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Đơn hàng
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-[#111]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#111]">
              {orderCount}
            </div>
            <p className="text-xs text-[#74746E] mt-1">
              Sẵn sàng cho Phase 5 & 6
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#E7E7E3] ">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#74746E]">
              Banners
            </CardTitle>
            <ImageIcon className="w-4 h-4 text-[#111]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-[#111]">
              {bannerCount}
            </div>
            <p className="text-xs text-[#74746E] mt-1">
              {session?.role === "ADMIN" ? "Quản lý toàn quyền" : "Chỉ xem"}
            </p>
          </CardContent>
        </Card>
      </div>

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
              ✓ Toàn quyền quản trị hệ thống: Xem & Cập nhật đơn hàng, CRUD Sản phẩm & Danh mục.
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
