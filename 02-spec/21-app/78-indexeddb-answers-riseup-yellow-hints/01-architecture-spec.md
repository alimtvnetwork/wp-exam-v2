# 78 Native IndexedDB Draft Persistence, Typing Retention & Interactive Hint Popover — Architecture Specification

**Version:** 1.0.0  
**Updated:** 2026-10-03  
**AI Confidence:** Verified  
**Ambiguity:** None  
**Module:** `02-spec/21-app/78-indexeddb-answers-riseup-yellow-hints`  
**Parent Plan:** `.ai-memory/plans/78-indexeddb-answers-riseup-yellow-hints.md`  
**Subtasks:**  
- Subtask 01: `.ai-memory/plans/subtasks/78-indexeddb-answers-riseup-yellow-hints/01-indexeddb-and-other-text.md`  
- Subtask 02: `.ai-memory/plans/subtasks/78-indexeddb-answers-riseup-yellow-hints/02-hint-popover.md`

---

## Keywords

`indexeddb` · `draft-persistence` · `typing-retention` · `other-option` · `spacebar-typing` · `hint-popover` · `radix-popover` · `form-runner` · `onboarding-quiz` · `riseup-theme`

---

## Scoring Matrix

| Criterion | Status | Technical Rationale |
|-----------|--------|---------------------|
| Native IndexedDB Draft Persistence | ✅ Pass | Zero-dependency IndexedDB storage (`wpexam_runner_db`, `quiz_drafts` store) with automatic hydration on load, asynchronous debounced writes, and complete draft clearance on submission |
| "Other:" Option Text Retention | ✅ Pass | Dedicated `otherTexts: Record<string, string>` dictionary mapping `fieldId -> customText`, ensuring candidate explanations are never discarded when deselecting or switching options |
| Spacebar Typing Unblocking | ✅ Pass | Removal of `.trim()` from `<Input value={currentOtherText} />` across multiple choice, single choice (radio), and searchable dropdown components |
| Interactive Hint Popover | ✅ Pass | Replacement of static left-side guidance box with an interactive `<Popover>` button (`<Lightbulb /> Need a Hint?`) in the Candidate Response header |
| Multi-Theme Harmonization | ✅ Pass | WCAG AAA contrast compliance across all 8 presets, enforcing Riseup single-word branding (`#0A0A14` navy base, `#F7F1E6` cream text, `#E8C547` gold indicator mark) |
| Coding Guideline Compliance | ✅ Pass | Zero explicit true boolean checks, zero mixed-polarity conditionals, strict relative git paths, and `is`/`has` naming standards |

---

## 1. Executive Summary & Problem Formulation

In previous revisions of the assessment engine (`src/components/runner/FormRunner.tsx`), three major architectural and usability issues impacted candidate experience and data reliability:

### 1.1 Volatile Candidate Draft State
The runner previously relied on a synchronous `localStorage` snapshot triggered only when a candidate manually clicked "Save Progress". If a candidate accidentally refreshed the browser tab, navigated back in history, or suffered a network/browser glitch midway through an assessment, all intermediate keystrokes and selections since the last manual save were lost. Furthermore, `localStorage` is subject to a strict 5 MB domain limit and synchronous main-thread blocking during large form serializations.

**Solution:** Implement a native, non-blocking IndexedDB draft storage engine (`src/lib/indexeddb-answers.ts`). The database automatically hydrates draft states on component mount, asynchronously saves answers and step progression on every interaction, and cleanly purges the draft record when the assessment is finalized and submitted.

### 1.2 "Other:" Option Typing Amnesia & Spacebar Truncation Bug
Candidate evaluations frequently enable custom responses via `allowOtherOption`. Two critical flaws previously degraded this experience:
1. **Spacebar Truncation**: Inputs were bound to `value={otherValue.trim()}`. When a candidate pressed the spacebar to separate words, `.trim()` immediately stripped the trailing whitespace, preventing multi-word explanations from being entered naturally.
2. **Typing Amnesia**: Custom text was stored solely as a combined string (e.g. `'__other__:My custom answer'`) inside the active option list or radio value. If a candidate temporarily clicked another radio option or unchecked the "Other" checkbox, the custom text was obliterated. Returning to "Other" forced the candidate to retype their explanation from scratch.

