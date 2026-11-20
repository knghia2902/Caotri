import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderDetailView } from "@/components/admin/order-detail-view";

export const dynamic = "force-dynamic";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  // Chỉ ADMIN hoặc STAFF mới được xem chi tiết đơn hàng
  const session = await requireRole(["ADMIN", "STAFF"]);
  const isAdmin = session.role === "ADMIN";

  const { id } = await params;

  const [order, settingRows] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    }),
    prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "shop_name",
            "shopName",
            "hotline",
            "shop_address",
            "address",
            "site_url",
            "siteUrl",
          ],
        },
      },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const settingMap: Record<string, string> = {};
  for (const row of settingRows) {
    settingMap[row.key] = row.value;
  }

  const shopInfo = {
    shopName:
      settingMap.shop_name?.trim() ||
      settingMap.shopName?.trim() ||
      "TringuyenGear",
    hotline: settingMap.hotline?.trim() || "",
    address:
      settingMap.shop_address?.trim() || settingMap.address?.trim() || "",
    siteUrl:
      settingMap.site_url?.trim() || settingMap.siteUrl?.trim() || "",
  };

  // Bảo mật: Tuyệt đối không gửi costPrice xuống Client Component nếu không phải ADMIN
  const sanitizedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerNotes: order.customerNotes,
    adminNotes: order.adminNotes,
    totalAmount: order.totalAmount,
    status: order.status,
    channel: order.channel,
    paymentMethod: order.paymentMethod,
    discount: order.discount,
    shippingFee: order.shippingFee,
    soldAt: order.soldAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      product: item.product,
      ...(isAdmin ? { costPrice: item.costPrice } : {}),
    })),
  };

  return (
    <OrderDetailView
      order={sanitizedOrder}
      isAdmin={isAdmin}
      shopInfo={shopInfo}
    />
  );
}
