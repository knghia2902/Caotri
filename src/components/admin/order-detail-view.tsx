"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Printer,
  Package,
  User,
  MapPin,
  Clock,
  Save,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatVND, getStatusLabel } from "@/lib/utils";
import { OrderStatus } from "@/types";
import {
  updateOrderStatusAction,
  updateOrderNotesAction,
} from "@/app/actions/order";
import { OrderStatusBadge } from "./order-status-badge";
import { CancelOrderDialog } from "./cancel-order-dialog";

export interface OrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string;
  } | null;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes: string | null;
  adminNotes: string | null;
  totalAmount: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderDetailItem[];
}

interface OrderDetailViewProps {
  order: OrderDetailData;
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStatus, setCurrentStatus] = useState<string>(order.status);
  const [adminNotes, setAdminNotes] = useState<string>(order.adminNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const cleanPhone = order.customerPhone.replace(/\D/g, "");

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === "CANCELLED") {
      setIsCancelDialogOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatusAction({
        orderId: order.id,
        status: newStatus,
      });

      if (res.success) {
        toast.success(res.message || "Cập nhật trạng thái thành công");
        setCurrentStatus(newStatus);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Không thể cập nhật trạng thái");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatusAction({
        orderId: order.id,
        status: "CANCELLED",
        cancelReason: reason,
      });

      if (res.success) {
        toast.success(res.message || "Đã hủy đơn hàng thành công");
        setCurrentStatus("CANCELLED");
        setIsCancelDialogOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Không thể hủy đơn hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi hủy đơn hàng");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveAdminNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await updateOrderNotesAction({
        orderId: order.id,
        adminNotes: adminNotes.trim(),
      });

      if (res.success) {
        toast.success("Đã lưu ghi chú nội bộ thành công");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Không thể lưu ghi chú");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu ghi chú");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Helper parsing product image
  const getProductImage = (item: OrderDetailItem) => {
    if (item.product?.images) {
      try {
        const parsed = JSON.parse(item.product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        if (item.product.images.startsWith("http") || item.product.images.startsWith("/")) {
          return item.product.images;
        }
      }
    }
    return null;
  };

  return (
    <div>
      {/* ============================================================ */}
      {/* 1. SCREEN UI (Ẩn khi In)                                      */}
      {/* ============================================================ */}
      <div className="space-y-6 print:hidden">
        {/* Back navigation & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#74746E] hover:text-[#111] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại danh sách đơn</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111]">
                Đơn hàng #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={currentStatus} />
            </div>

            <div className="flex items-center gap-2 text-xs text-[#74746E]">
              <Clock className="w-3.5 h-3.5" />
              <span>Đặt hàng vào lúc {formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* 1-Click Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <a
              href={`tel:${order.customerPhone}`}
              title={`Gọi ngay cho ${order.customerName}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 hover:bg-zinc-200 text-[#111] transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4 text-[#111]" />
              <span>Gọi điện</span>
            </a>

            <a
              href={`https://zalo.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở trò chuyện Zalo với số điện thoại này"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#0068FF] hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Mở chat Zalo</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              title="In phiếu giao hàng dán thùng COD"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#E7E7E3] bg-white hover:bg-zinc-100 text-[#111] transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#111]" />
              <span>In phiếu giao hàng</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI (65% ~ 8 cols): Danh sách linh kiện, Thanh toán, Thông tin người nhận */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Danh sách linh kiện */}
            <div className="bg-white border border-[#E7E7E3] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#E7E7E3] flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#111] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#111]" />
                  Danh sách linh kiện ({order.items.length} mặt hàng)
                </h2>
                <span className="text-xs text-[#74746E]">
                  Tổng SL: {order.items.reduce((s, i) => s + i.quantity, 0)} món
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E7E7E3] text-[#74746E] uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Sản phẩm</th>
                      <th className="py-3 px-4 text-right">Đơn giá</th>
                      <th className="py-3 px-4 text-center">SL</th>
                      <th className="py-3 px-5 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E3]">
                    {order.items.map((item) => {
                      const img = getProductImage(item);
                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/60">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-zinc-100 border border-[#E7E7E3] flex items-center justify-center shrink-0 overflow-hidden">
                                {img ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={img}
                                    alt={item.productName}
                                    className="w-full h-full object-contain p-1"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-zinc-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                {item.product ? (
                                  <Link
                                    href={`/products/${item.product.slug}`}
                                    target="_blank"
                                    className="font-medium text-[#111] hover:underline flex items-center gap-1 line-clamp-2"
                                  >
                                    <span>{item.productName}</span>
                                    <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                                  </Link>
                                ) : (
                                  <div className="font-medium text-[#111] line-clamp-2">
                                    {item.productName}
                                  </div>
                                )}
                                <div className="text-[11px] text-[#74746E] mt-0.5 font-mono">
                                  ID: {item.productId}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-medium text-[#111]">
                            {formatVND(item.price)}
                          </td>

                          <td className="py-3.5 px-4 text-center whitespace-nowrap font-semibold text-[#111]">
                            x{item.quantity}
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap font-bold text-[#111]">
                            {formatVND(item.price * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tóm tắt thanh toán */}
              <div className="p-5 border-t border-[#E7E7E3] bg-[#FAFAFA] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#74746E]">
                  <span>Tạm tính linh kiện:</span>
                  <span className="font-medium text-[#111]">
                    {formatVND(order.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#74746E]">
                  <span>Phí giao hàng toàn quốc:</span>
                  <span className="font-medium text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E7E7E3]">
                  <div>
                    <span className="font-bold text-sm text-[#111]">
                      Tổng tiền thu hộ (COD):
                    </span>
                    <p className="text-[11px] text-[#74746E]">
                      Khách hàng thanh toán tiền mặt khi nhận hàng
                    </p>
                  </div>
                  <span className="font-bold text-lg text-[#111]">
                    {formatVND(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Thông tin khách hàng & Giao hàng */}
            <div className="bg-white border border-[#E7E7E3] rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#111] flex items-center gap-2">
                <User className="w-4 h-4 text-[#111]" />
                Thông tin người nhận hàng
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-[#74746E]">Họ và tên:</div>
                  <div className="font-semibold text-sm text-[#111]">
                    {order.customerName}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[#74746E]">Số điện thoại liên hệ:</div>
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-[#111]">
                    <span>{order.customerPhone}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="text-[#74746E] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Địa chỉ giao hàng chi tiết:</span>
                  </div>
                  <div className="font-medium text-[#111] leading-relaxed bg-[#F7F7F5] p-3 rounded-xl border border-[#E7E7E3]">
                    {order.customerAddress}
                  </div>
                </div>

                {order.customerNotes && (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="text-amber-800 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Ghi chú của khách hàng khi đặt đơn:</span>
                    </div>
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-xl leading-relaxed">
                      &ldquo;{order.customerNotes}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (35% ~ 4 cols): Trạng thái & Ghi chú nội bộ nhân viên */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card 3: Xử lý trạng thái đơn hàng */}
            <div className="bg-white border border-[#E7E7E3] rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#111] flex items-center justify-between">
                <span>Trạng thái đơn hàng</span>
                {isUpdatingStatus && (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                )}
              </h2>

              <div className="p-3.5 rounded-xl bg-[#F7F7F5] border border-[#E7E7E3] space-y-2">
                <div className="text-[11px] text-[#74746E]">Trạng thái hiện tại:</div>
                <div>
                  <OrderStatusBadge status={currentStatus} className="text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111]">
                  Chuyển nhanh trạng thái:
                </label>
                <select
                  value={currentStatus}
                  disabled={isUpdatingStatus}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as OrderStatus)
                  }
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-[#E7E7E3] bg-white text-[#111] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all cursor-pointer"
                >
                  <option value="PENDING">Chờ xử lý (Mới nhận)</option>
                  <option value="CONTACTED">Đã liên hệ xác nhận</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="COMPLETED">Hoàn thành (Đã thanh toán COD)</option>
                  <option value="CANCELLED">Hủy đơn hàng</option>
                </select>
                <p className="text-[11px] text-[#74746E] leading-normal">
                  * Khi chọn Hủy đơn hàng, hệ thống sẽ mở hộp thoại yêu cầu nhập lý do để lưu vào nhật ký nội bộ.
                </p>
              </div>
            </div>

            {/* Card 4: Ghi chú nội bộ nhân viên (Staff Notes) */}
            <div className="bg-white border border-[#E7E7E3] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#111] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#111]" />
                  Ghi chú nội bộ nhân viên
                </h2>
              </div>

              <p className="text-[11px] text-[#74746E] leading-relaxed">
                Chỉ hiển thị cho quản trị viên & nhân viên. Dùng để lưu mã vận
                đơn (GHTK, GHN, Viettel Post) hoặc lịch sử cuộc gọi xác nhận.
              </p>

              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Nhập mã vận đơn, tiến độ tư vấn, nhật ký vận chuyển..."
                rows={5}
                maxLength={2000}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E7E7E3] bg-white text-[#111] placeholder:text-[#74746E] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#74746E]">
                  {adminNotes.length}/2000 ký tự
                </span>

                <button
                  type="button"
                  onClick={handleSaveAdminNotes}
                  disabled={isSavingNotes}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#111] hover:bg-black text-white disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSavingNotes ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSavingNotes ? "Đang lưu..." : "Lưu ghi chú"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRINT-ONLY DELIVERY RECEIPT (@media print)                 */}
      {/* ============================================================ */}
      <div className="hidden print:block font-sans text-black text-xs leading-normal bg-white p-6 max-w-2xl mx-auto border-2 border-black">
        {/* Print Header */}
        <div className="border-b-2 border-black pb-4 text-center space-y-1">
          <div className="text-base font-extrabold uppercase tracking-wide">
            CAOTRI GAMING GEAR & TECH ACCESSORIES
          </div>
          <div className="text-xs font-semibold">
            Hotline: 0909.123.456 &bull; Website: caotri.vn
          </div>
          <div className="text-sm font-black uppercase mt-2">
            PHIẾU GIAO HÀNG & THU HỘ TIỀN (COD)
          </div>
        </div>

        {/* Order Barcode / Number Box */}
        <div className="flex items-center justify-between py-3 border-b border-black">
          <div>
            <span className="font-bold">MÃ ĐƠN HÀNG:</span>
            <span className="font-mono font-black text-base ml-2">
              #{order.orderNumber}
            </span>
          </div>
          <div className="text-right">
            <div>
              <span className="font-bold">Ngày đặt:</span>{" "}
              {formatDate(order.createdAt)}
            </div>
            <div>
              <span className="font-bold">Trạng thái:</span>{" "}
              {getStatusLabel(order.status)}
            </div>
          </div>
        </div>

        {/* Sender & Receiver Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-black">
          {/* Sender */}
          <div className="space-y-1 pr-2 border-r border-black">
            <div className="font-bold uppercase text-[11px] underline">
              NGƯỜI GỬI (SHOP):
            </div>
            <div className="font-semibold">CaoTrí Gaming Gear Store</div>
            <div>Hotline: 0909.123.456</div>
            <div>Kho vận: TP. Hồ Chí Minh</div>
          </div>

          {/* Receiver */}
          <div className="space-y-1 pl-2">
            <div className="font-bold uppercase text-[11px] underline">
              NGƯỜI NHẬN (KHÁCH HÀNG):
            </div>
            <div className="font-bold text-sm">{order.customerName}</div>
            <div className="font-bold font-mono text-sm">{order.customerPhone}</div>
            <div className="font-medium text-xs leading-snug">
              {order.customerAddress}
            </div>
            {order.customerNotes && (
              <div className="text-[11px] italic mt-1 font-semibold">
                * Ghi chú: {order.customerNotes}
              </div>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div className="py-4 border-b border-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black text-[11px]">
                <th className="py-1 pr-2 w-8">STT</th>
                <th className="py-1 px-2">Tên sản phẩm linh kiện</th>
                <th className="py-1 px-2 text-right">Đơn giá</th>
                <th className="py-1 px-2 text-center w-12">SL</th>
                <th className="py-1 pl-2 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1.5 pr-2 align-top">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-medium align-top">
                    {item.productName}
                  </td>
                  <td className="py-1.5 px-2 text-right whitespace-nowrap align-top">
                    {formatVND(item.price)}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold align-top">
                    {item.quantity}
                  </td>
                  <td className="py-1.5 pl-2 text-right font-semibold whitespace-nowrap align-top">
                    {formatVND(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total COD Amount */}
        <div className="py-3 border-b-2 border-black flex items-center justify-between">
          <div className="font-bold uppercase text-xs">
            TỔNG TIỀN THU HỘ (COD):
          </div>
          <div className="font-mono font-black text-lg">
            {formatVND(order.totalAmount)}
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-4 pt-6 pb-12 text-center">
          <div>
            <div className="font-bold uppercase">NGƯỜI NHẬN HÀNG</div>
            <div className="text-[10px] italic text-gray-600">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
          <div>
            <div className="font-bold uppercase">NGƯỜI GIAO HÀNG</div>
            <div className="text-[10px] italic text-gray-600">
              (Ký và ghi rõ họ tên)
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-dashed border-gray-400 text-[10px] italic">
          Khách hàng vui lòng kiểm tra kỹ linh kiện và phụ kiện trước khi thanh toán. Cảm ơn bạn đã lựa chọn CaoTrí Gear!
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={isCancelDialogOpen}
        orderNumber={order.orderNumber}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        isPending={isUpdatingStatus}
      />
    </div>
  );
}
