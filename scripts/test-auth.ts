import { signJWT, verifyJWT } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function runAuthTests() {
  console.log("=== Bắt đầu kiểm thử Auth & RBAC ===");

  // 1. Test JWT Signing & Verification
  console.log("\n1. Kiểm tra ký và giải mã JWT token...");
  const samplePayload = {
    userId: "test-user-123",
    email: "test@caotri.vn",
    name: "Cao Trí Test",
    role: "ADMIN" as const,
  };

  const token = await signJWT(samplePayload);
  console.log("✓ Đã ký JWT Token:", token.slice(0, 30) + "...");

  const verified = await verifyJWT(token);
  if (
    verified &&
    verified.userId === samplePayload.userId &&
    verified.email === samplePayload.email &&
    verified.role === "ADMIN"
  ) {
    console.log("✓ Giải mã JWT thành công, dữ liệu payload khớp 100%!");
  } else {
    throw new Error("❌ Thất bại: Payload giải mã không khớp!");
  }

  // 2. Test Invalid / Tampered Token
  console.log("\n2. Kiểm tra phát hiện token giả mạo...");
  const tamperedToken = token.slice(0, -5) + "abcde";
  const invalidResult = await verifyJWT(tamperedToken);
  if (invalidResult === null) {
    console.log("✓ Token giả mạo bị từ chối thành công (trả về null)!");
  } else {
    throw new Error("❌ Thất bại: Token giả mạo không bị chặn!");
  }

  // 3. Test Database Users & Bcrypt Passwords
  console.log("\n3. Kiểm tra tài khoản trong database...");
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@caotri.vn" },
  });
  if (!adminUser) throw new Error("❌ Không tìm thấy user admin@caotri.vn");

  const isAdminPassValid = await bcrypt.compare("admin123@", adminUser.password);
  if (!isAdminPassValid) throw new Error("❌ Mật khẩu admin123@ không khớp!");
  console.log("✓ Tài khoản Admin: admin@caotri.vn / admin123@ hợp lệ (Role: " + adminUser.role + ")");

  const staffUser = await prisma.user.findUnique({
    where: { email: "staff@caotri.vn" },
  });
  if (!staffUser) throw new Error("❌ Không tìm thấy user staff@caotri.vn");

  const isStaffPassValid = await bcrypt.compare("staff123@", staffUser.password);
  if (!isStaffPassValid) throw new Error("❌ Mật khẩu staff123@ không khớp!");
  console.log("✓ Tài khoản Staff: staff@caotri.vn / staff123@ hợp lệ (Role: " + staffUser.role + ")");

  // 4. Test Wrong Password
  const isWrongPassValid = await bcrypt.compare("wrongpassword", adminUser.password);
  if (!isWrongPassValid) {
    console.log("✓ Nhập sai mật khẩu bị từ chối thành công!");
  } else {
    throw new Error("❌ Thất bại: Mật khẩu sai lại được chấp nhận!");
  }

  // 5. Test RBAC logic checks
  console.log("\n4. Kiểm tra logic phân quyền (RBAC)...");
  const adminAllowed = ["ADMIN"].includes(adminUser.role);
  const staffBlockedFromAdminOnly = !["ADMIN"].includes(staffUser.role);
  const staffAllowedOrders = ["ADMIN", "STAFF"].includes(staffUser.role);

  if (adminAllowed && staffBlockedFromAdminOnly && staffAllowedOrders) {
    console.log("✓ Phân quyền chuẩn: Admin toàn quyền, Staff bị chặn ở quyền Admin-only!");
  } else {
    throw new Error("❌ Thất bại: Logic phân quyền có lỗi!");
  }

  console.log("\n=========================================");
  console.log("🎉 TẤT CẢ 5/5 BÀI TEST AUTH ĐÃ VƯỢT QUA! 🎉");
  console.log("=========================================");
}

runAuthTests()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
