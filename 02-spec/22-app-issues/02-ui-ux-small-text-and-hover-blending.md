# Issue: Small Text Typography, Blending Hover Effects & Ineffective Card Hierarchy

## 1. Problem Description & Reproduction
- **Tiny Typography:** Numerous UI elements across the form builder and runner were hardcoded to `text-[10px]` or `text-xs`, causing severe eye strain and failing accessibility/usability standards.
- **Hover Blending:** Action buttons like "AI Studio" and "Tools" suffered from ghosting and low contrast when hovered in light themes because background and foreground fell back to matching or near-matching neutral tones.
- **Card Clutter & Lack of Space:** Question cards placed field type dropdowns, section inputs, and settings in inline rows adjacent to the question, leaving cramped horizontal space for the actual question text.
- **Multiple Choice Limitations:** Single-choice correct answer toggling prevented multiple options from being marked as correct in multi-select quizzes.
- **Section Friction:** Section assignment lacked auto-suggestions of already defined sections in the quiz.

## 2. Root Cause Analysis
1. CSS custom properties for hover states (`--accent`, `--secondary`) were partially omitted in theme presets, causing shadcn outline buttons to inherit transparent or inverted colors unpredictably.
2. Form builder layout did not follow standard form-builder patterns (e.g. Google Forms), leading to cluttered field card bodies.
3. Typography scale relied on micro-sizes (`text-[9px]`, `text-[10px]`) rather than standard body text scales (`text-sm`, `text-base`).

## 3. Remediation & Prevention
- Adopt Google Forms card layout: Field type placed in card header; question input expanded across full width; settings/grading housed in card footer.
- Enforce standard text sizing: minimum `text-sm` for inputs, labels, and buttons; `text-base` for question titles.
- Implement Section combobox with interactive suggestions of existing quiz sections.
- Support multiple correct answers in question options for `multiple_choice` fields.
- Introduce `theme-clean-wide` for spacious, clean white UI.
