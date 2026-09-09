import Link from "next/link";
import { Gamepad2, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, MessageSquare } from "lucide-react";
import { QuickContactDock } from "./quick-contact-dock";

interface StorefrontFooterProps {
  settings?: Record<string, string>;
}

export function StorefrontFooter({ settings = {} }: StorefrontFooterProps) {
  const shopName = settings.shopName || settings.shop_name || "Cao Trí Gaming Gear";
  const hotline = settings.hotline || "0987.654.321";
  const zalo = settings.zaloUrl || settings.zalo || "https://zalo.me/0987654321";
  const facebook = settings.facebookUrl || settings.facebook || "https://facebook.com";
  const address = settings.address || "123 Đường Công Nghệ, Q. Cầu Giấy, Hà Nội";
  const email = settings.email || "support@caotri.vn";

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-sm">
      {/* Floating Quick Contact Dock */}
      <QuickContactDock hotline={hotline} zalo={zalo} facebook={facebook} />

      {/* 3 Values Banner */}
      <div className="border-b border-zinc-900 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Chính Hãng 100%</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Cam kết linh kiện & gear chuẩn nguồn gốc</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Giao Hàng Siêu Tốc</h4>
              <p className="text-xs text-zinc-500 mt-0.5">Đóng gói chống sốc kỹ, kiểm tra trước khi nhận</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-100 text-xs sm:text-sm">Bảo Hành Nhanh Chóng</h4>
              <p className="text-xs text-zinc-500 mt-0.5">1 đổi 1 theo chính sách hãng, hỗ trợ tận tâm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: Shop Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-zinc-100">
              CAOTRI<span className="text-cyan-400">GEAR</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Hệ thống bán lẻ Gaming Gear, bàn phím cơ, chuột gaming và phụ kiện công nghệ hàng đầu. Trải nghiệm mua sắm mượt mà, chốt đơn tiện lợi qua Zalo/Hotline.
          </p>
          <div className="flex items-center gap-3 pt-1">
            {zalo && (
              <a
                href={zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 hover:border-blue-500 hover:bg-blue-950/30 transition-colors"
                title="Chat Zalo"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 hover:border-blue-500 hover:bg-blue-950/30 transition-colors"
                title="Fanpage Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-200 mb-4">
            Khám phá danh mục
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/products" className="hover:text-cyan-400 transition-colors">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/category/chuot-gaming" className="hover:text-cyan-400 transition-colors">
                Chuột Gaming
              </Link>
            </li>
            <li>
              <Link href="/category/ban-phim-co" className="hover:text-cyan-400 transition-colors">
                Bàn phím cơ Custom
              </Link>
            </li>
            <li>
              <Link href="/category/tai-nghe-gaming" className="hover:text-cyan-400 transition-colors">
                Tai nghe Gaming 7.1
              </Link>
            </li>
            <li>
              <Link href="/category/man-hinh-gaming" className="hover:text-cyan-400 transition-colors">
                Màn hình Gaming
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-200 mb-4">
            Hỗ trợ khách hàng
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                Hướng dẫn đặt hàng & Chốt Zalo
              </span>
            </li>
            <li>
              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                Chính sách bảo hành 1 đổi 1
              </span>
            </li>
            <li>
              <span className="hover:text-cyan-400 transition-colors cursor-pointer">
                Phương thức thanh toán & Giao hàng
              </span>
            </li>
            <li>
              <Link href="/admin" className="hover:text-cyan-400 transition-colors">
                Khu vực Quản trị (Admin)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Showroom */}
        <div>
          <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-200 mb-4">
            Thông tin liên hệ
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <a href={`tel:${hotline.replace(/[^0-9]/g, "")}`} className="hover:text-cyan-400 font-mono">
                {hotline}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-cyan-400">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-900 bg-zinc-950 py-4 px-4 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 {shopName}. Xây dựng trên nền tảng Next.js 15 App Router & Prisma.</p>
          <p className="text-[11px] text-zinc-600">
            Tối ưu trải nghiệm mua sắm Gaming Gear đỉnh cao.
          </p>
        </div>
      </div>
    </footer>
  );
}
