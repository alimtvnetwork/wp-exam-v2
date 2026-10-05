# Specification 80: Component Spec 03 — Presentation Layout Centering & Candidate Response Elimination

**Parent Spec:** `02-spec/21-app/80-backend-theme-contrast-and-presentation-slide-refinement/`  
**Area:** Presentation Mode Layout, FormRunner.tsx, FocusQuizRunner.tsx, Optical Alignment  

---

## 1. Problem Statement: Presentation Visual Balance & Legacy Labels

As documented in visual artifact `assets/screenshots/user-feedback-presentation-layout.png` (`media_1791184206952.png`):
1. **Vertical Title Imbalance:** In 2-column presentation slides, question titles were previously pinned to the top boundary of the column grid (`items-start`), leaving empty vertical space beneath the prompt when options on the right were numerous or tall. The user annotated this with a red horizontal baseline and down-arrow requesting vertical centering.
2. **Right-Column Displacement Tuning:** The right-hand column containing choice options required a controlled downward offset ("a little bit down, but not too much, a little bit so that it remains as it is"). Recent commits accidentally increased this to `lg:pt-10 xl:pt-14`, displacing options excessively.
3. **Candidate Response Clutter:** Visual artifact `assets/screenshots/user-feedback-candidate-response-removal.png` highlights the legacy `Candidate Response` label header. The user has explicitly and repeatedly mandated the permanent eradication of this section.

---

## 2. Presentation Grid Optical Alignment Architecture (`FormRunner.tsx`)

### 2.1 2-Column Desktop Grid Centering
In `src/components/runner/FormRunner.tsx`, the presentation layout container is configured for vertical optical balance:

```tsx
/* 2-Column Presentation Grid (50% / 50% on Desktop, Vertically Centered Left Column) */
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center w-full min-h-[70vh] lg:min-h-[78vh] xl:min-h-[82vh] my-auto">
  {/* Left Column: Vertically Centered Question Title & Editorial Guidance */}
  <div className={`w-full space-y-6 flex flex-col justify-center lg:self-center ${effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-2' : 'lg:order-1'}`}>
    ...
  </div>

  {/* Right Column: Controlled Downward Offset for Optical Balance */}
  <div className={`w-full lg:self-stretch flex flex-col justify-between h-full pt-2 lg:pt-6 xl:pt-8 ${effectiveAnswerPlacement === 'left' || effectiveLayoutMode === 'split_left' ? 'lg:order-1' : 'lg:order-2'}`}>
    ...
  </div>
</div>
```

### 2.2 Alignment Mechanics
1. **Grid Level:** `items-center` ensures both columns share vertical alignment across the slide container.
2. **Left Column:** `lg:self-center` positions the title prompt, subtitle, and hint popover in the exact optical center of the viewport height.
3. **Right Column:** `pt-2 lg:pt-6 xl:pt-8` applies a gentle downward nudge (24px–32px) so options align naturally with the middle-to-lower visual weight of the question title, preventing crowded top borders while maintaining compact reachability and avoiding excessive downward displacement.

---

## 3. Strict & Irreversible Elimination of "Candidate Response"

1. **Zero-Tolerance Prohibition:** Under no circumstances may any element containing the text `Candidate Response`, `CANDIDATE RESPONSE`, or related badge marks exist above choice options or within the runner columns.
2. **Regression Assertions:**
   - Unit tests (`src/test/`) must include explicit queries asserting that `screen.queryByText(/candidate response/i)` evaluates to `null`.
   - CI linters and test suites must fail immediately if any JSX node introduces `Candidate Response`.
3. **Clean Unboxed Architecture:** Options in presentation mode render in a clean, elevated, unboxed format with direct access to choices and navigation.
