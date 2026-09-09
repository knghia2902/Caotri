"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatVND } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { updateOrderStatusAction } from "@/app/actions/order";
import { CancelOrderDialog } from "./cancel-order-dialog";

export interface OrderItemSummary {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface AdminOrderRecord {
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
  items: OrderItemSummary[];
}

interface OrderTableProps {
  orders: AdminOrderRecord[];
  totalOrders: number;
  currentPage: number;
  statusCounts: {
    ALL: number;
    PENDING: number;
    CONTACTED: number;
    SHIPPING: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  currentStatus: string;
  searchQuery: string;
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "CONTACTED", label: "Đã liên hệ" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "COMPLETED", label: "Hoàn thành" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export function OrderTable({
  orders: initialOrders,
  totalOrders,
  currentPage,
  statusCounts,
  currentStatus,
  searchQuery,
}: OrderTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<AdminOrderRecord[]>(initialOrders);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Dialog state for cancelling order
  const [cancelTarget, setCancelTarget] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Synchronize orders if prop changes
  if (initialOrders !== orders && initialOrders.length !== orders.length) {
    setOrders(initialOrders);
  }

  const navigateWithParams = (newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  };

  const handleTabClick = (tabKey: string) => {
    navigateWithParams({
      status: tabKey === "ALL" ? null : tabKey,
      page: 1,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateWithParams({
      q: searchInput.trim() || null,
      page: 1,
    });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    navigateWithParams({
      q: null,
      page: 1,
    });
  };

  const handleStatusChange = async (
    orderId: string,
    orderNumber: string,
    newStatus: OrderStatus
  ) => {
    if (newStatus === "CANCELLED") {
      setCancelTarget({ orderId, orderNumber });
      return;
    }

    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatusAction({
        orderId,
        status: newStatus,
      });

      if (res.success) {
        toast.success(res.message || "Cập nhật trạng thái thành công");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Không thể cập nhật trạng thái");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi cập nhật");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!cancelTarget) return;

    setIsCancelling(true);
    try {
      const res = await updateOrderStatusAction({
        orderId: cancelTarget.orderId,
        status: "CANCELLED",
        cancelReason: reason,
      });

      if (res.success) {
        toast.success(res.message || "Đã hủy đơn hàng");
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancelTarget.orderId ? { ...o, status: "CANCELLED" } : o
          )
        );
        setCancelTarget(null);
        router.refresh();
      } else {
        toast.error(res.error || "Không thể hủy đơn hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const totalPages = Math.ceil(totalOrders / 10) || 1;

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

  return (
    <div className="space-y-4">
      {/* Top Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E7E7E3] scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive =
            (tab.key === "ALL" && (!currentStatus || currentStatus === "ALL")) ||
            currentStatus === tab.key;
          const count =
            statusCounts[tab.key as keyof typeof statusCounts] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#111] text-white shadow-sm"
                  : "text-[#74746E] hover:text-[#111] hover:bg-zinc-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#74746E]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã đơn (#DH-...), số điện thoại, tên khách..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#E7E7E3] bg-white text-[#111] placeholder:text-[#74746E] focus:outline-none focus:border-[#111] focus:ring-1 focus:ring-[#111] transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74746E] hover:text-[#111] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="text-xs text-[#74746E] flex items-center justify-between sm:justify-end gap-2">
          {isPending && (
            <span className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải...
            </span>
          )}
          <span>
            Hiển thị <strong>{orders.length}</strong> /{" "}
            <strong>{totalOrders}</strong> đơn hàng
          </span>
        </div>
      </div>

      {/* Order Table Container */}
      <div className="bg-white border border-[#E7E7E3] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111]">
            <thead className="bg-[#F7F7F5] border-b border-[#E7E7E3] text-[#74746E] uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Số Điện Thoại</th>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7E3]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-[#74746E]">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-sm text-[#111]">
                        Không tìm thấy đơn hàng nào
                      </p>
                      <p className="text-xs text-[#74746E]">
                        Thử điều chỉnh lại bộ lọc trạng thái hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalItemsCount = order.items.reduce(
                    (s, i) => s + i.quantity,
                    0
                  );
                  const firstItemName = order.items[0]?.productName || "Sản phẩm";
                  const cleanPhone = order.customerPhone.replace(/\D/g, "");

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-zinc-50/80 transition-colors group"
                    >
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-[#111] hover:underline flex items-center gap-1"
                        >
                          #{order.orderNumber}
                        </Link>
                        <div className="text-[11px] text-[#74746E] mt-0.5">
                          {formatDate(order.createdAt)}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-medium text-[#111] truncate">
                          {order.customerName}
                        </div>
                        <div
                          className="text-[11px] text-[#74746E] truncate mt-0.5"
                          title={order.customerAddress}
                        >
                          {order.customerAddress}
                        </div>
                        {order.customerNotes && (
                          <div
                            className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 inline-block max-w-full truncate"
                            title={`Khách ghi chú: ${order.customerNotes}`}
                          >
                            Ghi chú: {order.customerNotes}
                          </div>
                        )}
                      </td>

                      {/* Phone & Quick Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-[#111]">
                          {order.customerPhone}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <a
                            href={`tel:${order.customerPhone}`}
                            title="Gọi điện trực tiếp"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-[#111]" />
                            <span>Gọi</span>
                          </a>
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Nhắn tin Zalo"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-blue-600" />
                            <span>Zalo</span>
                          </a>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-medium text-[#111] truncate" title={firstItemName}>
                          {firstItemName}
                        </div>
                        <div className="text-[11px] text-[#74746E] mt-0.5">
                          {order.items.length > 1 ? (
                            <span>
                              {totalItemsCount} sản phẩm ({order.items.length} loại)
                            </span>
                          ) : (
                            <span>Số lượng: {totalItemsCount}</span>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-[#111] text-sm">
                          {formatVND(order.totalAmount)}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                order.orderNumber,
                                e.target.value as OrderStatus
                              )
                            }
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
                              order.status === "PENDING"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : order.status === "CONTACTED"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : order.status === "SHIPPING"
                                ? "bg-indigo-50 text-indigo-800 border-indigo-300"
                                : order.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-zinc-100 text-zinc-700 border-zinc-300"
                            }`}
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CONTACTED">Đã liên hệ</option>
                            <option value="SHIPPING">Đang giao</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Hủy đơn hàng</option>
                          </select>
                          {updatingId === order.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                          )}
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-zinc-100 text-[#74746E] hover:text-[#111] transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalOrders > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#E7E7E3] bg-[#F7F7F5] gap-3">
            <div className="text-xs text-[#74746E]">
              Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>{" "}
              (Tổng cộng <strong>{totalOrders}</strong> đơn hàng)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWithParams({ page: currentPage - 1 })}
                disabled={currentPage <= 1 || isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E7E7E3] bg-white text-[#111] hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trang trước</span>
              </button>

              <button
                onClick={() => navigateWithParams({ page: currentPage + 1 })}
                disabled={currentPage >= totalPages || isPending}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E7E7E3] bg-white text-[#111] hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={!!cancelTarget}
        orderNumber={cancelTarget?.orderNumber || ""}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        isPending={isCancelling}
      />
    </div>
  );
}
