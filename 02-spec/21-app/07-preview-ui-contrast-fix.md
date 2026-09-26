# Task: Fix FormRunner Preview UI & Contrast

## User Request (Verbatim)
It is fully trash in preview mode, what are you working on?? WHy that bad??

## Image Context
![Screenshot](assets/screenshots/preview-trash-1790386013361.png)
The screenshot shows the Preview mode (`FormRunner.tsx`):
1. **Broken Buttons:** The `Share Direct URL` and `Auto Fill` buttons in the top dark header have a white background with invisible (white or light gray) text/icons.
2. **Faint Buttons:** The `Previous` button in the question card has very faint gray text on a white background.
3. **Contrast Clash:** The header is dark, but the buttons inside it are forcing light-mode styles, resulting in unreadable text.

## Actionable Tasks
1. **Task-01: Fix FormRunner Header Buttons**
   - Locate the `Share Direct URL` and `Auto Fill` buttons in `src/components/runner/FormRunner.tsx` (or `PreviewHeader`).
   - Remove hardcoded `bg-white` or fix the `variant="outline"` classes so they inherit the correct dark-mode text and background (`bg-transparent text-foreground border-border hover:bg-accent`).
   - Fix the `Previous` button in the form card to have legible contrast (e.g., standard `variant="outline"` without faint custom text colors).
