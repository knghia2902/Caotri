"use client";

import { useState, useTransition } from "react";
import { Phone, MessageSquare, Store, MapPin, Mail, Save, Loader2, ShieldCheck, Image as ImageIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/app/actions/setting";
import { ImageUploader } from "@/components/admin/image-uploader";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({
    logo_url: initialSettings.logo_url || initialSettings.logoUrl || initialSettings.logo || "/logo.png",
    hotline: initialSettings.hotline || "",
    zalo: initialSettings.zalo || initialSettings.zaloUrl || "",
    facebook: initialSettings.facebook || initialSettings.facebookUrl || "",
    shop_name: initialSettings.shop_name || initialSettings.shopName || "TringuyenGear",
    address: initialSettings.address || "",
    email: initialSettings.email || "",
  });

  const [isPending, startTransition] = useTransition();

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateSettings(formData);
      if (res.success) {
        toast.success("Đã cập nhật cài đặt và logo cửa hàng thành công!");
      } else {
        toast.error(res.error || "Không thể lưu cài đặt");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Block 1: Logo & Nhận diện thương hiệu */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E7E7E3]">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-[#111]/30 flex items-center justify-center text-[#111]">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111]">
              Logo & Nhận diện thương hiệu
            </h2>
            <p className="text-xs text-[#74746E]">
              Logo chính thức hiển thị trên Header, Footer, trang Đăng nhập và menu quản trị
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo Preview Box */}
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#D5D5D0] bg-[#FAFAFA] flex items-center justify-center p-2 overflow-hidden flex-shrink-0 relative group shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={formData.logo_url || "/logo.png"}
              alt="Logo Shop"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <ImageUploader
                compact={true}
                multiple={false}
                buttonText="Tải logo từ máy"
                onUploadSuccess={(urls) => handleChange("logo_url", urls[0])}
                disabled={isPending}
              />
              {formData.logo_url !== "/logo.png" && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleChange("logo_url", "/logo.png")}
                  disabled={isPending}
                  className="text-xs h-10 px-3 text-[#74746E] hover:text-[#111] gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Khôi phục logo mặc định
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                Đường dẫn URL Logo
              </label>
              <Input
                value={formData.logo_url}
                onChange={(e) => handleChange("logo_url", e.target.value)}
                placeholder="/logo.png hoặc dán link ảnh logo"
                disabled={isPending}
              />
              <p className="text-[11px] text-[#A3A39D]">
                💡 Bấm <strong>Tải logo từ máy</strong> để lưu trực tiếp lên VPS hoặc nhập đường dẫn ảnh (hỗ trợ PNG trong suốt, WEBP, SVG, JPG).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Block 2: Kênh liên hệ & Chốt đơn */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E7E7E3]">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-[#111]/30 flex items-center justify-center text-[#111]">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111]">
              Kênh liên hệ & Đặt hàng nhanh
            </h2>
            <p className="text-xs text-[#74746E]">
              Các thông tin này sẽ hiển thị trên nút chốt đơn giỏ hàng, footer và thanh header của khách hàng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Hotline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#111]" />
              Hotline tư vấn & Bán hàng <span className="text-[#D94A4A]">*</span>
            </label>
            <Input
              value={formData.hotline}
              onChange={(e) => handleChange("hotline", e.target.value)}
              placeholder="VD: 0987.654.321"
              disabled={isPending}
              required
            />
            <p className="text-[11px] text-[#74746E] mt-1">
              Số điện thoại khách hàng bấm gọi trực tiếp khi chọn phương thức Gọi Hotline
            </p>
          </div>

          {/* Zalo OA */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              Đường dẫn Zalo (OA hoặc Cá nhân) <span className="text-[#D94A4A]">*</span>
            </label>
            <Input
              value={formData.zalo}
              onChange={(e) => handleChange("zalo", e.target.value)}
              placeholder="VD: https://zalo.me/0987654321"
              disabled={isPending}
              required
            />
            <p className="text-[11px] text-[#74746E] mt-1">
              Khách hàng bấm vào sẽ mở chat Zalo để gửi danh sách đơn hàng
            </p>
          </div>

          {/* Facebook */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-blue-400 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Link Fanpage Facebook / Messenger
            </label>
            <Input
              value={formData.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
              placeholder="VD: https://facebook.com/tringuyengear hoặc https://m.me/tringuyengear"
              disabled={isPending}
            />
            <p className="text-[11px] text-[#74746E] mt-1">
              Liên kết mở Fanpage hoặc khung chat Messenger của shop
            </p>
          </div>
        </div>
      </div>

      {/* Block 3: Thông tin cửa hàng */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E7E7E3]">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#21A366]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111]">
              Thông tin cửa hàng & Showroom
            </h2>
            <p className="text-xs text-[#74746E]">
              Thông tin nhận diện thương hiệu và địa chỉ bảo hành hiển thị tại chân trang
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Shop name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#74746E]" />
              Tên cửa hàng / Thương hiệu
            </label>
            <Input
              value={formData.shop_name}
              onChange={(e) => handleChange("shop_name", e.target.value)}
              placeholder="TringuyenGear"
              disabled={isPending}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#74746E]" />
              Email liên hệ & Hỗ trợ kỹ thuật
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@tringuyengear.vn"
              disabled={isPending}
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#74746E]" />
              Địa chỉ showroom / Điểm bảo hành
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Đường Công Nghệ, Quận Cầu Giấy, TP. Hà Nội"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Security alert for ADMIN only */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-[#D5D5D0] flex items-center gap-3 text-xs text-[#111]">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#111]" />
        <span>
          Tính năng cấu hình cài đặt này được phân quyền nghiêm ngặt dành riêng cho Quản trị viên (<strong>ADMIN</strong>).
        </span>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          className="bg-[#111] text-white rounded-lg h-11 px-[18px] min-w-[150px] gap-2"
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
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
