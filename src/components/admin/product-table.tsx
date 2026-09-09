"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Star,
  Edit3,
  Trash2,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  deleteProduct,
  toggleProductFeatured,
  toggleProductInStock,
} from "@/app/actions/product";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  images: string; // JSON string
  specs: string | null;
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductTableProps {
  products: ProductItem[];
  categories: CategoryOption[];
}

export function ProductTable({ products: initialProducts, categories }: ProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingStockId, setTogglingStockId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Sync state if initialProducts changes
  if (initialProducts !== products && initialProducts.length !== products.length) {
    setProducts(initialProducts);
  }

  // Lọc sản phẩm
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "all" || p.categoryId === selectedCategory;

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in_stock" && p.inStock) ||
      (stockFilter === "out_of_stock" && !p.inStock);

    const matchesFeatured =
      featuredFilter === "all" ||
      (featuredFilter === "featured" && p.isFeatured) ||
      (featuredFilter === "standard" && !p.isFeatured);

    return matchesSearch && matchesCategory && matchesStock && matchesFeatured;
  });

  // Quick-Toggle Featured
  const handleToggleFeatured = async (product: ProductItem) => {
    const oldStatus = product.isFeatured;
    const newStatus = !oldStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isFeatured: newStatus } : p))
    );
    setTogglingFeaturedId(product.id);

    const res = await toggleProductFeatured(product.id, oldStatus);
    setTogglingFeaturedId(null);

    if (res.success) {
      toast.success(
        newStatus
          ? `Đã đưa "${product.name}" lên danh sách Nổi bật`
          : `Đã bỏ trạng thái Nổi bật của "${product.name}"`
      );
    } else {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isFeatured: oldStatus } : p))
      );
      toast.error(res.error || "Lỗi cập nhật trạng thái");
    }
  };

  // Quick-Toggle InStock
  const handleToggleStock = async (product: ProductItem) => {
    const oldStatus = product.inStock;
    const newStatus = !oldStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: newStatus } : p))
    );
    setTogglingStockId(product.id);

    const res = await toggleProductInStock(product.id, oldStatus);
    setTogglingStockId(null);

    if (res.success) {
      toast.success(
        newStatus
          ? `"${product.name}" đã chuyển sang trạng thái CÒN HÀNG`
          : `"${product.name}" đã chuyển sang trạng thái HẾT HÀNG`
      );
    } else {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: oldStatus } : p))
      );
      toast.error(res.error || "Lỗi cập nhật trạng thái");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (product: ProductItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    setDeletingId(product.id);
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.success) {
        toast.success(`Đã xóa sản phẩm "${product.name}"`);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa sản phẩm");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74746E]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên, slug, thương hiệu..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-xs text-[#111] focus:outline-none focus:ring-2 focus:border-[#111] focus:ring-0"
          >
            <option value="all">Tất cả danh mục ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-xs text-[#111] focus:outline-none focus:ring-2 focus:border-[#111] focus:ring-0"
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="in_stock">🟢 Còn hàng</option>
            <option value="out_of_stock">🔴 Hết hàng</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-xs text-[#111] focus:outline-none focus:ring-2 focus:border-[#111] focus:ring-0"
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="featured">⭐ Sản phẩm Nổi bật</option>
            <option value="standard">Tiêu chuẩn</option>
          </select>

          {/* Add Product Button */}
          <Link href="/admin/products/new">
            <Button className="bg-[#111] text-white rounded-lg h-11 px-4 gap-2">
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#E7E7E3] bg-white  overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#111]">
            <thead className="bg-[#FAFAFA] border-b border-[#E7E7E3] text-xs font-semibold uppercase text-[#74746E] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16">Ảnh</th>
                <th className="py-3.5 px-4">Tên sản phẩm</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4 text-center">Nổi bật</th>
                <th className="py-3.5 px-4 text-center">Tồn kho</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#74746E]">
                    <Package className="w-10 h-10 mx-auto mb-3 text-[#A3A39D]" />
                    <p className="text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                    <p className="text-xs text-[#A3A39D] mt-1">
                      Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  let imageList: string[] = [];
                  try {
                    imageList = JSON.parse(product.images || "[]");
                  } catch {
                    imageList = [];
                  }
                  const firstImage = imageList[0];

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white transition-colors group"
                    >
                      {/* Image */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-lg bg-[#111111] border border-[#E7E7E3] overflow-hidden flex items-center justify-center group-hover:border-[#111] transition-colors">
                          {firstImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100/18181b/a1a1aa?text=No+Img";
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#A3A39D]" />
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#111] group-hover:text-[#111] transition-colors line-clamp-1">
                            {product.name}
                          </span>
                          {product.isNew && (
                            <Badge className="bg-[#F3F3F1] text-[#21A366] border border-[#21A366] text-[10px] px-1.5 py-0">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs font-mono text-[#74746E] truncate mt-0.5">
                          /{product.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className="bg-[#FAFAFA] text-[#111] border-[#E7E7E3] text-xs"
                        >
                          {product.category.name}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-[#111]">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-[#74746E] line-through">
                            {formatPrice(product.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Quick-Toggle Featured */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product)}
                          disabled={togglingFeaturedId === product.id}
                          title={
                            product.isFeatured
                              ? "Bấm để tắt Nổi bật"
                              : "Bấm để đưa lên trang chủ Nổi bật"
                          }
                          className={`p-1.5 rounded-lg border transition-all ${
                            product.isFeatured
                              ? "bg-[#FAFAFA] border-[#D99A24] text-[#D99A24] hover:bg-[#F3F3F1] "
                              : "bg-white border-[#D5D5D0] text-[#74746E] hover:text-[#111] hover:bg-[#FAFAFA]"
                          }`}
                        >
                          {togglingFeaturedId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#D99A24]" />
                          ) : (
                            <Star
                              className={`w-4 h-4 ${
                                product.isFeatured ? "fill-[#D99A24]" : ""
                              }`}
                            />
                          )}
                        </button>
                      </td>

                      {/* Quick-Toggle Stock */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product)}
                          disabled={togglingStockId === product.id}
                          title="Bấm 1-Click để đổi trạng thái Còn hàng / Hết hàng"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            product.inStock
                              ? "bg-[#F3F3F1] text-[#21A366] border-[#21A366] hover:bg-[#E7E7E3]"
                              : "bg-[#F3F3F1] text-[#D94A4A] border-[#D94A4A] hover:bg-[#E7E7E3]"
                          }`}
                        >
                          {togglingStockId === product.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : product.inStock ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{product.inStock ? "Còn hàng" : "Hết hàng"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Chỉnh sửa sản phẩm"
                              className="h-8 w-8 p-0 text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1]"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            title="Xóa sản phẩm"
                            className="h-8 w-8 p-0 text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#D94A4A]" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
