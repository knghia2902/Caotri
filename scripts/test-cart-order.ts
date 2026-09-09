import { prisma } from "../src/lib/prisma";
import { createOrderAction, checkoutSchema } from "../src/app/actions/order";

async function runCartOrderTests() {
  console.log("🛒 === BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG GIỎ HÀNG & ĐẶT HÀNG (PHASE 5) ===\n");

  let passedTests = 0;
  const totalTests = 5;

  try {
    // -------------------------------------------------------------
    // Test 1: Kiểm tra Zod schema từ chối số điện thoại không hợp lệ
    // -------------------------------------------------------------
    console.log("👉 Test 1: Kiểm tra Zod Schema validation (SĐT không hợp lệ)...");
    const invalidPhoneResult = checkoutSchema.safeParse({
      customerName: "Nguyễn Văn Test",
      customerPhone: "123456", // Không đúng định dạng VN
      customerAddress: "123 Đường Cầu Giấy, Hà Nội",
      items: [
        {
          productId: "prod-1",
          productName: "Chuột Logitech G Pro",
          price: 1500000,
          quantity: 1,
        },
      ],
    });

    if (!invalidPhoneResult.success) {
      console.log("   ✅ Đã chặn thành công SĐT không hợp lệ (lỗi: " + invalidPhoneResult.error.issues[0].message + ")");
      passedTests++;
    } else {
      throw new Error("❌ Thất bại: Schema không chặn SĐT sai định dạng!");
    }

    // -------------------------------------------------------------
    // Test 2: Kiểm tra Zod schema chấp nhận dữ liệu đặt hàng hợp lệ
    // -------------------------------------------------------------
    console.log("\n👉 Test 2: Kiểm tra Zod Schema validation (Dữ liệu hợp lệ)...");
    const validData = {
      customerName: "Trần Minh Game thủ",
      customerPhone: "0988123456",
      customerAddress: "Số 88 Phố Huế, Quận Hai Bà Trưng, Hà Nội",
      customerNotes: "Giao trong giờ hành chính",
      items: [
        {
          productId: "test-prod-1",
          productName: "Bàn phím cơ Akko 5075B",
          price: 1890000,
          quantity: 1,
        },
        {
          productId: "test-prod-2",
          productName: "Lót chuột Artisan Hayate Otsu",
          price: 1350000,
          quantity: 2,
        },
      ],
    };

    const validResult = checkoutSchema.safeParse(validData);
    if (validResult.success) {
      console.log("   ✅ Xác thực dữ liệu đặt hàng thành công!");
      passedTests++;
    } else {
      throw new Error("❌ Thất bại: Schema từ chối dữ liệu hợp lệ: " + JSON.stringify(validResult.error.issues));
    }

    // -------------------------------------------------------------
    // Test 3: Tạo đơn hàng thực tế vào CSDL qua createOrderAction
    // -------------------------------------------------------------
    console.log("\n👉 Test 3: Thực thi createOrderAction lưu đơn hàng vào Prisma DB...");
    // Lấy 1 sản phẩm thật trong DB để làm productId tham chiếu
    const realProduct = await prisma.product.findFirst();
    if (!realProduct) {
      throw new Error("Không tìm thấy sản phẩm mẫu trong DB để test!");
    }

    const orderData = {
      customerName: "Lê Cao Trí",
      customerPhone: "0999340416",
      customerAddress: "Tầng 5 Tòa nhà Công Nghệ, Quận Cầu Giấy, Hà Nội",
      customerNotes: "Test tự động Phase 5",
      items: [
        {
          productId: realProduct.id,
          productName: realProduct.name,
          price: realProduct.price,
          quantity: 2,
        },
      ],
    };

    const actionResult = await createOrderAction(orderData);
    if (actionResult.success && actionResult.orderNumber) {
      console.log(`   ✅ Đã tạo đơn hàng thành công! Mã đơn: ${actionResult.orderNumber}`);
      passedTests++;
    } else {
      throw new Error("❌ Thất bại khi chạy createOrderAction: " + actionResult.error);
    }

    const createdOrderNumber = actionResult.orderNumber!;

    // -------------------------------------------------------------
    // Test 4: Kiểm tra bản ghi Order và OrderItem trong CSDL
    // -------------------------------------------------------------
    console.log("\n👉 Test 4: Truy vấn CSDL xác thực Order & OrderItem...");
    const dbOrder = await prisma.order.findUnique({
      where: { orderNumber: createdOrderNumber },
      include: { items: true },
    });

    if (!dbOrder) {
      throw new Error("❌ Không tìm thấy đơn hàng vừa tạo trong CSDL!");
    }

    const expectedTotal = realProduct.price * 2;
    if (dbOrder.totalAmount === expectedTotal && dbOrder.items.length === 1) {
      console.log(`   ✅ Dữ liệu CSDL toàn vẹn:`);
      console.log(`      - Khách hàng: ${dbOrder.customerName} (${dbOrder.customerPhone})`);
      console.log(`      - Tổng tiền: ${dbOrder.totalAmount.toLocaleString("vi-VN")}đ`);
      console.log(`      - Số món: ${dbOrder.items[0].quantity}x ${dbOrder.items[0].productName}`);
      console.log(`      - Trạng thái: ${dbOrder.status}`);
      passedTests++;
    } else {
      throw new Error(`❌ Sai lệch tổng tiền: kỳ vọng ${expectedTotal}, thực tế ${dbOrder.totalAmount}`);
    }

    // -------------------------------------------------------------
    // Test 5: Dọn dẹp đơn hàng mẫu sau khi kiểm thử
    // -------------------------------------------------------------
    console.log("\n👉 Test 5: Dọn dẹp dữ liệu đơn hàng thử nghiệm...");
    await prisma.order.delete({
      where: { orderNumber: createdOrderNumber },
    });

    const checkDeleted = await prisma.order.findUnique({
      where: { orderNumber: createdOrderNumber },
    });

    if (!checkDeleted) {
      console.log("   ✅ Đã xóa đơn hàng thử nghiệm sạch sẽ!");
      passedTests++;
    } else {
      throw new Error("❌ Chưa xóa được đơn hàng thử nghiệm!");
    }

    console.log(`\n🎉 KẾT QUẢ: ${passedTests}/${totalTests} BÀI KIỂM THỬ THÀNH CÔNG VƯỢT TRỘI!`);
  } catch (error) {
    console.error("❌ Lỗi kiểm thử:", error);
    process.exit(1);
  }
}

runCartOrderTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
