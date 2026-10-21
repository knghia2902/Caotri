import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";

/**
 * Kiểm tra xem URL có phải là ảnh được lưu trữ cục bộ trên server (/uploads/...) không.
 */
export function isLocalUploadUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const cleanUrl = url.trim();
  return cleanUrl.startsWith("/uploads/") || cleanUrl.startsWith("uploads/");
}

/**
 * Lấy tên file an toàn từ đường dẫn /uploads/<filename> (chống Path Traversal)
 */
export function getSafeFilename(url: string): string | null {
  try {
    if (!url || typeof url !== "string") return null;
    const clean = url.trim();

    // Chặn triệt để Path Traversal
    if (clean.includes("..") || clean.includes("\\")) {
      return null;
    }

    const stripped = clean.replace(/^\/?uploads\//, "");
    // Không cho phép subfolder lồng nhau
    if (stripped.includes("/") || stripped.includes("\\")) {
      return null;
    }

    const baseName = path.basename(stripped);
    if (!baseName || baseName === "." || baseName === "..") {
      return null;
    }

    return baseName;
  } catch {
    return null;
  }
}

/**
 * Kiểm tra xem file ảnh có đang được dùng bởi bất kỳ bảng nào khác trong database không
 */
export async function isImageReferencedElsewhere(
  filename: string,
  excludeProductId?: string
): Promise<boolean> {
  if (!filename) return false;

  // 1. Kiểm tra trong các Product khác
  const productCount = await prisma.product.count({
    where: {
      id: excludeProductId ? { not: excludeProductId } : undefined,
      images: {
        contains: filename,
      },
    },
  });
  if (productCount > 0) return true;

  // 2. Kiểm tra trong Category
  const categoryCount = await prisma.category.count({
    where: {
      imageUrl: {
        contains: filename,
      },
    },
  });
  if (categoryCount > 0) return true;

  // 3. Kiểm tra trong Banner
  const bannerCount = await prisma.banner.count({
    where: {
      imageUrl: {
        contains: filename,
      },
    },
  });
  if (bannerCount > 0) return true;

  // 4. Kiểm tra trong SiteSetting (Logo, favicon...)
  const settingCount = await prisma.siteSetting.count({
    where: {
      value: {
        contains: filename,
      },
    },
  });
  if (settingCount > 0) return true;

  return false;
}

/**
 * Xóa một file vật lý trong public/uploads nếu không còn ai tham chiếu đến
 */
export async function deleteLocalUploadFile(
  url: string,
  excludeProductId?: string
): Promise<{ deleted: boolean; filename: string | null; reason?: string }> {
  if (!isLocalUploadUrl(url)) {
    return { deleted: false, filename: null, reason: "Không phải ảnh lưu trữ cục bộ (/uploads)" };
  }

  const filename = getSafeFilename(url);
  if (!filename) {
    return { deleted: false, filename: null, reason: "Tên file không hợp lệ" };
  }

  // Không bao giờ xóa file .gitkeep
  if (filename === ".gitkeep") {
    return { deleted: false, filename, reason: "File hệ thống bảo vệ" };
  }

  // Kiểm tra xem file còn được dùng ở nơi khác không
  const isUsed = await isImageReferencedElsewhere(filename, excludeProductId);
  if (isUsed) {
    return {
      deleted: false,
      filename,
      reason: "File vẫn đang được sử dụng bởi sản phẩm/danh mục/banner khác",
    };
  }

  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return { deleted: true, filename };
    } else {
      return { deleted: false, filename, reason: "File không tồn tại trên ổ đĩa" };
    }
  } catch (err: any) {
    console.error(`Lỗi khi xóa file ${filePath}:`, err);
    return { deleted: false, filename, reason: err.message };
  }
}

/**
 * Xóa toàn bộ danh sách ảnh cục bộ của một sản phẩm
 */
export async function deleteProductImages(
  imagesInput: string | string[] | null | undefined,
  excludeProductId?: string
): Promise<{ deletedFiles: string[]; skippedFiles: string[] }> {
  const deletedFiles: string[] = [];
  const skippedFiles: string[] = [];

  let imageUrls: string[] = [];

  if (Array.isArray(imagesInput)) {
    imageUrls = imagesInput;
  } else if (typeof imagesInput === "string") {
    try {
      imageUrls = JSON.parse(imagesInput);
    } catch {
      imageUrls = [imagesInput];
    }
  }

  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    return { deletedFiles, skippedFiles };
  }

  for (const url of imageUrls) {
    if (!url || typeof url !== "string") continue;
    const res = await deleteLocalUploadFile(url, excludeProductId);
    if (res.deleted && res.filename) {
      deletedFiles.push(res.filename);
    } else if (res.filename) {
      skippedFiles.push(`${res.filename} (${res.reason})`);
    }
  }

  return { deletedFiles, skippedFiles };
}

/**
 * Quét toàn bộ thư mục public/uploads và dọn dẹp các file rác không còn được tham chiếu trong Database
 */
export async function cleanupOrphanedUploadFiles(): Promise<{
  scanned: number;
  deleted: string[];
  kept: string[];
}> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const deleted: string[] = [];
  const kept: string[] = [];

  if (!fs.existsSync(uploadDir)) {
    return { scanned: 0, deleted, kept };
  }

  const entries = await fs.promises.readdir(uploadDir);
  const candidateFiles = entries.filter((f) => f !== ".gitkeep");

  for (const file of candidateFiles) {
    const isUsed = await isImageReferencedElsewhere(file);
    const fullPath = path.join(uploadDir, file);

    if (!isUsed) {
      try {
        await fs.promises.unlink(fullPath);
        deleted.push(file);
      } catch (e) {
        console.error(`Không thể xóa file rác ${file}:`, e);
      }
    } else {
      kept.push(file);
    }
  }

  return {
    scanned: candidateFiles.length,
    deleted,
    kept,
  };
}
