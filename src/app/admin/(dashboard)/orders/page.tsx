import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderTable } from "@/components/admin/order-table";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

const VALID_STATUSES = [
  "PENDING",
  "CONTACTED",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  // Đảm bảo chỉ ADMIN hoặc STAFF mới truy cập được
  await requireRole(["ADMIN", "STAFF"]);

  const params = await searchParams;
  const statusParam = params.status?.trim().toUpperCase();
  const rawQ = params.q?.trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const pageSize = 10;

  // Xây dựng điều kiện lọc Prisma
  const where: any = {};

  if (statusParam && VALID_STATUSES.includes(statusParam)) {
    where.status = statusParam;
  }

  if (rawQ) {
    where.OR = [
      { orderNumber: { contains: rawQ } },
      { customerPhone: { contains: rawQ } },
      { customerName: { contains: rawQ } },
    ];
  }

  // Chạy các truy vấn CSDL đồng thời
  const [orders, totalOrders, statusGroups, totalAllOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            price: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.order.count(),
  ]);

  // Chuẩn hóa bộ đếm trạng thái cho tabs
  const statusCounts = {
    ALL: totalAllOrders,
    PENDING: 0,
    CONTACTED: 0,
    SHIPPING: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  };

  statusGroups.forEach((g) => {
    if (g.status in statusCounts) {
      statusCounts[g.status as keyof typeof statusCounts] = g._count;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#111]" />
            Quản lý Đơn hàng
          </h1>
          <p className="text-xs text-[#74746E] mt-1">
            Theo dõi, liên hệ khách hàng qua Zalo/Hotline và cập nhật trạng thái
            xử lý giao hàng.
          </p>
        </div>
      </div>

      {/* Main Order Table with Tabs, Search, and Pagination */}
      <OrderTable
        orders={orders}
        totalOrders={totalOrders}
        currentPage={page}
        statusCounts={statusCounts}
        currentStatus={statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : "ALL"}
        searchQuery={rawQ || ""}
      />
    </div>
  );
}
