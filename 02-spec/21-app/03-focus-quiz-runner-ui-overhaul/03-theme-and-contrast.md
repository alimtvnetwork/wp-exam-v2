# 03 — Theme & Contrast Specification

Spec for task: `12-focus-quiz-ui-overhaul`
Related subtask plan: `.ai-memory/plans/subtasks/12-focus-quiz-ui-overhaul/02-theme-and-sidebar.md`

---

## 1. Problem Analysis — Admin Sidebar Contrast (Dracula + Purple)

### Dracula Theme

The admin sidebar (`src/components/admin/wp-admin-sidebar.tsx`) renders inactive nav items using the Tailwind utility `text-muted-foreground`. In the **Dracula** theme, the current value is:

```
--muted-foreground: 225 25% 70%
```

This resolves to approximately `#8D97C2`, which provides insufficient contrast against the card/panel background `--card: 231 15% 18%` (approx `#282A36`). Users with even modest visual impairments will struggle to distinguish inactive nav links from the surrounding panel.

Additionally, the **active state** uses `bg-muted text-foreground`. On Dracula:
- `--muted: 232 14% 24%` (approx `#363845`)
- `--card: 231 15% 18%` (approx `#282A36`)

The delta between `muted` and `card` is only ~6 lightness points, making the active highlight nearly invisible.

### Purple Theme

The Purple theme also uses `text-muted-foreground` for inactive sidebar items:

```
--muted-foreground: 240 15% 75%
```

While slightly more legible than Dracula's 70%, the deep violet background (`#0F0E1E`) makes this still borderline. Boosting to 82% lightness ensures WCAG AA compliance for text-on-dark.

---

## 2. Token Corrections (Exact Before → After Values per Theme)

All values are HSL triples applied to CSS custom properties in `src/lib/theme-context.tsx` inside the `THEME_CONFIGS` map.

### Dracula Theme — `hslValues` block

| CSS Variable          | Before              | After               | Rationale                                        |
|-----------------------|---------------------|---------------------|--------------------------------------------------|
| `--muted-foreground`  | `225 25% 70%`       | `225 25% 82%`       | Boost lightness 12 pts for sidebar text contrast |
| `--muted`             | `232 14% 24%`       | `232 14% 28%`       | Slight lift so active bg is distinct from --card |

### Purple Theme — `hslValues` block

| CSS Variable          | Before              | After               | Rationale                                        |
|-----------------------|---------------------|---------------------|--------------------------------------------------|
| `--muted-foreground`  | `240 15% 75%`       | `240 15% 82%`       | Legibility on `#0F0E1E` deep violet background   |

> [!NOTE]
> No changes to `--foreground`, `--primary`, `--accent`, or `--background` for either theme. Only the two tokens above are modified.

---

## 3. Sidebar Hover & Active State Improvements

### Hover State

**File:** `src/components/admin/wp-admin-sidebar.tsx`

Current Tailwind class on nav button: `hover:bg-muted/80`

On dark themes (`dracula`, `purple`, `riseup`), `--muted` at 24–28% lightness with 80% opacity produces a hover highlight that is visually imperceptible. The replacement:

```
hover:bg-accent/60
```

`--accent` is typically set to a more saturated hue per theme (e.g., purple/indigo on Dracula, violet on Purple), providing a clearly visible hover region without being garish.

### Active State

Current Tailwind classes on active nav button: `bg-muted text-foreground`

Add a luminous ring to reinforce active selection:

```
ring-1 ring-primary/30
```

This creates a subtle 1px inner border using the theme's primary color at 30% opacity — consistent with the `#3A3568` luminous-border convention in AGENTS.md §9 for the Purple theme, and proportionally appropriate for other dark themes.

Full proposed active class string:

```
bg-muted text-foreground ring-1 ring-primary/30
```

---

## 4. Riseup Asia Theme Validation

Per `AGENTS.md §9` (BINDING), the Riseup Asia brand rules are:

| Rule | Expected Value | Spec Compliance |
|------|---------------|-----------------|
| Background | `#0A0A14` (dark navy) | ✅ `--background: 240 38% 6%` resolves to ~`#09090F` — compliant |
| Primary text | `#F7F1E6` (cream) | ✅ `--foreground: 38 33% 94%` resolves to ~`#F5EFDE` — compliant |
| Gold (`#E8C547`) | Active/selection indicator ONLY | ✅ Gold is mapped only to `--primary` on Riseup; sidebar active text uses `text-foreground`, not gold |
| `--muted-foreground` | Warm cream-grey | ✅ `38 22% 64%` is a warm mid-tone — keep unchanged |

**No token changes are required for the Riseup Asia theme.** It already satisfies all AGENTS.md §9 constraints.

> [!IMPORTANT]
> Gold (`#E8C547` / `--primary` in Riseup) MUST NOT be used as a sidebar text color, hover background, or surface fill. It is exclusively an active-indicator mark. This constraint is non-negotiable per AGENTS.md §9.

---

## 5. Implementation Instructions

Target file: `src/lib/theme-context.tsx`

### Step 1 — Dracula `--muted-foreground`

Locate the `dracula` key inside `THEME_CONFIGS`. Within its `hslValues` object, find:

```ts
'--muted-foreground': '225 25% 70%',
```

Change to:

```ts
'--muted-foreground': '225 25% 82%',
```

### Step 2 — Dracula `--muted`

In the same `dracula` `hslValues` block, find:

```ts
'--muted': '232 14% 24%',
```

Change to:

```ts
'--muted': '232 14% 28%',
```

### Step 3 — Purple `--muted-foreground`

Locate the `purple` key inside `THEME_CONFIGS`. Within its `hslValues` object, find:

```ts
'--muted-foreground': '240 15% 75%',
```

Change to:

```ts
'--muted-foreground': '240 15% 82%',
```

### Step 4 — Sidebar Hover Class

Target file: `src/components/admin/wp-admin-sidebar.tsx`

Find all occurrences of `hover:bg-muted/80` on nav button elements and replace with:

```
hover:bg-accent/60
```

### Step 5 — Sidebar Active Ring

In the same file, on the active nav button `className`, append:

```
ring-1 ring-primary/30
```

The full active className should include: `bg-muted text-foreground ring-1 ring-primary/30`
