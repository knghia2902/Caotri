---
phase: 2
slug: authentication-admin-rbac
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js TS verification script + Next.js build verification |
| **Config file** | `package.json` / `tsconfig.json` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npx tsx scripts/test-auth.ts && npm run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npx tsx scripts/test-auth.ts && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | AUTH-01 | T-02-01 | Verify password with bcrypt and issue JWT via jose | unit | `npx tsx scripts/test-auth.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | AUTH-02 | T-02-02 | Set and clear httpOnly secure session cookie | integration | `npx tsx scripts/test-auth.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | AUTH-02 | T-02-03 | Edge Middleware intercepts unauthenticated `/admin/*` | integration | `npm run build` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | AUTH-01 | T-02-04 | Render `/admin/login` split screen UI | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | AUTH-03 | T-02-05 | Admin Layout & Collapsible Sidebar with RBAC menu filter | unit | `npm run build` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | AUTH-03 | T-02-06 | Server Action & Middleware enforce role check for ADMIN/STAFF | integration | `npx tsx scripts/test-auth.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/test-auth.ts` — test script for JWT signing/verification, bcrypt checking, and RBAC helper functions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Split screen visual responsive & collapsible sidebar animation | AUTH-01, AUTH-03 | UI interaction and visual aesthetics | Mở trình duyệt tại `/admin/login` và `/admin`, kiểm tra form và sidebar trên mobile & desktop |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-09
