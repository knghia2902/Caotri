import { prisma } from "@/lib/prisma";
import { BannerGrid } from "@/components/admin/banner-grid";
import { Image as ImageIcon } from "lucide-react";

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
        <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
          <ImageIcon className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Nội dung & Quảng bá
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Quản lý Banner Trang chủ
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quản lý các banner hiển thị trên Slider trang chủ, link liên kết khuyến mãi và thứ tự xuất hiện
        </p>
      </div>

      {/* Banner Card Grid */}
      <BannerGrid banners={banners} />
    </div>
  );
}
