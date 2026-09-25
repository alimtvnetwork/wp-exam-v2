# 61: Comprehensive Slug Management, File Upload Engine, Modern UI Template, Question AI Studio & Fluid Theming

Spec Reference: [02-spec/21-app/readme.md](readme.md)

## User Request (Verbatim)

```text
is it done properly???

Few serious issues. That's why I always say verify your task. You would have done nothing but, what can I say, stupidity in account. Okay? Why you do that? That's kind of interesting. Now, let's come to the point where you could actually get out of your stupidity. So here, when I say you check and validate, you check the URL as well. The URL does not change. Every time I go to somewhere, it should have its own slug, you stupid fuck. So it should have its own category of the slug. So you should have a slug management, and you can show me at the end what the slug that you are building, how you are building. Every slug needs to be very clear. Okay? So slug is very terrible what you have. Then you have other issues. I selected the file, right? And the test view shows nothing. And why there is a, let's say, section or module, either put section or module. Don't put two, okay? Okay. Now, coming to the point, when I put the validation, where is the file upload? I don't see the file upload. It's stupidity. Things does not work, and you come back and say, "It's working." I asked you several times to make the UI better. You put the required field just like the old raw forms does. You don't have any nice UI template. You are not using any framework properly, just garbage. Why? And the test view looks nothing. Okay? Okay. Now these are there. Okay, fine. Okay, I can drag drop, but drag drop has issues. Drag drop has issues. So if I'm in this section, I should also be drag items out of this section, I believe. Okay, I can. That's all right. Okay. So in each section, I should have each question, I should have AI instruction and AI inputs. What do I mean by that? AI instruction will be an instruction section where all these fields, options, these are available that would be there, and adjacent format that the current system is, and the output format that we seek for that AI can create, which we can import. Okay? So that is like everywhere there should be a short button input/export using action actually in the action section you can keep. And the coloring does not make any sense. The coloring button, the hover over, there is not much of an animation. You can see it's very terrible actually. If you change the color to something else, some other company, like no effect, very terrible. Like it change to literally, there is literally no effect. It's stupid. I asked you several times, and you are playing stupidity with me. Why? What is the main reason?
```

---

## 1. Domain Architecture & Architectural Boundaries

### 1.1 Slug Management & Hierarchical URL Routing
- **Bidirectional Ground Truth:** Every entity in the application must maintain a strict URL contract:
  - Form Editor: `/admin/form/:slug` (supports category namespaces e.g. `tech-eval/frontend-developer`)
  - Public Form Runner: `/f/:slug`
  - Interactive Live Preview: `/preview/:slug`
- **Slug Management Subsystem:**
  - Auto-generation from title with category prefixing.
  - Sanitization logic: lowercase alphanumeric, hyphens only, no double hyphens, trimmed.
  - Real-time address bar synchronization without unmounting components.
  - Visual Slug Inspector in the builder header displaying URL scheme, category tags, and copy-ready URLs.

### 1.2 Dedicated File Upload Engine (Builder & Runner)
- **Validation Rules (`FileValidationRule`):**
  - Max File Size: Configurable limit in MB (2, 5, 10, 25, 50, 100 MB).
  - Allowed File Extensions: Multi-select format pills (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.png`, `.jpg`, `.jpeg`, `.zip`, `.csv`, `.json`).
  - Custom Rejection Message: User-customizable rejection text.
- **Interactive File Upload Component in FormRunner & Test View:**
  - Drag-and-drop dropzone with animated upload states.
  - Selected file card displaying file name, size in MB, MIME type icon, and timestamp.
  - Immediate evaluation against configured file validation rules with visual indicators:
    - Pass: Emerald banner with `Valid & Approved`.
    - Fail: Rose alert banner with exact rejection reason and `Reset Test` button.

### 1.3 Modern UI Template & Redesigned Required Field Indicators
- **Elimination of Raw Form Styling:**
  - Modern card glassmorphism with subtle borders and shadows (`rounded-2xl border-border/70 bg-card/90 shadow-sm`).
  - Sophisticated Required Indicator: Sleek pill badge `<Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/10 font-mono">Required</Badge>` replacing raw asterisks.
  - Responsive, touch-friendly option buttons with clear selection active states and micro-interactions.

### 1.4 Terminology & Cross-Section Moving
- Standardize all UI references strictly to **Section** (zero instances of "module" or "section or module").
- Provide 1-click **Move to Section** action in each card's Actions menu to move fields between sections even in filtered views.

### 1.5 Question AI Instruction & 1-Click Import/Export Studio
- In each question card's Actions menu:
  - **AI Instruction Studio:** Displays structured AI prompt including all field properties, options, points, section, and validation constraints.
  - **Current System JSON:** Valid JSON representation of the question.
  - **Expected AI Output Schema:** JSON format that AI models must emit for valid imports.
  - **1-Click Import / Export:** Textarea and copy buttons to paste AI-generated JSON and immediately update or generate questions.

### 1.6 Theming Engine Overhaul & Micro-Animations
- Replace hardcoded color classes with dynamic CSS variable tokens (`hsl(var(--primary))`, `hsl(var(--card))`, `hsl(var(--accent))`).
- Ensure all 5 themes (Rise Up Asia Gold, Purple Theme, Dracula Purple, Obsidian Emerald, Clean Slate) transform the entire UI instantaneously.
- Add rich button hover micro-interactions: scale transitions (`hover:scale-[1.02] active:scale-[0.98]`), vibrant glow micro-shadows, and smooth CSS color transitions.

---

## 2. Verification Gates & Acceptance Criteria

1. **URL Synchronization:**
   - Navigating or editing a form slug updates the browser URL to `/admin/form/:slug` in real-time.
   - Bookmarking or copying the address bar URL returns to the active form.
2. **File Upload in Test Preview & Runner:**
   - Selecting a file in the builder's interactive dropzone or in `FormRunner` renders the file details card and validates size/extensions live.
3. **Question AI Studio & Import/Export:**
   - Every question has an "AI Studio & Schema" and "Export/Import JSON" action.
   - Pasting valid question JSON updates the question immediately.
4. **Theming & Animations:**
   - Switching themes transforms colors across cards, buttons, badges, and headers without hardcoded color override locks.
   - Buttons and cards animate on hover with smooth micro-scale and glow.
5. **Quality Gates:**
   - `npx tsc --noEmit` -> 0 errors.
   - `npm run lint` -> 0 errors.
   - `npx vitest run` -> 100% tests passing.
