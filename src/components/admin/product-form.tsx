"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Sparkles,
  Check,
  PackageCheck,
  ShieldAlert,
  ShieldCheck,
  Archive,
  BadgeDollarSign,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
  shortDescription?: string | null;
  description: string | null;
  price: number;
  originalPrice: number | null;
  images: string; // JSON
  specs: string | null; // JSON
  inStock: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isArchived?: boolean;
  costPrice?: number | null;
  internalNote?: string | null;
  warrantyNote?: string | null;
  warrantyImages?: string | null; // JSON
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
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || initialData?.description || ""
  );
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
  const [isArchived, setIsArchived] = useState(initialData?.isArchived ?? false);

  // Sổ tính giá thu / vốn & ghi chú trade nội bộ (Chỉ Admin thấy)
  const [costPrice, setCostPrice] = useState<number | string>(
    initialData?.costPrice !== null && initialData?.costPrice !== undefined
      ? initialData.costPrice
      : ""
  );
  const [internalNote, setInternalNote] = useState<string>(
    initialData?.internalNote || ""
  );

  // Warranty note & private images (Chỉ lưu nội bộ, không hiển thị web)
  const [warrantyNote, setWarrantyNote] = useState(initialData?.warrantyNote || "");
  const initialWarrantyImages: string[] = (() => {
    if (!initialData?.warrantyImages) return [];
    try {
      if (Array.isArray(initialData.warrantyImages)) return initialData.warrantyImages;
      return JSON.parse(initialData.warrantyImages);
    } catch {
      return [];
    }
  })();
  const [warrantyImages, setWarrantyImages] = useState<string[]>(initialWarrantyImages);

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
        shortDescription: shortDescription.trim() || undefined,
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
        isArchived,
        costPrice:
          costPrice !== "" && !isNaN(Number(costPrice))
            ? Number(costPrice)
            : null,
        internalNote: internalNote.trim() || null,
        warrantyNote: warrantyNote.trim() || null,
        warrantyImages,
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
              className="h-10 px-3.5 border-[#E7E7E3] text-[#74746E] hover:text-[#111] rounded-lg text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Danh sách
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#111]">
              {isEditing ? `Sửa: ${initialData?.name}` : "Thêm sản phẩm mới"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              className="h-10 px-4 text-xs font-medium rounded-lg border-[#E7E7E3] text-[#74746E] hover:text-[#111]"
            >
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-[#111] hover:bg-[#1A1A1A] text-white rounded-lg h-10 px-4 text-xs font-medium gap-2 min-w-[125px]"
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
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Mô tả ngắn
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="VD: Cấu hình văn phòng học tập, pin 15p, chức năng tốt, kèm sạc..."
                rows={2}
                disabled={isPending}
                className="w-full rounded-lg bg-white border border-[#E7E7E3] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Mô tả chi tiết
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết các tính năng, ngoại hình, thông số, quà tặng kèm theo..."
                rows={4}
                disabled={isPending}
                className="w-full rounded-lg bg-white border border-[#E7E7E3] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all resize-y"
              />
            </div>
          </div>

          {/* Card: Bộ sưu tập hình ảnh */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Bộ sưu tập hình ảnh
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

          {/* Card: Hồ sơ bảo hành */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <h2 className="text-sm font-semibold text-blue-950 uppercase tracking-wider">
                  Hồ sơ bảo hành
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                🔒 Nội bộ
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Số Serial / Ghi chú bảo hành
              </label>
              <textarea
                value={warrantyNote}
                onChange={(e) => setWarrantyNote(e.target.value)}
                placeholder="Serial, thời hạn bảo hành hãng, ngày mua VAT..."
                rows={2}
                disabled={isPending}
                className="w-full rounded-lg bg-white border border-[#E7E7E3] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Ảnh tem, số Serial & Hóa đơn
              </label>
              <ImageGalleryEditor
                images={warrantyImages}
                onChange={setWarrantyImages}
                allowSetMain={false}
                disabled={isPending}
              />
            </div>
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
            </div>
          </div>

          {/* Thiết lập giá bán */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Giá bán sản phẩm
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Giá bán (VNĐ) <span className="text-[#D94A4A]">*</span>
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
              ) : null}
            </div>
          </div>

          {/* Trạng thái hiển thị */}
          <div className="rounded-xl border border-[#E7E7E3] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#111] uppercase tracking-wider">
              Trạng thái & Hiển thị
            </h2>

            {/* Tồn kho */}
            <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                disabled={isPending}
                className="rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <span className="text-sm font-medium text-[#111]">
                Còn hàng trong kho
              </span>
            </label>

            {/* Nổi bật */}
            <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                disabled={isPending}
                className="rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <span className="text-sm font-medium text-[#111]">
                Sản phẩm nổi bật (Trang chủ)
              </span>
            </label>

            {/* Mới về */}
            <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F7F7F5] border border-[#E7E7E3] cursor-pointer hover:border-[#D5D5D0] transition-colors">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                disabled={isPending}
                className="rounded border-[#D5D5D0] text-[#111] focus:border-[#111] focus:ring-0"
              />
              <span className="text-sm font-medium text-[#111]">
                Gắn nhãn Hàng mới
              </span>
            </label>

            {/* Lưu kho / Ẩn khỏi website */}
            <label className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 cursor-pointer hover:border-amber-300 transition-colors">
              <input
                type="checkbox"
                checked={isArchived}
                onChange={(e) => setIsArchived(e.target.checked)}
                disabled={isPending}
                className="rounded border-amber-300 text-amber-600 focus:border-amber-600 focus:ring-0"
              />
              <span className="text-sm font-medium text-amber-950">
                Lưu kho (Ẩn khỏi website)
              </span>
            </label>
          </div>

          {/* Card: Sổ tính & Ghi chú nội bộ */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="w-4 h-4 text-indigo-600 shrink-0" />
                <h2 className="text-sm font-semibold text-indigo-950 uppercase tracking-wider">
                  Sổ tính & Ghi chú nội bộ
                </h2>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                🔒 Nội bộ
              </span>
            </div>

            {/* Giá thu vào / Giá vốn */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Giá thu vào / Giá vốn (VNĐ)
              </label>
              <Input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="VD: 800000"
                disabled={isPending}
                className="bg-white"
              />
              {costPrice !== "" && !isNaN(Number(costPrice)) && Number(costPrice) > 0 ? (
                <div className="mt-2.5 p-3 rounded-lg bg-white border border-indigo-100 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#74746E]">Giá vốn:</span>
                    <span className="font-mono font-semibold text-indigo-950">
                      {formatPrice(Number(costPrice))}
                    </span>
                  </div>
                  {price !== "" && !isNaN(Number(price)) && Number(price) > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-dashed border-gray-200">
                      <span className="text-[#74746E] flex items-center gap-1">
                        {Number(price) >= Number(costPrice) ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>Lời dự kiến:</span>
                      </span>
                      {Number(price) - Number(costPrice) >= 0 ? (
                        <span className="font-mono font-bold text-emerald-600">
                          +{formatPrice(Number(price) - Number(costPrice))} ({(((Number(price) - Number(costPrice)) / Number(costPrice)) * 100).toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-rose-600">
                          {formatPrice(Number(price) - Number(costPrice))}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Ghi chú Thu / Bán / Trade */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Ghi chú Thu / Bán / Trade
              </label>
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="VD: Thu của Nam FB 800k fullbox, trade phím bù 350k..."
                rows={3}
                disabled={isPending}
                className="w-full rounded-lg bg-white border border-[#E7E7E3] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
