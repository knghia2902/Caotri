import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentSession } from "@/lib/auth";

const BACKUP_DIR = "/home/caotri/backups";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { filename } = await params;

    // Chống Directory Traversal
    if (!filename || !/^caotri_backup_\d+_\d+\.tar\.gz$/.test(filename)) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return new NextResponse("Backup file not found", { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stat.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading backup file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
