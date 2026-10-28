---
status: complete
completed: 2026-10-28
slug: gmail-order-notifications
---

# Quick Task Summary: Gmail Order Notifications System

## Accomplished
1. **Installed dependencies**:
   - `nodemailer` and `@types/nodemailer`.
2. **Created Core Email Module (`src/lib/email.ts`)**:
   - `getEmailConfig()`: Dynamic config loaded from `SiteSetting` database table with `.env` fallback.
   - `sendEmail()`: Robust Nodemailer Gmail SMTP transporter handling SSL 465 / TLS 587, with friendly error mapping for common Google App Password errors.
   - `sendNewOrderNotification()`: Responsive Minimalist HTML template delivering order summary, customer details with clickable phone call link, items table, and admin order deep link.
   - `testSmtpConnectionAction()`: Server action allowing 1-click test emails from the settings form before saving.
3. **Integrated with Order Creation (`src/app/actions/order.ts`)**:
   - In `createOrderAction`, asynchronously dispatch `sendNewOrderNotification` without blocking user checkout response.
4. **Enhanced Admin Settings UI (`src/components/admin/settings-form.tsx`)**:
   - Added Block 4: "Thông báo Email Đơn hàng (Gmail SMTP)" with toggle switch, admin recipient email, sender Gmail, app password with show/hide toggle, and sender display name.
   - Added step-by-step Google App Password guide with direct links.
   - Added "Gửi email kiểm tra (Test)" button with real-time toast feedback.
5. **Live Production Verification (VPS 103.27.238.50)**:
   - User configured `nguyenlecaotri6900@gmail.com` with Google App Password in `/admin/settings`.
   - Verified automated removal of spaces from App Password.
   - Successfully authenticated with Google SMTP (`smtp.gmail.com`).
   - Dispatched test order `DH-FMT1Q2` with 100% success (`[Email Alert] Đã gửi thông báo đơn hàng #DH-FMT1Q2 thành công tới nguyenlecaotri6900@gmail.com`).
   - Production PM2 service online and functioning properly.
