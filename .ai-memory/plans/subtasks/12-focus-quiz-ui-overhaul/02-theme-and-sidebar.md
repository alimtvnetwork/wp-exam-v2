# Subtask 02 — Theme & Sidebar Fixes

**Parent task:** `12-focus-quiz-ui-overhaul`
**Spec:** `02-spec/21-app/03-focus-quiz-runner-ui-overhaul/03-theme-and-contrast.md`
**Status:** pending

## Owned Files

- `src/lib/theme-context.tsx` — muted-foreground and muted token corrections
- `src/components/admin/wp-admin-sidebar.tsx` — hover and active state classes

> [!IMPORTANT]
> These are the ONLY files this subtask may modify. Do not touch any other file.

---

## Steps

### Step 1 — Dracula `--muted-foreground` Boost

**File:** `src/lib/theme-context.tsx`
**Target:** `THEME_CONFIGS` → `dracula` entry → `hslValues` object

Find the exact line:

```ts
'--muted-foreground': '225 25% 70%',
```

Replace with:

```ts
'--muted-foreground': '225 25% 82%',
```

**Rationale:** Increases lightness from 70% → 82% so inactive sidebar nav items (`text-muted-foreground`) are clearly legible against the `#282A36` panel background.

---

### Step 2 — Dracula `--muted` Active Background Lift

**File:** `src/lib/theme-context.tsx`
**Target:** `THEME_CONFIGS` → `dracula` entry → `hslValues` object

Find the exact line:

```ts
'--muted': '232 14% 24%',
```

Replace with:

```ts
'--muted': '232 14% 28%',
```

**Rationale:** The active sidebar item uses `bg-muted`. Lifting from 24% → 28% lightness creates a perceptible distinction from the card/panel background (`--card: 231 15% 18%`), making the active state recognizable.

---

### Step 3 — Purple `--muted-foreground` Boost

**File:** `src/lib/theme-context.tsx`
**Target:** `THEME_CONFIGS` → `purple` entry → `hslValues` object

Find the exact line:

```ts
'--muted-foreground': '240 15% 75%',
```

Replace with:

```ts
'--muted-foreground': '240 15% 82%',
```

**Rationale:** The deep violet background (`#0F0E1E`) makes 75% lightness borderline for WCAG AA. Boosting to 82% ensures sidebar text is clearly readable per AGENTS.md §9 white-text-on-deep-violet requirement.

---

### Step 4 — Sidebar Hover Class Replacement

**File:** `src/components/admin/wp-admin-sidebar.tsx`

Search for all button `className` strings containing `hover:bg-muted/80` on nav item buttons.

Replace each occurrence of:

```
hover:bg-muted/80
```

with:

```
hover:bg-accent/60
```

**Rationale:** On dark themes, `--muted` at 24–28% lightness with 80% opacity produces a visually imperceptible hover. `--accent` is a more saturated hue per each theme, providing a clearly visible hover indicator.

---

### Step 5 — Active Sidebar Item Ring

**File:** `src/components/admin/wp-admin-sidebar.tsx`

Locate the active nav item button. Its `className` should include `bg-muted text-foreground` (or equivalent active condition classes).

Append to the active button's `className`:

```
ring-1 ring-primary/30
```

The complete active class set should read:

```
bg-muted text-foreground ring-1 ring-primary/30
```

**Rationale:** A 1px luminous ring using `--primary` at 30% opacity provides a subtle but recognizable active indicator consistent with the `#3A3568` luminous-border convention defined in AGENTS.md §9 for the Purple theme.

---

## Acceptance Criteria

- [ ] Dracula theme: `--muted-foreground` is `225 25% 82%` in `theme-context.tsx`
- [ ] Dracula theme: `--muted` is `232 14% 28%` in `theme-context.tsx`
- [ ] Purple theme: `--muted-foreground` is `240 15% 82%` in `theme-context.tsx`
- [ ] Riseup Asia theme tokens are unchanged (no modifications made)
- [ ] `hover:bg-muted/80` replaced with `hover:bg-accent/60` on all sidebar nav buttons
- [ ] Active sidebar button includes `ring-1 ring-primary/30` class
- [ ] Gold (`#E8C547`) is not used as any sidebar text, hover background, or surface fill
