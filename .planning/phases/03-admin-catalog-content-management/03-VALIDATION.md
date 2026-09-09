---
phase: 3
slug: admin-catalog-content-management
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-09
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js TS verification script + Next.js build verification |
| **Config file** | `package.json` / `tsconfig.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npx tsx scripts/test-catalog.ts && npm run build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npx tsx scripts/test-catalog.ts && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | ADMIN-01 | T-03-01 | Category CRUD Server Actions validate inputs | integration | `npx tsx scripts/test-catalog.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ADMIN-01 | T-03-02 | Category Table & Modal Dialog UI render properly | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | ADMIN-02 | T-03-03 | Product CRUD Server Actions handle JSON images & specs | integration | `npx tsx scripts/test-catalog.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | ADMIN-04 | T-03-04 | Quick-Toggle actions update isFeatured and inStock | integration | `npx tsx scripts/test-catalog.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | ADMIN-03 | T-03-05 | Product List and Product Form (New/Edit) compile cleanly | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | ADMIN-05 | T-03-06 | Banner Card Grid CRUD & toggle isActive | integration | `npx tsx scripts/test-catalog.ts` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | ADMIN-05 | T-03-07 | Site Settings Server Action enforces ADMIN role | integration | `npx tsx scripts/test-catalog.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/test-catalog.ts` — test script for Category, Product, Banner, and SiteSetting Server Actions and slugify utility

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dynamic Specs Category presets switching & Images Gallery preview | ADMIN-02, ADMIN-03 | Interactive client UI flow | Vào `/admin/products/new`, chọn từng danh mục, kiểm tra các trường specs tự động điền và thêm/xóa ảnh xem preview |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-09
