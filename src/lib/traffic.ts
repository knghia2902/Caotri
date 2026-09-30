import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const IP_SALT = process.env.JWT_SECRET || "tringuyen-traffic-security-salt-2026";

/**
 * Trả về ngày định dạng "YYYY-MM-DD" theo chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh - UTC+7)
 */
export function getVietnamDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

/**
 * Băm IP bằng SHA-256 + salt để bảo mật danh tính người dùng và chống trùng lặp IP trong ngày
 */
export function hashIp(ip: string): string {
  const cleanIp = (ip || "127.0.0.1").trim();
  return crypto.createHash("sha256").update(`${cleanIp}_${IP_SALT}`).digest("hex");
}

/**
 * Nhận diện loại thiết bị dựa vào User-Agent
 */
export function detectDeviceType(userAgent: string = ""): "Desktop" | "Mobile" | "Tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk/i.test(ua)) {
    return "Tablet";
  }
  if (/mobi|ipod|phone|blackberry|opera mini|fennec|iemobile/i.test(ua)) {
    return "Mobile";
  }
  return "Desktop";
}

/**
 * Nhận diện bot / web crawlers tự động để bỏ qua không tính vào lượt truy cập
 */
export function isBot(userAgent: string = ""): boolean {
  if (!userAgent) return false;
  return /bot|crawler|spider|crawling|googlebot|bingbot|yandex|slurp|duckduckbot|baiduspider|headlesschrome|facebookexternalhit|whatsapp|telegrambot|curl|wget|lighthouse|dataprovider|semrush|ahrefs|uptime|pingdom|bytespider|amazonbot|claudebot|gptbot|censys|shodan/i.test(
    userAgent
  );
}

/**
 * Trích xuất tên thiết bị / hệ điều hành thân thiện từ User-Agent
 */
export function parseDeviceInfo(userAgent: string = ""): string {
  if (!userAgent) return "Không rõ";
  const ua = userAgent.trim();

  if (/Dataprovider/i.test(ua)) return "Bot (Dataprovider)";
  if (/SM-S721B/i.test(ua)) return "Samsung Galaxy S24 FE";
  if (/SM-N970F/i.test(ua)) return "Samsung Note 10";
  if (/V2425A/i.test(ua)) return "Vivo X200 Pro";
  if (/iPhone/i.test(ua)) {
    const match = ua.match(/OS ([0-9_]+)/i);
    const ver = match ? match[1].replace(/_/g, ".") : "";
    return `iPhone${ver ? ` (iOS ${ver})` : ""}`;
  }
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) {
    const modelMatch = ua.match(/;\s*([A-Za-z0-9\-_ ]+)\s+Build\//i);
    if (modelMatch && modelMatch[1]) {
      return modelMatch[1].trim();
    }
    const verMatch = ua.match(/Android ([0-9.]+)/i);
    return `Android${verMatch ? ` ${verMatch[1]}` : ""}`;
  }
  if (/Windows NT 10.0/i.test(ua)) return "Windows 10/11";
  if (/Windows NT 6.3/i.test(ua)) return "Windows 8.1";
  if (/Windows NT 6.1/i.test(ua)) return "Windows 7";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Macintosh.*Mac OS X/i.test(ua)) return "Mac / macOS";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "Thiết bị khác";
}

export interface RecordVisitParams {
  visitorId?: string;
  ip: string;
  userAgent?: string;
  path: string;
  title?: string;
  isAdminOrStaff?: boolean;
}

/**
 * Ghi nhận lượt truy cập thông minh với cơ chế Deduplication nghiêm ngặt:
 * - 1 PC / 1 Trình duyệt trong 1 ngày CHỈ tính là 1 Khách truy cập duy nhất (Unique Visitor).
 * - 1 IP trong cùng 1 ngày (dù mở tab ẩn danh / trình duyệt khác trên cùng máy) CHỈ tính là 1 Khách duy nhất.
 * - Các lần F5, tải lại, chuyển trang nội bộ chỉ tăng tổng lượt xem trang (Pageviews), TUYỆT ĐỐI KHÔNG làm tăng số khách truy cập.
 * - Bỏ qua hoàn toàn Admin / Staff khi đang đăng nhập, bỏ qua bots và route hệ thống.
 */
