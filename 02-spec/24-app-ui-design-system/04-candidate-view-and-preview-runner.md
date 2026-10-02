# App UI — Candidate View and Preview Runner Architecture

Version: 1.0.0  
Updated: 2026-10-02  
AI Confidence: Production-Ready  
Ambiguity: None  

> **/goal** Architect the candidate assessment view, distraction-free header ergonomics, accessible typography, high-contrast option cards, and new-tab preview architecture in FormRunner.  
> **/learn** Eliminates modal constraints in favor of full-viewport live preview routes (`/preview/:slug`, `/f/:slug`), strips development debug paraphernalia from respondent viewports, and guarantees high contrast and fluid card transitions.

---

## 1. Ergonomic Objectives for Candidate Assessments

Candidates undergoing technical evaluations or employment assessments must have an uncluttered, high-focus environment. Cognitive load should be dedicated entirely to answering questions rather than navigating builder tools or struggling with cramped modal views.

### Core Ergonomic Requirements:
1. **Distraction-Free Header**:
   - In candidate (`/f/:slug`) and preview (`/preview/:slug`, `isPreviewRoute`) modes, developer testing tools (`[⚡ Auto | 🛠️ Debug | ✕ Exit]`) and unrelated project switchers (`intern-programmer`, `full-stack-architect`, etc.) MUST BE HIDDEN.
   - The top bar should feature only assessment identity, format switchers (`Quiz Format` vs `Presentation Slide`), question sequence drawers, and theme controls.
2. **High-Contrast Option Cards**:
   - Selection state must be immediately legible from across the room or on glare-heavy mobile screens.
   - Selected options display a distinct `border-primary` border, crisp `bg-primary/10` background tint, and a high-visibility check indicator (`CheckCircle2` or primary check badge).
   - Washed-out high-opacity background fills (`bg-primary/20`) are replaced to prevent visual muddying.
3. **Accessible Typography**:
   - Question inputs and textareas MUST use accessible `text-sm sm:text-base` sizing with `leading-relaxed` line-heights.
   - Textareas must provide adequate initial height (`min-h-[100px]`) and clean contrast against background surfaces.
   - Single-choice and multiple-choice labels render in legible `text-sm sm:text-base` with generous touch targets (`p-3 sm:p-3.5`).
4. **Context-Accurate Options (Zero Out-of-Context Suggestions)**:
   - Out-of-context mock suggestions (e.g. `'Bachelor in E-commerce'`, `'Bachelor in Arts'`, etc.) are prohibited on general questions.
   - Suggestion pills are rendered ONLY when explicit `suggestedOtherOptions` are authored on the question schema.
5. **Card Entrance Animation Keying**:
   - The question card container must attach `key={currentField.id}` so that React cleanly remounts the card on question change, triggering `.animate-card-entrance` smoothly for every step.

---

## 2. New-Tab Preview Architecture

### 2.1 The Modal Elimination Paradigm
Previous architectures rendered live previews inside cramped modal dialogues inside the WordPress admin page or builder canvas. This resulted in several critical UX failures:
- Scrollbar-within-scrollbar collisions between modal backdrops and question lists.
- Truncated option cards on small laptops and tablet viewports.
- Skewed CSS media queries that evaluated against the entire browser viewport rather than the modal inner dimensions.

### 2.2 Canonical New-Tab Routing
Form previews are decoupled into independent browser tabs using canonical URL routes:
- **Candidate Route**: `/f/:slug` or `/f/:category/:slug`
- **Builder Preview Route**: `/preview/:slug` or `/preview` (with `isPreviewRoute={true}`)
- **Benefits**:
  - Full viewport canvas for 2-column Presentation Slide mode (`presentation_split`).
  - Native browser address bar link copying for sharing drafts with hiring stakeholders.
  - Accurate viewport media queries for mobile, tablet, and widescreen testing.
  - Complete isolation from WordPress admin CSS rules.

---

## 3. Top Header State Matrix

| Header Element | Candidate View (`/f/:slug`) | Live Preview (`/preview/:slug`) | Admin Embedded Test (`/runner`) |
|----------------|----------------------------|--------------------------------|---------------------------------|
| Form Title / Identity | Visible | Visible | Visible |
| Layout Mode Switcher | Visible | Visible | Visible |
| Questions Sequence Drawer | Visible | Visible | Visible |
| Theme Selector | Visible | Visible | Visible |
| Copy Canonical URL | Visible | Visible | Visible |
| Project Selector (`Select`) | **Hidden** | **Hidden** | Visible |
| Dev Pill (`[⚡ Auto | 🛠️ Debug | ✕ Exit]`) | **Hidden** | **Hidden** | Visible |
| Exit / Close Button | **Hidden** (or Close Tab) | **Hidden** (or Close Tab) | Visible (calls `onClose()`) |

---

## 4. Option Card Anatomy & Selection Visual Hierarchy

### 4.1 Unselected State
```html
<label class="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-border/80 bg-card text-foreground font-sans font-medium cursor-pointer transition-all duration-150 hover:border-foreground/40 hover:bg-muted/70 hover:shadow-xs">
  <span class="w-8 h-8 rounded-lg border border-border/80 bg-muted/70 text-foreground/80 flex items-center justify-center font-sans text-sm font-semibold shrink-0">
    A
  </span>
  <input type="radio" class="text-primary focus:ring-primary h-4 w-4 accent-primary" />
  <span class="flex-1 font-sans text-sm sm:text-base font-medium text-foreground">Option Text</span>
</label>
```

### 4.2 Elevated Selected State
```html
<label class="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-primary bg-primary/10 text-foreground font-sans font-semibold shadow-xs ring-1 ring-primary/40 cursor-pointer transition-all duration-150">
  <span class="w-8 h-8 rounded-lg border border-primary bg-primary text-primary-foreground flex items-center justify-center font-sans text-sm font-semibold shrink-0">
    A
  </span>
  <input type="radio" checked class="text-primary focus:ring-primary h-4 w-4 accent-primary" />
  <span class="flex-1 font-sans text-sm sm:text-base font-semibold text-foreground">Option Text</span>
  <CheckCircle2 class="w-5 h-5 text-primary shrink-0 ml-auto" />
</label>
```

---

## 5. Sequential Card Keying Specification

In sequential mode, transitioning between questions must not feel static or stuttered.
1. The question card wrapper MUST declare `key={currentField.id}`.
2. The card wrapper MUST declare `.animate-card-entrance`.
3. When `currentStep` changes:
   - React unmounts previous card DOM nodes.
   - The new card node mounts with opacity 0 and translateY(12px).
   - In 0.35s, the card transitions smoothly to opacity 1 and translateY(0).
   - Focus is effortlessly redirected to the active question input.
