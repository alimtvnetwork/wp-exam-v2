# App UI — Design Tokens & Components

Version: 1.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the design tokens, CSS variables, and component architecture for the React SPA in the WordPress Quiz Plugin (`wp-exam`). It integrates Tailwind CSS with shadcn/ui component primitives, scoped cleanly to prevent bleed into the broader WordPress admin dashboard.

---

## 1. CSS Scope & Container

To prevent CSS collisions with WordPress admin styles, all React SPA elements are wrapped in a container class:

```html
<div id="wp-exam-app" class="wp-exam-theme"></div>
```

---

## 2. Design Tokens & Color Palette

All colors are mapped to CSS custom variables in `src/index.css`:

```css
:root {
  --wp-exam-primary: hsl(222.2 47.4% 11.2%);
  --wp-exam-primary-foreground: hsl(210 40% 98%);
  --wp-exam-background: hsl(0 0% 100%);
  --wp-exam-foreground: hsl(222.2 84% 4.9%);
  --wp-exam-muted: hsl(210 40% 96.1%);
  --wp-exam-muted-foreground: hsl(215.4 16.3% 46.9%);
  --wp-exam-border: hsl(214.3 31.8% 91.4%);
  --wp-exam-destructive: hsl(0 84.2% 60.2%);
  --wp-exam-destructive-foreground: hsl(210 40% 98%);
  --wp-exam-radius: 0.5rem;
}
```

### Semantic Token Mapping

| Token Name | Hex Value | Usage |
|------------|-----------|-------|
| `primary` | `#0f172a` | Primary call to action buttons, active navigation tabs. |
| `primary-foreground`| `#f8fafc` | Text on primary buttons. |
| `background` | `#ffffff` | Panel backgrounds, modal content cards. |
| `muted` | `#f1f5f9` | Table alternate rows, disabled states, inactive drag handles. |
| `border` | `#e2e8f0` | Card borders, input outlines, table divider lines. |
| `destructive` | `#ef4444` | Delete quiz, remove question button. |
| `success` | `#22c55e` | Correct answer indicators, submission confirmation badges. |

---

## 3. Typography Scale

- **Font Family:** Inherits system sans-serif: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif` to blend seamlessly with WP Admin.
- **H1:** `text-2xl font-bold tracking-tight` (Admin page title).
- **H2:** `text-xl font-semibold` (Card headings, modal titles).
- **H3:** `text-base font-medium` (Question labels).
- **Body:** `text-sm text-slate-600` (Descriptions, answers, table content).
- **Caption:** `text-xs text-slate-400` (Timestamps, metadata).

---

## 4. Reusable Component Inventory

| Component | File Path | Props Interface |
|-----------|-----------|-----------------|
| Button | `src/components/ui/button.tsx` | `ButtonProps { variant, size, isLoading }` |
| Card | `src/components/ui/card.tsx` | `CardProps { title, description, children }` |
| Dialog | `src/components/ui/dialog.tsx` | `DialogProps { isOpen, onClose, title, children }` |
| Badge | `src/components/ui/badge.tsx` | `BadgeProps { variant: 'default' | 'success' | 'destructive' }` |
| Input | `src/components/ui/input.tsx` | Standard HTML input with focus ring. |

---

## Cross-References

- [Core Design System](../07-design-system/01-index.md)
- [Quiz Feature Overview](../21-app/04-quiz-feature/00-overview.md)
- [File Topology](../21-app/04-quiz-feature/01-file-topology.md)
