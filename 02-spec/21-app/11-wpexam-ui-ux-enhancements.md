# Spec 11: WP Exam UI/UX Comprehensive Redesign & Interactive Enhancement

## 1. Executive Summary & Provenance

### 1.1 Overview
This specification details the comprehensive UI/UX overhaul of the WP Exam application and candidate assessment runner. It incorporates direct visual telemetry from user feedback, addresses critical UX defects identified in screenshots, standardizes cross-application typography (Poppins body + Ubuntu headings), implements country-flag phone inputs, establishes mandatory red required-field asterisks, provides a searchable position selector, introduces test auto-fill capabilities, refines multi-step conditional flows, fixes dropdown render bugs, declutters preview and header controls, and rebrands the emerald botanical palette as **Green Choice**.

### 1.2 User Request (Verbatim)
```text
https://prnt.sc/QHiwgSZxLLo3
https://prnt.sc/H3XBjmzObTn9
https://prnt.sc/nweN6xI4BX9w
https://prnt.sc/Qms4g8Wr4LWS

Okay. So here we wanted to discuss about the WP EXAM (WPXAM). Yeah. Okay. So you need to help me in some context. For example, the forms that you have made, these are, I think is questionable. It's not really appropriate yet. It does not have the UI/UX feeling. Okay? Try to understand that feeling. I think you are far from understanding. You are just writing code which you do not understand, and I do not appreciate that. If you open the UI, start with assessment. Okay? See the position that you offer in the candidate application. The font quality, the text coloring is not very big. Okay? In terms of the UI/UX, these are bigger and there is no search option. So if you check the sample website that I've given you, if you go into its options, it's too many options which you don't have. I want you to have those options. And based on the options, we will do so many things. And also in the flag section, phone number, I think you need to add the phone number with the flag, which is absolutely missing. Yeah, that is very important. Now, in the system, you need to include this. There should be a test button that I could click and proceed with the next. So add a test button, which will actually fill out the forms so I could go to each section for testing. Make sure phone number is only valid. I don't understand the skill qualification section. Are you immediately open to work? If I check this, I have the experience. If I say, "No, I don't have any experience section," I don't understand why you have this buggy type feeling. I mean, why on earth? I really don't get it. Okay. So let's say I put something in the GitHub. Okay. Let me put GitHub field. Yeah, I can pass it through if I don't provide a GitHub field. Not very good. And fields which are, let's say, required, it needs to have the red asterisks, which you don't have. Okay? You have black one. Okay, technical screening. What do you mean by technical screening briefing? Okay. All right. Makes sense. Which is the database design pattern that challenge for include the query is prima to lean. Okay. And we can ask this type of technical questions, based on the job position, okay, like we have in the step three. But also, I need to have the form in a debug mode. If I do in a debug mode, I can set out which fields can be repeated in other pages in the debug mode. Okay? So if I put and change the debug mode to different selection, it would actually give me different things. Okay? And in the body text, body text needs to be popping. Only the headers needs to be in wood one, two. Body, all text needs to be popping. Make sure the fonts are served properly. I think in our case, we have nine steps. So how do you complete nine steps? How do you pass this? You need to look into the form that I have given you. You try to go through this form if possible, okay, step by step, and see what are the things that it requests and asks. You can open the browser and you can check and understand, copy the screenshots so that you can make a job candidate form. It's not only that, I want these forms to be created from back end. So all these fields, all this conditional stuff that needs to come from back end. And there should be a nicer way so that I could design the page, like the Elementor in WordPress. I should be able to put a video, I should be able to put a title, section, FAQ. I don't have it. It's just very bad. And I cannot go back to the main screen as well. We need to exit. Okay, make the text a bit bigger. Okay, I do have the other options now. All right. But you didn't put the option for the other option. Is it going to be automatically picked or how it's going to work? You didn't explain it. Okay. And also for each one of the question, you can have a description section which you didn't have. Description section could be deployed like a arrow. If I click on it, I can go into the description. If not, then we skip the description section. Okay? Okay, now the UI looks a little bit better, for sure. Okay. And do you see there is a bug if I try to go to the last one, last arrow. It just shows the same icon repeated times. This is a serious bug in the UI that you need to fix. Okay, so let's say I go with the single choice. I'll go with the true, false. Okay, true, false. If I go into the preview. Okay. Why do I see the true, false preview? Why do you see this text? It's already in preview. Why the same thing is repeated? So in the left-hand side, it could just say preview, that's it. Why too many text? Why this true, false preview as well? True, false, I do admire. So in this case, you could also have two options like is it left indent, right indent, or center? We can have the options for this. Okay? You need to enhance the UI according to this. Do you understand? Okay, you need to make the right-hand side panel in the form creation a lot more better. Okay. Now the things are a little bit better than before. Okay? Okay, when I go into the preview, it looks like it's green. Does not make any sense because how it's going to preview or what is the theme that we are using, that should be here in the top, and I didn't pick any. You didn't provide the option for this. It's also stupid. You should use the system themes and also the green ones. So green ones, I've also wanted you to add on the top. You didn't add it. Yeah, Sweet Digs you did add. So it should not be Sweet Digs. It would be like green choice. Okay? So name this as a different ones so that it can be used. Okay, everywhere text, it needs to be Poppins. The headers needs to be Ubuntu, okay? And the back button, let's say this is like we're going to the back, right? Why right back? Just use the icon. It would be much more nicer. So here, the selected option, the header section of the form creation looks terrible, like too many stuff. These things will come up if I highlight or hover over on something. It will just say dot, dot, dot, the slug or something like this, then it would come up. Why too many options? The copy button should be on top. I could copy. Okay? If I like to change, I could just hover over and see it has a dropdown option, and then I change it. Okay, why I would have too many things and too many clouded option in here. You need to think of user experience perspective. It's not very good. Too many slugs. So this should be hidden somewhere. I should hover over and change it. Too many stuff everywhere. So these actually should be down for this purpose. And keep this as clean, the top level, keep it as clean. Combine the buttons if required to use icons to smooth it. Whatever you keep, you need to make things bigger so that it makes sense. Okay? You cannot just put everything together in one shot. That's terrible. You cannot. All the images that is given, I expect you to write the image's name at the end, image URL, and image as a file. Okay? At the end, you share the image. All the image is referred to should be saved as with proper slug and naming inside the assets folder, and they should be referred back to the MD files. Is it understood?
```

