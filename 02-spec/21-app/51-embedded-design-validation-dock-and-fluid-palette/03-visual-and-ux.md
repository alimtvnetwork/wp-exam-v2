# Spec 51: Visual & UX Architecture

## 1. Right Inspector Dock Hierarchy
The right column (`lg:col-span-4 sticky top-6`) houses the primary authoring toolbar divided into 4 tabs:

```
┌────────────────────────────────────────────────────────┐
│ [ Fields ]  [ Outline (N) ]  [ Audit (A+) ]  [ Config ]│
├────────────────────────────────────────────────────────┤
│ TAB 1: Fields                                          │
│  - Search input with clear (✕) button                  │
│  - Segmented category chips (All, Choice, Text, Media) │
│  - Single/dual responsive component cards with pastel  │
│    icons, category labels, and micro-hover states      │
├────────────────────────────────────────────────────────┤
│ TAB 2: Outline                                         │
│  - Search filter input                                 │
│  - Numbered question cards with Req and pt badges      │
│  - 1-click jump to canvas + up/down reorder buttons    │
│  - Bottom metrics ribbon (Questions, Req, Points, Time)│
├────────────────────────────────────────────────────────┤
│ TAB 3: Audit (Embedded Design Validation)              │
│  - Overall Health Meter: Score % + Letter Grade badge   │
│  - Severity breakdown: Errors, Warnings, Suggestions   │
│  - Category health progress bars                       │
│  - Diagnostic issue feed with inline Jump & Auto-Fix   │
│  - "Fix All Repairable Issues" action trigger          │
├────────────────────────────────────────────────────────┤
│ TAB 4: Config                                          │
│  - Access & Security (Public, Password, Protected)     │
│  - Assessment & Evaluation (Quiz mode, Instant review) │
│  - Presentation Pacing (Sequential 1-by-1, Progress bar│
└────────────────────────────────────────────────────────┘
```

## 2. Palette Component Card Ergonomics
- Padding: `p-2.5` with rounded `rounded-xl` borders.
- Background: `bg-card/70 border-border/80 hover:bg-primary/5 hover:border-primary/40`.
- Icon Box: `w-7 h-7 rounded-lg border flex items-center justify-center shrink-0`.
- Typography: Label `text-[11px] font-semibold text-foreground`, subtitle `text-[9px] text-muted-foreground`.
- Micro-interactions: `active:scale-[0.98] transition-all` with hover `+` icon trigger.

## 3. Responsive Dock Dimensions
- Outer container: `sticky top-6 flex flex-col h-[calc(100vh-5rem)]`.
- Tab content area: `flex-1 overflow-hidden p-3`.
- Internal scroll containers: `overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar pr-1`.
