import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runStorefrontTests() {
  console.log("🎮 === BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG STOREFRONT (PHASE 4) ===\n");
  let passedCount = 0;
  const totalTests = 7;

  try {
    // TEST 1: Banners active & orderIndex cho Hero Slider
    console.log("👉 Test 1: Kiểm tra nạp Banners active cho Hero Slider...");
    const activeBanners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });
    if (activeBanners.length === 0) {
      throw new Error("Không có banner nào ở trạng thái active!");
    }
    console.log(`   ✅ Đã tìm thấy ${activeBanners.length} banners active. Banner đầu tiên: "${activeBanners[0].title}" (orderIndex: ${activeBanners[0].orderIndex})`);
    passedCount++;

    // TEST 2: Danh mục kèm số lượng sản phẩm
    console.log("\n👉 Test 2: Kiểm tra nạp Danh mục sản phẩm kèm số lượng...");
    const categoriesWithCount = await prisma.category.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    if (categoriesWithCount.length === 0) {
      throw new Error("Không có danh mục nào trong CSDL!");
    }
    console.log(`   ✅ Đã tìm thấy ${categoriesWithCount.length} danh mục:`);
    categoriesWithCount.forEach((cat) => {
      console.log(`      - [${cat.slug}] ${cat.name}: ${cat._count.products} sản phẩm`);
    });
    passedCount++;

    // TEST 3: Sản phẩm Nổi bật (isFeatured) & Hàng mới về (isNew)
    console.log("\n👉 Test 3: Kiểm tra nạp Sản phẩm Nổi bật & Hàng mới về...");
    const featuredProducts = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 4,
    });
    const newProducts = await prisma.product.findMany({
      where: { isNew: true },
      take: 4,
    });
    if (featuredProducts.length === 0) {
      throw new Error("Không có sản phẩm nổi bật nào!");
    }
    if (newProducts.length === 0) {
      throw new Error("Không có sản phẩm mới về nào!");
    }
    console.log(`   ✅ Tìm thấy ${featuredProducts.length} sản phẩm nổi bật (ví dụ: "${featuredProducts[0].name}")`);
    console.log(`   ✅ Tìm thấy ${newProducts.length} sản phẩm mới về (ví dụ: "${newProducts[0].name}")`);
    passedCount++;

    // TEST 4: Tìm kiếm theo từ khóa (Search Query)
    console.log("\n👉 Test 4: Kiểm tra truy vấn tìm kiếm sản phẩm theo từ khóa 'Logitech'...");
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: "Logitech" } },
          { slug: { contains: "logitech" } },
        ],
      },
    });
    if (searchResults.length === 0) {
      throw new Error("Không tìm thấy kết quả nào cho từ khóa 'Logitech'!");
    }
    console.log(`   ✅ Tìm thấy ${searchResults.length} sản phẩm khớp từ khóa 'Logitech'. Đầu tiên: "${searchResults[0].name}"`);
    passedCount++;

    // TEST 5: Lọc theo khoảng giá ngân sách
    console.log("\n👉 Test 5: Kiểm tra truy vấn lọc theo khoảng giá (1.000.000đ - 3.000.000đ)...");
    const priceFiltered = await prisma.product.findMany({
      where: {
        price: {
          gte: 1000000,
          lte: 3000000,
        },
      },
      orderBy: { price: "asc" },
    });
    if (priceFiltered.length === 0) {
      throw new Error("Không tìm thấy sản phẩm nào trong khoảng giá 1tr - 3tr!");
    }
    console.log(`   ✅ Tìm thấy ${priceFiltered.length} sản phẩm trong khoảng 1.000.000đ - 3.000.000đ. Giá thấp nhất: ${priceFiltered[0].price.toLocaleString()}đ, cao nhất: ${priceFiltered[priceFiltered.length - 1].price.toLocaleString()}đ`);
    passedCount++;

    // TEST 6: Nạp chi tiết sản phẩm theo slug & parse an toàn JSON images/specs
    console.log("\n👉 Test 6: Kiểm tra nạp chi tiết sản phẩm và parse JSON images / specs...");
    const sampleProduct = await prisma.product.findFirst({
      include: { category: true },
    });
    if (!sampleProduct) {
      throw new Error("Không có sản phẩm nào để kiểm tra chi tiết!");
    }
    const parsedImages = JSON.parse(sampleProduct.images);
    if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
      throw new Error("Trường images không phải là JSON array hợp lệ!");
    }
    const parsedSpecs = sampleProduct.specs ? JSON.parse(sampleProduct.specs) : {};
    console.log(`   ✅ Đã nạp sản phẩm: "${sampleProduct.name}" (slug: ${sampleProduct.slug})`);
    console.log(`      - Danh mục: ${sampleProduct.category.name}`);
    console.log(`      - Số lượng ảnh trong gallery: ${parsedImages.length}`);
    console.log(`      - Số lượng thông số kỹ thuật (specs): ${Object.keys(parsedSpecs).length}`);
    passedCount++;

    // TEST 7: Site Settings cho Header/Footer/QuickContactDock
    console.log("\n👉 Test 7: Kiểm tra nạp Site Settings cho Contact Dock...");
    const siteSettings = await prisma.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    siteSettings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    const hotline = settingsMap.hotline;
    const zalo = settingsMap.zaloUrl || settingsMap.zalo;
    const facebook = settingsMap.facebookUrl || settingsMap.facebook;

    if (!hotline || !zalo) {
      throw new Error("Thiếu cấu hình hotline hoặc zalo trong SiteSetting!");
    }
    console.log(`   ✅ Cấu hình liên hệ hợp lệ:`);
    console.log(`      - Hotline: ${hotline}`);
    console.log(`      - Zalo: ${zalo}`);
    console.log(`      - Facebook: ${facebook || "N/A"}`);
    passedCount++;

    console.log(`\n🎉 KẾT QUẢ: ${passedCount}/${totalTests} BÀI KIỂM THỬ THÀNH CÔNG VƯỢT TRỘI!`);
  } catch (error) {
    console.error("\n❌ KIỂM THỬ THẤT BẠI:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStorefrontTests();
