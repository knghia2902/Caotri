"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Sparkles, Check, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageGalleryEditor } from "@/components/admin/image-gallery-editor";
import { SpecsEditor } from "@/components/admin/specs-editor";
import { slugify } from "@/lib/slugify";
import { formatPrice } from "@/lib/utils";
import { createProduct, updateProduct, type ProductFormData } from "@/app/actions/product";

export interface InitialProductData {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  images: string; // JSON
  specs: string | null; // JSON
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  categoryId: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  initialData?: InitialProductData | null;
  categories: CategoryOption[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug));
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories[0]?.id ?? "")
  );
  const [price, setPrice] = useState<number | string>(
    initialData?.price !== undefined ? initialData.price : ""
  );
  const [originalPrice, setOriginalPrice] = useState<number | string>(
    initialData?.originalPrice !== null && initialData?.originalPrice !== undefined
      ? initialData.originalPrice
      : ""
  );

  // Parse images
  const initialImages: string[] = (() => {
    if (!initialData?.images) return [];
    try {
      return JSON.parse(initialData.images);
    } catch {
      return [];
    }
  })();
  const [images, setImages] = useState<string[]>(initialImages);

  // Parse specs
  const initialSpecs: Record<string, string> = (() => {
    if (!initialData?.specs) return {};
    try {
      return JSON.parse(initialData.specs);
    } catch {
      return {};
    }
  })();
  const [specs, setSpecs] = useState<Record<string, string>>(initialSpecs);

  const [inStock, setInStock] = useState(initialData ? initialData.inStock : true);
  const [isFeatured, setIsFeatured] = useState(initialData ? initialData.isFeatured : false);
  const [isNew, setIsNew] = useState(initialData ? initialData.isNew : true);

  const [isPending, startTransition] = useTransition();

  // Find currently selected category slug for specs presets
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);
  const categorySlug = selectedCategoryObj?.slug || "";

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isCustomSlug && !isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomSlug(true);
    setSlug(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!categoryId) {
      toast.error("Vui lòng chọn danh mục cho sản phẩm");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Giá bán phải là số hợp lệ >= 0");
      return;
    }

    startTransition(async () => {
      const payload: ProductFormData = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        price: numPrice,
        originalPrice:
          originalPrice !== "" && !isNaN(Number(originalPrice))
            ? Number(originalPrice)
            : null,
        images,
        specs,
        inStock,
        isFeatured,
        isNew,
        categoryId,
      };

      const res = isEditing && initialData?.id
        ? await updateProduct(initialData.id, payload)
        : await createProduct(payload);

      if (res.success) {
        toast.success(
          isEditing
            ? `Cập nhật sản phẩm "${name}" thành công`
            : `Đã tạo sản phẩm "${name}" thành công`
        );
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(res.error || "Không thể lưu sản phẩm");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E3]">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-[#E7E7E3] text-[#74746E] hover:text-[#111]"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Danh sách
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#111]">
              {isEditing ? `Sửa: ${initialData?.name}` : "Thêm sản phẩm mới"}
            </h1>
            <p className="text-xs text-[#74746E]">
              {isEditing
                ? "Cập nhật giá, ảnh, thông số kỹ thuật và trạng thái"
                : "Tạo sản phẩm gaming gear mới với đầy đủ thông số và gallery"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products">
            <Button type="button" variant="outline" disabled={isPending}>
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-[#111] text-white rounded-lg h-11 px-[18px] gap-2 min-w-[130px]"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Details, Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Thông tin cơ bản */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Thông tin cơ bản
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Tên sản phẩm <span className="text-[#D94A4A]">*</span>
              </label>
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="VD: Chuột Gaming Không Dây Dragonfly F1 PRO MAX"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                  Đường dẫn (Slug)
                </label>
                {isCustomSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSlug(false);
                      setSlug(slugify(name));
                    }}
                    className="text-xs text-[#111] hover:underline"
                  >
                    Tạo lại từ tên
                  </button>
                )}
              </div>
              <Input
                value={slug}
                onChange={handleSlugChange}
                placeholder="chuot-dragonfly-f1-pro-max"
                disabled={isPending}
              />
              <p className="text-[11px] text-[#74746E] mt-1">
                Đường dẫn tĩnh cho sản phẩm: caotri.vn/products/{slug || "slug-mau"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả các tính năng nổi bật, trải nghiệm sử dụng, chế độ bảo hành..."
                rows={5}
                disabled={isPending}
                className="w-full rounded-lg bg-white border border-[#E7E7E3] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all resize-y"
              />
            </div>
          </div>

          {/* Card: Bộ sưu tập hình ảnh */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Bộ sưu tập hình ảnh (CDN Gallery)
            </h2>
            <ImageGalleryEditor
              images={images}
              onChange={setImages}
              disabled={isPending}
            />
          </div>

          {/* Card: Thông số kỹ thuật */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5">
            <SpecsEditor
              specs={specs}
              onChange={setSpecs}
              categorySlug={categorySlug}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Right 1 Col: Category, Pricing, Visibility */}
        <div className="space-y-6">
          {/* Phân loại danh mục */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Phân loại ngành hàng
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Danh mục <span className="text-[#D94A4A]">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isPending}
                className="w-full h-10 rounded-lg bg-white border border-[#E7E7E3] px-3 text-sm text-[#111] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] cursor-pointer"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#74746E] mt-1">
                Chọn danh mục để tự động gợi ý mẫu thông số kỹ thuật
              </p>
            </div>
          </div>

          {/* Thiết lập giá bán */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Giá bán sản phẩm
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Giá khuyến mãi / Giá bán (VNĐ) <span className="text-[#D94A4A]">*</span>
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1450000"
                disabled={isPending}
                required
              />
              <p className="text-xs font-mono text-[#111] mt-1 font-semibold">
                Hiển thị: {formatPrice(price || 0)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Giá niêm yết gốc (VNĐ, tùy chọn)
              </label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="1890000"
                disabled={isPending}
              />
              {originalPrice ? (
                <p className="text-xs font-mono text-[#74746E] line-through mt-1">
                  Giá cũ: {formatPrice(originalPrice)}
                </p>
              ) : (
                <p className="text-[11px] text-[#74746E] mt-1">
                  Nếu có giảm giá, giá gốc sẽ được hiển thị gạch ngang
                </p>
              )}
            </div>
          </div>

          {/* Trạng thái hiển thị */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Trạng thái & Hiển thị
            </h2>

            {/* Tồn kho */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <div>
                <span className="text-sm font-semibold text-[#111]">
                  Còn hàng trong kho
                </span>
                <p className="text-xs text-[#74746E]">
                  Khách hàng có thể bấm liên hệ đặt mua sản phẩm này
                </p>
              </div>
            </label>

            {/* Nổi bật */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <div>
                <span className="text-sm font-semibold text-[#111]">
                  Sản phẩm Nổi bật (Featured)
                </span>
                <p className="text-xs text-[#74746E]">
                  Ghim sản phẩm vào mục nổi bật ở đầu trang chủ
                </p>
              </div>
            </label>

            {/* Mới về */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                disabled={isPending}
                className="mt-0.5 rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <div>
                <span className="text-sm font-semibold text-[#111]">
                  Gắn nhãn Hàng Mới (New)
                </span>
                <p className="text-xs text-[#74746E]">
                  Hiển thị huy hiệu &quot;Mới&quot; trên thẻ sản phẩm
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
