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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, normalizeImageUrl } from "@/lib/utils";
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
  const [completeImmediately, setCompleteImmediately] = useState<boolean>(true);

  const [items, setItems] = useState<DraftOrderItem[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [discount, setDiscount] = useState<string>("0");
  const [shippingFee, setShippingFee] = useState<string>("0");

  const [customerName, setCustomerName] = useState("Khách lẻ tại shop");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (open) {
      setChannel("OFFLINE");
      setPaymentMethod("CASH");
      setSoldAt(getCurrentVnDateTimeLocal());
      setCompleteImmediately(true);
      setItems([]);
      setProductQuery("");
      setShowDropdown(false);
      setDiscount("0");
      setShippingFee("0");
      setCustomerName("Khách lẻ tại shop");
      setCustomerPhone("");
      setCustomerAddress("");
      setAdminNotes("");
    }
  }, [open]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 12);
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 15);
  }, [products, productQuery]);

  const { subtotal, totalAmount, totalCogs, missingCostCount, grossProfit } =
    useMemo(() => {
      const sub = items.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
        0
      );
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

      return {
        subtotal: sub,
        totalAmount: total,
        totalCogs: cogs,
        missingCostCount: missing,
        grossProfit: total - cogs,
      };
    }, [items, discount, shippingFee]);

  if (!open) return null;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === "COD") {
      setCompleteImmediately(false);
    } else if (method === "CASH" || method === "BANK_TRANSFER") {
      setCompleteImmediately(true);
    }
  };

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
          markOutOfStock: false,
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
        completeImmediately,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-[#111]">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E7E3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#111] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111]">
                Tạo đơn bán ngoài / Tại shop
              </h3>
              <p className="text-xs text-[#74746E]">
                Ghi nhận nhanh đơn bán trực tiếp, Zalo, Facebook và đồng bộ sổ quỹ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-[#74746E] hover:text-[#111] hover:bg-[#F3F3F1] transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="offline-order-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Block 1: Kênh bán & Thanh toán */}
          <div className="space-y-4 p-4 rounded-[10px] bg-[#F7F7F5] border border-[#E7E7E3]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2">
                  Kênh bán hàng
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OFFLINE_CHANNEL_OPTIONS.map((opt) => {
                    const active = channel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => setChannel(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#555550] border-[#D5D5D0] hover:border-[#111] hover:text-[#111]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-2">
                  Phương thức thanh toán
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_METHOD_OPTIONS.map((opt) => {
                    const active = paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isPending}
                        onClick={() => handlePaymentMethodChange(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          active
                            ? "bg-[#111] text-white border-[#111]"
                            : "bg-white text-[#555550] border-[#D5D5D0] hover:border-[#111] hover:text-[#111]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                  Thời gian bán (giờ VN)
                </label>
                <Input
                  type="datetime-local"
                  value={soldAt}
                  onChange={(e) => setSoldAt(e.target.value)}
                  disabled={isPending}
                  className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm text-[#111]"
                />
              </div>

              <label className="flex items-start gap-2.5 pt-4 sm:pt-5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={completeImmediately}
                  onChange={(e) => setCompleteImmediately(e.target.checked)}
                  disabled={isPending}
                  className="mt-0.5 w-4 h-4 rounded border-[#D5D5D0] accent-[#111]"
                />
                <span className="text-xs leading-snug text-[#111]">
                  <span className="font-semibold block">
                    Hoàn thành &amp; ghi nhận thu ngay
                  </span>
                  <span className="text-[#74746E]">
                    Tự động cộng tiền vào Sổ Quỹ và tính doanh thu ngay lập tức
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Block 2: Sản phẩm */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
                Sản phẩm trong đơn <span className="text-[#D94A4A]">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddAdHocItem}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#111] bg-white border border-[#D5D5D0] hover:border-[#111] hover:bg-[#F7F7F5] px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm món ngoài kho
              </button>
            </div>

            {/* Searchable catalog combobox */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#74746E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => {
                  // Delay nhỏ để click chọn item kịp chạy trước khi đóng
                  setTimeout(() => setShowDropdown(false), 180);
                }}
                placeholder="Tìm sản phẩm trong kho theo tên..."
                disabled={isPending}
                className="h-10 pl-9 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm text-[#111]"
              />

              {showDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-60 overflow-y-auto rounded-[10px] bg-white border border-[#E7E7E3] shadow-[0_8px_30px_rgba(0,0,0,0.08)] divide-y divide-[#F3F3F1]">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-[#74746E]">
                      Không tìm thấy sản phẩm phù hợp. Bạn có thể bấm{" "}
                      <span className="font-semibold text-[#111]">
                        + Thêm món ngoài kho
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
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-[#F7F7F5] transition-colors"
                      >
                        <div className="w-9 h-9 rounded-md bg-[#F3F3F1] border border-[#E7E7E3] overflow-hidden shrink-0 flex items-center justify-center">
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
                          <div className="text-sm font-medium text-[#111] truncate">
                            {product.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#74746E] mt-0.5">
                            <span className="font-semibold text-[#111]">
                              {formatPrice(product.price)}
                            </span>
                            {product.costPrice !== null && (
                              <span>· Vốn: {formatPrice(product.costPrice)}</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
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

            {/* Selected Items List */}
            {items.length === 0 ? (
              <div className="rounded-[10px] border border-dashed border-[#D5D5D0] py-6 px-4 text-center text-xs text-[#74746E]">
                Chưa có sản phẩm nào. Tìm từ kho ở ô trên hoặc bấm{" "}
                <strong className="text-[#111]">+ Thêm món ngoài kho</strong>.
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item) => {
                  const lineTotal = (Number(item.price) || 0) * item.quantity;
                  return (
                    <div
                      key={item.key}
                      className="rounded-[10px] border border-[#E7E7E3] bg-white p-3.5 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {item.productId ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#111] truncate">
                                {item.productName}
                              </span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F3F3F1] text-[#555550] shrink-0">
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
                                className="h-9 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                              />
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-[#D99A24] shrink-0">
                                Ngoài kho
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-[#74746E] hover:text-[#D94A4A] hover:bg-red-50 transition-colors"
                          aria-label="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-2.5 items-end">
                        {/* Quantity stepper */}
                        <div className="col-span-4 sm:col-span-3">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1">
                            Số lượng
                          </label>
                          <div className="flex items-center border border-[#D5D5D0] rounded-lg overflow-hidden h-9 bg-white">
                            <button
                              type="button"
                              disabled={isPending || item.quantity <= 1}
                              onClick={() =>
                                updateItem(item.key, {
                                  quantity: Math.max(1, item.quantity - 1),
                                })
                              }
                              className="w-8 h-full flex items-center justify-center text-[#555550] hover:bg-[#F3F3F1] disabled:opacity-40"
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
                              className="w-full text-center text-sm font-medium text-[#111] focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                updateItem(item.key, {
                                  quantity: item.quantity + 1,
                                })
                              }
                              className="w-8 h-full flex items-center justify-center text-[#555550] hover:bg-[#F3F3F1]"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-4 sm:col-span-3">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1">
                            Giá bán (₫)
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
                            className="h-9 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                          />
                        </div>

                        {/* Cost Price */}
                        <div className="col-span-4 sm:col-span-3">
                          <label className="block text-[11px] font-medium text-[#74746E] mb-1">
                            Giá vốn (₫)
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
                            className="h-9 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                          />
                        </div>

                        {/* Line subtotal */}
                        <div className="col-span-12 sm:col-span-3 text-right">
                          <span className="block text-[11px] text-[#74746E] mb-1">
                            Thành tiền
                          </span>
                          <span className="text-sm font-semibold text-[#111]">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      </div>

                      {item.productId && (
                        <label className="inline-flex items-center gap-2 text-xs text-[#555550] cursor-pointer select-none pt-1">
                          <input
                            type="checkbox"
                            checked={item.markOutOfStock}
                            onChange={(e) =>
                              updateItem(item.key, {
                                markOutOfStock: e.target.checked,
                              })
                            }
                            disabled={isPending}
                            className="w-3.5 h-3.5 rounded border-[#D5D5D0] accent-[#111]"
                          />
                          Đánh dấu sản phẩm này hết hàng sau khi bán
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Block 3: Giảm giá & Phí ship */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Giảm giá / Chiết khấu (₫)
              </label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                disabled={isPending}
                className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#74746E] mb-1.5">
                Phí giao hàng thu khách (₫)
              </label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                disabled={isPending}
                className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Block 4: Khách hàng & Ghi chú */}
          <div className="space-y-3 pt-2 border-t border-[#E7E7E3]">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#74746E]">
              Thông tin khách hàng &amp; Ghi chú
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#555550] mb-1">
                  Tên khách hàng
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Khách lẻ tại shop"
                  disabled={isPending}
                  className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555550] mb-1">
                  Số điện thoại (tùy chọn)
                </label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  disabled={isPending}
                  className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#555550] mb-1">
                  Địa chỉ (tùy chọn)
                </label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Mua trực tiếp tại cửa hàng"
                  disabled={isPending}
                  className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#555550] mb-1">
                  Ghi chú nội bộ (tùy chọn)
                </label>
                <Input
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="VD: Trade phím cũ, khách quen..."
                  disabled={isPending}
                  className="h-10 bg-white border-[#D5D5D0] focus:border-[#111] rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-[#E7E7E3] bg-[#F7F7F5] rounded-b-[10px] shrink-0 space-y-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#74746E]">
                Tổng thu
              </div>
              <div className="text-base font-bold text-[#111] mt-0.5">
                {formatPrice(totalAmount)}
              </div>
              {subtotal !== totalAmount && (
                <div className="text-[11px] text-[#74746E]">
                  Tạm tính: {formatPrice(subtotal)}
                </div>
              )}
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#74746E]">
                Giá vốn
              </div>
              <div className="text-base font-semibold text-[#555550] mt-0.5">
                {formatPrice(totalCogs)}
              </div>
              {missingCostCount > 0 && (
                <div className="inline-flex items-center gap-1 text-[11px] text-[#D99A24]">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {missingCostCount} món chưa có vốn
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-[#74746E]">
                Lãi gộp dự kiến
              </div>
              <div
                className={`text-base font-bold mt-0.5 ${
                  grossProfit >= 0 ? "text-[#21A366]" : "text-[#D94A4A]"
                }`}
              >
                {grossProfit >= 0 ? "+" : ""}
                {formatPrice(grossProfit)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E7E7E3]">
            <Button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-white text-[#111] border border-[#D5D5D0] hover:bg-[#FAFAFA] rounded-lg h-10 px-4 text-sm"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              form="offline-order-form"
              disabled={isPending || items.length === 0}
              className="min-w-[160px] bg-[#111] hover:bg-black text-white rounded-lg h-10 px-5 text-sm font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo đơn...
                </>
              ) : completeImmediately ? (
                "Tạo đơn & Ghi thu"
              ) : (
                "Tạo đơn hàng"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