export async function recordVisit({
  visitorId,
  ip,
  userAgent = "",
  path,
  title,
  isAdminOrStaff = false,
}: RecordVisitParams): Promise<{ isNewVisitorToday: boolean; visitorId: string }> {
  // 1. Lọc bỏ các truy cập không hợp lệ
  if (isAdminOrStaff) {
    return { isNewVisitorToday: false, visitorId: visitorId || "" };
  }
  if (isBot(userAgent)) {
    return { isNewVisitorToday: false, visitorId: visitorId || "" };
  }
  if (
    !path ||
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/uploads") ||
    path.includes(".")
  ) {
    return { isNewVisitorToday: false, visitorId: visitorId || "" };
  }

  const today = getVietnamDateString();
  const effectiveVid = visitorId && visitorId.trim().length > 8 ? visitorId.trim() : crypto.randomUUID();
  const ipHash = hashIp(ip);
  const deviceType = detectDeviceType(userAgent);
  const cleanPath = path.slice(0, 255);
  const cleanTitle = title ? title.slice(0, 255) : null;

  try {
    // 2. Kiểm tra xem visitorId này hôm nay đã vào web chưa
    const existingByVid = await prisma.dailyVisitor.findUnique({
      where: {
        visitorId_date: {
          visitorId: effectiveVid,
          date: today,
        },
      },
    });

    // 3. Nếu chưa thấy theo visitorId, kiểm tra tiếp theo ipHash (chống mở Incognito / xóa cookie trên cùng IP/máy)
    const existingByIp = !existingByVid
      ? await prisma.dailyVisitor.findFirst({
          where: {
            ipHash,
            date: today,
          },
        })
      : null;

    const existing = existingByVid || existingByIp;

    if (existing) {
      // ĐÃ TỪNG TRUY CẬP HÔM NAY -> KHÔNG TĂNG LƯỢT KHÁCH DUY NHẤT!
      // Chỉ tăng số trang đã xem (pageviews) của phiên khách này và tổng hệ thống
      await Promise.allSettled([
        prisma.dailyVisitor.update({
          where: { id: existing.id },
          data: {
            pageviews: { increment: 1 },
            lastPath: cleanPath,
            updatedAt: new Date(),
          },
        }),
        prisma.trafficStat.upsert({
          where: { date: today },
          update: {
            pageviews: { increment: 1 },
          },
          create: {
            date: today,
            visitors: 1,
            pageviews: 1,
          },
        }),
        prisma.pageviewStat.upsert({
          where: { path: cleanPath },
          update: {
            views: { increment: 1 },
            title: cleanTitle || undefined,
          },
          create: {
            path: cleanPath,
            title: cleanTitle,
            views: 1,
          },
        }),
      ]);

      return { isNewVisitorToday: false, visitorId: existing.visitorId || effectiveVid };
    }

    // 4. KHÁCH MỚI HOÀN TOÀN TRONG NGÀY
    await prisma.$transaction([
      prisma.dailyVisitor.create({
        data: {
          date: today,
          visitorId: effectiveVid,
          ipHash,
          userAgent: userAgent.slice(0, 500),
          deviceType,
          pageviews: 1,
          lastPath: cleanPath,
        },
      }),
      prisma.trafficStat.upsert({
        where: { date: today },
        update: {
          visitors: { increment: 1 },
          pageviews: { increment: 1 },
        },
        create: {
          date: today,
          visitors: 1,
          pageviews: 1,
        },
      }),
      prisma.pageviewStat.upsert({
        where: { path: cleanPath },
        update: {
          views: { increment: 1 },
          title: cleanTitle || undefined,
        },
        create: {
          path: cleanPath,
          title: cleanTitle,
          views: 1,
        },
      }),
    ]);

    return { isNewVisitorToday: true, visitorId: effectiveVid };
  } catch (error: any) {
    // Trường hợp race condition (hai request đồng thời từ cùng 1 máy): bỏ qua lỗi P2002
    if (error?.code === "P2002") {
      return { isNewVisitorToday: false, visitorId: effectiveVid };
    }
    console.error("[Traffic Tracking Error]:", error);
    return { isNewVisitorToday: false, visitorId: effectiveVid };
  }
}

/**
 * Lấy dữ liệu thống kê tổng hợp Traffic cho trang Quản trị Admin
 */
