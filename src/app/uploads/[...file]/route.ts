import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const resolvedParams = await params;
  const filePathArray = resolvedParams.file || [];
  // Chống Directory Traversal
  const safePath = filePathArray.join("/").replace(/\.\./g, "");
  const fullPath = path.join(process.cwd(), "public", "uploads", safePath);

  if (!fs.existsSync(fullPath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  const stat = await fs.promises.stat(fullPath);
  if (!stat.isFile()) {
    return new NextResponse("Not a file", { status: 400 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = await fs.promises.readFile(fullPath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}