### 1.3 Ingested Screenshot Visual Assets
The 5 screenshots provided by the user have been persistently stored under `assets/screenshots/` and are cataloged as follows:

| Ref ID | Source URI | Local Persistent File | Description & Visual Defect Captured |
|---|---|---|---|
| **IMG-01** | `https://prnt.sc/QHiwgSZxLLo3` | `assets/screenshots/64-wpexam-phone-flag-01.png` | Country flag dropdown for phone input (`BD Bangladesh +880`, `US United States +1`, etc.) |
| **IMG-02** | `https://prnt.sc/H3XBjmzObTn9` | `assets/screenshots/64-wpexam-step2-qualifications-02.png` | Step 2 Qualifications immediate-work toggle and experience inputs |
| **IMG-03** | `https://prnt.sc/nweN6xI4BX9w` | `assets/screenshots/64-wpexam-red-asterisk-03.png` | Required field indicator — user underlined black asterisk, demanding **red asterisk** |
| **IMG-04** | `https://prnt.sc/Qms4g8Wr4LWS` | `assets/screenshots/64-wpexam-step3-video-screening-04.png` | Step 3 Technical Screening with Video Briefing block and assessment questions |
| **IMG-05** | `media_1790413650023.png` | `assets/screenshots/64-wpexam-dropdown-arrow-bug-05.png` | Select dropdown bug where top/bottom arrows repeat multiple times |

---

## 2. Core Architectural Specifications

