"use client";

import { useState, useTransition, useEffect } from "react";
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
  Pencil,
  Check,
  X,
  CheckCircle2,
  TrendingUp,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { formatVND, getStatusLabel, normalizeImageUrl } from "@/lib/utils";
import { OrderStatus } from "@/types";
import {
  updateOrderStatusAction,
  updateOrderNotesAction,
  updateOrderItemCostAction,
} from "@/app/actions/order";
import {
  getChannelLabel,
  getPaymentMethodLabel,
} from "@/lib/finance-schema";
import { OrderStatusBadge } from "./order-status-badge";
import { CancelOrderDialog } from "./cancel-order-dialog";

export interface OrderDetailItem {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  costPrice?: number | null;
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
  channel?: string;
  paymentMethod?: string;
  discount?: number;
  shippingFee?: number;
  soldAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  items: OrderDetailItem[];
}

export interface ShopInfo {
  shopName: string;
  hotline?: string;
  address?: string;
  siteUrl?: string;
}

interface OrderDetailViewProps {
  order: OrderDetailData;
  isAdmin?: boolean;
  shopInfo?: ShopInfo;
}

function getChannelBadgeStyle(channel?: string | null): string {
  switch (channel) {
    case "OFFLINE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ZALO":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "FACEBOOK":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "OTHER":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "WEB":
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

export function OrderDetailView({
  order,
  isAdmin = false,
  shopInfo,
}: OrderDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStatus, setCurrentStatus] = useState<string>(order.status);
  const [adminNotes, setAdminNotes] = useState<string>(order.adminNotes || "");
  const [items, setItems] = useState<OrderDetailItem[]>(order.items);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Inline costPrice editing state (ADMIN ONLY)
  const [editingCostItemId, setEditingCostItemId] = useState<string | null>(null);
  const [editingCostValue, setEditingCostValue] = useState<string>("");
  const [isSavingCost, setIsSavingCost] = useState(false);

  useEffect(() => {
    setItems(order.items);
  }, [order.items]);

  useEffect(() => {
    setAdminNotes(order.adminNotes || "");
  }, [order.adminNotes]);

  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  const cleanPhone = (order.customerPhone || "").replace(/\D/g, "");
  const hasPhone = Boolean(order.customerPhone?.trim() && cleanPhone.length > 0);
  const resolvedShopName = shopInfo?.shopName?.trim() || "TringuyenGear";
  const resolvedHotline = shopInfo?.hotline?.trim() || "";
  const resolvedAddress = shopInfo?.address?.trim() || "";
  const resolvedSiteUrl = shopInfo?.siteUrl?.trim() || "";

  const isCodOrder = !order.paymentMethod || order.paymentMethod === "COD";
  const isPrepaidOrder =
    order.paymentMethod === "CASH" || order.paymentMethod === "BANK_TRANSFER";

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        toast.success(successMessage);
      } catch {
        toast.error("Không thể copy vào bộ nhớ tạm");
      }
    }
  };

  const startEditCost = (item: OrderDetailItem) => {
    setEditingCostItemId(item.id);
    setEditingCostValue(
      item.costPrice !== null && item.costPrice !== undefined
        ? String(item.costPrice)
        : ""
    );
  };

  const cancelEditCost = () => {
    setEditingCostItemId(null);
    setEditingCostValue("");
  };

  const handleSaveCost = async (itemId: string) => {
    const trimmed = editingCostValue.trim();
    let parsedCost: number | null = null;
    if (trimmed !== "") {
      const num = Number(trimmed);
      if (Number.isNaN(num) || num < 0) {
        toast.error("Giá vốn phải là số không âm");
        return;
      }
      parsedCost = num;
    }

    setIsSavingCost(true);
    try {
      const res = await updateOrderItemCostAction({
        orderItemId: itemId,
        costPrice: parsedCost,
      });

      if (res.success) {
        toast.success(res.message || "Đã cập nhật giá vốn");
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, costPrice: parsedCost } : it
          )
        );
        setEditingCostItemId(null);
        setEditingCostValue("");
        startTransition(() => {
          router.refresh();
        });
      } else {
        toast.error(res.error || "Không thể cập nhật giá vốn");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi cập nhật giá vốn");
    } finally {
      setIsSavingCost(false);
    }
  };

  const itemsSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = order.discount ?? 0;
  const shippingFeeAmount = order.shippingFee ?? 0;

  const handleCopyOrderSummary = () => {
    const lines: string[] = [
      `Đơn hàng #${order.orderNumber}`,
      `Khách: ${order.customerName}`,
    ];
    if (order.customerPhone?.trim()) {
      lines.push(`SĐT: ${order.customerPhone.trim()}`);
    }
    if (order.customerAddress?.trim()) {
      lines.push(`Địa chỉ: ${order.customerAddress.trim()}`);
    }
    lines.push("Sản phẩm:");
    for (const item of items) {
      lines.push(
        `- ${item.productName} x${item.quantity} (${formatVND(item.price * item.quantity)})`
      );
    }
    if (discountAmount > 0) {
      lines.push(`Giảm giá: -${formatVND(discountAmount)}`);
    }
    if (shippingFeeAmount > 0) {
      lines.push(`Phí ship: ${formatVND(shippingFeeAmount)}`);
    }
    lines.push(
      `Tổng cộng: ${formatVND(order.totalAmount)} (${getPaymentMethodLabel(order.paymentMethod)})`
    );
    if (isCodOrder) {
      lines.push(`Thu hộ (COD): ${formatVND(order.totalAmount)}`);
    } else if (isPrepaidOrder) {
      lines.push("Thanh toán: ĐÃ THANH TOÁN (0₫ thu hộ)");
    }
    if (order.customerNotes?.trim()) {
      lines.push(`Ghi chú: ${order.customerNotes.trim()}`);
    }
    copyToClipboard(lines.join("\n"), "Đã copy tóm tắt đơn hàng");
  };

  // Admin-only COGS & Gross Profit
  const totalCogs = isAdmin
    ? items.reduce((s, i) => s + (i.costPrice ?? 0) * i.quantity, 0)
    : 0;
  const missingCostCount = isAdmin
    ? items.filter((i) => i.costPrice === null || i.costPrice === undefined).length
    : 0;
  const grossProfit = isAdmin ? order.totalAmount - totalCogs : 0;
  const grossMarginPct =
    isAdmin && order.totalAmount > 0
      ? Math.round((grossProfit / order.totalAmount) * 1000) / 10
      : 0;

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
        if (Array.isArray(parsed) && parsed.length > 0) return normalizeImageUrl(parsed[0]);
      } catch {
        if (item.product.images.startsWith("http") || item.product.images.startsWith("/")) {
          return normalizeImageUrl(item.product.images);
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

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111]">
                Đơn hàng #{order.orderNumber}
              </h1>
              <OrderStatusBadge status={currentStatus} />
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getChannelBadgeStyle(
                  order.channel
                )}`}
              >
                {getChannelLabel(order.channel)}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#74746E] border border-[#E7E7E3]">
                {getPaymentMethodLabel(order.paymentMethod)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#74746E]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Tạo đơn lúc {formatDate(order.createdAt)}</span>
              </span>
              {order.soldAt && (
                <span className="inline-flex items-center gap-1.5 text-[#21A366] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ghi nhận bán lúc {formatDate(order.soldAt)}</span>
                </span>
              )}
            </div>
          </div>

          {/* 1-Click Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {hasPhone && (
              <>
                <a
                  href={`tel:${order.customerPhone}`}
                  title={`Gọi ngay cho ${order.customerName}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[10px] bg-zinc-100 hover:bg-zinc-200 text-[#111] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#111]" />
                  <span>Gọi điện</span>
                </a>

                <a
                  href={`https://zalo.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trò chuyện Zalo với số điện thoại này"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[10px] bg-[#0068FF] hover:bg-blue-600 text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>Mở chat Zalo</span>
                </a>
              </>
            )}

            <button
              type="button"
              onClick={handleCopyOrderSummary}
              title="Copy tóm tắt đơn hàng để gửi Zalo / GHTK / GHN"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[10px] border border-[#E7E7E3] bg-white hover:bg-[#F3F3F1] text-[#111] transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-[#111]" />
              <span>Copy tóm tắt đơn</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="In phiếu giao hàng"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[10px] border border-[#E7E7E3] bg-white hover:bg-[#F3F3F1] text-[#111] transition-colors cursor-pointer"
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
            <div className="bg-white border border-[#E7E7E3] rounded-[10px] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E7E3] flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#111] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#111]" />
                  Danh sách linh kiện ({items.length} mặt hàng)
                </h2>
                <span className="text-xs text-[#74746E]">
                  Tổng SL: {items.reduce((s, i) => s + i.quantity, 0)} món
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F7F5] border-b border-[#E7E7E3] text-[#74746E] uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-5">Sản phẩm</th>
                      <th className="py-3 px-4 text-right">Đơn giá</th>
                      {isAdmin && (
                        <th className="py-3 px-4 text-right">Giá vốn</th>
                      )}
                      <th className="py-3 px-4 text-center">SL</th>
                      <th className="py-3 px-5 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E3]">
                    {items.map((item) => {
                      const img = getProductImage(item);
                      const isEditingThisCost = editingCostItemId === item.id;
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
                                    referrerPolicy="no-referrer"
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
                                {item.productId ? (
                                  <div className="text-[11px] text-[#74746E] mt-0.5 font-mono">
                                    ID: {item.productId}
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-[#74746E] border border-[#E7E7E3]">
                                      Món ngoài kho
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap font-medium text-[#111] tabular-nums">
                            {formatVND(item.price)}
                          </td>

                          {isAdmin && (
                            <td className="py-3.5 px-4 text-right whitespace-nowrap tabular-nums">
                              {isEditingThisCost ? (
                                <div className="inline-flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    value={editingCostValue}
                                    onChange={(e) =>
                                      setEditingCostValue(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSaveCost(item.id);
                                      } else if (e.key === "Escape") {
                                        cancelEditCost();
                                      }
                                    }}
                                    placeholder="Giá vốn..."
                                    autoFocus
                                    className="w-24 px-2 py-1 text-right text-xs rounded-md border border-[#111] bg-white text-[#111] tabular-nums focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveCost(item.id)}
                                    disabled={isSavingCost}
                                    title="Lưu giá vốn"
                                    className="p-1 rounded-md bg-[#111] text-white hover:bg-black disabled:opacity-50 cursor-pointer"
                                  >
                                    {isSavingCost ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditCost}
                                    disabled={isSavingCost}
                                    title="Hủy"
                                    className="p-1 rounded-md border border-[#E7E7E3] bg-white text-[#74746E] hover:text-[#111] cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-end gap-1.5 group">
                                  {item.costPrice !== null &&
                                  item.costPrice !== undefined ? (
                                    <span className="font-medium text-[#74746E] tabular-nums">
                                      {formatVND(item.costPrice)}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      Chưa nhập
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => startEditCost(item)}
                                    title="Chỉnh sửa giá vốn"
                                    className="p-1 rounded text-[#74746E] hover:text-[#111] hover:bg-zinc-100 transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}

                          <td className="py-3.5 px-4 text-center whitespace-nowrap font-semibold text-[#111] tabular-nums">
                            x{item.quantity}
                          </td>

                          <td className="py-3.5 px-5 text-right whitespace-nowrap font-bold text-[#111] tabular-nums">
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
                  <span className="font-medium text-[#111] tabular-nums">
                    {formatVND(itemsSubtotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-[#74746E]">
                    <span>Giảm giá:</span>
                    <span className="font-medium text-[#D94A4A] tabular-nums">
                      -{formatVND(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#74746E]">
                  <span>Phí vận chuyển:</span>
                  {shippingFeeAmount > 0 ? (
                    <span className="font-medium text-[#111] tabular-nums">
                      {formatVND(shippingFeeAmount)}
                    </span>
                  ) : order.paymentMethod === "COD" || !order.paymentMethod ? (
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Khách chịu (thanh toán khi nhận)
                    </span>
                  ) : (
                    <span className="font-medium text-[#74746E] tabular-nums">
                      0đ (Tại shop / Miễn phí)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E7E7E3]">
                  <div>
                    <span className="font-bold text-sm text-[#111]">
                      Tổng thanh toán ({getPaymentMethodLabel(order.paymentMethod)}):
                    </span>
                    <p className="text-[11px] text-[#74746E]">
                      Kênh bán: {getChannelLabel(order.channel)}
                    </p>
                  </div>
                  <span className="font-bold text-lg text-[#111] tabular-nums">
                    {formatVND(order.totalAmount)}
                  </span>
                </div>

                {/* Admin-only COGS & Gross Profit Summary */}
                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-dashed border-[#D5D5D0] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74746E] flex items-center gap-1.5 font-medium">
                        <TrendingUp className="w-3.5 h-3.5 text-[#111]" />
                        <span>Tổng giá vốn (COGS):</span>
                      </span>
                      <span className="font-semibold text-[#111] tabular-nums">
                        {formatVND(totalCogs)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#74746E] font-medium">
                        Lãi gộp ước tính:
                      </span>
                      <span
                        className={`font-bold text-sm tabular-nums ${
                          grossProfit >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
                        }`}
                      >
                        {formatVND(grossProfit)}
                        {order.totalAmount > 0 && (
                          <span className="text-[11px] font-medium ml-1.5 opacity-80">
                            ({grossMarginPct}%)
                          </span>
                        )}
                      </span>
                    </div>
                    {missingCostCount > 0 && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1">
                        Lưu ý: Có {missingCostCount} mặt hàng chưa có giá vốn. Bấm biểu tượng bút ở cột Giá vốn để cập nhật cho báo cáo lợi nhuận chính xác.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Thông tin khách hàng & Giao hàng */}
            <div className="bg-white border border-[#E7E7E3] rounded-[10px] p-5 space-y-4">
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
                  {order.customerPhone?.trim() ? (
                    <div className="flex items-center gap-2 font-mono tabular-nums font-bold text-sm text-[#111]">
                      <span>{order.customerPhone}</span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            order.customerPhone.trim(),
                            "Đã copy số điện thoại"
                          )
                        }
                        title="Copy số điện thoại"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[#E7E7E3] bg-[#F7F7F5] hover:bg-[#E7E7E3] text-[11px] font-sans font-medium text-[#555550] hover:text-[#111] transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-[#A3A39D]">—</div>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[#74746E] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Địa chỉ giao hàng chi tiết:</span>
                    </div>
                    {order.customerAddress?.trim() && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            order.customerAddress.trim(),
                            "Đã copy địa chỉ giao hàng"
                          )
                        }
                        title="Copy địa chỉ"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[#E7E7E3] bg-[#F7F7F5] hover:bg-[#E7E7E3] text-[11px] font-medium text-[#555550] hover:text-[#111] transition-colors cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy địa chỉ</span>
                      </button>
                    )}
                  </div>
                  <div className="font-medium text-[#111] leading-relaxed bg-[#F7F7F5] p-3 rounded-[10px] border border-[#E7E7E3]">
                    {order.customerAddress || "—"}
                  </div>
                </div>

                {order.customerNotes && (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="text-amber-800 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Ghi chú của khách hàng khi đặt đơn:</span>
                    </div>
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-[10px] leading-relaxed">
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
            <div className="bg-white border border-[#E7E7E3] rounded-[10px] p-5 space-y-4">
              <h2 className="font-bold text-sm text-[#111] flex items-center justify-between">
                <span>Trạng thái đơn hàng</span>
                {isUpdatingStatus && (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                )}
              </h2>

              <div className="p-3.5 rounded-[10px] bg-[#F7F7F5] border border-[#E7E7E3] space-y-2">
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
                  className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-[#E7E7E3] bg-white text-[#111] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all cursor-pointer"
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
            <div className="bg-white border border-[#E7E7E3] rounded-[10px] p-5 space-y-3">
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
            {resolvedShopName}
          </div>
          {(resolvedHotline || resolvedSiteUrl) && (
            <div className="text-xs font-semibold">
              {[
                resolvedHotline ? `Hotline: ${resolvedHotline}` : null,
                resolvedSiteUrl ? `Website: ${resolvedSiteUrl}` : null,
              ]
                .filter(Boolean)
                .join(" • ")}
            </div>
          )}
          <div className="text-sm font-black uppercase mt-2">
            {isCodOrder
              ? "PHIẾU GIAO HÀNG & THU HỘ TIỀN (COD)"
              : "PHIẾU GIAO HÀNG"}
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
            <div className="font-semibold">{resolvedShopName}</div>
            {resolvedHotline && <div>Hotline: {resolvedHotline}</div>}
            {resolvedAddress && <div>Địa chỉ: {resolvedAddress}</div>}
          </div>

          {/* Receiver */}
          <div className="space-y-1 pl-2">
            <div className="font-bold uppercase text-[11px] underline">
              NGƯỜI NHẬN (KHÁCH HÀNG):
            </div>
            <div className="font-bold text-sm">{order.customerName}</div>
            {order.customerPhone?.trim() && (
              <div className="font-bold font-mono tabular-nums text-sm">
                {order.customerPhone}
              </div>
            )}
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
                  <td className="py-1.5 pr-2 align-top tabular-nums">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-medium align-top">
                    {item.productName}
                  </td>
                  <td className="py-1.5 px-2 text-right whitespace-nowrap align-top tabular-nums">
                    {formatVND(item.price)}
                  </td>
                  <td className="py-1.5 px-2 text-center font-bold align-top tabular-nums">
                    {item.quantity}
                  </td>
                  <td className="py-1.5 pl-2 text-right font-semibold whitespace-nowrap align-top tabular-nums">
                    {formatVND(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(discountAmount > 0 || shippingFeeAmount > 0) && (
            <div className="mt-3 pt-2 border-t border-gray-400 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span>Tạm tính:</span>
                <span className="font-semibold tabular-nums">
                  {formatVND(itemsSubtotal)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Giảm giá:</span>
                  <span className="font-semibold tabular-nums">
                    -{formatVND(discountAmount)}
                  </span>
                </div>
              )}
              {shippingFeeAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold tabular-nums">
                    {formatVND(shippingFeeAmount)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total / COD Amount */}
        <div className="py-3 border-b-2 border-black flex items-center justify-between gap-4">
          {isCodOrder ? (
            <>
              <div className="font-bold uppercase text-xs">
                THU HỘ TIỀN (COD):
                {shippingFeeAmount === 0 && (
                  <span className="block text-[10px] font-normal normal-case text-gray-600">
                    * Phí ship khách thanh toán cho shipper khi nhận
                  </span>
                )}
              </div>
              <div className="font-mono tabular-nums font-black text-lg">
                {formatVND(order.totalAmount)}
              </div>
            </>
          ) : isPrepaidOrder ? (
            <>
              <div className="font-bold uppercase text-xs">
                ĐÃ THANH TOÁN (0₫ thu hộ)
                <span className="block text-[10px] font-normal normal-case text-gray-600">
                  Tổng giá trị đơn: {formatVND(order.totalAmount)} ({getPaymentMethodLabel(order.paymentMethod)})
                </span>
              </div>
              <div className="font-mono tabular-nums font-black text-lg">
                0₫
              </div>
            </>
          ) : (
            <>
              <div className="font-bold uppercase text-xs">
                TỔNG THANH TOÁN ({getPaymentMethodLabel(order.paymentMethod)}):
              </div>
              <div className="font-mono tabular-nums font-black text-lg">
                {formatVND(order.totalAmount)}
              </div>
            </>
          )}
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
          Khách hàng vui lòng kiểm tra kỹ linh kiện và phụ kiện trước khi thanh toán. Cảm ơn bạn đã lựa chọn {resolvedShopName}!
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
