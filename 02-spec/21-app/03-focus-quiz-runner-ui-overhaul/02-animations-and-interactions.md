# Focus Quiz Runner — Animations & Interactions Spec

---

## 1. Option Card Animation System

### State Definitions

Option cards exist in three mutually exclusive visual states: **rest**, **hover**, and **selected**.

### Rest State

```
opacity: 0.75
background: theme.colors.cardBg
border-left: 3px solid transparent
transition: opacity 200ms ease, border-left-color 150ms ease, background-color 150ms ease
```

- No badge fill
- No checkmark visible
- Option text at normal weight

### Hover State

```
opacity: 1.0
background: theme.colors.cardHover      /* subtle tint */
border-left: 3px solid theme.colors.cardActiveBorder
```

Badge transition on hover:

```
transform: translateX(2px)
transition: transform 150ms ease
```

Text transition on hover:

```
/* option text container */
transition: transform 150ms ease
```

The option text itself may shift slightly right (e.g., `translateX(1px)`) to create a unified slide-in feel alongside the badge.

### Selected State

```
background: theme.colors.cardActiveBg
border-left: 3px solid theme.colors.cardActiveBorder
box-shadow: 0 0 16px {theme.colors.cardActiveBorder}44
```

- A/B/C badge: filled with `theme.colors.primary` background, white (`theme.colors.primaryText`) text, no border
- Checkmark: Lucide `<Check>` icon, color `#10B981`, positioned on the **right side** of the card (not inside the badge)

### React Implementation Pattern

```tsx
const isSelected = selectedOption === optIdx;
const cardStyle: React.CSSProperties = {
  opacity: isSelected ? 1.0 : 0.75,
  background: isSelected ? theme.colors.cardActiveBg : theme.colors.cardBg,
  borderLeft: isSelected
    ? `3px solid ${theme.colors.cardActiveBorder}`
    : '3px solid transparent',
  boxShadow: isSelected
    ? `0 0 16px ${theme.colors.cardActiveBorder}44`
    : 'none',
  transition:
    'opacity 200ms ease, border-left-color 150ms ease, background-color 150ms ease, box-shadow 200ms ease',
};
```

For hover state, use a `useState<number | null>` hover tracker:

```tsx
const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

const isHovered = hoveredIdx === optIdx;

// Override opacity + background when hovered and not selected
const effectiveOpacity = isSelected ? 1.0 : isHovered ? 1.0 : 0.75;
const effectiveBg = isSelected
  ? theme.colors.cardActiveBg
  : isHovered
  ? theme.colors.cardHover
  : theme.colors.cardBg;
const effectiveBorderColor = isSelected || isHovered
  ? theme.colors.cardActiveBorder
  : 'transparent';
```

Bind handlers to each card:

```tsx
onMouseEnter={() => setHoveredIdx(optIdx)}
onMouseLeave={() => setHoveredIdx(null)}
```

---

## 2. A/B/C Badge Spec

### Character Generation

```ts
const badgeLabel = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D', ...
```

### Base (Tailwind + inline style) Class List

```
min-w-[2rem] h-8 rounded-xl font-mono font-bold text-sm flex items-center justify-center
```

### State-Driven Styles

**Rest:**

```ts
{
  border: `2px solid ${theme.colors.cardBorder}`,
  color: theme.colors.textSecondary,
  background: 'transparent',
  transition: 'transform 150ms ease, border-color 150ms ease, background-color 150ms ease, color 150ms ease',
}
```

**Hover (not selected):**

```ts
{
  border: `2px solid ${theme.colors.cardActiveBorder}`,
  color: theme.colors.textPrimary,
  background: 'transparent',
  transform: 'translateX(2px)',
}
```

**Selected:**

```ts
{
  background: theme.colors.primary,
  color: theme.colors.primaryText,   // typically white
  border: 'none',
  transform: 'none',
}
```

### Complete Badge Component Pattern

```tsx
<span
  style={{
    minWidth: '2rem',
    height: '2rem',
    borderRadius: '0.75rem',
    fontFamily: 'monospace',
    fontWeight: 700,
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isSelected
      ? 'none'
      : isHovered
      ? `2px solid ${theme.colors.cardActiveBorder}`
      : `2px solid ${theme.colors.cardBorder}`,
    color: isSelected
      ? theme.colors.primaryText
      : isHovered
      ? theme.colors.textPrimary
      : theme.colors.textSecondary,
    background: isSelected ? theme.colors.primary : 'transparent',
    transform: isHovered && !isSelected ? 'translateX(2px)' : 'none',
    transition:
      'transform 150ms ease, border-color 150ms ease, background-color 150ms ease, color 150ms ease',
  }}
>
  {String.fromCharCode(65 + optIdx)}
</span>
```

---

## 3. Checkmark Selection State

When an option is selected (`isSelected === true`), render a Lucide `<Check>` icon on the **right side** of the card row.

### Placement

The card row layout must be:

```
[ A/B/C Badge ] [ Option Text (flex-1) ] [ Check Icon (right) ]
```

### Checkmark Spec

```tsx
import { Check } from 'lucide-react';

{isSelected && (
  <Check
    size={18}
    style={{ color: '#10B981', flexShrink: 0 }}
    aria-label="Selected"
  />
)}
```

- Color: `#10B981` (Tailwind `emerald-500`)
- Size: 18px
- Position: trailing (rightmost) flex child
- `flexShrink: 0` to prevent squishing
- Must NOT appear inside the A/B/C badge
- Must NOT appear when the option is not selected

---

## 4. Remove CANDIDATE RESPONSE Label

### Location

File: `src/components/runner/FormRunner.tsx`
Approximate line: **2385**

### Current Code Pattern (approximate)

```tsx
<div className="...section-header...">
  {/* sparkle icon may be present */}
  <span>Candidate Response</span>
</div>
```

### Surgical Removal Instruction

1. Locate the `<span>Candidate Response</span>` element at line ~2385.
2. Identify the **nearest enclosing wrapper element** that exists solely to contain this label (typically a `<div>` or `<p>` with a header/label class).
3. Delete the entire wrapper element and all its children, including:
   - Any sparkle emoji or `<span>` icon adjacent to the label text
   - The `<span>Candidate Response</span>` itself
   - The wrapping container if it contains nothing else
4. Do **not** delete any sibling elements that contain actual response content (text areas, input fields, answer displays).
5. Verify no empty `<div>` or `<section>` container is left behind.

### Acceptance

After removal, the section previously headed "Candidate Response" must render its content directly without a label above it.

---

## 5. Title Centering in Presentation Mode

### Location

File: `src/components/runner/FocusQuizRunner.tsx`
Approximate line: **1064** (Stage 3 quiz presentation block)

### Current Pattern (problematic)

```tsx
<div className="space-y-2 text-center">
  <h2>{quizTitle}</h2>
</div>
```

The `text-center` is applied to the parent `div`, not directly to the `<h2>`. In some rendering contexts (e.g., when child elements override alignment) this may fail to center the heading.

### Required Pattern

```tsx
<div className="space-y-2">
  <h2 className="text-center w-full">{quizTitle}</h2>
</div>
```

Rules:
- Apply `text-center` **directly** on the `<h2>` element, not only on its parent.
- Add `w-full` to ensure the heading spans the full container width, enabling correct centering.
- Remove `text-center` from the parent `div` only if no other children rely on it; otherwise retain it for compatibility but ensure the `<h2>` carries its own centering.

### Acceptance

The presentation title must be visually centered at all viewport widths from 320px to 1920px, verified by manual browser inspection.
