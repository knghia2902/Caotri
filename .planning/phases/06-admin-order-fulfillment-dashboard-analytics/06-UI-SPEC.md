---
phase: 6
slug: admin-order-fulfillment-dashboard-analytics
status: approved
shadcn_initialized: false
preset: none
created: 2026-09-09
---

# Phase 6 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated per Clean Tech Minimalist specification in DESIGN.md.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Tailwind CSS |
| Preset | Clean Tech Minimalist |
| Component library | Custom components (`src/components/ui/`) |
| Icon library | Lucide React |
| Font | Inter, sans-serif |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, badge padding |
| sm | 8px | Form inputs padding, button gap, compact spacing |
| md | 16px | Card padding, table cell padding, element gap |
| lg | 24px | Section padding, modal dialog padding |
| xl | 32px | Grid gaps, layout spacing |
| 2xl | 48px | Button height, major section breaks |
| 3xl | 64px | Page container margins |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 14px | 400 / 500 | 1.5 |
| Label | 12px | 500 / 600 | 1.4 |
| Heading | 20px | 600 | 1.3 |
| Display | 24px / 28px | 700 | 1.2 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F7F7F5` | Nền trang Admin, background chung |
| Secondary (30%) | `#FFFFFF` | Nền Card, nền Bảng đơn hàng, Sidebar `#111111` |
| Accent (10%) | `#111111` / `#21A366` | Nút CTA Primary đen tuyền, Badge hoàn thành xanh lá |
| Destructive | `#D94A4A` | Nút và Badge trạng thái Hủy đơn hàng |

Accent reserved for:
- Nút CTA chính ("Lưu ghi chú", "Xem chi tiết")
- Cột mốc hoàn thành đơn hàng (Badge `COMPLETED`)
- Cột mốc trong tiến trình (`PENDING` vàng `#D99A24`, `CONTACTED` xanh dương `#2B6CB0`, `SHIPPING` tím `#5B46BA`)

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "Lưu ghi chú nội bộ", "Xem chi tiết đơn hàng", "In phiếu giao hàng" |
| Empty state heading | "Chưa có đơn hàng nào" |
| Empty state body | "Hiện tại chưa có đơn hàng nào phù hợp với bộ lọc tìm kiếm. Vui lòng chọn tab khác hoặc xóa từ khóa." |
| Error state | "Không tìm thấy đơn hàng yêu cầu. Vui lòng kiểm tra lại đường dẫn." |
| Destructive confirmation | "Hủy đơn hàng: Bạn có chắc chắn muốn hủy đơn hàng này? Thao tác này sẽ cập nhật trạng thái đơn thành Đã hủy và ghi nhận lý do vào nhật ký." |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| Internal / Lucide | Lucide React icons, Tailwind UI cards, custom SVG bar chart | verified |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-09-09
