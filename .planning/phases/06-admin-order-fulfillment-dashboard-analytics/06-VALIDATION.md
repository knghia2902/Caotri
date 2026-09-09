---
phase: 6
slug: admin-order-fulfillment-dashboard-analytics
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-09-09
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js / tsx runtime test suite (`scripts/test-order-admin.ts`) + Next.js build & typecheck |
| **Config file** | `package.json`, `tsconfig.json` |
| **Quick run command** | `npx tsx scripts/test-order-admin.ts` |
| **Full suite command** | `npm run build && npx tsx scripts/test-order-admin.ts` |
| **Estimated runtime** | ~8 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsx scripts/test-order-admin.ts`
- **Before `/gsd-verify-work`:** Full suite must be green (`npm run build`)
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | ORDER-01 | T-06-01 | Phân quyền RBAC bảo vệ Server Actions và trang admin | integration | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | ORDER-01 | T-06-02 | Doanh thu thực tế vs Doanh thu tiềm năng tách bạch chuẩn xác | unit | `npx tsx scripts/test-order-admin.ts` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | ORDER-02, ORDER-04 | T-06-03 | Chỉ role ADMIN/STAFF mới được đổi trạng thái đơn | integration | `npx tsx scripts/test-order-admin.ts` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | ORDER-02 | — | Tabs lọc và tìm kiếm theo mã/SĐT hoạt động trơn tru | integration | `npm run build` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 3 | ORDER-03, ORDER-04 | T-06-04 | Ghi chú nội bộ staff độc lập với ghi chú của khách | integration | `npx tsx scripts/test-order-admin.ts` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 3 | ORDER-03 | — | Bộ nút liên hệ 1-Click và bản in phiếu giao hàng | integration | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Schema update: Bổ sung `adminNotes String?` vào model `Order` trong `prisma/schema.prisma` và chạy `npx prisma db push`.
- [x] Test suite template: `scripts/test-order-admin.ts` kiểm thử toàn bộ 7 kịch bản nghiệp vụ đơn hàng.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bản in phiếu giao hàng `@media print` | ORDER-03 | Yêu cầu kiểm tra giao diện in thực tế trên trình duyệt | Nhấn nút "In phiếu giao hàng" hoặc `Ctrl+P`, kiểm tra sidebar và header được ẩn, chỉ phiếu giao hàng được hiển thị |
| Nút mở Zalo chat theo SĐT | ORDER-03 | Mở ứng dụng Zalo bên ngoài trình duyệt | Bấm nút "Mở Zalo chat" trên trang chi tiết đơn, kiểm tra mở đúng URL `https://zalo.me/[customerPhone]` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-09
