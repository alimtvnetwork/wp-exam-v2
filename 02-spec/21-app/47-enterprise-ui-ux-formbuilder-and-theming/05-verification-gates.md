# Spec [47] Part 5: Quality Invariants & Verification Gates

## 1. Acceptance Criteria Matrix

| Gate ID | Invariant / Requirement | Verification Method | Target Status |
|---|---|---|---|
| `AC-SPEC-47-01` | `run.ps1` initiates Vite dev server and opens default browser at `http://127.0.0.1:5173`. | Script inspection and exit 0 validation | Mandatory |
| `AC-SPEC-47-02` | Theme switcher dynamically modifies CSS custom properties and reflects immediately in `FormRunner` and `wizard-runner`. | Style evaluation and theme token verification | Mandatory |
| `AC-SPEC-47-03` | All raw HTML `<select>` elements in runner and admin views replaced with custom / Radix UI Select components. | Component audit and AST scan | Mandatory |
| `AC-SPEC-47-04` | Candidate invites and audit logs render in high-contrast dark tokens with zero light-gray contrast defects. | Visual inspection and JSX review | Mandatory |
| `AC-SPEC-47-05` | FormBuilder renders Google Forms style top header card with editable Title and Description. | Component rendering test | Mandatory |
| `AC-SPEC-47-06` | Field palette is docked to a sticky right-hand container with click-to-add and drag-and-drop mechanics. | Layout check | Mandatory |
| `AC-SPEC-47-07` | Compound validation engine supports multiple rules (Starts With, Ends With, Contains, Regex, URL) with AND/OR logic and presets. | Unit testing of validation engine | Mandatory |
| `AC-SPEC-47-08` | Per-field interactive live preview mode allows live testing of inputs (e.g. WhatsApp, links, regex). | Interactive card test | Mandatory |
| `AC-SPEC-47-09` | Focus Quiz authoring studio allows creating, editing, and previewing sequential focus quizzes in admin. | Admin tab and state validation | Mandatory |
| `AC-SPEC-47-10` | Full compliance with AGENTS.md rules (no `== true`, positive booleans only, no mixed polarity, strict relative paths). | Coding guidelines audit | Mandatory |

---

## 2. Automated Verification Commands

```bash
# 1. Verify TypeScript compilation and ESLint hygiene
npm run lint

# 2. Verify all Vitest unit tests pass
npx vitest run

# 3. Verify repository coding guidelines
python 03-ai-scripts/06-cicd-local-runner.py --linter
```
