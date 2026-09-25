"use server";

import { prisma } from "@/lib/prisma";

import { buildProductSearchFilter } from "@/lib/search-utils";

export interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  images: string; // JSON string
  category: {
    name: string;
    slug: string;
  };
}

export async function searchProductsAction(query: string): Promise<SearchProductResult[]> {
  const q = query?.trim();
  if (!q || q.length < 2) {
    return [];
  }

  try {
    const searchFilter = buildProductSearchFilter(q);
    const products = await prisma.product.findMany({
      where: searchFilter || {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
        ],
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        isFeatured: "desc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
