# 14. Quiz Preview Redesign: Hero Model, Sequence Sidebar, Session Persistence & Anti-Collision

> **/goal** Deliver an enterprise-grade Quiz Preview & Assessment Runner featuring a Section Pattern Hero model, a responsive left-hand question sequence sidebar, session persistence for timed and untimed quizzes, collision-free top action navigation, and strict Poppins typography.
> **/learn** Adhere to `02-spec/07-design-system/13-section-patterns.md`, `.ai-memory/folder-structure.md`, and strict relative path mandates.

**Version:** 1.0.0  
**Updated:** 2026-09-27  
**Status:** Active  
**Traceability:** Task-01, Task-02, Task-03, Task-04, Task-05  

---

## 1. User Request (Verbatim)

```text
coding-guidelines/02-spec/03-error-manage
You have to work on the preview of the quiz. That means when I go to the preview mode, it feels like a full trash. Okay, so the first thing is that it feels like it's hanging somewhere. Okay. And you have lean sections. These are also colliding with each other. The writing, it's in Ubuntu, but it should be in Poppins. The headers should only be Ubuntu. Okay? And there is no consistency. For example, if I draw a line between the question and other stuff, there is no consistency. It looks really terrible. And the quizzes can be performed in a full screen as well, I discussed it. And left-hand side, I think there would be the sequence of projects and things. If there is multiple items, that would be in the left-hand side, and how far they are going in a quiz, they could also save as a session. Some quiz needs to be performed under time. Some quiz can be performed and saved later on as well. So make sure that these options are there, can be integrated, and also try to integrate the hero model properly. So read into the coding guideline hero model. Let me just refer you to coding guideline where you find the hero model. The hero model and everything regarding hero, try to integrate and implement. Can you please do that for me? Also see the coding examples inside the gold line code inside the coding guideline. Is it clear?
```

### Visual Assets & Screenshots Ingested
- `assets/screenshots/preview-quiz-redesign-01.png` — Full preview view showing floating card hanging in center with vast empty margins.
- `assets/screenshots/preview-quiz-redesign-02.png` — Top bar collision where `Auto Fill`, `Debug`, and `Exit` buttons overlap.
- `assets/screenshots/preview-quiz-redesign-03.png` — Red vertical guide line highlighting massive wasted space on the left.
- `assets/screenshots/preview-quiz-redesign-04.png` — Detailed annotations: red box on colliding buttons, red cross deleting redundant `quiz` tag, red box on `2 items entered` mono font, and red left-margin alignment line.

---

## 2. Architectural Blueprint & Technical Scope

### 2.1 Hero Model Integration (`Pattern 1: Hero Section`)
Derived directly from `02-spec/07-design-system/13-section-patterns.md`:
- **Header:** Gradient Ubuntu H1 title with icon badge.
- **Description:** Clean Poppins description with purpose, curriculum context, and instructions.
- **Metadata Stats Grid:**
  - Total Questions / Steps.
  - Duration & Mode: `Timed Exam (MM:SS)` or `Self-Paced / Untimed`.
  - Points total & Passing threshold.
  - Session status pill: `Session Saved` or `New Session`.
- **Hero Actions:** Quick "Start Assessment", "Resume Saved Session", and "Save Progress" CTAs with smooth slide hover styling.

### 2.2 Left-Hand Question Sequence Sidebar
- Replaces the narrow floating card hanging in whitespace.
- Structure:
  - Top: Progress overview with animated completion percentage.
  - Middle: Sequential list of all questions with status indicators:
    - Completed (green checkmark).
    - Active / Current (vivid primary accent).
    - Pending (muted gray).
    - Section / Group headers grouping related questions.
  - Footer: "Save as Session" button + Fullscreen toggle button.
- Responsive: Sticky sidebar on desktop (`lg:w-80`), collapsible slide-out drawer on tablet/mobile with hamburger trigger.

### 2.3 Top Bar Collision Elimination & Header De-Cluttering
- Flexbox grouping with `shrink-0` on all interactive buttons, preventing any wrapping or text overlapping.
- Truncation prevention: Canonical slug chip formatted as `/preview/{slug}` with 1-click copy and auto-sizing.
- Purge redundant `quiz` badge from the question card header (preserving difficulty and timer badges).
- Standardize button sizing with clear gap spacing (`gap-2 sm:gap-3`).

### 2.4 Session Persistence & Timed vs Untimed Quizzes
- **Storage Contract:**
  - Key: `wp_quiz_session_${formSlug}`
  - Schema:
    ```typescript
    interface QuizSessionData {
      formSlug: string;
      answers: Record<string, unknown>;
      currentStep: number;
      stepHistory: number[];
      savedAt: number;
      isTimed: boolean;
      timeLeftSeconds: number | null;
    }
    ```
- **Session Controls:**
  - "Save & Resume Later": Serializes state, updates timestamp, and displays clear confirmation toast.
  - Auto-Restore: Detects existing session on load and offers 1-click resume.
  - Timed vs Untimed branching: Timed mode enforces countdown with auto-submit; Untimed mode enables indefinite pause and resume.

### 2.5 Strict Poppins Typography & Vertical Alignment
- Body, options, descriptions, badges, and counters strictly use `font-sans` (Poppins, `font-medium`/`font-normal`).
- `MultilineListItemsInput` counter `{count} items entered` styled in clean Poppins without abrasive monospace font.
- Ubuntu strictly limited to `h1`–`h6` headers.
- Consistent vertical alignment: Sidebar and question canvas align with uniform padding, card radiuses, and border tokens.

---

## 3. Verification & Quality Gates

1. **Anti-Collision Gate:** Buttons in top preview bar never overlap or collide at any viewport width (`>= 320px`).
2. **Redundant Badge Gate:** Redundant `quiz` badge removed from question header.
3. **Sidebar Navigation Gate:** Clicking any question in the left sidebar immediately jumps to that question.
4. **Session Save & Resume Gate:** Saving session preserves answers and step index in `localStorage` across page reloads.
5. **Fullscreen Gate:** Toggling fullscreen expands runner across complete screen with zero wasted margins.
6. **Typography Gate:** All body copy, labels, option text, and counters render in Poppins; only primary headings render in Ubuntu.
