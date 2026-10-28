---
status: in-progress
created: 2026-10-28
slug: gmail-order-notifications
---

# Quick Task: Gmail Order Notifications System

## Objective
Implement an automated Gmail notification system via Nodemailer for Caotri Gear:
1. Send instant email alerts to the Admin when a customer places an order.
2. Provide a clean, minimal HTML email template matching Caotri Gear's design.
3. Add a dedicated "Email Notifications (Gmail SMTP)" management block in `/admin/settings`.
4. Include a 1-click "Send Test Email" feature with real-time feedback.
5. Provide step-by-step guidance on setting up Google App Passwords.

## Implementation Steps
1. Install `nodemailer` and `@types/nodemailer`.
2. Create `src/lib/email.ts` with:
   - Config loader from `SiteSetting` and fallback `.env`.
   - Minimalist HTML order alert template (logo, order code, customer info, items table, COD total, CTA button).
   - Core `sendEmail` helper.
   - `sendNewOrderNotification` function.
   - `testEmailAction` server action for verifying SMTP credentials.
3. Integrate `sendNewOrderNotification` into `src/app/actions/order.ts` (`createOrderAction`).
4. Update `src/components/admin/settings-form.tsx` to include the Gmail configuration UI, app password guide, and test email trigger.
5. Verify build with `npx tsc --noEmit` and `npm run build:local`.
6. Push to remotes (`caotri` & `origin`) and deploy to VPS.
