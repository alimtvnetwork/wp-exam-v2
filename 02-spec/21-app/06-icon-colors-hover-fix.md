# Task: Fix Icon Colors and Hover Effects (Theme Clash)

## User Request (Verbatim)
YOu cannot do blue with close green color, fix icons everywhere in hover effect for all themes please

## Image Context
![Screenshot](assets/screenshots/theme-clash-1790385887348.png)
The screenshot shows:
- Health button: Green text/border
- Tools button: Blue icon (Wand), dark text.
- Preview button: Light blue
- Save Form button: Dark blue

## Actionable Tasks
1. **Task-01: Fix Icon Colors & Hover Effects**
   - In `src/components/forms/FormBuilder.tsx`, the `Tools` button likely has a hardcoded blue color for the `Wand2` icon (e.g., `text-blue-500`).
   - Remove hardcoded blue icon colors so they inherit `text-current` or `text-foreground`.
   - Ensure all header buttons (Preview, Save, Tools) have unified hover effects and don't create jarring color clashes across custom themes (Clean, Riseup Asia, etc.).
