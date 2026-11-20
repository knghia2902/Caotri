"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Package,
  ShoppingBag,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatVND, normalizeImageUrl } from "@/lib/utils";
import { VN_OFFSET_MS } from "@/lib/date-vn";
import {
  PAYMENT_METHOD_LABELS,
  type OrderChannel,
  type PaymentMethod,
} from "@/lib/finance-schema";
import { createOfflineOrderAction } from "@/app/actions/order";

export interface OfflineProductOption {
  id: string;
  name: string;
  price: number;
  costPrice: number | null;
  inStock: boolean;
  thumbnail?: string | null;
}

export interface OfflineOrderModalProps {
  open: boolean;
  onClose: () => void;
  products: OfflineProductOption[];
  onSuccess?: (orderNumber: string) => void;
}

interface DraftOrderItem {
  key: string;
  productId: string | null;
  productName: string;
  price: number;
  costPrice: string; // giữ string để cho phép để trống (null)
  quantity: number;
  markOutOfStock: boolean;
  thumbnail?: string | null;
}

const OFFLINE_CHANNEL_OPTIONS: { value: OrderChannel; label: string }[] = [
  { value: "OFFLINE", label: "Tại shop" },
  { value: "ZALO", label: "Zalo" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "OTHER", label: "Khác" },
];

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: PAYMENT_METHOD_LABELS.CASH },
  { value: "BANK_TRANSFER", label: PAYMENT_METHOD_LABELS.BANK_TRANSFER },
  { value: "COD", label: PAYMENT_METHOD_LABELS.COD },
  { value: "OTHER", label: PAYMENT_METHOD_LABELS.OTHER },
];

