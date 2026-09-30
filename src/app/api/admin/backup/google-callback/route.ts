import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";

const execAsync = promisify(exec);
const RCLONE_CONF_DIR = "/home/caotri/.config/rclone";
const RCLONE_CONF_FILE = path.join(RCLONE_CONF_DIR, "rclone.conf");

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL || "https://tringuyengear.com";
  const redirectUri = `${baseUrl}/api/admin/backup/google-callback`;

  if (error || !code) {
    const errorMsg = error || "Không nhận được mã xác thực từ Google";
    return NextResponse.redirect(`${baseUrl}/admin/backups?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const clientId = process.env.GDRIVE_CLIENT_ID || (await prisma.siteSetting.findUnique({ where: { key: "backup_gdrive_client_id" } }))?.value || "";
    const clientSecret = process.env.GDRIVE_CLIENT_SECRET || (await prisma.siteSetting.findUnique({ where: { key: "backup_gdrive_client_secret" } }))?.value || "";

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/admin/backups?error=${encodeURIComponent("Thiếu cấu hình Client ID hoặc Client Secret trên máy chủ")}`);
    }

    // Đổi code lấy token từ Google OAuth API
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok || tokenJson.error) {
      const errMsg = tokenJson.error_description || tokenJson.error || "Lỗi đổi token với Google";
      return NextResponse.redirect(`${baseUrl}/admin/backups?error=${encodeURIComponent(errMsg)}`);
    }

    const tokenData = {
      access_token: tokenJson.access_token,
      token_type: tokenJson.token_type || "Bearer",
      refresh_token: tokenJson.refresh_token,
      expiry: new Date(Date.now() + (tokenJson.expires_in || 3600) * 1000).toISOString(),
    };

    const rcloneConf = `[gdrive]\ntype = drive\nclient_id = ${clientId}\nclient_secret = ${clientSecret}\nscope = drive\ntoken = ${JSON.stringify(tokenData)}\n`;

    if (!fs.existsSync(RCLONE_CONF_DIR)) {
      fs.mkdirSync(RCLONE_CONF_DIR, { recursive: true });
    }

    fs.writeFileSync(RCLONE_CONF_FILE, rcloneConf, "utf-8");

    // Thử kết nối rclone
    try {
      await execAsync("rclone lsd gdrive: --timeout 10s");
    } catch (e: any) {
      console.warn("Rclone test connection error:", e);
    }

    // Lưu vào database
    await prisma.siteSetting.upsert({
      where: { key: "backup_upload_gdrive" },
      update: { value: "true" },
      create: { key: "backup_upload_gdrive", value: "true" },
    });

    // Cập nhật backup.conf
    try {
      if (fs.existsSync("/home/caotri/scripts/backup.conf")) {
        let conf = fs.readFileSync("/home/caotri/scripts/backup.conf", "utf-8");
        conf = conf.replace(/UPLOAD_GDRIVE=.*/g, "UPLOAD_GDRIVE=true");
        fs.writeFileSync("/home/caotri/scripts/backup.conf", conf, "utf-8");
      }
    } catch {}

    return NextResponse.redirect(`${baseUrl}/admin/backups?gdrive=connected`);
  } catch (err: any) {
    return NextResponse.redirect(`${baseUrl}/admin/backups?error=${encodeURIComponent(err.message || "Lỗi hệ thống khi kích hoạt Google Drive")}`);
  }
}
