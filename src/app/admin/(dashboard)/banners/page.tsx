import { prisma } from "@/lib/prisma";
import { BannerGrid } from "@/components/admin/banner-grid";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: {
      orderIndex: "asc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Quản lý Banner Trang chủ
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Quản lý các banner hiển thị trên Slider trang chủ, link liên kết khuyến mãi và thứ tự xuất hiện
        </p>
      </div>

      {/* Banner Card Grid */}
      <BannerGrid banners={banners} />
    </div>
  );
}
