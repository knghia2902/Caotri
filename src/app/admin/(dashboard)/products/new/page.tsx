import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      orderIndex: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto py-2">
      <ProductForm categories={categories} />
    </div>
  );
}
