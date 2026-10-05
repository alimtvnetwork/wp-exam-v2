# Subtask 01 — Runner UI Fixes

**Parent task:** `12-focus-quiz-ui-overhaul`
**Spec:** `02-spec/21-app/03-focus-quiz-runner-ui-overhaul/02-animations-and-interactions.md`
**Status:** pending

## Owned Files

- `src/components/runner/FormRunner.tsx` — CANDIDATE RESPONSE label removal only
- `src/components/runner/FocusQuizRunner.tsx` — MCQ options + title centering

> [!IMPORTANT]
> These are the ONLY files this subtask may modify. Do not touch any other file.

---

## Steps

### Step 1 — Remove "Candidate Response" Label (FormRunner.tsx)

**File:** `src/components/runner/FormRunner.tsx`
**Target area:** approximately line 2385

Search for the text `Candidate Response` in `FormRunner.tsx`. This string appears inside a `<span>` element wrapped by a header or label element that serves as a section heading above the candidate's answer area.

Action: Remove the entire wrapping `<header>` or `<label>` element (and its children, including the `<span>`) that contains the text `Candidate Response`. Do not remove the answer content below it — only the label heading.

Verify: After removal, no visible "Candidate Response" text should appear in the form runner UI. The answer input/display area must remain intact and functional.

---

### Step 2 — MCQ Options Enhancements (FocusQuizRunner.tsx)

**File:** `src/components/runner/FocusQuizRunner.tsx`
**Target area:** options map at approximately lines 1164–1221

For each option rendered in the MCQ options list, apply the following changes inside the `.map((option, optIdx) => ...)` callback:

#### 2a — Add A/B/C/D Badge

Before the option text `<div>`, insert a letter badge element:

```tsx
<span className="font-mono font-bold text-xs mr-2 opacity-70">
  {String.fromCharCode(65 + optIdx)}
</span>
```

The badge renders `A`, `B`, `C`, `D` etc. based on `optIdx` (0-indexed).

#### 2b — Opacity Based on Selection State

On the outer `<button>` element for each option, add an inline style:

```tsx
style={{ opacity: isSelected ? 1 : 0.78 }}
```

Where `isSelected` is the existing boolean expression that checks whether the current option is the selected answer.

#### 2c — Transition CSS Class

On the same outer `<button>` element, add Tailwind classes:

```
transition-all duration-200
```

#### 2d — Hover Opacity Restore

On the same outer `<button>` element, add Tailwind class:

```
hover:opacity-100
```

#### 2e — Replace Round Checkbox with Green Checkmark

Locate the round checkbox `<div>` element currently used to indicate selection state (typically a circle with a border). Replace it with a green checkmark icon positioned on the **right side** of the option row:

```tsx
{isSelected && (
  <svg
    className="ml-auto h-5 w-5 text-green-500 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)}
```

Remove the old round checkbox `<div>` entirely.

---

### Step 3 — Center Quiz Title (FocusQuizRunner.tsx)

**File:** `src/components/runner/FocusQuizRunner.tsx`
**Target area:** Stage 3 quiz title, approximately line 1064

Locate the `<h2>` element rendering the quiz/question title in Stage 3.

Ensure the `<h2>` has the following Tailwind classes applied:

```
text-center mx-auto max-w-2xl
```

If `text-center` is already present, confirm `mx-auto` and a `max-w-*` constraint are also present. Add any that are missing.

---

## Acceptance Criteria

- [ ] No "Candidate Response" label visible in the form runner
- [ ] MCQ options display A/B/C/D badges to the left of option text
- [ ] Unselected options render at 78% opacity; selected at 100%
- [ ] Options have smooth `transition-all duration-200` animation
- [ ] Hover restores full opacity via `hover:opacity-100`
- [ ] Selected option shows a green checkmark SVG on the right; old round checkbox removed
- [ ] Stage 3 quiz title is horizontally centered with a max-width constraint
