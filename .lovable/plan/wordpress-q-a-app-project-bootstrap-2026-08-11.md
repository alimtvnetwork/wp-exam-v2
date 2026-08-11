# WordPress Q&A App — Project Bootstrap

## Goal
Initialize the TanStack Start project for a WordPress-focused question-and-answer application, replacing the placeholder page with a minimal branded landing page and adding a root README that documents the intended app and captures the details the user will provide later.

## Deliverables

1. **Replace the placeholder homepage**
   - Remove the `data-lovable-blank-page-placeholder` image from `src/routes/index.tsx`.
   - Add a clean, centered landing page with a working title, short description, and a clear "Details coming soon" state.

2. **Create the project README**
   - Add a `README.md` at the project root.
   - Include sections for:
     - Project overview
     - Tech stack
     - Local setup instructions
     - Feature placeholders for the user to fill in later (WordPress connection, exam name, core feature, data source)

3. **Prepare the folder structure for the Q&A app**
   - Create `src/components/` and `src/lib/` subdirectories as needed for future components and utilities.
   - Keep the initial structure minimal; no business logic until the user provides requirements.

4. **Verify the project still builds**
   - Run a typecheck/build check to confirm the scaffold compiles cleanly.

## Out of scope

- No WordPress API integration yet.
- No quiz, forum, or flashcard functionality yet.
- No database schema, auth, or data model.

These will be added once the user provides the exam name, feature set, and WordPress/data requirements.

## Tech stack

- TanStack Start v1 (React 19 + Vite 7)
- Tailwind CSS v4
- TanStack Query
- shadcn/ui components
- TypeScript
