import { slugify } from "../src/lib/slugify";
import { getSpecsPresetForCategory, CATEGORY_SPEC_PRESETS } from "../src/lib/presets";
import { prisma } from "../src/lib/prisma";

async function runCatalogTests() {
  console.log("==================================================");
  console.log("🧪 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CATALOG & CONTENT MANAGEMENT (PHASE 3)");
  console.log("==================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Kiểm thử thất bại: ${testName}`);
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Kiểm thử sinh Slug tiếng Việt chuẩn SEO
    // ----------------------------------------------------
    console.log("--- Test Suite 1: Sinh Slug tiếng Việt chuẩn SEO ---");
    assert(
      slugify("Bàn phím cơ DareU EK87") === "ban-phim-co-dareu-ek87",
      "Slugify cơ bản với dấu cách và chữ hoa"
    );
    assert(
      slugify("Chuột Gaming Không Dây Siêu Nhẹ 49g!") === "chuot-gaming-khong-day-sieu-nhe-49g",
      "Slugify loại bỏ ký tự đặc biệt (!@#$) và giữ nguyên số"
    );
    assert(
      slugify("  Màn hình cong Samsung Odyssey G9 --- Đẳng Cấp ") === "man-hinh-cong-samsung-odyssey-g9-dang-cap",
      "Slugify xử lý khoảng trắng thừa và dấu gạch ngang liên tiếp"
    );
    console.log("");

    // ----------------------------------------------------
    // TEST 2: Kiểm thử Presets thông số kỹ thuật (Tech Specs)
    // ----------------------------------------------------
    console.log("--- Test Suite 2: Presets Thông số kỹ thuật ---");
    const mousePreset = getSpecsPresetForCategory("chuot-gaming");
    assert(
      Boolean(mousePreset["Cảm biến (Sensor)"]) && Boolean(mousePreset["Độ phân giải (DPI)"]),
      "Lấy đúng Preset cho ngành hàng Chuột gaming"
    );

    const keyboardPreset = getSpecsPresetForCategory("ban-phim-co");
    assert(
      Boolean(keyboardPreset["Loại Switch"]) && Boolean(keyboardPreset["Khả năng Hotswap"]),
      "Lấy đúng Preset cho ngành hàng Bàn phím cơ"
    );

    const screenPreset = getSpecsPresetForCategory("man-hinh-gaming");
    assert(
      Boolean(screenPreset["Tần số quét"]) && Boolean(screenPreset["Thời gian phản hồi"]),
      "Lấy đúng Preset cho ngành hàng Màn hình gaming"
    );
    console.log("");

    // ----------------------------------------------------
    // TEST 3: CRUD Danh mục sản phẩm (Category)
    // ----------------------------------------------------
    console.log("--- Test Suite 3: CSDL CRUD Danh mục sản phẩm ---");
    const testCategorySlug = `test-cat-${Date.now()}`;
    const newCategory = await prisma.category.create({
      data: {
        name: "Danh Mục Kiểm Thử Tự Động",
        slug: testCategorySlug,
        description: "Mô tả danh mục kiểm thử",
        orderIndex: 99,
        imageUrl: "https://example.com/cat-icon.png",
      },
    });
    assert(Boolean(newCategory.id), "Tạo thành công danh mục mới trong CSDL");

    const updatedCategory = await prisma.category.update({
      where: { id: newCategory.id },
      data: {
        name: "Danh Mục Kiểm Thử Đã Sửa",
        orderIndex: 100,
      },
    });
    assert(
      updatedCategory.name === "Danh Mục Kiểm Thử Đã Sửa" && updatedCategory.orderIndex === 100,
      "Cập nhật thành công danh mục"
    );

    // Xóa danh mục kiểm thử
    await prisma.category.delete({
      where: { id: newCategory.id },
    });
    const deletedCheck = await prisma.category.findUnique({
      where: { id: newCategory.id },
    });
    assert(deletedCheck === null, "Xóa thành công danh mục kiểm thử khỏi CSDL");
    console.log("");

    // ----------------------------------------------------
    // TEST 4: CRUD Sản phẩm với Multiple Images JSON & Specs JSON
    // ----------------------------------------------------
    console.log("--- Test Suite 4: CSDL CRUD Sản phẩm (Gallery & Specs) ---");
    const firstCategory = await prisma.category.findFirst();
    if (!firstCategory) {
      throw new Error("Không tìm thấy danh mục để gán sản phẩm kiểm thử");
    }

    const testProductSlug = `test-prod-${Date.now()}`;
    const testImages = [
      "https://example.com/img1.png",
      "https://example.com/img2.png",
    ];
    const testSpecs = {
      "Cảm biến": "PAW3395",
      "Trọng lượng": "49g",
    };

    const newProduct = await prisma.product.create({
      data: {
        name: "Sản Phẩm Kiểm Thử Tự Động",
        slug: testProductSlug,
        price: 1250000,
        originalPrice: 1500000,
        images: JSON.stringify(testImages),
        specs: JSON.stringify(testSpecs),
        inStock: true,
        isFeatured: false,
        isNew: true,
        categoryId: firstCategory.id,
      },
    });
    assert(Boolean(newProduct.id), "Tạo sản phẩm với Images và Specs JSON thành công");

    // Kiểm tra parse JSON images & specs
    const parsedImages = JSON.parse(newProduct.images);
    const parsedSpecs = JSON.parse(newProduct.specs || "{}");
    assert(
      Array.isArray(parsedImages) && parsedImages.length === 2 && parsedImages[0] === testImages[0],
      "Lưu trữ mảng hình ảnh JSON đúng chuẩn Cloudflare-ready"
    );
    assert(
      parsedSpecs["Cảm biến"] === "PAW3395" && parsedSpecs["Trọng lượng"] === "49g",
      "Lưu trữ thông số kỹ thuật JSON đúng chuẩn"
    );

    // Quick-toggle test: Featured & InStock
    const toggledFeatured = await prisma.product.update({
      where: { id: newProduct.id },
      data: { isFeatured: true },
    });
    assert(toggledFeatured.isFeatured === true, "Quick-toggle Nổi bật (isFeatured) hoạt động chính xác");

    const toggledStock = await prisma.product.update({
      where: { id: newProduct.id },
      data: { inStock: false },
    });
    assert(toggledStock.inStock === false, "Quick-toggle Tồn kho (inStock) hoạt động chính xác");

    // Xóa sản phẩm kiểm thử
    await prisma.product.delete({
      where: { id: newProduct.id },
    });
    console.log("");

    // ----------------------------------------------------
    // TEST 5: CRUD Banner trang chủ
    // ----------------------------------------------------
    console.log("--- Test Suite 5: CSDL CRUD Banner trang chủ ---");
    const newBanner = await prisma.banner.create({
      data: {
        title: "Banner Kiểm Thử Khuyến Mãi",
        imageUrl: "https://example.com/banner-test.jpg",
        linkUrl: "/products/khuyen-mai",
        orderIndex: 99,
        isActive: true,
      },
    });
    assert(Boolean(newBanner.id), "Tạo banner mới thành công");

    const toggledBanner = await prisma.banner.update({
      where: { id: newBanner.id },
      data: { isActive: false },
    });
    assert(toggledBanner.isActive === false, "Bật/Tắt hiển thị banner (isActive) thành công");

    await prisma.banner.delete({
      where: { id: newBanner.id },
    });
    console.log("");

    // ----------------------------------------------------
    // TEST 6: Cập nhật Cài đặt Cửa hàng (SiteSetting)
    // ----------------------------------------------------
    console.log("--- Test Suite 6: CSDL Cài đặt Cửa hàng (SiteSetting) ---");
    const testHotline = `0999.${Math.floor(100000 + Math.random() * 900000)}`;
    await prisma.siteSetting.upsert({
      where: { key: "hotline" },
      update: { value: testHotline },
      create: { key: "hotline", value: testHotline },
    });

    const verifySetting = await prisma.siteSetting.findUnique({
      where: { key: "hotline" },
    });
    assert(
      verifySetting?.value === testHotline,
      "Cập nhật và đọc lại giá trị Hotline từ bảng SiteSetting thành công"
    );
    console.log("");

    // ----------------------------------------------------
    // TỔNG KẾT
    // ----------------------------------------------------
    console.log("==================================================");
    console.log(`🎉 HOÀN THÀNH KIỂM THỬ: ${passedTests}/${totalTests} BÀI TEST ĐẠT KẾT QUẢ TỐT!`);
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình kiểm thử:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runCatalogTests();
