import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/traffic";
import { verifyJWT, COOKIE_NAME as ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra nếu là Admin / Staff đang đăng nhập -> bỏ qua hoàn toàn
    const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (adminToken) {
      const session = await verifyJWT(adminToken);
      if (session) {
        return NextResponse.json({ success: true, ignored: "admin_session" });
      }
    }

    // 2. Đọc payload từ client
    let body: { path?: string; title?: string; visitorId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body rỗng hoặc beacon gửi text
    }

    const path = body.path || "/";
    const title = body.title || "";

    // 3. Lấy IP khách truy cập thực tế (Cloudflare Tunnel, Nginx reverse proxy hoặc direct)
    const cfIp = req.headers.get("cf-connecting-ip");
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const ip = cfIp ? cfIp.trim() : forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";

    // 4. Lấy User-Agent
    const userAgent = req.headers.get("user-agent") || "";

    // 5. Lấy hoặc khởi tạo Visitor ID từ Cookie hoặc LocalStorage gửi lên
    const cookieVid = req.cookies.get("tg_vid")?.value;
    const effectiveVid = cookieVid || body.visitorId || "";

    // 6. Ghi nhận lượt truy cập
    const result = await recordVisit({
      visitorId: effectiveVid,
      ip,
      userAgent,
      path,
      title,
      isAdminOrStaff: false,
    });

    // 7. Trả về response và set Cookie 1 năm nếu cần
    const response = NextResponse.json({
      success: true,
      isNewVisitorToday: result.isNewVisitorToday,
    });

    if (!cookieVid && result.visitorId) {
      response.cookies.set("tg_vid", result.visitorId, {
        httpOnly: false, // Để client javascript đọc và đồng bộ với localStorage nếu cần
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 năm
      });
    }

    return response;
  } catch (error) {
    console.error("[Track API Error]:", error);
    return NextResponse.json({ success: false }, { status: 200 }); // Luôn return 200 để client beacon không báo lỗi
  }
}
