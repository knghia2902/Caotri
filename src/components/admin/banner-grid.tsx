"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BannerModal, type BannerModalData } from "@/components/admin/banner-modal";
import { deleteBanner, toggleBannerActive } from "@/app/actions/banner";
import { normalizeImageUrl } from "@/lib/utils";

export interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
}

interface BannerGridProps {
  banners: BannerItem[];
}

export function BannerGrid({ banners: initialBanners }: BannerGridProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerModalData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (initialBanners !== banners && initialBanners.length !== banners.length) {
    setBanners(initialBanners);
  }

  const handleAddNew = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner: BannerItem) => {
    setSelectedBanner({
      id: banner.id,
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      orderIndex: banner.orderIndex,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (banner: BannerItem) => {
    const oldStatus = banner.isActive;
    const newStatus = !oldStatus;

    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
    );
    setTogglingId(banner.id);

    const res = await toggleBannerActive(banner.id, oldStatus);
    setTogglingId(null);

    if (res.success) {
      toast.success(
        newStatus
          ? `Đã bật hiển thị banner "${banner.title}"`
          : `Đã ẩn banner "${banner.title}"`
      );
    } else {
      // Rollback
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: oldStatus } : b))
      );
      toast.error(res.error || "Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (banner: BannerItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title}"?`)) {
      return;
    }

    setDeletingId(banner.id);
    startTransition(async () => {
      const res = await deleteBanner(banner.id);
      if (res.success) {
        toast.success(`Đã xóa banner "${banner.title}"`);
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        router.refresh();
      } else {
        toast.error(res.error || "Không thể xóa banner");
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[#74746E]">
            Hiện có <span className="text-[#111] font-semibold">{banners.length}</span> banner trong hệ thống
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#111] text-white rounded-lg h-11 px-[18px] gap-2">
          <Plus className="w-4 h-4" />
          Thêm banner mới
        </Button>
      </div>

      {/* Card Grid */}
      {banners.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#E7E7E3] bg-white/30">
          <ImageIcon className="w-12 h-12 mx-auto text-[#A3A39D] mb-3" />
          <h3 className="text-base font-semibold text-[#111]">Chưa có banner nào</h3>
          <p className="text-xs text-[#74746E] mt-1 max-w-sm mx-auto">
            Tạo banner đầu tiên để hiển thị các chương trình khuyến mãi và sản phẩm nổi bật trên slider trang chủ.
          </p>
          <Button onClick={handleAddNew} className="bg-[#111] text-white rounded-lg h-11 px-[18px] mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Tạo banner ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group rounded-2xl border border-[#E7E7E3] bg-white overflow-hidden hover:border-[#111] transition-all flex flex-col "
            >
              {/* Image Preview */}
              <div className="relative aspect-[16/8] w-full bg-[#111111] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeImageUrl(banner.imageUrl)}
                  alt={banner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/800x400/18181b/a1a1aa?text=Banner+Error";
                  }}
                />

                {/* Badges on top of image */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge className="bg-white/80  text-[#111] border border-[#E7E7E3] font-mono text-[11px] px-2 py-0.5">
                    Thứ tự #{banner.orderIndex}
                  </Badge>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner)}
                    disabled={togglingId === banner.id}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold  border transition-all ${
                      banner.isActive
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/90"
                        : "bg-white/80 text-[#74746E] border-[#E7E7E3] hover:bg-[#FAFAFA]/90"
                    }`}
                  >
                    {togglingId === banner.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : banner.isActive ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                    <span>{banner.isActive ? "Hiển thị" : "Đã ẩn"}</span>
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-semibold text-[#111] group-hover:text-[#111] transition-colors line-clamp-1">
                    {banner.title}
                  </h4>
                  {banner.linkUrl ? (
                    <div className="flex items-center gap-1 text-xs text-[#74746E] font-mono mt-1 truncate">
                      <ExternalLink className="w-3 h-3 text-[#111] flex-shrink-0" />
                      <span className="truncate">{banner.linkUrl}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-[#A3A39D] mt-1 italic">
                      (Không gắn liên kết)
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#E7E7E3] flex items-center justify-between">
                  <span className="text-[11px] text-[#74746E] font-mono">
                    ID: {banner.id.slice(0, 8)}...
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(banner)}
                      title="Chỉnh sửa banner"
                      className="h-8 w-8 p-0 text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1]"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(banner)}
                      disabled={deletingId === banner.id}
                      title="Xóa banner"
                      className="h-8 w-8 p-0 text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50"
                    >
                      {deletingId === banner.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#D94A4A]" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={selectedBanner}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
