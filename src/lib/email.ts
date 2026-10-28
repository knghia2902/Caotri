"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { formatVND } from "@/lib/utils";

export interface EmailConfig {
  enabled: boolean;
  adminNotifyEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  fromName: string;
  shopName: string;
  siteUrl: string;
}

/**
 * Nạp cấu hình Email từ bảng SiteSetting (có fallback qua biến môi trường .env)
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  const keys = [
    "email_notify_enabled",
    "admin_notify_email",
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_pass",
    "smtp_from_name",
    "shop_name",
    "site_url",
  ];

  try {
    const records = await prisma.siteSetting.findMany({
      where: { key: { in: keys } },
    });

    const map = new Map(records.map((r) => [r.key, r.value]));

    const enabled = (map.get("email_notify_enabled") ?? process.env.EMAIL_NOTIFY_ENABLED ?? "true") === "true";
    const smtpUser = map.get("smtp_user") || process.env.SMTP_USER || "";
    const smtpPass = map.get("smtp_pass") || process.env.SMTP_PASS || "";
    const adminNotifyEmail = map.get("admin_notify_email") || process.env.ADMIN_NOTIFY_EMAIL || smtpUser;
    const smtpHost = map.get("smtp_host") || process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(map.get("smtp_port") || process.env.SMTP_PORT || "465");
    const fromName = map.get("smtp_from_name") || map.get("shop_name") || "Caotri Gear";
    const shopName = map.get("shop_name") || "Caotri Gear";
    const siteUrl = map.get("site_url") || process.env.NEXTAUTH_URL || process.env.SITE_URL || "http://localhost:3000";

    return {
      enabled,
      adminNotifyEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      fromName,
      shopName,
      siteUrl,
    };
  } catch {
    return {
      enabled: true,
      adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL || "",
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
      smtpPort: 465,
      smtpUser: process.env.SMTP_USER || "",
      smtpPass: process.env.SMTP_PASS || "",
      fromName: "Caotri Gear",
      shopName: "Caotri Gear",
      siteUrl: process.env.SITE_URL || "http://localhost:3000",
    };
  }
}

/**
 * Tạo Nodemailer Transporter từ cấu hình
 */
