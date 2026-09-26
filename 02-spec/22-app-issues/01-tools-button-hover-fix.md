# Issue 01: Tools Button White-on-White Hover Effect

## 1. Reproduction (Why)
- **User Report**: "What a hover effect, white with white... Fix it with RCA"
- **Trigger**: Hovering over the "Tools" button (and potentially other ghost/outline buttons) in the FormBuilder header while a Light Theme (e.g., Clean Light) is active but the root document retains `.dark` class defaults for missing variables.
- **Symptom**: The button text turns white while the background turns light gray, making the text completely unreadable (a severe WCAG contrast violation).

## 2. Root Cause (How)
- **Investigation**: The "Tools" button in `FormBuilder.tsx` uses `<Button variant="outline" className="hover:bg-muted">`. 
- **The Cascade Collision**:
  1. `variant="outline"` internally defines `hover:text-accent-foreground`.
  2. `className="hover:bg-muted"` overrides the hover background to use `--muted`.
  3. In `src/styles/theme.css`, the light theme overrides (like `.theme-clean`) define `--muted` as light gray (`210 40% 96%`) but fail to define `--accent-foreground`. 
  4. Because `--accent-foreground` is omitted, it falls back to the default `.dark` theme value (`210 40% 98%`, which is white).
  5. **Result**: White text (`--accent-foreground`) on a Light Gray background (`--muted`).

## 3. Code Fix
- **Action 1 (Systemic)**: Patch `src/styles/theme.css` to include the missing Shadcn tailwind variables (`--accent`, `--accent-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--destructive-foreground`) for all custom theme definitions (both dark and light blocks).
- **Action 2 (Local)**: Remove `hover:bg-muted` from `variant="outline"` buttons in `FormBuilder.tsx` (like the Tools button). They should rely on the standardized `hover:bg-accent hover:text-accent-foreground` provided by the Shadcn `button.tsx` variant.

## 4. Prevention
- **Rule**: Custom theme variants in CSS must exhaustively define all structural Radix/Shadcn variables. Never define `--muted` without also defining `--accent` and `--secondary`. 
- **Rule**: Avoid combining structural variant props (e.g., `variant="outline"`) with hardcoded hover background overrides (`hover:bg-muted`) that mismatch the variant's expected text foreground.
