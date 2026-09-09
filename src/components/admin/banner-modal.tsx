"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBanner, updateBanner, type BannerFormData } from "@/app/actions/banner";

export interface BannerModalData {
  id?: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  orderIndex: number;
  isActive: boolean;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: BannerModalData | null;
  onSuccess?: () => void;
}

export function BannerModal({
  isOpen,
  onClose,
  banner,
  onSuccess,
}: BannerModalProps) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(banner?.id);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setImageUrl(banner.imageUrl || "");
      setLinkUrl(banner.linkUrl || "");
      setOrderIndex(banner.orderIndex ?? 0);
      setIsActive(banner.isActive ?? true);
    } else {
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
      setOrderIndex(0);
      setIsActive(true);
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề banner");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh banner");
      return;
    }

    startTransition(async () => {
      const payload: BannerFormData = {
        title: title.trim(),
        imageUrl: imageUrl.trim(),
        linkUrl: linkUrl.trim() || undefined,
        orderIndex: Number(orderIndex) || 0,
        isActive,
      };

      const res = isEditing && banner?.id
        ? await updateBanner(banner.id, payload)
        : await createBanner(payload);

      if (res.success) {
        toast.success(
          isEditing
            ? `Cập nhật banner "${title}" thành công`
            : `Tạo banner "${title}" thành công`
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || "Thao tác thất bại");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">
              {isEditing ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEditing
                ? "Cập nhật hình ảnh và liên kết điều hướng banner"
                : "Tạo banner quảng cáo mới hiển thị trên slider trang chủ"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Tiêu đề Banner <span className="text-rose-400">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Siêu Phẩm Gaming Chuột Không Dây Mới Nhất 2026"
              disabled={isPending}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              URL Hình ảnh Banner (Khuyên dùng tỉ lệ 16:9 hoặc 21:9) <span className="text-rose-400">*</span>
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... hoặc Cloudflare CDN"
              disabled={isPending}
              required
            />
            {imageUrl && (
              <div className="mt-2 relative rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden aspect-[16/7] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/800x350/18181b/a1a1aa?text=URL+Ảnh+Không+Hợp+Lệ";
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Liên kết đích (Link URL khi bấm vào banner)
            </label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="VD: /products/chuot-dragonfly-f1-pro-max hoặc https://..."
              disabled={isPending}
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Khách hàng click vào banner sẽ được chuyển hướng tới trang này
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Thứ tự hiển thị
              </label>
              <Input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={isPending}
              />
              <p className="text-[11px] text-zinc-500 mt-1">Số nhỏ hiển thị trước</p>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isPending}
                  className="rounded border-zinc-700 text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-xs font-semibold text-zinc-200">
                  Hiển thị trên Slider
                </span>
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="neon"
              disabled={isPending}
              className="min-w-[120px]"
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