function createTransporter(config: EmailConfig) {
  // Loại bỏ khoảng trắng thường gặp khi copy mật khẩu ứng dụng Google (ví dụ: "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const cleanPass = config.smtpPass.replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465, // true cho port 465 SSL, false cho port 587 STARTTLS
    auth: {
      user: config.smtpUser.trim(),
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Gửi email chung
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  customConfig,
}: {
  to?: string;
  subject: string;
  html: string;
  text?: string;
  customConfig?: Partial<EmailConfig>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const baseConfig = await getEmailConfig();
    const config: EmailConfig = { ...baseConfig, ...customConfig };

    if (!config.enabled && !customConfig) {
      return { success: false, error: "Tính năng thông báo qua email đang bị tắt trong Cài đặt." };
    }

    if (!config.smtpUser || !config.smtpPass) {
      return {
        success: false,
        error: "Chưa cấu hình tài khoản Gmail gửi thư hoặc Mật khẩu ứng dụng trong Cài đặt.",
      };
    }

    const recipient = to || config.adminNotifyEmail;
    if (!recipient) {
      return { success: false, error: "Chưa có địa chỉ email nhận thông báo." };
    }

    const transporter = createTransporter(config);

    const fromAddress = `"${config.fromName}" <${config.smtpUser.trim()}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      subject,
      html,
      text: text || "Vui lòng xem nội dung email bằng trình duyệt hỗ trợ HTML.",
    });

    return { success: true };
  } catch (err: any) {
    console.error("[Email Error]:", err);
    let msg = err.message || "Lỗi không xác định khi gửi email qua Gmail SMTP.";
    if (msg.includes("535") || msg.includes("BadCredentials") || msg.includes("Username and Password not accepted")) {
      msg = "Gmail từ chối đăng nhập. Hãy đảm bảo bạn dùng 'Mật khẩu ứng dụng' (16 ký tự do Google cấp), KHÔNG dùng mật khẩu đăng nhập tài khoản thông thường.";
    } else if (msg.includes("ETIMEDOUT") || msg.includes("ESOCKET")) {
      msg = "Không thể kết nối đến máy chủ smtp.gmail.com. Vui lòng kiểm tra lại kết nối mạng hoặc port.";
    }
    return { success: false, error: msg };
  }
}

/**
 * Gửi thông báo đơn hàng mới về email quản trị viên
 */
export async function sendNewOrderNotification(order: {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string | null;
  totalAmount: number;
  createdAt?: Date;
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
  }>;
}) {
  try {
    const config = await getEmailConfig();
    if (!config.enabled || !config.smtpUser || !config.smtpPass || !config.adminNotifyEmail) {
      console.log("[Email Alert] Bỏ qua gửi email do chưa bật hoặc chưa cấu hình SMTP.");
      return;
    }

    const orderTime = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(order.createdAt || new Date());

    const cleanPhone = order.customerPhone.replace(/\D/g, "");
    const adminOrderUrl = `${config.siteUrl}/admin/orders/${order.id}`;

    // Tạo HTML danh sách sản phẩm
    const itemsRows = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #E7E7E3;">
          <td style="padding: 12px 8px; font-weight: 600; color: #111111; font-size: 13px;">
            ${item.productName}
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #555550; font-size: 13px;">
            x${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; font-family: monospace; font-size: 13px; color: #111111;">
            ${formatVND(item.price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đơn hàng mới #${order.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F7F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F7F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Container chính -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E7E7E3; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #111111; padding: 24px 28px; text-align: left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; text-transform: uppercase;">
                      ${config.shopName}
                    </span>
                    <span style="display: block; font-size: 11px; color: #A3A39D; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                      Hệ Thống Thông Báo Đơn Hàng Tự Động
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #21A366; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ĐƠN MỚI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tóm tắt đơn hàng -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px 0; color: #111111;">
                Có 1 đơn hàng mới đang chờ xử lý!
              </h1>
              <p style="font-size: 13px; color: #74746E; margin: 0 0 20px 0;">
                Mã đơn hàng: <strong style="color: #111111; font-family: monospace;">#${order.orderNumber}</strong> • Đặt lúc ${orderTime}
              </p>

              <!-- Card Tổng tiền -->
              <table role="presentation" width="100%" style="background-color: #FAFAFA; border: 1px solid #E7E7E3; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="font-size: 13px; color: #74746E;">Tổng tiền thanh toán (COD):</td>
                  <td align="right" style="font-size: 20px; font-weight: 800; color: #21A366; font-family: monospace;">
                    ${formatVND(order.totalAmount)}
                  </td>
                </tr>
              </table>

              <!-- Thông tin người nhận -->
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555550; margin: 0 0 12px 0;">
                Thông tin người mua:
              </h2>
              <table role="presentation" width="100%" style="background-color: #FFFFFF; border: 1px solid #E7E7E3; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #74746E; width: 110px;">Họ và tên:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #111111;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #74746E;">Số điện thoại:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #111111;">
                    <a href="tel:${cleanPhone}" style="color: #2563EB; text-decoration: none;">
                      ${order.customerPhone} (Bấm để gọi ngay)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #74746E; vertical-align: top;">Địa chỉ nhận:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #111111; line-height: 1.4;">${order.customerAddress}</td>
                </tr>
                ${
                  order.customerNotes
                    ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #74746E; vertical-align: top;">Khách ghi chú:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #D94A4A; font-weight: 500; font-style: italic;">
                    "${order.customerNotes}"
                  </td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Danh sách sản phẩm -->
              <h2 style="font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555550; margin: 0 0 12px 0;">
                Sản phẩm đặt mua:
              </h2>
              <table role="presentation" width="100%" style="border-collapse: collapse; margin-bottom: 28px;">
                <thead>
                  <tr style="border-bottom: 2px solid #111111; text-align: left;">
                    <th style="padding: 8px 8px; font-size: 11px; text-transform: uppercase; color: #74746E;">Sản phẩm</th>
                    <th style="padding: 8px 8px; font-size: 11px; text-transform: uppercase; color: #74746E; text-align: center;">SL</th>
                    <th style="padding: 8px 8px; font-size: 11px; text-transform: uppercase; color: #74746E; text-align: right;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Nút CTA mở Admin -->
              <table role="presentation" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background-color: #111111; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-align: center;">
                      Xem & Xử Lý Đơn Hàng Trong Admin →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="text-align: center; font-size: 11px; color: #A3A39D; margin: 0;">
                Hoặc truy cập: <a href="${adminOrderUrl}" style="color: #74746E;">${adminOrderUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAFAFA; border-top: 1px solid #E7E7E3; padding: 18px 28px; text-align: center;">
              <p style="font-size: 11px; color: #74746E; margin: 0;">
                Email thông báo tự động từ hệ thống thương mại điện tử <strong>${config.shopName}</strong>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendEmail({
      to: config.adminNotifyEmail,
      subject: `🔔 [ĐƠN HÀNG MỚI] #${order.orderNumber} - ${order.customerName} (${formatVND(order.totalAmount)})`,
      html: htmlContent,
      text: `Có đơn hàng mới #${order.orderNumber} từ ${order.customerName} (${order.customerPhone}) - Tổng: ${formatVND(order.totalAmount)}. Vui lòng truy cập admin: ${adminOrderUrl}`,
    });
  } catch (error) {
    console.error("[Email Notification Failed]:", error);
  }
}

