import { prisma } from "@/lib/prisma";
import { CategoryTable } from "@/components/admin/category-table";

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
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Quản lý Danh mục
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Tạo và điều chỉnh các phân loại gaming gear (chuột, bàn phím, tai nghe, phụ kiện...)
        </p>
      </div>

      {/* Table & Modals */}
      <CategoryTable categories={categories} />
    </div>
  );
}
