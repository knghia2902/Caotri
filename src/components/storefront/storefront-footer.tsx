import Link from "next/link";
import { Gamepad2, Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import { QuickContactDock } from "./quick-contact-dock";

interface StorefrontFooterProps {
  settings?: Record<string, string>;
}

export function StorefrontFooter({ settings = {} }: StorefrontFooterProps) {
  const shopName = settings.shop_name || settings.shopName || "Cao Trí Gaming Gear";
  const hotline = settings.hotline || "0987.654.321";
  const zalo = settings.zalo || settings.zaloUrl || "https://zalo.me/0987654321";
  const facebook = settings.facebook || settings.facebookUrl || "https://facebook.com";
  const address = settings.address || "123 Đường Công Nghệ, Q. Cầu Giấy, Hà Nội";
  const email = settings.email || "support@caotri.vn";

  return (
    <footer className="bg-[#111111] text-[#A3A39D] text-sm">
      {/* Floating Quick Contact Dock */}
      <QuickContactDock hotline={hotline} zalo={zalo} facebook={facebook} />

      {/* Main Footer Links */}
      <div className="max-w-[1360px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: Shop Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 flex items-center justify-center text-white">
              <Gamepad2 className="w-6 h-6 stroke-[1.5px]" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Caotri Gear
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Hệ thống bán lẻ Gaming Gear, bàn phím cơ, chuột gaming và phụ kiện công nghệ hàng đầu. Trải nghiệm mua sắm mượt mà, chốt đơn tiện lợi qua Zalo/Hotline.
          </p>
          <div className="flex items-center gap-3 pt-1">
            {zalo && (
              <a
                href={zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3A3A36] flex items-center justify-center text-white hover:bg-[#3A3A36] transition-colors"
                title="Chat Zalo"
              >
                <MessageSquare className="w-4 h-4 stroke-[1.5px]" />
              </a>
            )}
            {facebook && (
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#3A3A36] flex items-center justify-center text-white hover:bg-[#3A3A36] transition-colors"
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
          <h4 className="font-semibold text-sm tracking-tight text-white mb-4">
            Khám phá danh mục
          </h4>
          <ul className="space-y-3">
            <li>
              <Link href="/products" className="hover:text-white transition-colors">
                Tất cả sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/category/chuot-gaming" className="hover:text-white transition-colors">
                Chuột Gaming
              </Link>
            </li>
            <li>
              <Link href="/category/ban-phim-co" className="hover:text-white transition-colors">
                Bàn phím cơ Custom
              </Link>
            </li>
            <li>
              <Link href="/category/tai-nghe-gaming" className="hover:text-white transition-colors">
                Tai nghe Gaming 7.1
              </Link>
            </li>
            <li>
              <Link href="/category/man-hinh-gaming" className="hover:text-white transition-colors">
                Màn hình Gaming
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care */}
        <div>
          <h4 className="font-semibold text-sm tracking-tight text-white mb-4">
            Hỗ trợ khách hàng
          </h4>
          <ul className="space-y-3">
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">
                Hướng dẫn đặt hàng & Chốt Zalo
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">
                Chính sách bảo hành 1 đổi 1
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">
                Phương thức thanh toán & Giao hàng
              </span>
            </li>
            <li>
              <span className="hover:text-white transition-colors cursor-pointer">
                Chính sách bảo mật thông tin
              </span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Showroom */}
        <div>
          <h4 className="font-semibold text-sm tracking-tight text-white mb-4">
            Thông tin liên hệ
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#A3A39D] flex-shrink-0 mt-0.5 stroke-[1.5px]" />
              <span className="leading-relaxed">{address}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#A3A39D] flex-shrink-0 stroke-[1.5px]" />
              <a href={`tel:${hotline.replace(/[^0-9]/g, "")}`} className="hover:text-white">
                {hotline}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#A3A39D] flex-shrink-0 stroke-[1.5px]" />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#3A3A36] bg-[#111111] py-4 px-4 text-center text-sm text-[#74746E]">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 {shopName}. Xây dựng trên nền tảng Next.js 15 App Router & Prisma.</p>
          <p className="text-sm">
            Tối ưu trải nghiệm mua sắm Gaming Gear đỉnh cao.
          </p>
        </div>
      </div>
    </footer>
  );
}
