# Subtask 01 — Theme Palettes and Dracula Contrast

**Parent Plan:** `.ai-memory/plans/pending/14-theme-contrast-hover-animations-and-presentation-layout.md`  
**Status:** completed  
**Owned Files:**  
- `src/styles/theme.css`  
- `src/styles/theme.less`  
- `src/themes/theme-definitions.ts`  
- `src/lib/theme-context.tsx`  

---

## Objectives

1. In `src/styles/theme.css` and `src/styles/theme.less`:
   - Upgrade Dracula `--muted-foreground` from `225 27% 51%` to `225 25% 76%` (`#BAC7E8`).
   - Upgrade Dracula `--wp-exam-text-secondary` from `#6272A4` to `#BAC7E8`.
   - Update Dracula `--border` and `--input` to `232 14% 34%` (`#4B4E63`) for clean, crisp structural separation.
   - For Riseup theme: ensure `--wp-exam-highlight` is `#F7F1E6` (cream), adhering to Rule 9 (gold `#E8C547` strictly indicator mark, cream primary text).
2. In `src/themes/theme-definitions.ts`:
   - Set Dracula `textSecondary: '#BAC7E8'`.
   - Set Riseup `highlightWord: '#F7F1E6'`.
3. In `src/lib/theme-context.tsx`:
   - Sync Dracula and Riseup color tokens to match the updated definitions.
