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
  Coins,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice, normalizeImageUrl } from "@/lib/utils";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingStockId, setTogglingStockId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Handlers reset page về 1 khi thay đổi điều kiện tìm kiếm/lọc
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleStockFilterChange = (val: string) => {
    setStockFilter(val);
    setCurrentPage(1);
  };

  const handleFeaturedFilterChange = (val: string) => {
    setFeaturedFilter(val);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (val: number) => {
    setPageSize(val);
    setCurrentPage(1);
  };

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

  // Tính toán phân trang
  const totalFiltered = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Sinh danh sách trang thông minh với dấu ...
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) {
        pages.push("...");
      }
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (safePage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

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

  // Thống kê tồn kho & giá trị sản phẩm còn hàng
  const totalInStockValue = products
    .filter((p) => p.inStock)
    .reduce((sum, p) => sum + (p.price || 0), 0);
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="space-y-6">
      {/* Product Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng giá trị hàng còn */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Tổng giá trị hàng còn
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#111] mt-1 tracking-tight">
              {formatPrice(totalInStockValue)}
            </p>
            <p className="text-[11px] text-[#21A366] mt-1 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{inStockCount} sản phẩm sẵn sàng bán</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Sản phẩm còn hàng */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Sản phẩm còn hàng
            </p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 tracking-tight">
              {inStockCount}
            </p>
            <p className="text-[11px] text-[#74746E] mt-1">
              Khách có thể đặt mua ngay
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Sản phẩm hết hàng */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Sản phẩm hết hàng
            </p>
            <p className="text-xl sm:text-2xl font-bold text-rose-600 mt-1 tracking-tight">
              {outOfStockCount}
            </p>
            <p className="text-[11px] text-[#74746E] mt-1">
              Tạm ngưng nhận đơn
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Tổng sản phẩm trên web */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Tổng sản phẩm đã đăng
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#111] mt-1 tracking-tight">
              {products.length}
            </p>
            <p className="text-[11px] text-[#74746E] mt-1">
              Toàn bộ danh mục kinh doanh
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74746E]" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm sản phẩm theo tên, slug, thương hiệu..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
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
            onChange={(e) => handleStockFilterChange(e.target.value)}
            className="h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-xs text-[#111] focus:outline-none focus:ring-2 focus:border-[#111] focus:ring-0"
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="in_stock">🟢 Còn hàng</option>
            <option value="out_of_stock">🔴 Hết hàng</option>
          </select>

          {/* Featured Filter */}
          <select
            value={featuredFilter}
            onChange={(e) => handleFeaturedFilterChange(e.target.value)}
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
                paginatedProducts.map((product) => {
                  let imageList: string[] = [];
                  try {
                    imageList = JSON.parse(product.images || "[]");
                  } catch {
                    imageList = [];
                  }
                  const firstImage = normalizeImageUrl(imageList[0]);

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
                              referrerPolicy="no-referrer"
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

        {/* Pagination Footer */}
        {totalFiltered > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3.5 border-t border-[#E7E7E3] bg-[#FAFAFA] gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#74746E]">
              <span>
                Hiển thị <strong className="text-[#111]">{startIndex + 1}</strong> -{" "}
                <strong className="text-[#111]">{endIndex}</strong> trên tổng số{" "}
                <strong className="text-[#111]">{totalFiltered}</strong> sản phẩm
              </span>
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E7E7E3]">
                <span>Hiển thị:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="h-7 rounded border border-[#E7E7E3] bg-white px-2 text-xs font-medium text-[#111] focus:outline-none focus:ring-1 focus:ring-[#111]"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                  <option value={100}>100 / trang</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Trang đầu */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg border border-[#E7E7E3] bg-white text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang đầu tiên"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Trang trước */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E7E7E3] bg-white text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trước</span>
              </button>

              {/* Danh sách số trang */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[#74746E]">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-colors ${
                        safePage === p
                          ? "bg-[#111] text-white shadow-sm"
                          : "border border-[#E7E7E3] bg-white text-[#111] hover:bg-[#F3F3F1]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Trang sau */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[#E7E7E3] bg-white text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang tiếp theo"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Trang cuối */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg border border-[#E7E7E3] bg-white text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang cuối cùng"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
