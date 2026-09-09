---
phase: 4
slug: storefront-discovery-browsing-experience
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js TS verification script + Next.js build verification |
| **Config file** | `package.json` / `tsconfig.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npx tsx scripts/test-storefront.ts && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npx tsx scripts/test-storefront.ts && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | STORE-01 | T-04-01 | Storefront Header, Footer and Hero Slider render dynamically from DB | integration | `npx tsx scripts/test-storefront.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | STORE-01 | T-04-02 | Home page showcases categories, featured and new products | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | STORE-03 | T-04-03 | Instant Search Popover searches products with debounce | integration | `npx tsx scripts/test-storefront.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | STORE-02, STORE-04 | T-04-04 | Catalog & Category browsing with Price Range Slider and sorting | integration | `npx tsx scripts/test-storefront.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | STORE-05 | T-04-05 | Product details page renders gallery, specs and pricing | integration | `npx tsx scripts/test-storefront.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 3 | STORE-06 | T-04-06 | Floating Contact Dock renders Hotline, Zalo and Messenger links | integration | `npx tsx scripts/test-storefront.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/test-storefront.ts` — test script for Storefront queries (Banners, Categories, Featured/New products, Price range filtering, Search, and SiteSettings)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero Banner Slider Autoplay & Pause on hover | STORE-01 | Interactive client timing flow | Vào trang chủ `/`, quan sát banner tự chạy sau 5s, rê chuột xem có tạm dừng không |
| Dual Price Range Slider dragging & real-time filter | STORE-04 | Interactive drag UI | Vào `/products`, kéo 2 đầu thanh trượt giá và kiểm tra danh sách sản phẩm cập nhật |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-09
