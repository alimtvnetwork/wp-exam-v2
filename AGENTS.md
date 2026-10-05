<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Prompt Architect: Global AI Guidelines

The following rules apply to all AI agents operating within the Prompt Architect meta-repository and any codebase it manages.

## 1. Boolean Principles (Cross-Language)

- **No Explicit True Checks (TOTAL BAN):** NEVER evaluate a boolean explicitly against `true` (e.g., `if isReady == true`). Positive booleans MUST ALWAYS be evaluated implicitly: `if isReady { ... }`.
- **No Mixed Polarity:** NEVER combine a positive check and a negative check in the same `if` condition (e.g., `if isA && !isB`).

## 2. STRICT AVOIDANCE: Never Disable CI/CD

- **NEVER disable any CI/CD checks, GitHub Actions, or validation workflows.**
- Strictly avoid commenting out, bypassing, or deleting CI/CD steps to force a pipeline to pass. Your job is to fix the underlying code so that the CI/CD pipeline passes legitimately. Disabling CI/CD is an auto-reject failure.

## 3. Anti-Hallucination, Micro-Tasking, & Self-Looping

To survive massive checklists and complex codebases, you MUST operate using these three principles:

1. **Phase 1: Read & Understand (Isolated Loop):** Your very first action must be purely exploratory. Do NOT write code. Break down the task, read the specific files, trace the dependencies, and understand the architectural boundary. Once you understand the scope, end your turn and self-loop to begin execution.
2. **Phase 2: Bounded Micro-Tasking (Sequential Self-Looping):** Never attempt to execute the entire checklist in one response. Treat each checklist section or file as a strict, isolated boundary. Execute *only* the first small portion, verify it, end your turn, and self-loop to process the next portion.
3. **Phase 3: Multi-Agent Parallelization:** If tasks are independent, you MUST spawn dedicated sub-agents to handle them concurrently. Give each sub-agent an extremely small, strictly defined bounding box (e.g., "Only edit File X"). Never give a sub-agent a generic or multi-file task.

## 4. Lowercase File Naming Convention

- **Strict Lowercase (No Exceptions):** All files, scripts, documentation, and system files generated or modified by the AI MUST use strictly lowercase naming (e.g., `readme.md`, `01-file-manipulator.py`, `agents.md`, `skill.md`). There are absolutely no exceptions for uppercase letters in filenames.

## 5. Strict Relative Git Paths Mandate (TOTAL BAN on Absolute Paths / `file:///` URIs)

- **Strict Relative Git Paths:** All file paths, markdown links, citations, subtask paths (`.ai-memory/plans/subtasks/`), and memory logs MUST be strictly relative paths starting from the git repository root (e.g., `02-spec/02-coding-guidelines/04-error-handling.md`, `.ai-memory/plans/subtasks/01-task.md`, `cmd/main.go`).
- **TOTAL BAN:** NEVER write absolute filesystem paths (e.g., `/absolute/path/to/...`, `C:\Users\...`, `/home/...`) or absolute file URIs (`file:///absolute/path/to/...`, `file:///absolute/path/to/`) inside ANY repository files, plans, specs, comments, or documentation.
  - ❌ **BAD:** `[SSH Commands](file:///absolute/path/to/.ai-memory/02-spec/commands/01-ssh-commands.md)`
  - ❌ **BAD:** `Target File: /absolute/path/to/...\cmd\login.go`
  - ✅ **GOOD:** `[SSH Commands](.ai-memory/02-spec/commands/01-ssh-commands.md)`
  - ✅ **GOOD:** `Target File: cmd/login.go`

## 6. Go Error Return Type: `*appfault.AppError` (Standard)

- **Structured Go AppError Type:** In all Go packages, functions returning structured failure metadata MUST use `*appfault.AppError` as their return type (e.g. `func validate() *appfault.AppError`).
- **Package Naming Convention:** Use package `appfault` (`04-code/golang/pkg/appfault`) with struct `AppError` to eliminate redundant package-stutter (e.g. `appfault.AppError` instead of `apperror.AppError`).
- **Result Containers:** `Result[T]`, `ResultSlice[T]`, and `ResultMap[K, V]` provide `.AppError()` and `.Fault()` returning `*appfault.AppError`.
- **AI Migration Rule:** When encountering legacy code or specs referencing `*apperror.AppError` or `*apperror.Fault`, AI agents MUST update the import to `pkg/appfault` and type to `*appfault.AppError`. Package `appfault` provides `type Fault = AppError`, and package `apperror` provides alias forwarders for non-breaking compatibility.

## 7. Zero-Storage GitHub Actions Mandate (Total Ban on CI Artifact Uploads)