export async function getTrafficOverview() {
  const today = getVietnamDateString();

  // Tính ngày hôm qua
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getVietnamDateString(yesterdayDate);

  // Danh sách 7 ngày gần nhất (từ 6 ngày trước đến hôm nay)
  const last7DaysList: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7DaysList.push(getVietnamDateString(d));
  }

  // Mốc 30 ngày trước
  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
  const thirtyDaysAgoStr = getVietnamDateString(thirtyDaysAgoDate);

  const [
    todayStat,
    yesterdayStat,
    last7DaysStats,
    last30DaysAgg,
    allTimeAgg,
    deviceGroups,
    topPages,
    recentVisitors,
  ] = await Promise.all([
    // 1. Thống kê hôm nay
    prisma.trafficStat.findUnique({ where: { date: today } }),

    // 2. Thống kê hôm qua
    prisma.trafficStat.findUnique({ where: { date: yesterday } }),

    // 3. Thống kê 7 ngày gần nhất
    prisma.trafficStat.findMany({
      where: {
        date: { in: last7DaysList },
      },
    }),

    // 4. Tổng 30 ngày gần nhất
    prisma.trafficStat.aggregate({
      _sum: { visitors: true, pageviews: true },
      where: {
        date: { gte: thirtyDaysAgoStr },
      },
    }),

    // 5. Tổng toàn thời gian
    prisma.trafficStat.aggregate({
      _sum: { visitors: true, pageviews: true },
    }),

    // 6. Phân bổ thiết bị trong 30 ngày qua
    prisma.dailyVisitor.groupBy({
      by: ["deviceType"],
      _count: { id: true },
      where: {
        date: { gte: thirtyDaysAgoStr },
      },
    }),

    // 7. Top 8 trang được xem nhiều nhất
    prisma.pageviewStat.findMany({
      take: 8,
      orderBy: { views: "desc" },
    }),

    // 8. 10 khách truy cập mới nhất gần đây
    prisma.dailyVisitor.findMany({
      take: 10,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        date: true,
        deviceType: true,
        userAgent: true,
        pageviews: true,
        lastPath: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  // Ghép dữ liệu cho biểu đồ 7 ngày (đảm bảo đủ cả 7 ngày kể cả ngày chưa có data)
  const chartPoints = last7DaysList.map((dStr) => {
    const found = last7DaysStats.find((s) => s.date === dStr);
    const [, mm, dd] = dStr.split("-");
    return {
      date: dStr,
      label: `${dd}/${mm}`,
      visitors: found ? found.visitors : 0,
      pageviews: found ? found.pageviews : 0,
    };
  });

  const total7DaysVisitors = chartPoints.reduce((sum, p) => sum + p.visitors, 0);
  const total7DaysPageviews = chartPoints.reduce((sum, p) => sum + p.pageviews, 0);

  // Chuẩn hóa phân bổ thiết bị
  let desktopCount = 0;
  let mobileCount = 0;
  let tabletCount = 0;
  deviceGroups.forEach((g) => {
    if (g.deviceType === "Desktop") desktopCount += g._count.id;
    else if (g.deviceType === "Mobile") mobileCount += g._count.id;
    else if (g.deviceType === "Tablet") tabletCount += g._count.id;
  });
  const totalDevices = desktopCount + mobileCount + tabletCount || 1;

  return {
    today: {
      visitors: todayStat?.visitors || 0,
      pageviews: todayStat?.pageviews || 0,
    },
    yesterday: {
      visitors: yesterdayStat?.visitors || 0,
      pageviews: yesterdayStat?.pageviews || 0,
    },
    last7Days: {
      visitors: total7DaysVisitors,
      pageviews: total7DaysPageviews,
      chart: chartPoints,
    },
    last30Days: {
      visitors: last30DaysAgg._sum.visitors || 0,
      pageviews: last30DaysAgg._sum.pageviews || 0,
    },
    allTime: {
      visitors: allTimeAgg._sum.visitors || 0,
      pageviews: allTimeAgg._sum.pageviews || 0,
    },
    devices: {
      desktop: { count: desktopCount, percent: Math.round((desktopCount / totalDevices) * 100) },
      mobile: { count: mobileCount, percent: Math.round((mobileCount / totalDevices) * 100) },
      tablet: { count: tabletCount, percent: Math.round((tabletCount / totalDevices) * 100) },
    },
    topPages,
    recentVisitors,
  };
}
