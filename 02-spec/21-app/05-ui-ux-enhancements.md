# UI/UX Enhancements, Layout Restructure, and Button Fixes

## 1. Overview
This specification addresses multiple UI/UX defects reported by the user, focusing on typography readability, Google Forms-style field card restructuring, button hover contrast issues, and MCQ feature enhancements. 

## 2. User Request (Verbatim)
"You need to work on UI/UX. It's still not there. The reason I'm saying this because you have very small text. So small text does not comply with UI/UX... the correct button is better, but also you can add multiple correct buttons, okay, for the section text... type the sections which is already created in that quiz... suggest to type the existing one... The AI Studio button, when I hover over, it just blends it in... tool section buttons, these are really terrible work... why there is a big gap?... make the preview open in another window with shortsession... add better animation. Don't use the zoom-in animation. I really hate it. Probably a hover animation... MCQ section, the answer can be a paragraph, answer can be a link, answer can be others... add that Others option where we could add others, and also in the Others, we can also suggest few... Field type should be on top position where you have required grading... Just try to understand the Google Forms..."

## 3. Data Contracts & Model Updates
### 3.1 `FormField` Interface
- Add `allowOtherOption?: boolean` to the `FormField` type to support the enhanced MCQ "Others" feature.
- Add `otherOptionSuggestions?: string[]` to store the auto-suggested common answers for the "Others" field (e.g., "Engineering", "Biotech").

## 4. Visual and UX Specification
### 4.1 Typography & Layout Gaps
- **Typography**: Replace excessive `text-[10px]` and `text-xs` with `text-sm` and `text-base` in `FormBuilder.tsx` and `sortable-field-card.tsx`.
- **Top Gap**: Inspect `Index.tsx` and `FormBuilder.tsx` for massive `mt-10` or `pt-16` padding blocks and eliminate them so the builder starts near the top of the viewport.

### 4.2 Button Hover Contrast (AI Studio & Tools)
- Remove `hover:bg-muted`, `hover:text-white` or custom hover overrides on the AI Studio and Tools buttons. Rely exclusively on Shadcn's standard `hover:bg-accent hover:text-accent-foreground` for outline/ghost buttons.

### 4.3 Field Card Restructure (Google Forms Style)
- Move the "Field Type" dropdown selector (Multiple Choice, Text, Video, etc.) from the middle/bottom of the card to the **Top Header** of the card, next to the "Required", "Points", and "Grading" toggles.
- Dedicate the main body of the card entirely to the Question input and media options.

### 4.4 Section Autocomplete & Enhanced Others
- **Section Autocomplete**: When typing a Section name in the builder, provide a combobox/datalist dropdown suggesting existing sections already created in the form.
- **Enhanced Others**: When `allowOtherOption` is enabled in MCQ, render an "Other: [Text Input]" field. If `otherOptionSuggestions` exist, render them as a datalist for the text input.

### 4.5 Animations
- Strip `animate-in zoom-in-95` from `FormRunner.tsx` and UI components.
- Replace with `animate-in fade-in duration-200` or subtle hover scaling (`hover:-translate-y-0.5`).
