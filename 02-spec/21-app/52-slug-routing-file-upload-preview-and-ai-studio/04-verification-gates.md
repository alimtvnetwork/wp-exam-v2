# Spec 52: Verification Gates & Quality Assurance

## 1. Automated Verification Commands
```bash
npx tsc --noEmit
npm run lint
npx vitest run
```

## 2. Invariant Acceptance Gates
- **G-01 (File Upload Dropzone):** In question card test preview, field type `file_upload` renders a specialized drag-and-drop file upload zone. Zero fallback to generic text input.
- **G-02 (Dynamic Slug Engine):** Forms support custom slug configuration with real-time preview, copy button, and navigation synchronization (`/f/:slug`, `/preview/:slug`).
- **G-03 (Terminology Standardization):** All labels and text use `Section` exclusively. Zero occurrences of `Section / Module` slash-stutter.
- **G-04 (Modern UI Controls):** The "Required" property on question cards is rendered using the Radix `Switch` component with smooth micro-transitions.
- **G-05 (Per-Question AI Studio):** Each question card contains an `AI Instruction & Schema` option in its Actions dropdown with prompt copy and JSON import/export.
- **G-06 (Theme Visual Feedback):** Theme switching between Letterly, Rise Up Asia, and Default dynamically modifies the primary color palette, card borders, and hover micro-animations across all builder cards.
- **G-07 (Quality Gates):** 0 TypeScript errors, 0 ESLint errors, and 100% passing test suites.
