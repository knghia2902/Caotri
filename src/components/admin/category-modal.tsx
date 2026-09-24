"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slugify";
import { normalizeImageUrl } from "@/lib/utils";
import { createCategory, updateCategory } from "@/app/actions/category";
import { ImageUploader } from "@/components/admin/image-uploader";

export interface CategoryModalData {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  orderIndex: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryModalData | null;
  onSuccess?: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(category?.id);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setSlug(category.slug || "");
      setDescription(category.description || "");
      setImageUrl(category.imageUrl || "");
      setOrderIndex(category.orderIndex ?? 0);
      setIsCustomSlug(true);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setOrderIndex(0);
      setIsCustomSlug(false);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

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
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() ? normalizeImageUrl(imageUrl.trim()) : undefined,
        orderIndex: Number(orderIndex) || 0,
      };

      const res = isEditing && category?.id
        ? await updateCategory(category.id, payload)
        : await createCategory(payload);

      if (res.success) {
        toast.success(
          isEditing
            ? `Cập nhật danh mục "${name}" thành công`
            : `Tạo danh mục "${name}" thành công`
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || "Thao tác thất bại");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-6 text-[#111]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E7E3]">
          <div>
            <h3 className="text-lg font-bold text-[#111]">
              {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h3>
            <p className="text-xs text-[#74746E] mt-0.5">
              {isEditing
                ? "Cập nhật thông tin và thứ tự hiển thị danh mục"
                : "Tạo danh mục phân loại mới cho sản phẩm"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-[#74746E] hover:text-[#111] hover:bg-[#FAFAFA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Tên danh mục <span className="text-[#D94A4A]">*</span>
            </label>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="VD: Bàn phím cơ, Chuột gaming..."
              disabled={isPending}
              required
              className="h-11 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-[#111]"
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
                  className="text-xs text-[#3B82F6] hover:underline"
                >
                  Tạo lại từ tên
                </button>
              )}
            </div>
            <Input
              value={slug}
              onChange={handleSlugChange}
              placeholder="ban-phim-co"
              disabled={isPending}
              className="h-11 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-[#111]"
            />
            <p className="text-[11px] text-[#A3A39D] mt-1">
              Đường dẫn thân thiện SEO (ví dụ: tringuyengear.vn/category/{slug || "slug-mau"})
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                Hình ảnh / Icon đại diện
              </label>
              <ImageUploader
                compact={true}
                multiple={false}
                buttonText="Tải ảnh từ máy"
                onUploadSuccess={(urls) => setImageUrl(urls[0])}
                disabled={isPending}
              />
            </div>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Dán link ảnh hoặc bấm 'Tải ảnh từ máy' để lưu vào VPS"
              disabled={isPending}
              className="h-11 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-[#111]"
            />
            <p className="text-[11px] text-[#74746E] mt-1">
              💡 Bấm <strong>Tải ảnh từ máy</strong> để lưu trực tiếp lên VPS hoặc dán link Google Drive/Unsplash.
            </p>
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-lg bg-[#FAFAFA] border border-[#E7E7E3]">
                <div className="w-12 h-12 rounded bg-white overflow-hidden flex items-center justify-center border border-[#E7E7E3] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={normalizeImageUrl(imageUrl)}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="text-xs text-[#74746E] truncate flex-1">
                  Preview ảnh danh mục
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Thứ tự hiển thị
            </label>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              placeholder="0"
              disabled={isPending}
              className="h-11 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-[#111]"
            />
            <p className="text-[11px] text-[#A3A39D] mt-1">
              Số nhỏ hơn sẽ hiển thị trước trên thanh menu storefront
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Mô tả ngắn
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả danh mục sản phẩm..."
              rows={3}
              disabled={isPending}
              className="w-full rounded-lg bg-white border border-[#D5D5D0] px-3.5 py-2.5 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:border-[#111] transition-all resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E7E3]">
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-white text-[#111] border border-[#D5D5D0] hover:bg-[#FAFAFA] rounded-lg h-11 px-[18px]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[120px] bg-[#111] hover:bg-black text-white rounded-lg h-11 px-[18px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                "Cập nhật"
              ) : (
                "Thêm mới"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
