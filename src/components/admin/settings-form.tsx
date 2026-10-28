"use client";

import { useState, useTransition } from "react";
import {
  Phone,
  MessageSquare,
  Store,
  MapPin,
  Mail,
  Save,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  RotateCcw,
  Send,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateSettings } from "@/app/actions/setting";
import { testSmtpConnectionAction } from "@/lib/email";
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
    product_policy_title:
      initialSettings.product_policy_title ||
      initialSettings.productPolicyTitle ||
      "Chính sách bảo hành & Ghi chú bán hàng",
    product_policy:
      initialSettings.product_policy ||
      initialSettings.productPolicy ||
      "Bảo hành 1 tháng • Bao test 7 ngày lỗi 1 đổi 1 • Nhận cọc ship COD toàn quốc",
    // Cấu hình thông báo Email qua Gmail SMTP
    email_notify_enabled: initialSettings.email_notify_enabled ?? "true",
    admin_notify_email: initialSettings.admin_notify_email || initialSettings.email || "",
    smtp_user: initialSettings.smtp_user || "",
    smtp_pass: initialSettings.smtp_pass || "",
    smtp_from_name: initialSettings.smtp_from_name || initialSettings.shop_name || "Caotri Gear",
  });

  const [isPending, startTransition] = useTransition();
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestEmail = async () => {
    if (!formData.smtp_user?.trim() || !formData.smtp_pass?.trim()) {
      toast.error("Vui lòng nhập Email Gmail gửi thư và Mật khẩu ứng dụng trước khi gửi thử!");
      return;
    }
    if (!formData.admin_notify_email?.trim()) {
      toast.error("Vui lòng nhập Email nhận thông báo!");
      return;
    }

    setIsTestingEmail(true);
    const toastId = toast.loading("Đang kết nối đến Gmail và gửi thư thử nghiệm...");
    try {
      const res = await testSmtpConnectionAction({
        smtp_user: formData.smtp_user,
        smtp_pass: formData.smtp_pass,
        admin_notify_email: formData.admin_notify_email,
        smtp_from_name: formData.smtp_from_name,
      });

      if (res.success) {
        toast.success(res.message || "Gửi email thử nghiệm thành công! Hãy kiểm tra hộp thư đến.", { id: toastId });
      } else {
        toast.error(res.error || "Gửi email thất bại", { id: toastId, duration: 6000 });
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi kiểm tra email", { id: toastId });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateSettings(formData);
      if (res.success) {
        toast.success("Đã cập nhật cài đặt cửa hàng và cấu hình email thành công!");
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
              placeholder="Caotri Gear"
              disabled={isPending}
            />
          </div>

          {/* Email liên hệ */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#74746E]" />
              Email liên hệ hiển thị ở Footer
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="contact@caotrigear.com"
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
              placeholder="123 Đường Công Nghệ, TP. Hồ Chí Minh"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Block 4: Cấu hình Thông báo Email khi có đơn hàng (Gmail SMTP) */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111]">
                Thông báo Email Đơn hàng (Gmail SMTP)
              </h2>
              <p className="text-xs text-[#74746E]">
                Tự động gửi email thông báo chi tiết đến hòm thư Admin ngay khi khách hàng chốt đơn
              </p>
            </div>
          </div>

          {/* Toggle Bật/Tắt */}
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.email_notify_enabled === "true"}
              onChange={(e) => handleChange("email_notify_enabled", e.target.checked ? "true" : "false")}
              disabled={isPending}
              className="w-4 h-4 rounded text-[#111] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#111]">
              {formData.email_notify_enabled === "true" ? "Đang BẬT thông báo" : "Đang TẮT"}
            </span>
          </label>
        </div>

        {/* Hướng dẫn nhanh Google App Password */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E7E7E3] text-xs space-y-2 text-[#555550]">
          <div className="font-semibold text-[#111] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hướng dẫn thiết lập Mật khẩu ứng dụng Gmail (Chỉ mất 1 phút):</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
            <li>
              Đăng nhập Gmail, vào trang Bảo mật Google:{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                myaccount.google.com/security <ExternalLink className="w-3 h-3 inline" />
              </a>
            </li>
            <li>Đảm bảo tài khoản đã <strong>Bật xác minh 2 bước</strong>.</li>
            <li>
              Truy cập trang tạo Mật khẩu ứng dụng:{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
              >
                myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3 inline" />
              </a>
            </li>
            <li>Đặt tên (VD: <em>Caotri Gear</em>) và bấm <strong>Tạo</strong>. Google sẽ cấp mã 16 chữ cái màu vàng.</li>
            <li>Sao chép mã 16 chữ cái đó dán vào ô <strong>Mật khẩu ứng dụng</strong> bên dưới.</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email nhận thông báo (Admin) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email nhận thông báo đơn hàng (Hòm thư của bạn) <span className="text-[#D94A4A]">*</span>
            </label>
            <Input
              type="email"
              value={formData.admin_notify_email}
              onChange={(e) => handleChange("admin_notify_email", e.target.value)}
              placeholder="VD: nguyenlecaotri@gmail.com (hoặc nhiều email cách nhau dấu phẩy)"
              disabled={isPending}
            />
            <p className="text-[11px] text-[#A3A39D] mt-1">
              Email mà hệ thống sẽ bắn thông báo đơn hàng mới về (có thể điền cùng email gửi bên dưới).
            </p>
          </div>

          {/* Gmail gửi thư */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#111]" />
              Tài khoản Gmail gửi thư <span className="text-[#D94A4A]">*</span>
            </label>
            <Input
              type="email"
              value={formData.smtp_user}
              onChange={(e) => handleChange("smtp_user", e.target.value)}
              placeholder="VD: caotrigear@gmail.com"
              disabled={isPending}
            />
          </div>

          {/* Mật khẩu ứng dụng Gmail */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              Mật khẩu ứng dụng Gmail (16 ký tự) <span className="text-[#D94A4A]">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.smtp_pass}
                onChange={(e) => handleChange("smtp_pass", e.target.value)}
                placeholder="VD: abcd efgh ijkl mnop"
                disabled={isPending}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111]"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tên người gửi hiển thị */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Tên người gửi hiển thị trong hòm thư
            </label>
            <Input
              value={formData.smtp_from_name}
              onChange={(e) => handleChange("smtp_from_name", e.target.value)}
              placeholder="Caotri Gear - Thông báo đơn hàng"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Nút gửi thử email */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E7E7E3]">
          <p className="text-xs text-[#74746E]">
            Kiểm tra kết nối và gửi 1 thư thử nghiệm vào hòm thư của bạn:
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestEmail}
            disabled={isPending || isTestingEmail}
            className="h-10 px-4 text-xs font-medium border-[#E7E7E3] hover:border-[#111] hover:bg-[#F3F3F1] gap-2 shrink-0 rounded-lg"
          >
            {isTestingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Đang gửi thư thử...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Gửi email kiểm tra (Test)</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Block 5: Chính sách & Ghi chú mặc định sản phẩm */}
      <div className="rounded-2xl border border-[#E7E7E3] bg-white p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E7E7E3]">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#21A366]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111]">
              Chính sách & Ghi chú mặc định sản phẩm
            </h2>
            <p className="text-xs text-[#74746E]">
              Hiển thị tự động bên dưới phần mô tả của tất cả sản phẩm (bảo hành, bao test, cọc, quy định đổi trả...)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Tiêu đề chính sách & ghi chú
            </label>
            <Input
              value={formData.product_policy_title}
              onChange={(e) => handleChange("product_policy_title", e.target.value)}
              placeholder="VD: Chính sách bảo hành & Ghi chú bán hàng"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
              Nội dung thông tin mặc định (Bảo hành, Bao test, Đặt cọc...)
            </label>
            <textarea
              value={formData.product_policy}
              onChange={(e) => handleChange("product_policy", e.target.value)}
              placeholder="VD: Bảo hành 1 tháng • Bao test 7 ngày lỗi 1 đổi 1 • Nhận cọc ship COD toàn quốc..."
              rows={4}
              disabled={isPending}
              className="w-full rounded-xl border border-[#D5D5D0] p-3 text-sm text-[#111] placeholder:text-[#A3A39D] focus:outline-none focus:ring-2 focus:ring-[#111] transition-all resize-y"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          className="bg-[#111] text-white rounded-lg h-11 px-[18px] min-w-[150px] gap-2"
          disabled={isPending || isTestingEmail}
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
