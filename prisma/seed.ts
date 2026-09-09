import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialSiteSettings,
} from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu mẫu (Seeding Database)...");

  // 1. Dọn dẹp dữ liệu cũ (nếu có)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Đã làm sạch các bảng dữ liệu.");

  // 2. Tạo tài khoản Admin & Staff
  const adminPasswordHash = await bcrypt.hash("admin123@", 10);
  const staffPasswordHash = await bcrypt.hash("staff123@", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@caotri.vn",
      name: "Quản trị viên CaoTri",
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@caotri.vn",
      name: "Nhân viên Bán hàng",
      password: staffPasswordHash,
      role: "STAFF",
    },
  });

  console.log(`👤 Đã tạo 2 tài khoản: ${adminUser.email} (ADMIN), ${staffUser.email} (STAFF)`);

  // 3. Nạp danh mục sản phẩm (Categories)
  const categoryMap = new Map<string, string>();

  for (const cat of initialCategories) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        orderIndex: cat.orderIndex,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }

  console.log(`📂 Đã nạp ${categoryMap.size} danh mục sản phẩm.`);

  // 4. Nạp sản phẩm mẫu (Products)
  let productCount = 0;
  for (const prod of initialProducts) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice,
        images: JSON.stringify(prod.images),
        specs: JSON.stringify(prod.specs),
        inStock: prod.inStock,
        isFeatured: prod.isFeatured,
        isNew: prod.isNew,
        categoryId: categoryId,
      },
    });
    productCount++;
  }

  console.log(`🎮 Đã nạp ${productCount} sản phẩm gaming gear thực tế.`);

  // 5. Nạp Banners
  for (const banner of initialBanners) {
    await prisma.banner.create({
      data: {
        title: banner.title,
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl,
        orderIndex: banner.orderIndex,
        isActive: banner.isActive,
      },
    });
  }

  console.log(`🖼️ Đã nạp ${initialBanners.length} banners trang chủ.`);

  // 6. Nạp Site Settings
  for (const setting of initialSiteSettings) {
    await prisma.siteSetting.create({
      data: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log(`⚙️ Đã nạp ${initialSiteSettings.length} cấu hình cửa hàng.`);
  console.log("✅ Hoàn tất Seed Data cho Phase 1!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi nạp dữ liệu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
