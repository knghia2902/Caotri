import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, MapPin, Phone, User, FileText, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { OrderSuccessActions } from "@/components/cart/order-success-actions";
import {
  getStorefrontCategories,
  getStorefrontSettings,
  extractMegaMenuOverrides,
} from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

interface SuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({
  params,
}: SuccessPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Đặt hàng thành công #${orderNumber} | TringuyenGear`,
    description: "Cảm ơn bạn đã đặt hàng tại TringuyenGear.",
  };
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderNumber } = await params;

  // 1. Nạp chi tiết đơn hàng
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  // 2. Nạp cấu hình danh mục và settings từ cache
  const [categories, settings] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontSettings(),
  ]);

  const megaMenuOverrides = extractMegaMenuOverrides(settings);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111] flex flex-col selection:bg-[#111] selection:text-white">
      <StorefrontHeader
        categories={categories}
        hotline={settings.hotline}
        logoUrl={settings.logo_url || settings.logoUrl}
        shopName={settings.shop_name || settings.shopName}
        megaMenuOverrides={megaMenuOverrides}
      />

      <main className="flex-1 max-w-[840px] w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Success Card Header */}
        <div className="bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)] text-center space-y-4">
          <div className="w-16 h-16 bg-[#EBF7F0] rounded-full flex items-center justify-center mx-auto text-[#21A366]">
            <CheckCircle2 className="w-9 h-9 stroke-[2px]" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#111] tracking-tight">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-sm text-[#74746E] max-w-md mx-auto">
              Cảm ơn bạn đã tin tưởng lựa chọn CaoTrí Gear. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
            </p>
          </div>

          {/* Order Number Highlight */}
          <div className="inline-flex items-center gap-3 bg-[#FAFAFA] border border-[#E7E7E3] px-4 py-2 rounded-lg">
            <span className="text-xs text-[#74746E]">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-base text-[#111]">
              #{order.orderNumber}
            </span>
            <Badge variant="warning" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Chờ xác nhận
            </Badge>
          </div>
        </div>

        {/* Thông tin đơn hàng & Người nhận */}
        <div className="bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
          <h2 className="text-base font-semibold text-[#111] tracking-tight pb-3 border-b border-[#E7E7E3]">
            Chi Tiết Người Nhận & Giao Hàng
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#74746E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#74746E] block">Người nhận</span>
                <span className="font-medium text-[#111]">{order.customerName}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#74746E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#74746E] block">Số điện thoại</span>
                <span className="font-medium text-[#111]">{order.customerPhone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:col-span-2">
              <MapPin className="w-4 h-4 text-[#74746E] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#74746E] block">Địa chỉ giao hàng</span>
                <span className="font-medium text-[#111] leading-relaxed">
                  {order.customerAddress}
                </span>
              </div>
            </div>

            {order.customerNotes && (
              <div className="flex items-start gap-2.5 sm:col-span-2">
                <FileText className="w-4 h-4 text-[#74746E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#74746E] block">Ghi chú</span>
                  <span className="text-[#555550] italic">{order.customerNotes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bảng danh sách sản phẩm */}
        <div className="bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E3]">
            <h2 className="text-base font-semibold text-[#111] tracking-tight">
              Sản Phẩm Đã Đặt ({order.items.length})
            </h2>
            <span className="text-xs text-[#74746E]">
              Thanh toán: <span className="font-medium text-[#111]">COD khi nhận hàng</span>
            </span>
          </div>

          <div className="divide-y divide-[#E7E7E3]">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Package className="w-5 h-5 text-[#74746E] flex-shrink-0" />
                  <span className="font-medium text-[#111] truncate">
                    {item.productName}
                  </span>
                </div>

                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="text-[#74746E]">x{item.quantity}</span>
                  <span className="font-semibold text-[#111] min-w-[90px] text-right">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E7E7E3] flex justify-between items-baseline">
            <span className="text-base font-semibold text-[#111]">Tổng cộng</span>
            <span className="text-xl font-bold text-[#111]">
              {formatVND(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* 1-Click Multi-channel Order Confirmation Actions */}
        <div className="bg-white border border-[#E7E7E3] rounded-[14px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-3">
          <div>
            <h3 className="text-base font-semibold text-[#111]">
              Chốt Đơn Tức Thì Với Shop
            </h3>
            <p className="text-xs text-[#74746E] mt-1">
              Để đơn hàng được chuẩn bị và đóng gói nhanh nhất, bạn có thể bấm gửi thông tin đơn hàng trực tiếp qua Zalo hoặc Messenger của cửa hàng.
            </p>
          </div>

          <OrderSuccessActions
            orderNumber={order.orderNumber}
            customerName={order.customerName}
            customerPhone={order.customerPhone}
            customerAddress={order.customerAddress}
            customerNotes={order.customerNotes}
            totalAmount={order.totalAmount}
            items={order.items.map((i) => ({
              productName: i.productName,
              price: i.price,
              quantity: i.quantity,
            }))}
            zaloUrl={settings.zalo || settings.zaloUrl}
            facebookUrl={settings.facebook || settings.facebookUrl}
            hotline={settings.hotline}
          />
        </div>
      </main>

      <StorefrontFooter settings={settings} />
    </div>
  );
}
