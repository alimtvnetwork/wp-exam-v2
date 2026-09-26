# Question Card Redesign & Exam Intelligence Specification

> **/goal** Eliminate visual noise in question cards, implement animated floating title placeholders, consolidate redundant alignment buttons, overhaul Boolean question types (True/False, Yes/No, Enable/Disable), introduce difficulty tiers (Easy/Medium/Hard) with automatic point weighting, support prefix/suffix citations and to-do checklists, enforce flexible exam timers and anti-cheat fullscreen mode, and implement list-of-items autocomplete with memory learning.
> **/learn** Grounded directly on user telemetry and annotated screenshot `assets/screenshots/66-question-card-redesign-01.png`.

## 1. Verbatim User Request & Visual Telemetry

User feedback captured from LightShot annotation `https://prnt.sc/H4MgqjNyxVSH`:
- **Title Noise & Floating Placeholder**: "when the text title we are writing, there is no need to have the question title section. That does not make any sense. Okay. What you could do is put that question or... Question title is not, it's just the title. You can put it very light manner in the right-hand side. Okay? And when I take over or make the text empty, it will show that title in the left-hand side as a placeholder, but in an animated way. So it would move from there, so that would look and feel very nice."
- **Preview & Actions Combination**: "if you see the preview button feels like it has an icon, but it's not visible because of the color issue. Again, preview and action, try to combine together. Okay?"
- **Boolean Type & Display Presets**: "Also the true/false, combine it to a Boolean rather than true/false. And how the true/false is displayed, you have given the left/right. That's all right. But also we can have more option, like is it yes, no, enable, disable. So we can have all types of display option that user can pick or in the display, which is missing. Okay?"
- **Consolidate Redundant Alignment**: "The points section, I think. So you have too many places the left, right, center is mentioned. I don't understand why it is repeated three places. I don't have any clue. It should be in one place. Okay? So wherever you have, it should be on one place."
- **Difficulty Tiers & Points Allocation**: "the points that you have displayed. The points can be default. There'll be a default configuration for the quiz or questions. We can have no points or every question same weight. Okay? And then we can put some questions as different weight. We can have some criteria, easy, medium, hard. So medium, easy, all easy would be in same point. Medium would be different point, hard would be too much difficult point... points can be an exceptional stage that the owner of the quiz can actually put the number... think of this in a different place, like additional option, that will be usually hidden, but we can just click on a button to expand this and have this additional option."
- **Icon-Only Delete & Duplicate**: "And also the delete and duplicate, combine this button with icons. If I hover over, I can see what that is. Combine. Save a space. Okay?"
- **Section & Group Disclosure (Eliminating Empty Space)**: "also the section and group, there will be a little bit of arrow inside the title. After the title, like an arrow, to section. So one would be for the description if you want to, another would be for the section and group. Okay? So if we go into that section and group, and then and only then the section and group will appear, and it needs to be better. The current way that you have done it, it's in the left-hand side. I do not understand why there is empty space in the right-hand side. Why empty space? I have no clue."
- **Direct Number Input Reordering**: "you should be able to type the numbers if you want to. Okay? You can double-click and change the number order, and that will go to that position."
- **Image & Description Unified Add Menu**: "Also the image and description, I think you can combine these two button. But then again, the image addition, that would be plus image. The description, you need to find an icon if someone hovers over. The description would be actually below of the question, so the space will be reduced."
- **Citations, Reference Links & Actionable To-Do Checklists**: "Some additional step or additional citations. So we should have a way to add. There should be a plus button where we could just hover over. We can see image, we can see a description, we can see other things like citations or links or things like that. So when we go to the links, we provide some links with title or a list of items... It can be in markdown format, so all kinds of formats can be accepted... This can be a prefix of the question we can set or suffix of the question. If we put as a prefix of the question, so user has to visit those links and do the check, like say, 'I have done it.' Check."
- **Timers & Anti-Cheat Fullscreen Mode**: "quizzes can have timers... fixed time, let's say 30 minutes they have to finish all the quizzes... or each question is five minutes... easy question, how many time? Hard points or easy media... make a full screen mode as well... cannot get out of the full screen mode. If it goes out of the full screen mode, the screen becomes black or white with warning."
- **List of Items & Suggestions (CSV/JSON/Memory Autocomplete)**: "user can put list of items. So rather than like short answer or just Boolean, so user can give two ways that they could provide. They could just type in, or also when the user type, we could choose the question how the typing would behave. We could give a set of CSV or we could say, this is a pre-filled CSV that would actually showed up in the list when they type or a JSON... Or we could point a SQLite DB. So this type of suggestions can be imported and exported... improve the memory based on what user types or saves to the answer."