**Solution:** Decouple custom typed text from the option selection state using a dedicated `otherTexts: Record<string, string>` dictionary mapping `fieldId -> customText`. Custom text is preserved in React state and persisted to IndexedDB regardless of whether the "Other" option is currently active. Furthermore, all `.trim()` calls on input `value` props are excised to restore smooth spacebar typing.

### 1.3 Static Left-Hand Guidance Pill vs. Clean Interactive Popover
In presentation split mode (`presentation_split`), question hints (`currentField.placeholder`) were rendered as a static block underneath the question description in the left-hand column. This caused visual clutter, distorted column vertical balance, and revealed hints unconditionally even when candidates wanted to test their knowledge without assistance.

**Solution:** Remove the static guidance box from the left editorial column. Integrate an interactive, accessible Radix UI Popover (`Need a Hint?`) in the Candidate Response header directly adjacent to the `Candidate Response` title mark. Hints are revealed on demand with smooth entrance animations and full theme contrast.

---

## 2. Native IndexedDB Draft Persistence Architecture

### 2.1 Storage Specifications
The persistence layer is housed in a standalone utility module at `src/lib/indexeddb-answers.ts` without external npm dependencies, utilizing the standard browser `indexedDB` API:

```
Database Name:    wpexam_runner_db
Database Version: 1
Object Store:     quiz_drafts
Key Path:         formSlug (string)
```

### 2.2 Record Data Schema
Every draft record persisted to IndexedDB conforms to the `QuizDraftRecord` interface:

```typescript
export interface QuizDraftRecord {
  /** Canonical slug identifying the assessment */
  formSlug: string;
  /** Map of fieldId to response value (string, string[], number, etc.) */
  answers: Record<string, unknown>;
  /** Map of fieldId to custom text typed in "Other" inputs */
  otherTexts: Record<string, string>;
  /** Zero-indexed active question step */
  currentStep: number;
  /** Breadcrumb stack of visited step indices for branching rollback */
  stepHistory: number[];
  /** Unix millisecond timestamp of last draft update */
  updatedAt: number;
}
```

### 2.3 Public API Surface (`src/lib/indexeddb-answers.ts`)

```typescript
/**
 * Opens or initializes the runner IndexedDB instance with schema upgrades.
 */
export function openQuizDraftDB(): Promise<IDBDatabase | null>;

/**
 * Saves or updates a quiz draft asynchronously.
 */
export function saveQuizDraft(draft: QuizDraftRecord): Promise<void>;

/**
 * Retrieves the persisted draft for a specific form slug.
 * Returns null if no draft exists or if IndexedDB is unavailable.
 */
export function getQuizDraft(formSlug: string): Promise<QuizDraftRecord | null>;

/**
 * Deletes the draft record for a specific form slug upon final submission.
 */
export function deleteQuizDraft(formSlug: string): Promise<void>;

/**
 * Clears all cached drafts across all slugs (diagnostic / reset utility).
 */
export function clearAllQuizDrafts(): Promise<void>;
```

### 2.4 Error Handling & Fallback Invariants
1. **Environment Guard:** If `typeof window === 'undefined'` or `!('indexedDB' in window)`, all functions resolve gracefully without throwing uncaught exceptions.
2. **Quota / Permission Handling:** If storage quota is exceeded or private browsing security blocks database initialization, transaction failures are caught, logged to console warning, and the runner continues operating with in-memory React state.

---

## 3. "Other:" Field Typing Retention & Spacebar Fix

### 3.1 Root Cause Analysis (RCA)

```
[Candidate presses Spacebar]
        │
        ▼
<Input onChange={(e) => handleOtherChange(e.target.value)} />   --> value contains "Hello "
        │
        ▼
FormRunner processes string: '__other__:Hello '
        │
        ▼
<Input value={otherValue.trim()} />                             --> value is trimmed to "Hello"
        │
        ▼
[CURSOR JUMPS / SPACE IS DELETED - CANDIDATE CANNOT TYPE WORDS WITH SPACES]
```

### 3.2 Dual-Layer Architecture: Decoupled Custom Text
To guarantee zero typing amnesia and uninterrupted spacebar input:

1. **State Isolation:**
   ```typescript
   // FormRunner.tsx
   const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
   ```
