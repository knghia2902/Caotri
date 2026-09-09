import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/admin/product-table";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: {
        orderIndex: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-cyan-400 mb-1">
          <Package className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Kho hàng & Sản phẩm
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Quản lý Sản phẩm
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quản lý toàn bộ danh mục gaming gear, giá cả, gallery hình ảnh và thông số kỹ thuật
        </p>
      </div>

      {/* Interactive Products Table */}
      <ProductTable products={products} categories={categories} />
    </div>
  );
}
