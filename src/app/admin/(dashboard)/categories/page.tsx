import { prisma } from "@/lib/prisma";
import { CategoryTable } from "@/components/admin/category-table";
import { FolderKanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      orderIndex: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
          <FolderKanban className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Phân loại sản phẩm
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Quản lý Danh mục
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Tạo và điều chỉnh các phân loại gaming gear (chuột, bàn phím, tai nghe, phụ kiện...)
        </p>
      </div>

      {/* Table & Modals */}
      <CategoryTable categories={categories} />
    </div>
  );
}
