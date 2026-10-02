# App UI — CSS3 Animations and Motion Standards

Version: 1.0.0  
Updated: 2026-10-02  
AI Confidence: Production-Ready  
Ambiguity: None  

> **/goal** Define the complete motion design system, CSS3 keyframe inventory, transition timings, and Zero Hover Scale compliance rules across the assessment runner and builder.  
> **/learn** Standardizes hardware-accelerated animations (`transform`, `opacity`), provides smooth step transitions for candidate questions, and enforces strict ergonomic guidelines to avoid layout shifts and cognitive fatigue.

---

## 1. Architectural Foundations of Motion

Motion in WP Exam is designed to be purposeful, fluid, and non-distracting. Animations are strictly bounded to entrance states, step advancement notifications, and subtle status pulses.

### Core Motion Principles:
1. **Compositor Acceleration**: Animations are restricted to `transform` and `opacity`. Layout properties (`width`, `height`, `margin`, `padding`, `top`, `left`) MUST NEVER be animated.
2. **Zero Hover Scale Mandate (Absolute Ban on Hover Scale)**:
   - Interactive cards, buttons, and options MUST NOT apply `transform: scale(...)` or `hover:scale-105` on hover.
   - *Rationale*: Hover scaling causes blurry subpixel text re-rasterization on Chromium, layout jitter on nearby elements, and accidental scrollbar triggering on edge viewports.
   - *Approved Hover Paradigm*: Hover states must use smooth background contrast (`hover:bg-muted/70`), crisp border transitions (`hover:border-foreground/40`), and subtle elevation shadows (`hover:shadow-xs` / `hover:shadow-sm`).
3. **Card Keying for Step Transitions**:
   - Sequential runners MUST mount question card wrappers with unique keys (`key={currentField.id}`) to trigger `.animate-card-entrance` automatically on question advancement.
4. **Accessible Reduced Motion**:
   - All keyframe animations automatically respect the user OS preference via `@media (prefers-reduced-motion: reduce)`.

---

## 2. CSS3 Keyframes Catalog

The following keyframes are defined in `src/styles/theme.css`:

### 2.1 `cardEntrance`
- **Purpose**: Smooth step advancement entrance for candidate question cards.
- **Duration**: 0.35s ease-out.
- **Specification**:
```css
@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```
- **Utility Class**: `.animate-card-entrance { animation: cardEntrance 0.35s ease-out forwards; }`

### 2.2 `pulseGlow`
- **Purpose**: Attention callout for active candidate badges and urgency notifications.
- **Duration**: 2.0s infinite.
- **Specification**:
```css
@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 173, 1, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 173, 1, 0);
  }
}
```
- **Utility Class**: `.animate-pulse-glow { animation: pulseGlow 2s infinite; }`

### 2.3 `sweetDigsPulseGlow`
- **Purpose**: Emerald eco-luxury glowing accents on luxury hero callouts and submit buttons.
- **Duration**: 2.0s ease-in-out infinite.
- **Specification**:
```css
@keyframes sweetDigsPulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
  }
  50% {
    box-shadow: 0 0 16px 3px rgba(22, 163, 74, 0.15);
  }
}
```
- **Utility Class**: `.animate-sweet-pulse-glow { animation: sweetDigsPulseGlow 2s ease-in-out infinite; }`

### 2.4 `sweetDigsFloat`
- **Purpose**: Subtle floating badge and pill elevation without triggering layout shifts.
- **Duration**: 3.0s ease-in-out infinite.
- **Specification**:
```css
@keyframes sweetDigsFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
```
- **Utility Class**: `.animate-sweet-float { animation: sweetDigsFloat 3s ease-in-out infinite; }`

### 2.5 `sweetDigsFadeInUp` & `sweetDigsFadeIn`
- **Purpose**: Staggered content mounting for candidate introduction heroes and results cards.
- **Durations**: 0.5s / 0.35s ease-out.
- **Specification**:
```css
@keyframes sweetDigsFadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sweetDigsFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```
- **Utility Classes**: `.animate-sweet-fade-in-up`, `.animate-sweet-fade-in`.

### 2.6 `sweetDigsScaleIn`
- **Purpose**: Clean modal and popover entrance without exceeding boundary bounds.
- **Duration**: 0.35s ease-out both.
- **Specification**:
```css
@keyframes sweetDigsScaleIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```
- **Utility Class**: `.animate-sweet-scale-in`.

---

## 3. Theme Transition Standards

When switching themes, UI components must transition color tokens seamlessly without jarring flashes.

### Specification:
```css
.theme-transition {
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 250ms;
}
```

In `src/index.css`, all interactive elements (`button`, `input`, `select`, `textarea`, `.modern-quiz-card`) inherit standard timing curves:
- Background color transition: 300ms ease.
- Foreground text color transition: 200ms ease.
- Border and shadow transition: 150ms cubic-bezier(0.4, 0, 0.2, 1).

---

## 4. Staggered Delay Hierarchy

For sequential and presentation lists, sequential delay utility classes are standardized:
- `.delay-100`: `animation-delay: 100ms;` (Eyebrow & kicker)
- `.delay-200`: `animation-delay: 200ms;` (Headline & body)
- `.delay-300`: `animation-delay: 300ms;` (Media & reference resources)
- `.delay-400`: `animation-delay: 400ms;` (Interactive options)
- `.delay-500`: `animation-delay: 500ms;` (Footer navigation)

---

## 5. Accessibility & Performance Guardrails

1. **Reduced Motion Media Query**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
2. **GPU Optimization**: Keyframe elements animate using 3D hardware contexts (`transform: translateY(...)`) to preserve 60fps frame rates across mobile and embedded tablet viewports.
