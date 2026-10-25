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
  Archive,
  ArchiveRestore,
  ShieldCheck,
  Eye,
  Download,
  X,
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
  toggleProductArchived,
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
  isArchived?: boolean;
  warrantyNote?: string | null;
  warrantyImages?: string | null;
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
  const [archiveFilter, setArchiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingStockId, setTogglingStockId] = useState<string | null>(null);
  const [togglingArchiveId, setTogglingArchiveId] = useState<string | null>(null);
  const [viewingWarrantyProduct, setViewingWarrantyProduct] = useState<ProductItem | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Helper tải ảnh trực tiếp về máy
  const handleDownloadImage = async (url: string, prefix = "anh") => {
    const cleanUrl = normalizeImageUrl(url);
    const filename = cleanUrl.split("/").pop()?.split("?")[0] || `${prefix}.jpg`;

    try {
      const downloadTarget = cleanUrl.startsWith("/uploads/")
        ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}download=1`
        : cleanUrl;

      const response = await fetch(downloadTarget, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success(`Đã tải xuống: ${filename}`);
    } catch {
      const a = document.createElement("a");
      a.href = cleanUrl.startsWith("/uploads/")
        ? `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}download=1`
        : cleanUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.info(`Đang mở tải file ${filename}...`);
    }
  };

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

  const handleArchiveFilterChange = (val: string) => {
    setArchiveFilter(val);
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

    const matchesArchive =
      archiveFilter === "all" ||
      (archiveFilter === "active" && !p.isArchived) ||
      (archiveFilter === "archived" && Boolean(p.isArchived));

    return matchesSearch && matchesCategory && matchesStock && matchesFeatured && matchesArchive;
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

  // Quick-Toggle Archive (Lưu kho / Đưa ra web)
  const handleToggleArchive = async (product: ProductItem) => {
    const oldStatus = Boolean(product.isArchived);
    const newStatus = !oldStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isArchived: newStatus } : p))
    );
    setTogglingArchiveId(product.id);

    const res = await toggleProductArchived(product.id, oldStatus);
    setTogglingArchiveId(null);

    if (res.success) {
      toast.success(
        newStatus
          ? `Đã chuyển "${product.name}" vào LƯU KHO (ẩn hoàn toàn khỏi website)`
          : `Đã mở bán lại "${product.name}" trên website`
      );
    } else {
      // Rollback
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isArchived: oldStatus } : p))
      );
      toast.error(res.error || "Lỗi cập nhật trạng thái lưu kho");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (product: ProductItem) => {
    const confirmMsg =
      `Bạn có chắc chắn muốn XÓA VĨNH VIỄN sản phẩm "${product.name}"?\n\n` +
      `⚠️ Chú ý phân biệt:\n` +
      `• Nếu sản phẩm chỉ TẠM HẾT HÀNG: Hãy hủy bỏ và bấm nút "Còn hàng / Hết hàng" để giữ lại thông tin & ảnh.\n` +
      `• Nếu XÓA HẲN: Sản phẩm sẽ bị xóa khỏi hệ thống và toàn bộ file ảnh trên máy chủ sẽ được dọn dẹp để tiết kiệm ổ đĩa.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setDeletingId(product.id);
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.success) {
        const imgCount = (res as any).deletedImages?.length || 0;
        toast.success(
          imgCount > 0
            ? `Đã xóa "${product.name}" và giải phóng ${imgCount} file ảnh trên server.`
            : `Đã xóa sản phẩm "${product.name}" khỏi hệ thống.`
        );
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa sản phẩm");
      }
      setDeletingId(null);
    });
  };

  // Thống kê tồn kho & giá trị sản phẩm còn hàng
  const archivedCount = products.filter((p) => p.isArchived).length;
  const activeProducts = products.filter((p) => !p.isArchived);
  const totalInStockValue = activeProducts
    .filter((p) => p.inStock)
    .reduce((sum, p) => sum + (p.price || 0), 0);
  const inStockCount = activeProducts.filter((p) => p.inStock).length;
  const outOfStockCount = activeProducts.length - inStockCount;

  return (
    <div className="space-y-6">
      {/* Product Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tổng giá trị hàng còn */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Tổng giá trị hàng còn (Đang bán)
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

        {/* 4. Tổng sản phẩm (Web & Kho) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E7E7E3] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#74746E]">
              Tổng sản phẩm quản lý
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#111] mt-1 tracking-tight">
              {products.length}
            </p>
            <p className="text-[11px] text-[#74746E] mt-1">
              <span className="text-emerald-700 font-semibold">{activeProducts.length} đang bán</span> • <span className="text-amber-700 font-semibold">{archivedCount} lưu kho</span>
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

          {/* Archive Filter */}
          <select
            value={archiveFilter}
            onChange={(e) => handleArchiveFilterChange(e.target.value)}
            className="h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-xs text-[#111] focus:outline-none focus:ring-2 focus:border-[#111] focus:ring-0"
          >
            <option value="all">Kho: Tất cả ({products.length})</option>
            <option value="active">🌐 Đang bán ({activeProducts.length})</option>
            <option value="archived">📦 Đã lưu kho ({archivedCount})</option>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#111] group-hover:text-[#111] transition-colors line-clamp-1">
                            {product.name}
                          </span>
                          {product.isArchived && (
                            <Badge className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-1.5 py-0 flex items-center gap-1 font-semibold">
                              <Archive className="w-2.5 h-2.5" />
                              Lưu kho
                            </Badge>
                          )}
                          {product.isNew && !product.isArchived && (
                            <Badge className="bg-[#F3F3F1] text-[#21A366] border border-[#21A366] text-[10px] px-1.5 py-0">
                              Mới
                            </Badge>
                          )}
                          {(product.warrantyNote || (product.warrantyImages && product.warrantyImages !== "[]")) && (
                            <button
                              type="button"
                              onClick={() => setViewingWarrantyProduct(product)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                              title="Bấm để xem nhanh hồ sơ bảo hành, số serial và tải ảnh hóa đơn"
                            >
                              <ShieldCheck className="w-3 h-3 text-blue-600" />
                              <span>BH</span>
                            </button>
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
                          {/* 1-Click Toggle Lưu kho */}
                          <button
                            type="button"
                            onClick={() => handleToggleArchive(product)}
                            disabled={togglingArchiveId === product.id}
                            title={
                              product.isArchived
                                ? "Đang lưu kho (đã ẩn ngoài web). Bấm để mở bán lại ra website"
                                : "Đang bán ngoài web. Bấm để cất vào kho (ẩn khỏi website)"
                            }
                            className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all ${
                              product.isArchived
                                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                                : "bg-white border-[#E7E7E3] text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1]"
                            }`}
                          >
                            {togglingArchiveId === product.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                            ) : product.isArchived ? (
                              <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                            ) : (
                              <Archive className="w-3.5 h-3.5 text-[#74746E]" />
                            )}
                          </button>

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

      {/* ========================================================================= */}
      {/* MODAL XEM NHANH HỒ SƠ BẢO HÀNH & HÓA ĐƠN TRONG BẢNG SẢN PHẨM */}
      {/* ========================================================================= */}
      {viewingWarrantyProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setViewingWarrantyProduct(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E7E7E3] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-[#E7E7E3] flex items-center justify-between bg-[#FAFAFA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111] line-clamp-1">
                    Hồ sơ bảo hành: {viewingWarrantyProduct.name}
                  </h2>
                  <p className="text-xs text-[#74746E]">
                    Thông tin nội bộ • Không hiển thị ngoài web
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingWarrantyProduct(null)}
                className="p-1.5 rounded-lg text-[#74746E] hover:text-[#111] hover:bg-[#E7E7E3] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Ghi chú */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2">
                  Ghi chú bảo hành / Số Serial / Hóa đơn
                </h3>
                {viewingWarrantyProduct.warrantyNote ? (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-sm text-amber-950 font-mono whitespace-pre-wrap leading-relaxed select-text">
                    {viewingWarrantyProduct.warrantyNote}
                  </div>
                ) : (
                  <p className="text-xs text-[#A3A39D] italic">Chưa có ghi chú văn bản nào.</p>
                )}
              </div>

              {/* Ảnh chứng từ / hóa đơn */}
              {(() => {
                let warrantyImgList: string[] = [];
                try {
                  if (Array.isArray(viewingWarrantyProduct.warrantyImages)) {
                    warrantyImgList = viewingWarrantyProduct.warrantyImages;
                  } else if (viewingWarrantyProduct.warrantyImages) {
                    warrantyImgList = JSON.parse(viewingWarrantyProduct.warrantyImages);
                  }
                } catch {
                  warrantyImgList = [];
                }

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                        Ảnh chụp hóa đơn, tem & số serial ({warrantyImgList.length})
                      </h3>
                      {warrantyImgList.length > 0 && (
                        <span className="text-[11px] text-[#74746E]">
                          Bấm vào ảnh để xem lớn hoặc tải về máy
                        </span>
                      )}
                    </div>

                    {warrantyImgList.length === 0 ? (
                      <p className="text-xs text-[#A3A39D] italic">
                        Chưa có ảnh hóa đơn/serial nào được tải lên.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {warrantyImgList.map((url, idx) => {
                          const cleanUrl = normalizeImageUrl(url);
                          return (
                            <div
                              key={url + idx}
                              className="group rounded-xl overflow-hidden border border-[#E7E7E3] bg-zinc-900 relative shadow-sm"
                            >
                              <div
                                onClick={() => setPreviewImageUrl(cleanUrl)}
                                className="aspect-square relative overflow-hidden flex items-center justify-center cursor-pointer"
                                title="Bấm để xem ảnh lớn"
                              >
                                <img
                                  src={cleanUrl}
                                  alt={`Chứng từ ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://placehold.co/400x400/18181b/a1a1aa?text=Lỗi+ảnh";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <span className="p-2 rounded-lg bg-white/90 text-[#111]">
                                    <Eye className="w-4 h-4" />
                                  </span>
                                </div>
                              </div>

                              <div className="p-2 bg-white border-t border-[#E7E7E3] flex items-center justify-between">
                                <span className="text-[11px] font-mono text-[#74746E]">
                                  #{idx + 1}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImageUrl(cleanUrl)}
                                    className="p-1 rounded text-zinc-700 hover:text-[#111] hover:bg-zinc-100"
                                    title="Xem lớn"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDownloadImage(
                                        url,
                                        `bh-${viewingWarrantyProduct.slug}-${idx + 1}`
                                      )
                                    }
                                    className="p-1 rounded text-emerald-700 hover:bg-emerald-50"
                                    title="Tải ảnh về máy"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E7E7E3] bg-[#FAFAFA] flex items-center justify-between">
              <Link href={`/admin/products/${viewingWarrantyProduct.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa thông tin sản phẩm
                </Button>
              </Link>
              <Button
                type="button"
                onClick={() => setViewingWarrantyProduct(null)}
                size="sm"
                className="bg-[#111] text-white text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview riêng cho Modal bảo hành */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div
            className="flex items-center justify-between text-white max-w-4xl mx-auto w-full z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-zinc-300 font-mono truncate max-w-sm">
              {previewImageUrl.split("/").pop()}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadImage(previewImageUrl, "bao-hanh")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Tải về máy</span>
              </button>
              <a
                href={previewImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                title="Mở tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white"
                title="Đóng (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-3">
            <img
              src={previewImageUrl}
              alt="Xem ảnh lớn"
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="text-center text-xs text-zinc-400 py-1">
            Bấm phím ESC hoặc bấm ra ngoài để đóng
          </div>
        </div>
      )}
    </div>
  );
}