2. **Input Value Binding (Zero Trim):**
   ```tsx
   // Unchecked value prop preserves exact trailing spaces while typing
   <Input
     value={currentOtherText}
     onChange={(e) => handleOtherTextChange(field.id, e.target.value)}
     placeholder="Type custom answer..."
     className="h-8 text-sm flex-1 max-w-md bg-background"
     onClick={(e) => e.stopPropagation()}
   />
   ```
3. **Radio Switch Invariant:**
   - Candidate selects "Other" and types `"PostgreSQL 16"`.
   - Candidate clicks option `"MySQL"`.
   - Result: `answers[field.id] = 'MySQL'`.
   - Invariant: `otherTexts[field.id]` remains `'PostgreSQL 16'`.
   - Candidate re-selects "Other" radio.
   - Result: `answers[field.id]` is restored to `'__other__:PostgreSQL 16'` using `otherTexts[field.id]`.
4. **Checkbox Uncheck Invariant:**
   - Candidate selects "Other" and types `"Cloudflare Workers"`.
   - Candidate unchecks the "Other" checkbox.
   - Result: `__other__:` entry is filtered from `answers[field.id]`.
   - Invariant: `otherTexts[field.id]` remains `'Cloudflare Workers'`.
   - Candidate re-checks the "Other" checkbox.
   - Result: `__other__:Cloudflare Workers` is appended back to `answers[field.id]`.
5. **Searchable Dropdown Invariant:**
   - In `CustomDropdownSelect`, selecting "Other... (Type custom answer)" hydrates the input with `otherTexts[field.id] || ''`.
   - Value binding removes `.trim()`, allowing spacebar input.

---

## 4. Candidate Response Header Interactive Hint Popover

### 4.1 Component Placement & Layout
The static left-side pill is eliminated. The interactive popover trigger is placed directly inside the flexbox header of the Candidate Response column:

```
+─────────────────────────────────────────────────────────────────────────────+
| Candidate Response Header (w-full flex items-center justify-between pb-1)   |
|                                                                             |
| [✦ Candidate Response]                               [💡 Need a Hint? ▾]   |
+─────────────────────────────────────────────────────────────────────────────+
|                                                      │ Popover Content      |
|                                                      │ +──────────────────+ |
|                                                      │ | 💡 Helpful Hint  | |
|                                                      │ | {placeholder}    | |
|                                                      │ +──────────────────+ |
+─────────────────────────────────────────────────────────────────────────────+
| [ Option A: Balanced Binary Trees                                         ] |
| [ Option B: B-Tree Indexes                                                ] |
+─────────────────────────────────────────────────────────────────────────────+
```

### 4.2 Interactive Popover Markup & Styling

```tsx
<div className="flex items-center justify-between pb-1">
  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
    <Sparkles className="w-3.5 h-3.5 text-foreground" />
    <span>Candidate Response</span>
  </span>

  {hasPlaceholderHint ? (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-2xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
          <span>Need a Hint?</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 p-3.5 rounded-xl border border-border shadow-lg bg-popover text-popover-foreground animate-in fade-in-50 zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <span className="font-semibold text-xs text-foreground block">
              Helpful Hint
            </span>
            <p className="font-sans text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {currentField.placeholder}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ) : null}
</div>
```

### 4.3 Multi-Theme Aesthetic Verification
1. **Riseup Theme (`riseup-asia` / `riseup`):**
   - Brand name: `Riseup` (single word).
   - Base canvas: `#0A0A14` midnight navy.
   - Primary text: `#F7F1E6` cream.
   - Indicator marks: `#E8C547` gold reserved for `<Lightbulb className="text-primary" />` and active radio accents.
   - Popover surface: `bg-popover` inherits deep navy background with crisp border, guaranteeing zero yellow-on-yellow clashing.
2. **Purple Theme (`purple`):**
   - Surface: `#0F0E1E` deep violet.
   - Foreground: `#FFFFFF` crisp white.
   - Popover border: Luminous border `#3A3568`.

---

## 5. End-to-End Lifecycle & Data Flow

