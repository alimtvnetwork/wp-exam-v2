# 73 — UI/UX Candidate View Theming, Ergonomics and New-Tab Preview Architecture

> **/goal** Master and execute the end-to-end modernization of the candidate assessment runner, elimination of cramped preview modals in favor of full-viewport new-tab previews, implementation of 8 high-contrast color palettes, accessible input ergonomics, and hardware-accelerated CSS3 card transitions.  
> **/learn** Synthesizes design system standards from `02-spec/24-app-ui-design-system/`, enforcing zero explicit true boolean evaluations, no mixed-polarity conditionals, strict relative git paths, and Zero Hover Scale compliance.

---

## 1. Executive Summary & Problem Formulation

In previous revisions of the WordPress Quiz and Assessment platform, two key architectural limitations constrained candidate and author experience:
1. **Modal Containment Bottleneck**: Form previews were rendered inside an admin modal dialog overlay. This constrained viewport dimensions, caused double-scrollbar conflicts between the modal backdrop and question lists, and degraded two-column presentation layouts (`presentation_split`).
2. **Visual Clutter & Respondent Friction**:
   - The test runner header displayed internal developer debug pills (`[⚡ Auto | 🛠️ Debug | ✕ Exit]`) and demo project switchers to candidates taking actual assessments.
   - Multiple-choice questions displayed hardcoded out-of-context suggestion pills (`'Bachelor in E-commerce'`, `'Bachelor in Arts'`, etc.) regardless of subject matter.
   - Option selection states relied on washed-out low-contrast tints (`bg-primary/20`) lacking crisp selection borders.
   - Long-form question textareas were constrained to cramped `text-xs` (12px) font sizes.
   - Step advancement suffered from static card transitions because question cards lacked dynamic React element keying.

This specification establishes the canonical blueprint to overhaul the candidate runner (`src/components/runner/FormRunner.tsx`), dismantle preview modals across the builder, and harmonize visual theming with the 8-theme design token engine.

---

## 2. Architectural Dimensions & Solutions

### 2.1 Dismantling Preview Modals in Favor of New-Tab Previews
- **FormBuilder Preview Trigger**: The "Preview" action in `FormBuilder` now opens the target assessment in a dedicated browser tab via `window.open('/preview/' + activeSlug, '_blank')`.
- **Dual Routing Architecture**:
  - `/f/:slug` and `/f/:category/:slug`: Public candidate assessment route with respondent session tracking.
  - `/preview/:slug` and `/preview`: Author live-preview route mounting `FormRunner` with `isPreviewRoute={true}`.
- **Full-Viewport Canvas**: Eliminating modals unlocks the complete 100vw/100vh canvas required for widescreen presentation layouts (`presentation_split`) and high-density question tables.

### 2.2 Distraction-Free Candidate & Preview Header
In candidate (`/f/*`) and preview (`/preview/*`, `isPreviewRoute`) modes, the runner header is streamlined:
- **Hidden Elements**:
  - Developer Debug Pill (`[⚡ Auto | 🛠️ Debug | ✕ Exit]`).
  - Unnecessary Project Switcher (`Select` with `intern-programmer`, `full-stack-architect`, etc.).
- **Retained Elements**:
  - Assessment Title and branding badge.
  - Viewport Layout Switcher (`Quiz Format` vs `Presentation Slide`).
  - Question Sequence Drawer button.
  - Dynamic Theme Selector dropdown.
  - Canonical URL Copy button.

### 2.3 High-Contrast Option Selection States
Single-choice (`single_choice`), multiple-choice (`multiple_choice`), and boolean options are upgraded:
- **Unselected State**: `border-border/80 bg-card text-foreground hover:bg-muted/70 hover:border-foreground/40 hover:shadow-xs`.
- **Selected State**:
  - Crisp high-contrast border: `border-primary`.
  - Subtle background fill: `bg-primary/10` (replacing washed-out `bg-primary/20`).
  - High-visibility check indicator: `<CheckCircle2 className="w-5 h-5 text-primary shrink-0 ml-auto" />`.
  - Prominent letter index badge: `bg-primary text-primary-foreground border-primary`.

### 2.4 Accessible Typography & Textarea Sizing
- All question textareas (`paragraph`, `feedback`) are upgraded from `text-xs` (12px) to `text-sm sm:text-base` with `leading-relaxed` line-heights.
- Generous touch targets and minimum heights (`min-h-[100px]`) prevent input truncation.
- Question descriptions and option labels are typeset in accessible Poppins font with high WCAG AAA contrast ratios.

### 2.5 Dynamic React Element Keying & CSS3 Card Entrance
To guarantee smooth transitions when moving between sequential questions:
1. The question card wrapper in both `presentation_split` and `standard` card views specifies `key={currentField.id}`.
2. The card wrapper declares class `.animate-card-entrance`.
3. When `currentStep` advances, React unmounts the previous question DOM and smoothly mounts the next card via `@keyframes cardEntrance` (0.35s ease-out), elevating the card by 12px with zero layout shift.

### 2.6 Removal of Out-of-Context Mock Suggestions
- Fallback suggestion arrays containing hardcoded values (`'Bachelor in E-commerce'`, `'Bachelor in Arts'`, etc.) are completely excised.
- "Other" suggestion pills are rendered if and only if explicit `suggestedOtherOptions` exist on the question schema (`(field as FormField).suggestedOtherOptions`).

---

## 3. Multi-Theme Engine & Palette Integration

The assessment runner seamlessly activates all 8 production themes via `src/lib/themes.ts` and `src/themes/theme-definitions.ts`:
1. `green-choice` (Emerald Eco-Luxury — default theme)
2. `clean-wide` (Clean Wide White with Vivid Indigo)
3. `microsoft-blue` (Clean Paper Light with Enterprise Sapphire)
4. `riseup-asia` (Rise Up Asia Signature Bright Gold & Midnight Navy)
5. `dracula` (Antigravity Dracula Dark Purple & Neon Green)
6. `purple` (Purple Theme with Electric Indigo & Violet)
7. `vscode-dark` (VS Code Dark Obsidian & Cyan)
8. `sweet-digs` (Sweet Digs Botanical Sage)

### Contrast and Styling Invariants:
- All themes provide complete coverage for `--primary`, `--card`, `--background`, `--foreground`, `--border`, and `--muted`.
- Dark themes maintain a minimum contrast ratio of 7.0:1 for question headlines and 4.5:1 for body copy.
- Zero Hover Scale: No option or card uses `hover:scale-*` to prevent subpixel jitter.

---

## 4. Code Quality & Boolean Logic Verification

In strict compliance with meta-repository guidelines:
1. **Zero Explicit True Evaluations**: Booleans are evaluated implicitly (`if (isSequential)` rather than `if (isSequential === true)`).
2. **Zero Mixed-Polarity Conditionals**: Positive checks and negative checks are never combined in a single condition:
   - *Token auto-authentication*: Refactored to separate nested conditional blocks.
   - *Step history pop loop*: Refactored to separate loop boundary checks from visibility evaluation.
3. **Strict Boolean Naming**: State variables use strict `is` and `has` prefixes (`isCandidateOrPreview`, `isSelected`, `hasSavedSession`).
