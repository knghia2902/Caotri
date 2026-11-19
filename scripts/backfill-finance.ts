/**
 * Script backfill idempotent cho dữ liệu Tài chính & Dòng tiền.
 * Chạy bằng lệnh: npx tsx scripts/backfill-finance.ts
 *
 * Thực hiện:
 * 1. Cập nhật soldAt = updatedAt cho các đơn COMPLETED chưa có soldAt.
 * 2. Snapshot OrderItem.costPrice từ Product.costPrice cho các dòng chưa có costPrice.
 * 3. Tạo CashflowEntry (IN) cho các đơn COMPLETED chưa có phiếu thu gắn với orderId.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

function getVnDateKey(date: Date): string {
  const vn = new Date(date.getTime() + VN_OFFSET_MS);
  const y = vn.getUTCFullYear();
  const m = String(vn.getUTCMonth() + 1).padStart(2, "0");
  const d = String(vn.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function main() {
  console.log("[backfill-finance] Bắt đầu backfill dữ liệu tài chính...");

  // 1. Backfill soldAt cho các đơn COMPLETED chưa có soldAt
  const completedWithoutSoldAt = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      soldAt: null,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  let updatedSoldAtCount = 0;
  for (const order of completedWithoutSoldAt) {
    await prisma.order.update({
      where: { id: order.id },
      data: { soldAt: order.updatedAt },
    });
    updatedSoldAtCount++;
  }
  console.log(
    `[backfill-finance] Đã cập nhật soldAt cho ${updatedSoldAtCount} đơn COMPLETED.`
  );

  // 2. Backfill OrderItem.costPrice từ Product.costPrice khi costPrice đang null
  const itemsWithoutCost = await prisma.orderItem.findMany({
    where: {
      costPrice: null,
      productId: { not: null },
    },
    include: {
      product: {
        select: { costPrice: true },
      },
    },
  });

  let updatedCostCount = 0;
  for (const item of itemsWithoutCost) {
    if (item.product?.costPrice !== null && item.product?.costPrice !== undefined) {
      await prisma.orderItem.update({
        where: { id: item.id },
        data: { costPrice: item.product.costPrice },
      });
      updatedCostCount++;
    }
  }
  console.log(
    `[backfill-finance] Đã snapshot costPrice cho ${updatedCostCount}/${itemsWithoutCost.length} dòng sản phẩm.`
  );

  // 3. Tạo CashflowEntry (IN) cho các đơn COMPLETED chưa có phiếu thu
  const completedOrders = await prisma.order.findMany({
    where: { status: "COMPLETED" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      channel: true,
      paymentMethod: true,
      totalAmount: true,
      soldAt: true,
      updatedAt: true,
      createdById: true,
      cashflowEntries: {
        where: { type: "IN" },
        select: { id: true },
      },
    },
  });

  let createdCashflowCount = 0;
  for (const order of completedOrders) {
    if (order.cashflowEntries.length > 0) continue;

    const occurredAt = order.soldAt ?? order.updatedAt;
    await prisma.cashflowEntry.create({
      data: {
        type: "IN",
        category: order.channel === "WEB" ? "ORDER_SALE" : "OFFLINE_SALE",
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod || "COD",
        occurredAt,
        dateKey: getVnDateKey(occurredAt),
        note: `Thu đơn ${order.orderNumber} - ${order.customerName} (backfill)`,
        orderId: order.id,
        createdById: order.createdById ?? null,
      },
    });
    createdCashflowCount++;
  }
  console.log(
    `[backfill-finance] Đã tạo mới ${createdCashflowCount} phiếu thu (CashflowEntry IN) cho đơn COMPLETED.`
  );

  console.log("[backfill-finance] Hoàn tất!");
}

main()
  .catch((err) => {
    console.error("[backfill-finance] Lỗi:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
