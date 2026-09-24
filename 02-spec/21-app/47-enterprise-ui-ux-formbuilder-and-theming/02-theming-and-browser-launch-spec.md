# Spec [47] Part 2: Universal Theming Engine & Browser Launch Specification

## 1. Browser Auto-Launch Specification (`run.ps1`)

### 1.1 Root Cause of Current Failure
In `run.ps1`, browser launching was attempted via `[System.Threading.Tasks.Task]::Run([Action]{ ... })`. In PowerShell Core / Windows PowerShell, executing a scriptblock inside a .NET thread pool worker without an attached PowerShell runspace fails silently. Additionally, `npm run dev` was launched without `--open`.

### 1.2 Target Launch Mechanics
1. **Native Vite Open Parameter:** Pass `--open` to Vite (`npm run dev -- --host 127.0.0.1 --port $Port --open`). Vite's internal launcher natively handles opening default browsers on Windows, macOS, and Linux without shell detachment.
2. **Resilient PowerShell Background Job Fallback:** In addition to `--open`, deploy a native PowerShell background job (`Start-Job`) or asynchronous timer that polls `http://127.0.0.1:$Port` for HTTP 200/404 readiness (up to 5 seconds) and invokes `Start-Process $TargetUrl` if Vite has not yet engaged the browser.

---

## 2. Universal Theming Engine Specification

### 2.1 CSS Variables Contract
The system establishes a single authoritative CSS custom property contract declared on `:root` and `.wp-exam-theme`:

```css
:root, [data-theme], .wp-exam-theme {
  --wp-exam-bg: #0A0A14;
  --wp-exam-card: #121224;
  --wp-exam-card-border: #2A2A44;
  --wp-exam-card-hover: #1A1A32;
  --wp-exam-primary: #FFAD01;
  --wp-exam-primary-text: #0A0A14;
  --wp-exam-text-primary: #FFF1D6;
  --wp-exam-text-secondary: #B8A990;
  --wp-exam-accent: #FFAD01;
  --wp-exam-badge-bg: rgba(255, 173, 1, 0.15);
  --wp-exam-badge-text: #FFAD01;
  --wp-exam-progress-bar: #FFAD01;
}
```

### 2.2 Theme Catalog Alignment
The theme catalog must provide unified presets accessible identically across `FormRunner.tsx`, `FocusQuizRunner.tsx`, `wizard-runner.tsx`, and the Admin layout:

| Theme ID | Display Name | Background | Card Surface | Primary / Accent | Text Primary | Appearance |
|---|---|---|---|---|---|---|
| `riseup-asia` / `riseup` | Rise Up Asia | `#0A0A14` | `#121224` | `#FFAD01` (Gold) | `#FFF1D6` | Dark |
| `dracula` | Antigravity Dracula | `#1E1F29` | `#282A36` | `#BD93F9` (Purple) | `#F8F8F2` | Dark |
| `vscode-dark` / `obsidian` | VS Code Dark | `#0E1117` | `#161B22` | `#007ACC` / `#38BDF8` | `#E6EDF3` | Dark |
| `letterly` | Letterly Night | `#0F0E1E` | `#18162F` | `#5C45FD` (Indigo) | `#FFFFFF` | Dark |
| `clean` / `white` | Clean Paper Light | `#F8FAFC` | `#FFFFFF` | `#2563EB` (Blue) | `#0F172A` | Light |

### 2.3 Scoped Application in Runners
1. **Dynamic Style & Class Injection:** `FormRunner.tsx` and `wizard-runner.tsx` must wrap the runner container with `style` and `className` reflecting the active theme.
2. **Elimination of Hardcoded Utilities:** Replace hardcoded `bg-slate-900`, `bg-card`, and static borders in runner cards with CSS variable-backed styles (`style={{ backgroundColor: 'var(--wp-exam-card)', borderColor: 'var(--wp-exam-card-border)' }}`).
3. **Global Theme Context Sync:** Updating the theme in any runner or admin selector immediately dispatches to `ThemeProvider`, updates `localStorage`, and updates `data-theme` and CSS variables on `document.documentElement`.