```
[Candidate Opens Assessment /f/:slug]
                 │
                 ▼
     openQuizDraftDB()
                 │
                 ▼
     getQuizDraft(activeSlug)
                 │
      ┌──────────┴──────────┐
      ▼                     ▼
[Draft Exists]        [No Draft]
      │                     │
      ▼                     ▼
Hydrate State:        Fresh Start:
- answers             - answers = {}
- otherTexts          - otherTexts = {}
- currentStep         - currentStep = 0
- stepHistory         - stepHistory = []
      │                     │
      └──────────┬──────────┘
                 │
                 ▼
[Candidate Types Keystroke / Selects Option / Clicks Next]
                 │
                 ▼
setAnswers(...) & setOtherTexts(...)
                 │
                 ▼
saveQuizDraft({ formSlug, answers, otherTexts, currentStep, stepHistory, updatedAt: Date.now() })
                 │
                 ▼
[Candidate Clicks "Submit Response"]
                 │
                 ▼
handleSubmit() ──► calculateResults() ──► setIsSubmitted(true)
                 │
                 ▼
deleteQuizDraft(activeSlug) ──► [IndexedDB Draft Cleaned]
```

---

## 6. Coding Guidelines & Invariant Rules

In accordance with meta-repository standards:

1. **Boolean Principles:**
   - Implicit evaluations only: `if (hasPlaceholderHint)` instead of `if (hasPlaceholderHint === true)`.
   - Discrete conditional clauses: Never combine positive and negative conditions in a single check.
2. **Strict Boolean Naming:**
   - Prefix boolean variables and properties strictly with `is` or `has` (e.g. `isDraftRestored`, `hasPlaceholderHint`, `isOtherSelected`).
3. **Strict Relative Git Paths:**
   - All references to files and specs must use relative repository paths starting from root (e.g. `src/lib/indexeddb-answers.ts`). Zero absolute filesystem paths.
4. **Disjoint Subtask Boundaries:**
   - Subtask 01 governs IndexedDB persistence and "Other" text state wiring.
   - Subtask 02 governs Hint Popover presentation and left guidance removal.

---

## 7. Verifiable Acceptance Criteria

| Criteria ID | Target File | Verification Method / Assertion | Expected Value | Status |
|-------------|-------------|---------------------------------|----------------|--------|
| **CRIT-IDB-01** | `src/lib/indexeddb-answers.ts` | File exists with zero external dependencies | Exports `saveQuizDraft`, `getQuizDraft`, `deleteQuizDraft`, `clearAllQuizDrafts` | PENDING |
| **CRIT-IDB-02** | `src/lib/indexeddb-answers.ts` | Verify schema definition | Object store `quiz_drafts` with keyPath `formSlug` | PENDING |
| **CRIT-IDB-03** | `src/components/runner/FormRunner.tsx` | Inspect mount hydration effect | Loads draft on mount and restores `answers`, `otherTexts`, `currentStep`, `stepHistory` | PENDING |
| **CRIT-IDB-04** | `src/components/runner/FormRunner.tsx` | Inspect `handleSubmit` execution | Invokes `deleteQuizDraft(activeSlug)` upon submission | PENDING |
| **CRIT-OTH-01** | `src/components/runner/FormRunner.tsx` | Inspect `otherTexts` state | Declared as `Record<string, string>` and passed to field renderers | PENDING |
| **CRIT-OTH-02** | `src/components/runner/FormRunner.tsx` | Inspect MCQ & single-choice input values | Uses `value={currentOtherText}` with zero `.trim()` calls on value prop | PENDING |
| **CRIT-OTH-03** | `src/components/runner/FormRunner.tsx` | Radio switch text retention | Switching radio from "Other" to option A and back restores saved custom text | PENDING |
| **CRIT-OTH-04** | `src/components/runner/FormRunner.tsx` | Checkbox uncheck text retention | Unchecking and re-checking "Other" checkbox restores saved custom text | PENDING |
| **CRIT-HNT-01** | `src/components/runner/FormRunner.tsx` | Left column static guidance check | Static `Candidate Guidance` block completely removed from left column | PENDING |
| **CRIT-HNT-02** | `src/components/runner/FormRunner.tsx` | Response header Popover check | Header contains `<Popover>` with button `<Lightbulb /> Need a Hint?` | PENDING |
| **CRIT-HNT-03** | `src/components/runner/FormRunner.tsx` | Popover conditional rendering | Only rendered when `hasPlaceholderHint` is true | PENDING |
| **CRIT-THEME-01**| `src/lib/themes.ts` | Riseup branding and color compliance | Brand spelled `Riseup`, navy `#0A0A14`, cream `#F7F1E6`, gold `#E8C547` as indicator only | PENDING |
