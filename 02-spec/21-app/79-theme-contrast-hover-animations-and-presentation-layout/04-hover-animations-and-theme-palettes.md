# Specification 79: Component 04 — Option Hover Animations & Theme Palette Standards

**Parent Spec:** `02-spec/21-app/79-theme-contrast-hover-animations-and-presentation-layout/01-overview.md`  
**Target Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/themes/theme-definitions.ts`  
- `src/components/runner/FormRunner.tsx`  
- `src/components/runner/FocusQuizRunner.tsx`  

---

## 1. Problem Definition: Static Option Cards & Theme Deviations

### 1.1 Lack of Option Hover Polish
The user highlighted:
> "Try to have better animation when I hover over. For example, the current text has no effects when I hover over. What you could do, the options, keep this a little bit blended in, like opacity, a bit of transparency. When I hover over, this actually comes as a sliding animation on top of this. The opacity goes in, like faded animation, that looks nice, colorful. Add a little bit of coloring when I hover over. Play with the contrast and darkness with the coloring so that it looks very professional. With all these themes, actually, not only these themes, but also other themes."

Currently:
- Unselected options have static opacity and don't visually slide or elevate on hover.
- Option text does not change state or brighten when hovered.

### 1.2 Riseup Brand & Palette Deviations
In `media_1791184575662.png`, the acronym "HTML" was displayed in gold `#E8C547`. Rule 9 explicitly states:
> "Riseup Brand & Theme Rules: Brand name must be written as one word (`Riseup`). Dark navy background (`#0A0A14`) paired with cream primary (`#F7F1E6`). Gold (`#E8C547`) is strictly an active indicator mark, never a dominant surface or text color."
> "Purple Theme Contrast: White text (`#FFFFFF`) on deep violet background (`#0F0E1E`) with luminous borders (`#3A3568`)."

---

## 2. Option Hover Animation & Blended Transparency System

### 2.1 CSS Class & Keyframe Architecture (`theme.css` & `theme.less`)

```css
/* Presentation Option Card: Smooth Blended Resting -> Elevated Slide on Hover */
.presentation-option-card {
  opacity: 0.82;
  transition:
    transform 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms ease,
    border-color 220ms ease,
    background-color 220ms ease,
    opacity 220ms ease;
  will-change: transform, opacity, box-shadow;
}

.presentation-option-card:hover {
  opacity: 1;
  transform: translate3d(6px, 0, 0);
  border-color: hsl(var(--primary) / 0.55);
  background-color: hsl(var(--primary) / 0.08);
  box-shadow:
    0 8px 24px -4px hsl(var(--primary) / 0.18),
    0 2px 6px -1px rgba(0, 0, 0, 0.25);
}

.presentation-option-card:hover .option-text {
  color: var(--foreground);
  font-weight: 600;
}

.presentation-option-card:hover .option-badge {
  border-color: hsl(var(--primary) / 0.6);
  background-color: hsl(var(--primary) / 0.15);
  color: hsl(var(--primary));
}
```

### 2.2 JSX Implementation in `FormRunner.tsx` & `FocusQuizRunner.tsx`

For single-choice, multiple-choice, and boolean cards in presentation mode:

```tsx
<label
  key={opt}
  className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl text-sm sm:text-base font-sans font-medium cursor-pointer ${choiceMotionClass} ${staggerClass} ${
    isSelected
      ? 'bg-primary/10 border-primary text-foreground font-semibold shadow-xs ring-1 ring-primary/40 opacity-100'
      : 'bg-card/75 border-border/80 text-foreground/80 hover:text-foreground'
  }`}
>
  <span className={`option-badge w-8 h-8 rounded-lg flex items-center justify-center font-sans text-xs font-bold shrink-0 transition-all ${
    isSelected
      ? 'bg-primary text-primary-foreground border-primary'
      : 'bg-muted/70 text-muted-foreground border border-border/60'
  }`}>
    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : String.fromCharCode(65 + optIndex)}
  </span>
  <input
    type="radio"
    name={`field-${field.id}`}
    value={opt}
    checked={isSelected}
    onChange={() => onChange(opt)}
    className="sr-only"
  />
  <span className="option-text flex-1 font-sans text-sm sm:text-base font-medium text-foreground/90 transition-colors">
    {opt}
  </span>
  {isSelected && (
    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-auto" />
  )}
</label>
```

---

## 3. Theme Palette Standards & Guidelines Alignment

### 3.1 Riseup Theme Palette
- Background: `#0A0A14` (Deep Midnight Navy)
- Card Surfaces: `#141424` with border `#2A2A44`
- Primary / Text Highlight: Cream `#F7F1E6`
- Active Indicator Mark: Gold `#E8C547` (used only for selected indicator dots, rings, or active pill marks, NEVER for text highlights or dominant backgrounds)
- Text Primary: `#FFF1D6` / `#F7F1E6`
- In `theme-definitions.ts`: `highlightWord: '#F7F1E6'` (cream text with decorative cream underline)

### 3.2 Antigravity Dracula Theme Palette
- Background: `#191A21`
- Cards: `#282A36`
- Borders: `#44475A`
- Muted Foreground: `#BAC7E8` (high-contrast accessible lilac-slate)
- Primary: `#BD93F9` (neon purple)
- Accent: `#50FA7B` (neon green)

### 3.3 Purple Theme Palette
- Background: `#0F0E1E` (deep violet)
- Card Surfaces: `#18162F`
- Borders: `#3A3568` (luminous border)
- Text Primary: `#FFFFFF`
- Primary: `#5C45FD` (electric indigo)
- Buttons: Vivid indigo with crisp white typography
