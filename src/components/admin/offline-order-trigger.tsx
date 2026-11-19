"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  OfflineOrderModal,
  type OfflineProductOption,
} from "@/components/admin/offline-order-modal";
import { cn } from "@/lib/utils";

interface OfflineOrderTriggerProps {
  products: OfflineProductOption[];
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}

export function OfflineOrderTrigger({
  products,
  variant = "primary",
  label = "Tạo đơn bán ngoài",
  className,
}: OfflineOrderTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
          variant === "primary"
            ? "bg-[#111] hover:bg-black text-white shadow-sm"
            : "border border-[#E7E7E3] hover:border-[#111] bg-white hover:bg-[#F7F7F5] text-[#111]",
          className
        )}
      >
        <Plus className="w-4 h-4" />
        <span>{label}</span>
      </button>

      <OfflineOrderModal
        open={open}
        onClose={() => setOpen(false)}
        products={products}
        onSuccess={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
