# WordPress Q&A App

Project URL: https://lovable.dev/projects/68b1fc57-2c73-4e9f-b0be-a286097ad543

A learning app for WordPress questions and answers.

## Tech Stack

- React 18 + TypeScript
- Vite
- TanStack Router + React Query
- Tailwind CSS
- shadcn/ui

## Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:8080 to view the app locally.

## One-line installer

Prefer an automated setup? The GitMap/AGM-style installer checks prerequisites
(node 20+, npm; php 8.3 optional), installs npm dependencies, compiles theme
styles (`npm run build:less`), runs the production build, and prints next steps.
Safe to re-run — steps already satisfied are skipped. It never uploads anything
anywhere (zero storage).

macOS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.sh | bash
```

Windows (PowerShell):

```powershell
iwr -useb https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.ps1 | iex
```

Or from a checkout:

```bash
bash scripts/install.sh
# powershell: .\scripts\install.ps1
```

Flags: `--help`, `--dry-run` (print actions, change nothing), `--skip-build`,
`--port <n>` (dev-server port for the next-steps output, default 5174).

## What's Next

The project scaffold is ready. The next details to add are:

- Exam / quiz name
- Core features and question types
- WordPress integration details
- Data source for questions and answers

## Memory

- .ai-memory/memory/readme.md
- .ai-memory/memory/learned/01-recent-session-2026-10-29.md
- .ai-memory/plans/readme.md