### 2.1 Typography Standard: Poppins Body & Ubuntu Headings
- **Body Text:** All body text, inputs, buttons, labels, and paragraph copy MUST use **Poppins** (`font-family: 'Poppins', sans-serif`).
- **Heading Text:** All headings (`h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `.font-heading`) MUST use **Ubuntu** (`font-family: 'Ubuntu', sans-serif`).
- **Font Scale & Sizing:** Base body text size increased to `text-sm` (14px) and `text-base` (16px). All micro-typography (`text-[10px]`, `text-[9px]`) is permanently eliminated.
- **Font Imports:** Ensure Google Fonts link or `@import` in `index.html` and `src/index.css` loads Poppins (400, 500, 600, 700) and Ubuntu (400, 500, 700).

### 2.2 Country Flag Phone Input with Dialing Codes & Strict Validation
- **Component:** `PhoneWithCountrySelect` in `src/components/ui/phone-input.tsx` or integrated into `FormRunner.tsx`.
- **Supported ISO Country Codes & Flags:**
  - `BD` Bangladesh (`+880`)
  - `US` United States (`+1`)
  - `GB` United Kingdom (`+44`)
  - `CA` Canada (`+1`)
  - `AU` Australia (`+61`)
  - `DE` Germany (`+49`)
  - `IN` India (`+91`)
  - `SG` Singapore (`+65`)
  - `AE` United Arab Emirates (`+971`)
- **Behavior:** Clicking the country pill triggers a clean dropdown displaying country code, name, and dial code. Typing updates national number. Validation ensures international E.164 compliance.

### 2.3 Required Field Red Asterisk Mandate
- **Rule:** Every required field MUST display a prominent red asterisk:
  ```tsx
  {field.isRequired && <span className="text-destructive font-bold ml-1">*</span>}
  ```
- **Black Asterisk Total Ban:** Rendering black asterisks for required fields is strictly banned across all components (`FormRunner.tsx`, `sortable-field-card.tsx`, `FocusQuizRunner.tsx`).

### 2.4 Searchable Candidate Position Combobox
- **Issue:** The candidate application had too few job positions and lacked search.
- **Solution:** Provide an extensive position catalog:
  - Intern Programmer / Junior Fullstack Developer
  - Senior Fullstack Engineer (React + Go / Node)
  - Backend Systems Engineer (Go / SQLite / Postgres)
  - Frontend Architect (React / TypeScript / Tailwind)
  - WordPress / Plugin Developer
  - QA Automation & Testing Engineer
  - DevOps & Cloud Infrastructure Engineer
  - AI / LLM Application Developer
  - Technical Product Manager / UI/UX Designer
- **Searchable Combobox:** Users can type into a filter input to instantly narrow down positions with keyboard and click selection.

### 2.5 "⚡ Test Fill & Next" Fast Testing Engine
- **Requirement:** Testers must be able to click a single button to auto-fill the current step with valid mock data and immediately proceed to the next step.
- **Placement:** Floating or prominent action bar adjacent to "Next Step" / "Save Draft" in `FormRunner.tsx`.
- **Data Generation:** Generates valid names, realistic emails, valid phone numbers according to active country code, selects valid answers, and advances step smoothly.

### 2.6 Step 2 Qualifications Flow & Strict Validation Enforcement
- **Conditional Immediate Work:**
  - "Yes, ready immediately" vs "No, in notice period" transitions cleanly without layout jumping.
  - Notice period selector appears when "No" is selected.
- **Validation Gates:** If Portfolio / GitHub is marked `isRequired`, `FormRunner` MUST block advancing to Step 3 until a valid URL is provided.

### 2.7 Interactive Form Debug Mode
- **Feature:** A dedicated "Debug Mode" toggle in the runner and preview header.
- **Capabilities:**
  - Instant step jumper (Steps 1 to 9).
  - Repeatable fields inspector (test repeating dynamic sections).
  - Raw JSON state drawer for inspecting live form submission payloads.

### 2.8 Elementor-Style Rich Blocks (Video Briefing, FAQ, Expandable Descriptions)
- **Video Briefing Block:** Embedded video/briefing component in Step 3 for architecture & system design technical screenings.
- **Question Description Accordion:** Each question card features an optional collapsible description indicated by a subtle chevron arrow. If clicked, expands detailed instructions/hints; if unexpanded, keeps the card ultra-clean.

### 2.9 Fix Radix UI Select Dropdown Scroll/Arrow Stacking Bug
- **Bug Diagnosis:** In `src/components/ui/select.tsx`, the `SelectScrollUpButton` and `SelectScrollDownButton` components can render visible chevron arrows that stack repeatedly when scrolling or at list boundaries.
- **Fix:** Refactor `SelectScrollUpButton` and `SelectScrollDownButton` with proper boundary detection and hide them when scrolling is unnecessary.

### 2.10 Clean Preview Mode & Choice Alignment Options
- **Preview De-Clutter:** Strip redundant repeated text ("true, false preview" / "Why do you see this text?"). Preview shows only a clean `Preview` badge.
- **Choice Alignment:** Allow choice/boolean questions to be aligned:
  - `left` (default)
  - `center`
  - `right`

### 2.11 Theme Renaming to "Green Choice" & Top Header Theme Selector
- **Theme Name:** Renamed from "Sweet Digs" to **Green Choice** (`green-choice` / `sweet-digs` alias preserved for backwards compatibility).
- **Header Controls:** Top navigation bar provides direct, immediate theme switching between Green Choice, Clean Wide White, Rise Up Asia, Antigravity Dracula, and Obsidian.

### 2.12 Streamlined FormBuilder Action Bar
- **Icon-Only Back Button:** Replace verbose "Back to Admin" text button with a clean `<Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>` linking back to admin/home.
- **Compact Slug Manager:** Replace crowded raw slug inputs with a compact slug chip (`/f/{slug}`) with a 1-click Copy button and hover/click popover to edit.
- **Enlarged Action Controls:** Increase button heights to `h-9` and `h-10` with generous padding and crisp icons.

---

## 3. One-Shot AI Verification Instructions

This block provides the exact one-shot instruction prompt for future AI agents to verify and validate that all specifications in this file are completely implemented:

```markdown
# AI ONE-SHOT VERIFICATION INSTRUCTION: SPEC 11 IMPLEMENTATION GATE

To verify full implementation of 02-spec/21-app/11-wpexam-ui-ux-enhancements.md:
1. Verify Fonts in `src/index.css`:
   - `body, button, input, select, textarea` must use `font-family: 'Poppins', sans-serif`.
   - `h1, h2, h3, h4, h5, h6, .font-heading` must use `font-family: 'Ubuntu', sans-serif`.
2. Verify Phone Input:
   - Must support country selector with flags (BD +880, US +1, GB +44, etc.) in `FormRunner.tsx`.
3. Verify Required Asterisks:
   - Check that `field.isRequired` outputs `text-destructive` or `text-red-500` asterisk, never black.
4. Verify Candidate Position Selector:
   - Position selector in Step 1 must have a search filter and at least 8 engineering/tech roles.
5. Verify Test Auto-Fill:
   - FormRunner must have a functioning "Test Fill & Next" button that populates the active step and advances.
6. Verify Redundant Select Arrow Bug:
   - `src/components/ui/select.tsx` must not render duplicate or stacked scroll chevrons.
7. Verify Theme Name:
   - Theme is titled "Green Choice" in `THEME_CONFIGS` and `THEME_PRESETS`.
8. Verify FormBuilder Top Bar:
   - Back button is an icon-only `<ArrowLeft />` button.
   - Slug display is clean and compact with 1-click copy action.
9. Verification Execution:
   - Run `npm test` and `npm run build` to ensure zero compilation or linter errors.
```

---

## 4. Verification Acceptance Criteria

| Gate ID | Area | Verification Condition |
|---|---|---|
| **AC-11-01** | Typography | Poppins body font + Ubuntu headings applied globally via `src/index.css`. |
| **AC-11-02** | Phone Flags | Phone input provides interactive country flag & dialing code dropdown with validation. |
| **AC-11-03** | Asterisks | All required fields display red asterisks (`text-destructive` / `text-red-500`). |
| **AC-11-04** | Position Search | Step 1 position selector includes instant search filtering and expanded roles list. |
| **AC-11-05** | Test Fill | "Test Fill & Next" button populates valid mock data and advances steps seamlessly. |
| **AC-11-06** | Video Block | Technical screening step renders video briefing player and clean question blocks. |
| **AC-11-07** | Select Chevron | Select component renders single clean chevrons without duplicates. |
| **AC-11-08** | Green Choice | Theme renamed to "Green Choice" and selectable from top header. |
| **AC-11-09** | Clean Header | FormBuilder top bar has icon-only back button and compact hover slug popover. |
| **AC-11-10** | Build & Test | Full test suite passes (`npm test`) and production build succeeds (`npm run build`). |