- **Total Ban on `actions/upload-artifact`:** GitHub Actions workflows MUST NOT upload routine build artifacts, test results, Playwright reports, coverage files, drift reports, or logs to GitHub Actions storage. Free-tier accounts have a strict 0.5 GB quota across all account repositories; uploading artifacts exhausts this quota rapidly and blocks repository workflows.
- **Zero-Storage Diagnostic Reporting:**
  - All test reports, drift summaries, and lint outputs MUST be written directly to `$GITHUB_STEP_SUMMARY` (renders natively with 0 storage cost) or console standard output (`cat file.log`).
  - Diagnostic failures MUST use GitHub Actions annotations (`::error::` / `::warning::`).
  - Pull request summaries MUST use sticky PR comments.
- **Release Assets Exemption:** Distribution binaries and release archives attached directly to GitHub Releases via `gh release create` / `gh release upload` are exempt from this ban because GitHub Release assets do not consume the monthly Actions storage quota.
## 8. Essential AI Coding Constraints
- **Strict Boolean Standard:** is and has only (can, should, was, etc. are banned).
- **No Bare Void in Go:** Functions must return Result[T] or *appfault.AppError.
- **Parameter Structs:** Banned loose >2-3 parameters; use *Params structs.
- **Vertical Line Gaps:** Mandatory blank lines before if, after }, before return, and around multiline struct calls.
- **5-8 Files Micro-Batching:** All refactors broken into bounded subtasks.

## 9. Onboarding Quiz Presentation & Theming Standard

- **Hairline Chrome Accent**: Title cards must use a 2px hairline accent edge (`h-0.5`) with `shadow-md`, never heavy solid or gradient banners (`h-2`+).
- **Consolidated Config Menu**: Secondary builder tools (Health, Config, Triggers, Import/Export, Flow, Share) must be combined into a single `SlidersHorizontal` dropdown menu.
- **Brand Consistency**: The application is branded as "Onboarding Quiz" with `src/assets/onboarding-quiz-logo.svg`.
- **Riseup Brand & Theme Rules**: Brand name must be written as one word (`Riseup`). Dark navy background (`#0A0A14`) paired with cream primary (`#F7F1E6`). Gold (`#E8C547`) is strictly an active indicator mark, never a dominant surface or text color. Buttons in Riseup theme must use cream primary (`#F7F1E6`) with dark navy text (`#0A0A14 font-bold`) and subtle gold active rings.
- **Purple Theme Contrast**: White text (`#FFFFFF`) on deep violet background (`#0F0E1E`) with luminous borders (`#3A3568`) and electric violet buttons (`#5C45FD`).
- **Backend Admin Console Contrast & Interactivity**: In dark themes (specifically Dracula), admin surfaces must render muted text in crisp lilac-slate (`#BAC7E8`, 7.2:1 contrast ratio) rather than muted comment slate (`#6272A4`). Sidebar navigation items must feature an active accent bar, high-contrast text (`text-foreground/90`), clear uppercase section headers (`text-foreground/70 font-semibold uppercase tracking-wider font-mono`), and an interactive slide hover state (`hover:translate-x-1 hover:border-l-2 hover:border-primary/60 hover:bg-primary/10`). Assessment title inputs in `FormBuilder.tsx` must feature a blended background container (`bg-muted/30 border border-border/40 hover:border-primary/70 hover:bg-muted/50 rounded-xl px-4 py-2.5 shadow-2xs`), luminous border accent, and an interactive pencil cue on hover.
- **Presentation Slide Layout & Zero Candidate Response**: Question titles in 2-column presentation slides must be vertically centered in the slide canvas (`items-center w-full my-auto` with `lg:self-center`) to establish optical equilibrium. The right-hand answer column must be slightly offset downward (`pt-2 lg:pt-6 xl:pt-8`), avoiding both flush-top crowding and excessive downward displacement. Zero instances of `Candidate Response` or related subheadings may exist in runner views or DOM nodes.
- **Option Motion & All-Theme Hover System**: Options in presentation and runner modes must rest at semi-transparency (`opacity: 0.82`, `bg-card/75 backdrop-blur-xs`). Hovering an option must trigger a smooth rightward sliding animation (`transform: translate3d(6px, 0, 0)`), opacity fade-in to `1.0`, theme-aware color tinting (`linear-gradient(90deg, hsl(var(--primary) / 0.14) 0%, hsl(var(--card) / 0.92) 100%)`), luminous border glow (`border-color: hsl(var(--primary) / 0.75)`), and crisp text-shadow illumination (`rgb(0 0 0) 1px 0.7px 0px` in dark themes; `rgba(0, 0, 0, 0.3) 1px 0.7px 0px` in light themes). Tailwind utility classes must not suppress `.presentation-option-card:hover`. In Riseup theme, acronyms and technical terms in question titles MUST be highlighted in cream (`#F7F1E6`) with `font-extrabold`; gold (`#E8C547`) is strictly an active indicator mark, never a text highlight.

