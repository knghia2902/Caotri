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
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
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
            className="h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
            className="h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="in_stock">🟢 Còn hàng</option>
            <option value="out_of_stock">🔴 Hết hàng</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="all">Tất cả sản phẩm</option>
            <option value="featured">⭐ Sản phẩm Nổi bật</option>
            <option value="standard">Tiêu chuẩn</option>
          </select>

          {/* Add Product Button */}
          <Link href="/admin/products/new">
            <Button variant="neon" className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-900/90 border-b border-zinc-800 text-xs font-semibold uppercase text-zinc-400 tracking-wider">
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
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <Package className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
                    <p className="text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
                    <p className="text-xs text-zinc-600 mt-1">
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
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Image */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
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
                            <Package className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {product.name}
                          </span>
                          {product.isNew && (
                            <Badge className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px] px-1.5 py-0">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                          /{product.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="secondary"
                          className="bg-zinc-800/80 text-zinc-300 border-zinc-700/60 text-xs"
                        >
                          {product.category.name}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-cyan-400">
                          {formatPrice(product.price)}
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="text-xs text-zinc-500 line-through">
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
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                              : "bg-zinc-800/40 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          {togglingFeaturedId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          ) : (
                            <Star
                              className={`w-4 h-4 ${
                                product.isFeatured ? "fill-amber-400" : ""
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
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 hover:bg-emerald-950/70"
                              : "bg-rose-950/40 text-rose-400 border-rose-800/50 hover:bg-rose-950/70"
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
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-950/30"
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
                            className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
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
