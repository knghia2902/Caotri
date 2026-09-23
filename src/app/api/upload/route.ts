import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { getCurrentSession } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

// Hỗ trợ tối đa 15MB mỗi ảnh
const MAX_FILE_SIZE = 15 * 1024 * 1024;

// MIME types ảnh được chấp nhận
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/avif": ".avif",
};

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra quyền Admin / Staff
    const session = await getCurrentSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json(
        { success: false, error: "Bạn chưa đăng nhập hoặc không có quyền tải file." },
        { status: 401 }
      );
    }

    // 2. Đọc formData
    const formData = await req.formData();
    const files: File[] = [];

    // Nhận cả mảng "files" hoặc 1 "file"
    const formFiles = formData.getAll("files");
    const singleFile = formData.get("file");

    if (formFiles && formFiles.length > 0) {
      for (const item of formFiles) {
        if (item && typeof item === "object" && "arrayBuffer" in item) {
          files.push(item as File);
        }
      }
    }

    if (singleFile && typeof singleFile === "object" && "arrayBuffer" in singleFile) {
      const f = singleFile as File;
      if (!files.some((existing) => existing.name === f.name && existing.size === f.size)) {
        files.push(f);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file hình ảnh tải lên." },
        { status: 400 }
      );
    }

    // 3. Đảm bảo thư mục public/uploads tồn tại
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const savedUrls: string[] = [];
    const savedFiles: string[] = [];

    // 4. Xử lý từng file
    for (const file of files) {
      // Kiểm tra dung lượng
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" vượt quá dung lượng tối đa cho phép (15MB).`,
          },
          { status: 400 }
        );
      }

      // Kiểm tra định dạng ảnh
      const mimeType = file.type?.toLowerCase();
      let ext = ALLOWED_MIME_TYPES[mimeType];

      // Nếu mime type không nhận diện được, thử lấy theo đuôi file
      if (!ext) {
        const fileExt = path.extname(file.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"].includes(fileExt)) {
          ext = fileExt === ".jpeg" ? ".jpg" : fileExt;
        }
      }

      if (!ext) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" không phải định dạng ảnh hợp lệ (hỗ trợ JPG, PNG, WEBP, GIF, SVG, AVIF).`,
          },
          { status: 400 }
        );
      }

      // Tạo tên file an toàn, chống ghi đè và ngăn chặn path traversal
      const rawBaseName = path.basename(file.name, path.extname(file.name));
      const cleanBase = slugify(rawBaseName).slice(0, 40) || "upload";
      const randomSuffix = crypto.randomBytes(4).toString("hex");
      const timestamp = Date.now();
      const uniqueFileName = `${cleanBase}-${timestamp}-${randomSuffix}${ext}`;

      const targetPath = path.join(uploadDir, uniqueFileName);

      // Lưu file vào đĩa
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.promises.writeFile(targetPath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      savedUrls.push(publicUrl);
      savedFiles.push(uniqueFileName);
    }

    return NextResponse.json({
      success: true,
      url: savedUrls[0],
      urls: savedUrls,
      files: savedFiles,
      message: `Đã tải lên thành công ${savedFiles.length} hình ảnh.`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi máy chủ khi tải ảnh lên." },
      { status: 500 }
    );
  }
}
