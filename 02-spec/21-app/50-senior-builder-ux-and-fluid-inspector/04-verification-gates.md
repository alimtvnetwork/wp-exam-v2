# Spec 50: Verification Gates & Quality Checklist

Spec Reference: [01-overview.md](./01-overview.md)

## 1. Quality Invariants

| Gate ID | Verification Check | Acceptance Criteria |
|---|---|---|
| **VG-50-01** | Top Bar Compaction | Loose button count <= 4 in the primary top toolbar. Secondary tools consolidated into `Tools ▾` Radix DropdownMenu. |
| **VG-50-02** | Live URL Integration | Live URL is integrated cleanly into the header region without consuming a redundant full-width card. |
| **VG-50-03** | Fluid Right-Hand Inspector | `FieldPalette`, `Outline`, and `Config` tabs render cleanly with responsive scrolling, category filters, and zero visual stutter. |
| **VG-50-04** | Alignment & Spacing | All header buttons share uniform height (`h-8`), center vertical alignment, and consistent padding. |
| **VG-50-05** | Regression Suite | 100% pass across all unit tests (`src/test/*.test.ts`). |
| **VG-50-06** | Type & Lint Gates | `npx tsc --noEmit` exits with 0 errors; `npm run lint` exits with 0 errors. |

---

## 2. Manual Verification Scenarios

1. **Compacted Actions Dropdown:**
   - Click `Tools ▾` -> Verify options for `Import from Google Forms`, `Branching Flow`, `JSON Schema Studio`, `AI Assistant`, and `Copy Live Share Link` render cleanly.
   - Click `Import from Google Forms` -> Modal opens without delay.
2. **Preview Trigger:**
   - Click `Preview` -> Interactive modal runner opens.
   - Click secondary `Open Live URL in New Tab` -> Dedicated `/preview` opens in new window.
3. **Inspector Tabs:**
   - Switch between `Fields`, `Outline`, and `Config` -> State is preserved, smooth transitions.
   - Click a question in `Outline` -> Canvas smoothly scrolls to center the question card.
