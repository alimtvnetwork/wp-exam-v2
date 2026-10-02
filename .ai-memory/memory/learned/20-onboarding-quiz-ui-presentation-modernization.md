# Onboarding Quiz UI and Presentation Modernization Decisions

Status: Active
Spec: 02-spec/21-app/75-onboarding-quiz-presentation-modernization/01-architecture-spec.md
Companion: 02-spec/21-app/75-onboarding-quiz-presentation-modernization/02-component-spec.md
Plan: .ai-memory/plans/completed/75-onboarding-quiz-presentation-modernization.md

## Architectural & Design Decisions

1. **Brand Identity & Logo**:
   - Application wordmark is officially **Onboarding Quiz**.
   - Created dedicated modern vector brand asset `src/assets/onboarding-quiz-logo.svg` incorporating dual-layer glyphs with emerald, cyan, and indigo accents alongside pure white typography.
   - Admin sidebar brand presentation (`src/components/admin/wp-admin-sidebar.tsx`) updated to display the Onboarding Quiz logo with accompanying subtext "Enterprise Assessment Suite".

2. **Builder Chrome & Excessive Green Reduction**:
   - Replaced overwhelming thick green borders with a restrained, refined 2px dynamic accent ribbon (`h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60`) at the card crown.
   - Form title card and questions list utilize balanced soft shadows (`shadow-md`, `shadow-xs`) with subtle elevation instead of heavy borders.
   - Form title input remains prominent, inline-editable, and auto-generates slug URLs.

3. **Unified Navigation & Action Dropdown**:
   - Consolidated scattered secondary actions (Health score, Quiz configuration, Notification triggers, JSON import/export, Google forms importer, visual branching flow, share, and live URL copy) into a single compact Config dropdown (`SlidersHorizontal` icon button) with descriptive menu items and tooltips.
   - Primary action controls are cleanly separated: Preview (`Eye` icon) and Save (`Save` icon) are housed in a segmented pill with clear tooltips.

4. **Right-Hand Sidebar & Palette Modernization**:
   - Restored layout boundaries across Fields, Outline, Audit, and Config tabs in `FormBuilder.tsx`.
   - Category filter pills in `src/components/forms/field-palette.tsx` (All, Choice, Text, Media, Page Elements) use responsive tooltips with icons to eliminate truncation.
   - Palette items render within an unclipped grid with colorful iconography and clean descriptions.

5. **Question Card & Item Options Polish**:
   - Added complete question action icons in `src/components/forms/sortable-field-card.tsx` for Save, Duplicate, Delete, Preview, and Reorder (up/down).
   - Multi-choice, single-choice, and dropdown option items feature crisp borders, responsive padding, choice alignment controls (Left, Center, Right), custom stored values, and checkmark indicators for correct answers.

6. **White Presentation Split Mode & CSS3 Animations**:
   - Re-architected `FormRunner.tsx` presentation split mode to mirror White Presentation standards:
     - Left column (50%): Large `text-4xl lg:text-5xl` question headline, full subtitle and description rendered without `line-clamp-2` artificial truncation, and an interactive guidance chip with `Lightbulb` icon when a placeholder hint is configured.
     - Right column (50%): Elevated response cards with `@keyframes slideInUpSoft` upward slide-in animation (`.slide-up-anim`), staggered cascade delays (`.stagger-1` through `.stagger-6`), and tactile hover glide (`hover:translate-x-2`, `.presentation-option-card`).
   - Suppressed redundant `QuizHeroSection` and `Candidate Guest` banners in presentation split mode so questions occupy the full viewport immediately.

7. **Floating HUD Sequence Sidebar**:
   - In `presentation_split` mode, `<aside>` is converted into a floating HUD overlay (`fixed top-16 left-4 z-50 w-72 sm:w-80 max-h-[calc(100dvh-5rem)] bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl p-4`) with backdrop click dismissal.
   - `<main>` occupies 100% full width (`w-full`) so the 50/50 presentation split grid is never squished or compressed by the sidebar.
   - When collapsed, a pinned floating `Questions (Step X/Y)` button in the bottom-left corner allows instant access to the question drawer.

8. **Constrained Video Presentation & 2-Choice Route Controls**:
   - Video player in presentation mode is constrained to `max-w-3xl mx-auto w-full max-h-[380px] aspect-video rounded-2xl overflow-hidden border border-border shadow-lg bg-black/80`.
   - For 2-choice or branching questions, dual route buttons render directly below the video to trigger conditional routing via `getNextStepIndex`.

9. **Color Harmony & Brain Fog Elimination**:
   - **Purple Theme**: Elevated `--secondary` to `hsl(246 32% 19%)`, set luminous border tokens (`#3A3568`), and guaranteed pure white headlines to eliminate purple-on-purple mudiness.
   - **RiseUp Theme**: Spelled `RiseUp` (one word); gold `#E8C547` restricted strictly to active focus rings and choice checkmarks; body text and controls use warm cream (`#FFF1D6` and `#F7F1E6`) on midnight navy `#0A0A14` to prevent cognitive fatigue.
   - **VS Code Navy Gold**: Registered preset `vscode-navy-gold` (`Navy Gold`) with `#0D1117` background, `#F0F6FC` text, and gold choice indicators.