### Visual Telemetry Reference
- `assets/screenshots/66-question-card-redesign-01.png`:
  1. Top-left `#2 *` marked for direct type reorder.
  2. Redundant `Preview` and `Actions ▾` boxed for combining into cohesive action tools.
  3. `Question Title *` label boxed with arrow pointing to title input indicating removal of static text in favor of an animated floating placeholder.
  4. Redundant empty space next to `Section / Group:` flagged as `"EMPTY Space ????"`.
  5. Alignment (`Left | Center | Right`) repeated across 3 separate rows flagged for consolidation into a single place.
  6. `Duplicate` and `Delete` wide text buttons boxed for conversion to compact icon buttons.

---

## 2. Technical Contracts & Architecture

### 2.1 Extended Form Field Types (`src/lib/types/form.ts`)
```typescript
export type FieldType =
  | 'text'
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'single_choice'
  | 'true_false' // alias for backward compatibility
  | 'boolean'    // universal boolean type
  | 'dropdown'
  | 'number'
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'file_upload'
  | 'video'
  | 'rating'
  | 'regex_text'
  | 'list_items'; // new list of items/links

export type BooleanDisplayPreset = 'true_false' | 'yes_no' | 'enable_disable' | 'agree_disagree';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type CitationPosition = 'prefix' | 'suffix';

export interface QuestionCitation {
  id: string;
  title: string;
  url?: string;
  description?: string;
  position: CitationPosition;
  isRequiredCheck?: boolean; // Must check "I have visited/done this"
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  isRequired: boolean;
  points?: number;
  difficulty?: QuestionDifficulty;
  customPointsOverride?: boolean;
  booleanDisplay?: BooleanDisplayPreset;
  alignment?: 'left' | 'center' | 'right';
  citations?: QuestionCitation[];
  suggestionsPool?: string[];
  group?: string;
  // ... existing fields preserved
}

export interface FormSettings {
  timeLimitSeconds?: number;
  timerMode?: 'global' | 'per_question' | 'per_difficulty';
  perQuestionSeconds?: number;
  difficultyTimers?: { easy: number; medium: number; hard: number };
  difficultyPoints?: { easy: number; medium: number; hard: number };
  enableFullscreenLock?: boolean;
  defaultQuestionsRequired?: boolean;
  passingScore?: number;
  successMessage?: string;
}
```

### 2.2 Question Card Geometry & Layout (`sortable-field-card.tsx`)
1. **Header Row**:
   - Left: Drag handle + Direct-type question number `<Badge>` (`#2`). Double-clicking or clicking toggles an inline number input allowing instant index jumping.
   - Field Type `<Select>` dropdown (supporting `Boolean`, `Multiple Choice`, `List of Items`, etc.).
   - Actions Dropdown & Preview toggle: Unified icon buttons with clear tooltips.
2. **Title & Animated Placeholder**:
   - Single clean input container.
   - When focused or filled, the placeholder animates smoothly up and to the right (`text-xs text-muted-foreground transition-all duration-200`).
   - Clean inline buttons: `[+] Add (Image, Description, Citation)` and `[→ Section / Group]` disclosure.
   - Expands `Section / Group` directly inline with 100% width, eliminating right-hand empty space.
3. **Consolidated Alignment & Boolean Presets**:
   - Single alignment toggle in question card options.
   - For Boolean fields, user can select display preset:
     - `True / False`
     - `Yes / No`
     - `Enable / Disable`
     - `Agree / Disagree`
4. **Footer Toolbar**:
   - Left: `Required *` switch.
   - Middle: Difficulty selector (`Easy [5pts]`, `Medium [10pts]`, `Hard [20pts]`) with expandable custom point override.
   - Right: Compact icon buttons for `Duplicate` (`<Copy />`) and `Delete` (`<Trash2 />`) with Radix tooltips.

---

## 3. Verification & Compliance Invariants

- Rule 1: Zero explicit boolean checks (`== true` banned).
- Rule 4: Lowercase file naming convention (`spec13-question-card-intelligence.test.ts`).
- Rule 5: Strict relative Git paths only (zero absolute paths).
- Rule 7: Zero storage artifact upload.
- Full Vitest suite passing with zero regressions.
- Vite production build passing (`npm run build`).