/**
 * Server Action gửi email thử nghiệm (Test SMTP connection)
 */
export async function testSmtpConnectionAction(customConfig: {
  smtp_user?: string;
  smtp_pass?: string;
  admin_notify_email?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_from_name?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const config = await getEmailConfig();

    const mergedConfig: Partial<EmailConfig> = {
      smtpUser: customConfig.smtp_user?.trim() || config.smtpUser,
      smtpPass: customConfig.smtp_pass?.trim() || config.smtpPass,
      adminNotifyEmail: customConfig.admin_notify_email?.trim() || config.adminNotifyEmail,
      smtpHost: customConfig.smtp_host?.trim() || config.smtpHost,
      smtpPort: Number(customConfig.smtp_port || config.smtpPort),
      fromName: customConfig.smtp_from_name?.trim() || config.fromName,
    };

    if (!mergedConfig.smtpUser) {
      return { success: false, error: "Vui lòng nhập Email Gmail gửi thư." };
    }
    if (!mergedConfig.smtpPass) {
      return { success: false, error: "Vui lòng nhập Mật khẩu ứng dụng Gmail (16 ký tự)." };
    }
    if (!mergedConfig.adminNotifyEmail) {
      return { success: false, error: "Vui lòng nhập Email quản trị viên nhận thông báo." };
    }

    const testTime = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date());

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E7E7E3; border-radius: 12px; background-color: #FFFFFF;">
        <h2 style="color: #21A366; margin-top: 0;">🎉 Kết nối Gmail SMTP thành công!</h2>
        <p style="color: #111111; font-size: 14px; line-height: 1.5;">
          Hệ thống <strong>${mergedConfig.fromName || "Caotri Gear"}</strong> đã kết nối thành công với Gmail của bạn và sẵn sàng gửi thông báo mỗi khi có đơn hàng mới từ khách hàng.
        </p>
        <div style="background-color: #FAFAFA; border: 1px solid #E7E7E3; border-radius: 8px; padding: 12px; font-size: 12px; color: #555550; margin: 16px 0;">
          <div>• Email gửi: <strong>${mergedConfig.smtpUser}</strong></div>
          <div>• Email nhận: <strong>${mergedConfig.adminNotifyEmail}</strong></div>
          <div>• Thời gian kiểm tra: <strong>${testTime}</strong></div>
        </div>
        <p style="color: #74746E; font-size: 12px; margin-bottom: 0;">
          Bạn không cần phản hồi email này. Chúc bạn kinh doanh phát đạt! 🚀
        </p>
      </div>
    `;

    const res = await sendEmail({
      to: mergedConfig.adminNotifyEmail,
      subject: `[${mergedConfig.fromName || "Caotri Gear"}] 🎉 Kiểm tra kết nối Email thông báo thành công!`,
      html: htmlContent,
      customConfig: mergedConfig,
    });

    if (res.success) {
      return {
        success: true,
        message: `Đã gửi email thử nghiệm thành công tới "${mergedConfig.adminNotifyEmail}". Hãy kiểm tra hộp thư đến (Inbox) hoặc mục Thư rác/Spam.`,
      };
    } else {
      return { success: false, error: res.error };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối máy chủ gửi thư." };
  }
}
