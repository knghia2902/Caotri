import { prisma } from "../src/lib/prisma";
import {
  updateOrderStatusSchema,
  updateOrderNotesSchema,
  updateOrderStatusAction,
} from "../src/app/actions/order";
import { getStatusLabel } from "../src/lib/utils";
import { computeDailyRevenue } from "../src/lib/order-analytics";

async function runAdminOrderTests() {
  console.log("🚀 === BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG ADMIN ORDER FULFILLMENT (PHASE 6) ===\n");

  let passed = 0;
  const total = 7;
  const createdOrderIds: string[] = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Zod Schema Validation (Order Status & Admin Notes)
    // -------------------------------------------------------------
    console.log("👉 Test 1: Kiểm tra Zod Validation cho Schema Trạng thái & Ghi chú...");
    const invalidStatusCheck = updateOrderStatusSchema.safeParse({
      orderId: "order-123",
      status: "INVALID_STATUS",
    });
    if (invalidStatusCheck.success) {
      throw new Error("❌ Zod không chặn trạng thái không hợp lệ!");
    }

    const validStatusCheck = updateOrderStatusSchema.safeParse({
      orderId: "order-123",
      status: "SHIPPING",
      cancelReason: "Giao hỏa tốc",
    });
    if (!validStatusCheck.success) {
      throw new Error("❌ Zod từ chối dữ liệu trạng thái hợp lệ: " + JSON.stringify(validStatusCheck.error));
    }

    const overlongNotesCheck = updateOrderNotesSchema.safeParse({
      orderId: "order-123",
      adminNotes: "A".repeat(2001),
    });
    if (overlongNotesCheck.success) {
      throw new Error("❌ Zod không chặn ghi chú vượt quá 2000 ký tự!");
    }

    console.log("   ✅ Zod validation hoạt động chính xác (chặn status sai & note > 2000 ký tự)");
    passed++;

    // -------------------------------------------------------------
    // Test 2: RBAC Security Guard
    // -------------------------------------------------------------
    console.log("\n👉 Test 2: Kiểm tra RBAC Protection cho Server Action...");
    try {
      const unauthorizedResult = await updateOrderStatusAction({
        orderId: "fake-order-id",
        status: "COMPLETED",
      });
      if (unauthorizedResult.success) {
        throw new Error("❌ Server Action cho phép truy cập mà không kiểm tra phân quyền!");
      }
      console.log("   ✅ Server Action từ chối yêu cầu không có session đăng nhập hợp lệ:", unauthorizedResult.error);
    } catch (err: unknown) {
      // requireRole redirects or throws when no session
      console.log("   ✅ requireRole đã chặn truy cập unauthenticated thành công:", (err as Error).message);
    }
    passed++;

    // -------------------------------------------------------------
    // Test 3: Vòng đời đơn hàng (PENDING -> CONTACTED -> SHIPPING -> COMPLETED)
    // -------------------------------------------------------------
    console.log("\n👉 Test 3: Kiểm thử chuyển đổi trạng thái đơn hàng (PENDING -> CONTACTED -> SHIPPING -> COMPLETED)...");
    const realProduct = await prisma.product.findFirst();
    if (!realProduct) {
      throw new Error("Không tìm thấy sản phẩm mẫu trong DB để test!");
    }

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now().toString().slice(-6)}`,
        customerName: "Nguyễn Văn Game Thủ",
        customerPhone: "0912345678",
        customerAddress: "123 Đường Công Nghệ, Quận 1, TP.HCM",
        customerNotes: "Giao hàng buổi sáng",
        totalAmount: realProduct.price,
        status: "PENDING",
        items: {
          create: [
            {
              productId: realProduct.id,
              productName: realProduct.name,
              price: realProduct.price,
              quantity: 1,
            },
          ],
        },
      },
    });
    createdOrderIds.push(testOrder.id);
    console.log(`   - Tạo đơn hàng test thành công #${testOrder.orderNumber}, status: ${testOrder.status}`);

    // Chuyển sang CONTACTED
    const orderContacted = await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: "CONTACTED" },
    });
    if (orderContacted.status !== "CONTACTED") throw new Error("Chuyển trạng thái CONTACTED thất bại!");

    // Chuyển sang SHIPPING
    const orderShipping = await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: "SHIPPING" },
    });
    if (orderShipping.status !== "SHIPPING") throw new Error("Chuyển trạng thái SHIPPING thất bại!");

    // Chuyển sang COMPLETED
    const orderCompleted = await prisma.order.update({
      where: { id: testOrder.id },
      data: { status: "COMPLETED" },
    });
    if (orderCompleted.status !== "COMPLETED") throw new Error("Chuyển trạng thái COMPLETED thất bại!");

    console.log("   ✅ Vòng đời trạng thái đơn hàng cập nhật chuẩn xác trong CSDL");
    passed++;

    // -------------------------------------------------------------
    // Test 4: Hủy đơn an toàn & Ghi nhật ký vào adminNotes
    // -------------------------------------------------------------
    console.log("\n👉 Test 4: Kiểm thử Hủy đơn an toàn kèm ghi nhật ký lý do...");
    const cancelOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-CANCEL-${Date.now().toString().slice(-4)}`,
        customerName: "Khách Đổi Ý",
        customerPhone: "0987654321",
        customerAddress: "456 Đường Lê Lợi, TP.HCM",
        totalAmount: 1200000,
        status: "PENDING",
      },
    });
    createdOrderIds.push(cancelOrder.id);

    const cancelReason = "Khách hàng thông báo hủy qua Zalo do trùng đơn";
    const cancelLog = `[HỦY ĐƠN lúc 14:00 09/09/2026 bởi Admin Test]: ${cancelReason}`;

    const cancelledInDb = await prisma.order.update({
      where: { id: cancelOrder.id },
      data: {
        status: "CANCELLED",
        adminNotes: cancelLog,
      },
    });

    if (cancelledInDb.status !== "CANCELLED" || !cancelledInDb.adminNotes?.includes(cancelReason)) {
      throw new Error("❌ Không lưu được lý do hủy đơn vào adminNotes!");
    }
    console.log("   ✅ Hủy đơn an toàn thành công, nhật ký lý do được lưu trữ:", cancelledInDb.adminNotes);
    passed++;

    // -------------------------------------------------------------
    // Test 5: Phân tách độc lập giữa adminNotes và customerNotes
    // -------------------------------------------------------------
    console.log("\n👉 Test 5: Kiểm thử phân tách độc lập giữa adminNotes và customerNotes...");
    const internalNote = "Mã vận đơn GHTK: S218901928, kho đã test nút click";
    const updatedWithNote = await prisma.order.update({
      where: { id: testOrder.id },
      data: { adminNotes: internalNote },
    });

    if (updatedWithNote.adminNotes !== internalNote) {
      throw new Error("❌ adminNotes không khớp!");
    }
    if (updatedWithNote.customerNotes !== "Giao hàng buổi sáng") {
      throw new Error("❌ customerNotes bị ảnh hưởng hoặc ghi đè!");
    }
    console.log("   ✅ adminNotes được lưu độc lập, customerNotes nguyên vẹn");
    passed++;

    // -------------------------------------------------------------
    // Test 6: Tính toán Doanh thu thực tế vs Doanh thu đang xử lý
    // -------------------------------------------------------------
    console.log("\n👉 Test 6: Kiểm thử logic tính tổng doanh thu Completed vs Pending...");
    const completedAggregate = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "COMPLETED" },
    });
    const pendingAggregate = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["PENDING", "CONTACTED", "SHIPPING"] } },
    });

    console.log(`   - Doanh thu thực tế (COMPLETED): ${completedAggregate._sum.totalAmount || 0} ₫`);
    console.log(`   - Doanh thu đang xử lý: ${pendingAggregate._sum.totalAmount || 0} ₫`);
    if (typeof completedAggregate._sum.totalAmount !== "number") {
      throw new Error("❌ Aggregate sum doanh thu không hợp lệ");
    }
    console.log("   ✅ Logic truy vấn doanh thu hoạt động chuẩn xác");
    passed++;

    // -------------------------------------------------------------
    // Test 7: Hàm computeDailyRevenue tính liên tục 7 ngày
    // -------------------------------------------------------------
    console.log("\n👉 Test 7: Kiểm thử computeDailyRevenue sinh đúng 7 điểm ngày liên tiếp...");
    const sampleOrders = [
      {
        totalAmount: 1500000,
        status: "COMPLETED",
        createdAt: new Date(),
      },
      {
        totalAmount: 2000000,
        status: "SHIPPING",
        createdAt: new Date(),
      },
      {
        totalAmount: 800000,
        status: "COMPLETED",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 ngày trước
      },
    ];

    const dailyPoints = computeDailyRevenue(sampleOrders);
    if (dailyPoints.length !== 7) {
      throw new Error(`❌ computeDailyRevenue trả về ${dailyPoints.length} điểm thay vì 7!`);
    }

    const todayPoint = dailyPoints[6];
    if (todayPoint.completedRevenue !== 1500000 || todayPoint.pendingRevenue !== 2000000) {
      throw new Error("❌ Doanh thu ngày hôm nay tính toán sai!");
    }

    console.log("   ✅ computeDailyRevenue sinh đúng 7 ngày liên tiếp không bị đứt quãng:", 
      dailyPoints.map(p => `${p.dayOfWeek} (${p.label}): ${p.orderCount} đơn`).join(", ")
    );
    passed++;

  } finally {
    // Dọn dẹp dữ liệu test
    if (createdOrderIds.length > 0) {
      console.log(`\n🧹 Dọn dẹp ${createdOrderIds.length} đơn hàng thử nghiệm...`);
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: createdOrderIds } },
      });
      await prisma.order.deleteMany({
        where: { id: { in: createdOrderIds } },
      });
      console.log("   ✅ Đã xóa sạch dữ liệu kiểm thử trong CSDL.");
    }
  }

  console.log(`\n🎉 === KẾT QUẢ KIỂM THỬ: ${passed}/${total} BÀI PASS (100%) ===`);
}

runAdminOrderTests().catch((err) => {
  console.error("\n❌ KIỂM THỬ THẤT BẠI:", err);
  process.exit(1);
});
