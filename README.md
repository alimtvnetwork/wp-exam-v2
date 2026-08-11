# WordPress Q&A App

A focused question-and-answer application for WordPress-related topics and exams. This project is intentionally bootstrapped with a minimal scaffold so the exact exam scope, feature set, and WordPress integration can be defined before the core learning logic is built.

## What it is

This is a TanStack Start application that will become a study/practice tool for WordPress questions and answers. It is built to support:

- Practice quizzes and exam-style multiple-choice questions
- Q&A-style study cards with answers and explanations
- Optional WordPress REST API integration for content sourcing
- A clean, responsive UI that works on desktop and mobile

## What is defined later

The following details will be provided by the user before implementation begins:

- **WordPress connection**: whether the app reads from a live WordPress site or is a standalone WordPress-topic app
- **Exam/topic name**: the specific WordPress exam or topic the questions cover
- **Core feature**: quiz, Q&A forum, study flashcards, or a combination
- **Data source**: existing WordPress data, no data yet, or built-in demo questions

## Tech stack

- [TanStack Start v1](https://tanstack.com/start) — full-stack React framework
- [React 19](https://react.dev/) — UI library
- [TanStack Query](https://tanstack.com/query) — server-state management
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [shadcn/ui](https://ui.shadcn.com/) — accessible component primitives
- [TypeScript](https://www.typescriptlang.org/) — type-safe development
- [Vite 7](https://vitejs.dev/) — build tool

## Project structure

```text
src/
  components/        # React components and UI primitives
  lib/               # Utilities, helpers, and data access
  routes/            # TanStack Router file-based routes
  styles.css         # Tailwind / theme tokens
  router.tsx         # Router configuration
```

## Local development

Requirements:

- Node.js 18+
- Bun or npm

Install dependencies:

```sh
bun install
```

Start the development server:

```sh
bun run dev
```

The app will be available at `http://localhost:8080` by default.

## Build

```sh
bun run build
```

## Lint and format

```sh
bun run lint
bun run format
```

## Next steps

1. Confirm the WordPress connection mode and exam/topic name.
2. Choose the core feature set (quiz, Q&A, flashcards, or combined).
3. Provide the question data or confirm that demo questions should be seeded.
4. Add the appropriate routes, components, and data layer based on the requirements above.
