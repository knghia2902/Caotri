import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/admin/product-table";

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
        <h1 className="text-2xl font-bold tracking-tight text-[#111]">
          Quản lý Sản phẩm
        </h1>
        <p className="text-sm text-[#74746E] mt-1">
          Quản lý toàn bộ danh mục gaming gear, giá cả, gallery hình ảnh và thông số kỹ thuật
        </p>
      </div>

      {/* Interactive Products Table */}
      <ProductTable products={products} categories={categories} />
    </div>
  );
}