function getCurrentVnDateTimeLocal(): string {
  const vn = new Date(Date.now() + VN_OFFSET_MS);
  const yyyy = vn.getUTCFullYear();
  const mm = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(vn.getUTCDate()).padStart(2, "0");
  const hh = String(vn.getUTCHours()).padStart(2, "0");
  const mi = String(vn.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function OfflineOrderModal({
  open,
  onClose,
  products,
  onSuccess,
}: OfflineOrderModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [channel, setChannel] = useState<OrderChannel>("OFFLINE");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [soldAt, setSoldAt] = useState<string>("");

  const [items, setItems] = useState<DraftOrderItem[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [discount, setDiscount] = useState<string>("0");
  const [shippingFee, setShippingFee] = useState<string>("0");

  const [customerName, setCustomerName] = useState("Khách lẻ tại shop");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showExtraCustomer, setShowExtraCustomer] = useState(false);

  useEffect(() => {
    if (open) {
      setChannel("OFFLINE");
      setPaymentMethod("CASH");
      setSoldAt(getCurrentVnDateTimeLocal());
      setItems([]);
      setProductQuery("");
      setShowDropdown(false);
      setDiscount("0");
      setShippingFee("0");
      setCustomerName("Khách lẻ tại shop");
      setCustomerPhone("");
      setCustomerAddress("");
      setAdminNotes("");
      setShowExtraCustomer(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isPending, onClose]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 15);
  }, [products, productQuery]);

  const {
    subtotal,
    discountAmount,
    shippingFeeAmount,
    totalAmount,
    totalCogs,
    missingCostCount,
    grossProfit,
    profitMargin,
    totalQuantity,
  } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
      0
    );
    const qty = items.reduce((sum, item) => sum + item.quantity, 0);
    const disc = Math.max(0, Number(discount) || 0);
    const ship = Math.max(0, Number(shippingFee) || 0);
    const total = Math.max(0, sub - disc + ship);

    let cogs = 0;
    let missing = 0;
    for (const item of items) {
      const parsedCost =
        item.costPrice.trim() === "" ? null : Number(item.costPrice);
      if (parsedCost === null || Number.isNaN(parsedCost)) {
        missing += 1;
      } else {
        cogs += parsedCost * item.quantity;
      }
    }

    const profit = total - cogs;
    const margin = total > 0 ? (profit / total) * 100 : 0;

    return {
      subtotal: sub,
      discountAmount: disc,
      shippingFeeAmount: ship,
      totalAmount: total,
      totalCogs: cogs,
      missingCostCount: missing,
      grossProfit: profit,
      profitMargin: margin,
      totalQuantity: qty,
    };
  }, [items, discount, shippingFee]);

  if (!open) return null;

  const isExtraCustomerExpanded =
    showExtraCustomer ||
    customerAddress.trim().length > 0 ||
    adminNotes.trim().length > 0;

  const handleAddCatalogProduct = (product: OfflineProductOption) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((it) => it.productId === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key: `cat-${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          price: product.price,
          costPrice:
            product.costPrice !== null && product.costPrice !== undefined
              ? String(product.costPrice)
              : "",
          quantity: 1,
          markOutOfStock: true,
          thumbnail: product.thumbnail ?? null,
        },
      ];
    });
    setProductQuery("");
    setShowDropdown(false);
  };

  const handleAddAdHocItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: `adhoc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: null,
        productName: "",
        price: 0,
        costPrice: "",
        quantity: 1,
        markOutOfStock: false,
      },
    ]);
  };

  const updateItem = (key: string, patch: Partial<DraftOrderItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 sản phẩm hoặc thêm món ngoài kho");
      return;
    }

    for (const item of items) {
      if (!item.productName.trim()) {
        toast.error("Vui lòng nhập tên cho tất cả sản phẩm");
        return;
      }
      if (item.price < 0 || Number.isNaN(item.price)) {
        toast.error(`Giá bán của "${item.productName}" không hợp lệ`);
        return;
      }
      if (item.costPrice.trim() !== "") {
        const parsedCost = Number(item.costPrice);
        if (Number.isNaN(parsedCost) || parsedCost < 0) {
          toast.error(`Giá vốn của "${item.productName}" không hợp lệ`);
          return;
        }
      }
    }

    if (totalAmount <= 0) {
      toast.error("Tổng giá trị đơn hàng phải lớn hơn 0");
      return;
    }

    startTransition(async () => {
      const res = await createOfflineOrderAction({
        channel,
        paymentMethod,
        soldAt: soldAt || undefined,
        completeImmediately: paymentMethod !== "COD",
        discount: Math.max(0, Number(discount) || 0),
        shippingFee: Math.max(0, Number(shippingFee) || 0),
        customerName: customerName.trim() || "Khách lẻ tại shop",
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim() || "Mua trực tiếp tại cửa hàng",
        adminNotes: adminNotes.trim() || null,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName.trim(),
          price: Number(item.price) || 0,
          costPrice:
            item.costPrice.trim() === "" ? null : Number(item.costPrice),
          quantity: item.quantity,
          markOutOfStock: item.productId ? item.markOutOfStock : false,
        })),
      });

      if (res.success && res.orderNumber) {
        toast.success(
          res.message || `Đã tạo đơn ${res.orderNumber} thành công`
        );
        onSuccess?.(res.orderNumber);
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Không thể tạo đơn bán ngoài");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40"
      onClick={() => {
        if (!isPending) onClose();
      }}
    >
      <div
        className="relative w-[95vw] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-[#111111]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E3] bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-[8px] bg-[#111111] text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-[#111111] truncate">
                Tạo đơn bán ngoài / Tại shop
              </h3>
              <p className="text-xs text-[#74746E] truncate">
                Ghi nhận nhanh đơn bán trực tiếp, Zalo, Facebook và đồng bộ sổ quỹ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-[8px] p-2 text-[#74746E] hover:text-[#111111] hover:bg-[#F3F3F1] transition-colors shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column POS Body */}
        <form
          id="offline-order-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12"
        >
          {/* Left Column: Chọn sản phẩm */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 space-y-5 lg:overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#74746E] whitespace-nowrap">
                  Chọn sản phẩm <span className="text-[#D94A4A]">*</span>
                </h4>
                {items.length > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#F3F3F1] text-[#555550] tabular-nums whitespace-nowrap shrink-0">
                    {items.length} món · {totalQuantity} SP
                  </span>
                )}
              </div>
            </div>

            {/* Searchable product picker bar + Add ad-hoc button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-[#74746E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => {
                    setTimeout(() => setShowDropdown(false), 180);
                  }}
                  placeholder="Tìm sản phẩm trong kho theo tên..."
                  disabled={isPending}
                  className="h-11 pl-10 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm text-[#111111]"
                />

                {showDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-72 overflow-y-auto rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.08)] divide-y divide-[#F3F3F1]">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-[#74746E]">
                        Không tìm thấy sản phẩm phù hợp. Bạn có thể bấm{" "}
                        <span className="font-semibold text-[#111111] whitespace-nowrap">
                          + Thêm món ngoài
                        </span>
                        .
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddCatalogProduct(product);
                          }}
                          className="w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-[#F7F7F5] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-[6px] bg-[#F3F3F1] border border-[#E7E7E3] overflow-hidden shrink-0 flex items-center justify-center">
                            {product.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={normalizeImageUrl(product.thumbnail)}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-[#A3A39D]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#111111] truncate">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#74746E] mt-0.5 tabular-nums">
                              <span className="font-semibold text-[#111111] whitespace-nowrap">
                                {formatVND(product.price)}
                              </span>
                              {product.costPrice !== null && (
                                <span className="whitespace-nowrap">
                                  · Vốn: {formatVND(product.costPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-[6px] shrink-0 whitespace-nowrap ${
                              product.inStock
                                ? "bg-emerald-50 text-[#21A366]"
                                : "bg-[#F3F3F1] text-[#74746E]"
                            }`}
                          >
                            {product.inStock ? "Còn hàng" : "Hết hàng"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddAdHocItem}
                disabled={isPending}
                className="h-11 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#111111] bg-white border border-[#D5D5D0] hover:border-[#111111] hover:bg-[#F7F7F5] px-3.5 rounded-[8px] transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Thêm món ngoài
              </button>
            </div>

            {/* Selected Items List */}
            {items.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#D5D5D0] bg-[#FAFAFA] py-14 px-6 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-[8px] bg-[#F3F3F1] text-[#74746E] flex items-center justify-center mx-auto">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-[#111111]">
                  Chưa có sản phẩm nào trong đơn
                </div>
                <p className="text-xs text-[#74746E] max-w-sm mx-auto leading-relaxed">
                  Tìm sản phẩm có sẵn từ thanh tìm kiếm ở trên hoặc bấm{" "}
                  <strong className="font-semibold text-[#111111] whitespace-nowrap">
                    + Thêm món ngoài
                  </strong>{" "}
                  để nhập nhanh mặt hàng lẻ.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const lineTotal = (Number(item.price) || 0) * item.quantity;
                  return (
                    <div
                      key={item.key}
                      className="rounded-[10px] border border-[#E7E7E3] p-4 bg-white space-y-3.5"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          {item.productId ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-[#111111] leading-snug">
                                {item.productName}
                              </span>
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#F3F3F1] text-[#555550] shrink-0 whitespace-nowrap">
                                Trong kho
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.productName}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    productName: e.target.value,
                                  })
                                }
                                placeholder="Nhập tên món ngoài kho (VD: Pad cũ, vệ sinh phím...)"
                                disabled={isPending}
                                className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm min-w-0"
                              />
                              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-amber-50 text-[#D99A24] shrink-0 whitespace-nowrap">
                                Ngoài kho
                              </span>
                            </div>
                          )}

                          {item.productId && (
                            <label className="inline-flex items-center gap-2 text-xs text-[#555550] cursor-pointer select-none whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={item.markOutOfStock}
                                onChange={(e) =>
                                  updateItem(item.key, {
                                    markOutOfStock: e.target.checked,
                                  })
                                }
                                disabled={isPending}
                                className="w-3.5 h-3.5 rounded border-[#D5D5D0] accent-[#111111] shrink-0"
                              />
                              Đánh dấu hết hàng
                            </label>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          disabled={isPending}
                          className="p-1.5 rounded-[8px] text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50 transition-colors shrink-0"
                          aria-label="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom row: Số lượng, Đơn giá, Giá vốn, Thành tiền */}
                      <div className="grid grid-cols-2 sm:grid-cols-[104px_minmax(0,1fr)_minmax(0,1fr)_116px] gap-3 items-end pt-3 border-t border-[#F3F3F1]">
                        {/* Quantity stepper */}
                        <div className="min-w-0">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1.5 whitespace-nowrap">
                            Số lượng
                          </label>
                          <div className="flex items-center border border-[#D5D5D0] rounded-[8px] overflow-hidden h-9 bg-white">
                            <button
                              type="button"
                              disabled={isPending || item.quantity <= 1}
                              onClick={() =>
                                updateItem(item.key, {
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="w-8 h-full shrink-0 flex items-center justify-center text-[#555550] hover:bg-[#F3F3F1] disabled:opacity-40 transition-colors"
                              aria-label="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(item.key, {
                                  quantity: Math.max(
                                    1,
                                    parseInt(e.target.value, 10) || 1
                                  ),
                                })
                              }
                              disabled={isPending}
                              className="w-full min-w-0 text-center text-sm font-medium text-[#111111] tabular-nums focus:outline-none bg-transparent"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                updateItem(item.key, {
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="w-8 h-full shrink-0 flex items-center justify-center text-[#555550] hover:bg-[#F3F3F1] transition-colors"
                              aria-label="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="min-w-0">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1.5 whitespace-nowrap">
                            Đơn giá
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.key, {
                                price: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            disabled={isPending}
                            className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm tabular-nums"
                          />
                        </div>

                        {/* Cost Price */}
                        <div className="min-w-0">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1.5 whitespace-nowrap">
                            Giá vốn
                          </label>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={item.costPrice}
                            onChange={(e) =>
                              updateItem(item.key, {
                                costPrice: e.target.value,
                              })
                            }
                            placeholder="Chưa nhập"
                            disabled={isPending}
                            className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm tabular-nums"
                          />
                        </div>

                        {/* Line subtotal */}
                        <div className="text-right pb-1 min-w-0">
                          <span className="block text-[11px] font-medium text-[#74746E] mb-1 whitespace-nowrap">
                            Thành tiền
                          </span>
                          <span className="block text-sm font-semibold text-[#111111] tabular-nums whitespace-nowrap">
                            {formatVND(lineTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Thông tin & Thanh toán */}
          <div className="lg:col-span-5 bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-[#E7E7E3] flex flex-col justify-between min-h-0 lg:overflow-hidden">
            {/* Scrollable top section */}
            <div className="flex-1 lg:overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* Kênh bán */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2 whitespace-nowrap">
                  Kênh bán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {OFFLINE_CHANNEL_OPTIONS.map((opt) => {
                    const active = channel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => setChannel(opt.value)}
                        className={`px-3 py-2 rounded-[8px] text-xs font-medium border text-center whitespace-nowrap transition-colors ${
                          active
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-[#555550] border-[#D5D5D0] hover:border-[#111111] hover:text-[#111111]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thanh toán */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2 whitespace-nowrap">
                  Thanh toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHOD_OPTIONS.map((opt) => {
                    const active = paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => setPaymentMethod(opt.value)}
                        className={`px-3 py-2 rounded-[8px] text-xs font-medium border text-center whitespace-nowrap transition-colors ${
                          active
                            ? "bg-[#111111] text-white border-[#111111]"
                            : "bg-white text-[#555550] border-[#D5D5D0] hover:border-[#111111] hover:text-[#111111]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Khách hàng */}
              <div className="space-y-2.5 pt-2 border-t border-[#E7E7E3]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] whitespace-nowrap">
                  Khách hàng
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                      Tên khách
                    </label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Khách lẻ tại shop"
                      disabled={isPending}
                      className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                      SĐT
                    </label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09xx xxx xxx"
                      disabled={isPending}
                      className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExtraCustomer((prev) => !prev)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#555550] hover:text-[#111111] transition-colors pt-0.5 whitespace-nowrap"
                >
                  {isExtraCustomerExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                      Ẩn địa chỉ / ghi chú
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      + Thêm địa chỉ / ghi chú
                    </>
                  )}
                </button>

                {isExtraCustomerExpanded && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                        Địa chỉ
                      </label>
                      <Input
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Mua trực tiếp tại cửa hàng"
                        disabled={isPending}
                        className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                        Ghi chú nội bộ
                      </label>
                      <Input
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="VD: Trade phím cũ, khách quen..."
                        disabled={isPending}
                        className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ngày bán */}
              <div className="pt-2 border-t border-[#E7E7E3]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5 whitespace-nowrap">
                  Ngày bán (giờ VN)
                </label>
                <Input
                  type="datetime-local"
                  value={soldAt}
                  onChange={(e) => setSoldAt(e.target.value)}
                  disabled={isPending}
                  className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm text-[#111111]"
                />
              </div>

              {/* Giảm giá & Phí ship */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E7E7E3]">
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                    Giảm giá (₫)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    disabled={isPending}
                    className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm tabular-nums"
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-[11px] font-medium text-[#555550] mb-1 whitespace-nowrap">
                    Phí ship (₫)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    disabled={isPending}
                    className="h-9 bg-white border-[#D5D5D0] focus:border-[#111111] rounded-[8px] text-sm tabular-nums"
                  />
                </div>
              </div>
            </div>

            {/* Pinned Summary & CTA Footer */}
            <div className="shrink-0 p-5 border-t border-[#E7E7E3] bg-white space-y-3">
              {/* Compact breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-2 text-[#74746E]">
                  <span className="whitespace-nowrap">Tạm tính</span>
                  <span className="tabular-nums font-medium text-[#111111] whitespace-nowrap">
                    {formatVND(subtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between gap-2 text-[#74746E]">
                    <span className="whitespace-nowrap">Giảm giá</span>
                    <span className="tabular-nums font-medium text-[#D94A4A] whitespace-nowrap">
                      -{formatVND(discountAmount)}
                    </span>
                  </div>
                )}
                {shippingFeeAmount > 0 && (
                  <div className="flex items-center justify-between gap-2 text-[#74746E]">
                    <span className="whitespace-nowrap">Phí ship</span>
                    <span className="tabular-nums font-medium text-[#111111] whitespace-nowrap">
                      +{formatVND(shippingFeeAmount)}
                    </span>
                  </div>
                )}
              </div>

              {/* Tổng thanh toán */}
              <div className="flex items-baseline justify-between gap-2 pt-2 border-t border-[#F3F3F1]">
                <span className="text-sm font-semibold text-[#111111] whitespace-nowrap">
                  Tổng thanh toán
                </span>
                <span className="text-xl font-bold text-[#111111] tabular-nums whitespace-nowrap">
                  {formatVND(totalAmount)}
                </span>
              </div>

              {/* Subtle profit strip */}
              <div className="bg-[#F7F7F5] rounded-[8px] px-3 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-[#555550] whitespace-nowrap">
                  <span className="shrink-0">Giá vốn:</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {formatVND(totalCogs)}
                  </span>
                  {missingCostCount > 0 && (
                    <span
                      className="inline-flex items-center gap-0.5 text-[11px] text-[#D99A24] shrink-0"
                      title={`${missingCostCount} món chưa nhập giá vốn`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {missingCostCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 tabular-nums whitespace-nowrap">
                  <span className="text-[#74746E]">Lãi gộp:</span>
                  <span
                    className={`font-semibold ${
                      grossProfit >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
                    }`}
                  >
                    {grossProfit >= 0 ? "+" : ""}
                    {formatVND(grossProfit)}
                    {totalAmount > 0 && (
                      <span className="ml-1 text-[11px] font-medium">
                        ({profitMargin >= 0 ? "+" : ""}
                        {profitMargin.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-0.5">
                <Button
                  type="submit"
                  form="offline-order-form"
                  disabled={isPending || items.length === 0}
                  className="w-full bg-[#111111] hover:bg-black text-white rounded-[8px] h-11 text-sm font-medium whitespace-nowrap"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
                      Đang lưu đơn...
                    </>
                  ) : (
                    "Lưu đơn bán ngoài"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="w-full bg-white text-[#555550] hover:text-[#111111] border border-[#E7E7E3] hover:bg-[#FAFAFA] rounded-[8px] h-9 text-xs font-medium whitespace-nowrap"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
