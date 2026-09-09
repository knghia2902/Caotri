import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  let badgeStyle = "bg-zinc-100 text-zinc-600 border-zinc-200";
  let label = status;

  switch (status) {
    case "PENDING":
      badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      label = "Chờ xử lý";
      break;
    case "CONTACTED":
      badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
      label = "Đã liên hệ";
      break;
    case "SHIPPING":
      badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
      label = "Đang giao";
      break;
    case "COMPLETED":
      badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      label = "Hoàn thành";
      break;
    case "CANCELLED":
      badgeStyle = "bg-zinc-100 text-zinc-600 border-zinc-200";
      label = "Đã hủy";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        badgeStyle,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
}
