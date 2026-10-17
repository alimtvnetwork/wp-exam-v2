# Subtask 02 — Simulation, Onboarding, Checklist, Security, Video (Worker B)

Parent: 69-ui-ux-improvement-for-wp-exam
Specs:
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/03-conditional-simulation-spec.md`
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/04-guided-onboarding-spec.md`
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/05-email-checklist-spec.md`
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/06-video-questions-spec.md`
- `02-spec/21-app/ui-ux-improvement-for-wp-exam/07-security-hardening-spec.md`

Owner: **Worker B** (all five tasks; executed sequentially — later tasks may build on earlier ones)
Status: PENDING

Disjoint from Spec Agent 1's subtask file (01 — focus minimalism + animated theme controls). If the task tracker reports an ownership collision on any file below, the lead reassigns: the narrow-scope notes on each task define the split.

---

## Task-04: Security hardening (AC-H1..AC-H7)

**Spec:** `02-spec/21-app/ui-ux-improvement-for-wp-exam/07-security-hardening-spec.md`
**Owner:** Worker B

**Owned files:**
- `src/components/auth/AdminLoginModal.tsx` (full rewrite of `useAdminAuth` + modal)
- `src/pages/Index.tsx` — login-surface block only (~lines 112–125, 175); everything else frozen
- `routes/api.php` — email route auth gates only
- `includes/api/EmailSettingsRestController.php` — `smtp_pass` seal/mask only
- `includes/api/authrestcontroller.php` — `getSecretKey()` fail-closed only
- `app/services/email/mailboxmanager.php` — remove `test-pass.json` read only
- `app/services/security/secretbox.php` — NEW (seal/open helpers, key from AUTH_KEY)
- `src/components/admin/email-settings.tsx` — false-claim text only (`:556`)
- `src/components/admin/mailbox-modal.tsx` — false-claim text only (`:231`)

**Checklist:**
1. Read spec 07 in full before touching anything.
2. `app/services/security/secretbox.php`: implement `seal()` / `open()` with `sodium_crypto_secretbox`, `random_bytes` nonce, key = `sodium_crypto_generichash('wp-exam-smtp-v1', AUTH_KEY)`; throw when `AUTH_KEY` undefined/empty. `php -l` the file.
3. `EmailSettingsRestController.php`: on save, keep stored value when incoming is empty or `'••••••'`; otherwise `seal()` before insert/update. On read, return `'smtp_pass' => ''` + `'has_smtp_pass' => !empty($stored)`. `php -l`.
4. `authrestcontroller.php`: delete the `'wp_exam_jwt_secret_signing_key_44b39fa'` fallback; throw `\RuntimeException` when no salts. `php -l`.
5. `routes/api.php`: gate `GET /api/v1/email/config` and `POST /api/v1/email/verify-connection` on `current_user_can('manage_options')` (401 otherwise). `php -l`.
6. `mailboxmanager.php`: delete the `test-pass.json` read; `getConfig()` returns `has_configured_pass` bool, never a `pass` key. `php -l`.
7. `AdminLoginModal.tsx`: add server check via new `GET /wp-json/wp-exam/v1/auth/admin-status` endpoint (`current_user_can('manage_options')`); delete the form, hardcoded `'admin'` comparison, pre-filled `useState('admin')`, `localStorage` read/write, and the credential-advertising error message. Positive booleans only (`isAdmin`, `isVerified`).
8. `src/pages/Index.tsx`: route the second login surface through the rewritten hook; delete the duplicated inline check.
9. Fix the false claim text in `email-settings.tsx:556` and `mailbox-modal.tsx:231` to describe libsodium secretbox accurately; delete `email_passwords.db` / SSH RSA mentions.
10. Confirm `test-pass.json` is not tracked (`git ls-files | grep test-pass` → empty; do NOT run any other git command).

**Verification:**
- `gitmap aum search -r "=== 'admin'|wp_exam_admin_authenticated" src` → 0 hits
- `gitmap aum search "wp_exam_jwt_secret_signing_key_44b39fa" .` → 0 hits (repo root scope; binary paths excluded by the tool)
- `gitmap aum search "salted SSH RSA identity" src` → 0 hits
- `gitmap aum search "'pass' =>" app/services/email/mailboxmanager.php routes/api.php` → 0 hits
- `php -l` on every touched PHP file → no syntax errors
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors in touched TSX files (pre-existing errors elsewhere are out of scope but must not grow)
- `npx eslint` on touched TSX files → exit 0
- `python3 03-ai-scripts/05-guideline-autofixer.py src/components/auth src/components/admin --check-only` → zero violations on touched files

---

## Task-05: Candidate simulation + guided onboarding (AC-S1..AC-S4, AC-O1..AC-O4)

**Specs:** `02-spec/21-app/ui-ux-improvement-for-wp-exam/03-conditional-simulation-spec.md`, `.../04-guided-onboarding-spec.md`
**Owner:** Worker B

**Owned files (all NEW):**
- `src/components/simulation/quiz-simulator.tsx`
- `src/components/simulation/simulation-stories.ts`
- `src/components/onboarding/guided-tour.tsx`
- `src/components/onboarding/admin-tour-steps.ts`

**Checklist:**
1. Read specs 03 and 04 in full before touching anything.
2. `simulation-stories.ts`: story-point data (`{ title, body, stepIndex }`) for the `branching-onboarding` fixture; plain instructional language; "Section" never "Module".
3. `quiz-simulator.tsx`: props `{ fixtureSlug: string }`; loads fixture from `src/quiz/store/exam-store.ts` (read-only import — do NOT edit the store here); one question at a time; transitions via the real `getNextStepIndex`; story point shown after each transition using `formatRuleDescription` + `describeSkippedSteps`; branch-map strip via `previewBranchOutcomes` (visited/current/skipped). Demo answers in component state only — never persisted.
4. `admin-tour-steps.ts`: 6 steps (builder → branching → preview → simulation → invite → checklist) with `targetSelector`, title, body (one idea per card, `text-sm` minimum).
5. `guided-tour.tsx`: `{ steps, onDone }`; spotlight via `getBoundingClientRect` cutout, re-measured on scroll/resize; `Escape` skips; focus moved into the card per step; missing selector → skip step gracefully; completion flag `wp_exam_onboarding_tour_completed` in `localStorage`; export a `GuidedTourReplayButton`.
6. Shell integration: mount `<GuidedTourManager />` (auto-start on first visit, 600ms settle) plus the replay button in the admin shell. The shell file (`src/pages/Index.tsx`) is owned by Task-04 — perform this single-line mount ONLY after Task-04 is marked complete, and log it as a Task-05 action.
7. Motion: transform/opacity only; card enter `--ease-out-editorial` 200ms; backdrop fade 150ms; stagger 60–80ms; `prefers-reduced-motion` → instant. No `zoom-in-95`, no hover scale.

**Verification:**
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors in the 4 new files
- `npx eslint` on the 4 new files → exit 0
- `python3 03-ai-scripts/05-guideline-autofixer.py src/components/simulation src/components/onboarding --check-only` → zero violations
- `gitmap aum search "framer-motion|zoom-in-95" src/components/simulation src/components/onboarding` → 0 hits
- AC-S2: `git diff --stat` shows zero changes to `src/components/forms/branching-flow-modal.tsx` (read-only check via `git diff --stat -- <path>` is allowed for verification; no other git commands)

---

## Task-06: Checklist dashboard + checklist emails (AC-C1..AC-C4)

**Spec:** `02-spec/21-app/ui-ux-improvement-for-wp-exam/05-email-checklist-spec.md`
**Owner:** Worker B

**Owned files:**
- `includes/api/checklistrestcontroller.php` — NEW (token-scoped endpoints, template defaults, cron callback)
- `src/components/checklist/candidate-checklist.tsx` — NEW (route `/checklist/{token}`)
- `wp-exam.php` — WP-Cron registration lines only (locate existing `wp_schedule_event` via `gitmap aum search`)

**Checklist:**
1. Read spec 05 in full, especially the logged assumption: NO candidate login in this program.
2. `checklistrestcontroller.php`: `GET /api/v1/checklist/{token}` → `{ id, title, kind, status, due_at, invite_url }` per item; validate token against the invite table; unknown/expired → 404 with identical envelope shape (no oracle). Use the existing QueryWrapper-style data access — no raw unshielded queries. `php -l`.
3. Template defaults (`checklist_subject/body`, `reminder_subject/body` with `{user_name}`, `{checklist_url}`, `{pending_count}`) defined as fallback constants in the controller; overrides read from the existing `templates_json` keys. No new settings table.
4. `candidate-checklist.tsx`: grouped list (To do → In progress → Done), progress header with hairline `h-0.5` bar, Resume/Start buttons, empty states ("Nothing assigned yet" / CheckCircle2 "All done"). Motion: 60–80ms row stagger, transform/opacity only.
5. `wp-exam.php`: register the daily WP-Cron reminder (due within 48h, still pending) — registration lines only.
6. Admin: additive per-invite completion summary columns (pending/in-progress/completed counts) in the existing invite admin view — locate via `gitmap aum search "invite" src/components/admin`; additive only.

**Verification:**
- `php -l` on the new controller → clean
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors in new/changed files
- `npx eslint` on touched files → exit 0
- `python3 03-ai-scripts/05-guideline-autofixer.py src/components/checklist --check-only` → zero violations
- `gitmap aum search -r "password|wp_set_auth_cookie|wp_signon" src/components/checklist includes/api/checklistrestcontroller.php` → 0 hits (no login code introduced)
- AC-C1 evidence: describe the curl test for the lead's E2E phase (valid token → items; invalid → identical-shape 404)

---

## Task-07: Complex conditional seeds (AC-S3, AC-C2 support)

**Specs:** `.../03-conditional-simulation-spec.md` (seed plan), `.../05-email-checklist-spec.md`
**Owner:** Worker B

**Owned files:**
- `src/quiz/store/exam-store.ts` — additive fixtures only

**Checklist:**
1. Add `simulation-showcase` fixture: 7 steps, nested conditions (visibility rule inside a jump-rule branch), multi-select routing rule, and a dead-end guard variant that `validateConditionalFixture` flags when mutated. Declare `theme` in settings.
2. Add checklist demo fixtures: one invite with 3 assigned items in mixed statuses (pending/in_progress/completed) for the dashboard; one due-soon item for the reminder path.
3. Seeds are plain data — no credentials, tokens, or secrets. Fixtures stay small and offline-friendly.
4. Verify: `validateConditionalFixture(simulation-showcase)` → `isValid=true`; mutated cycle → `isValid=false` (node driver or ts-node one-liner — a runtime check, not a test suite).

**Verification:**
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors in `exam-store.ts`
- `npx eslint src/quiz/store/exam-store.ts` → exit 0
- `python3 03-ai-scripts/05-guideline-autofixer.py src/quiz/store --check-only` → zero violations
- `gitmap aum search -r "sk-|AKIA|BEGIN .*PRIVATE KEY" src/quiz/store/exam-store.ts` → 0 hits

---

## Task-08: Video as question content (AC-V1..AC-V4)

**Spec:** `02-spec/21-app/ui-ux-improvement-for-wp-exam/06-video-questions-spec.md`
**Owner:** Worker B

**Owned files:**
- `src/components/runner/video-question-field.tsx` — NEW (player + answer pairing)
- `src/components/forms/FormBuilder.tsx` — video question type registration only (narrow scope; additive)

**Checklist:**
1. Read spec 06 in full before touching anything.
2. `video-question-field.tsx`: native `<video controls preload="metadata">` as the question hero; answer control below; `answerKind: 'video'` chains into the EXISTING `src/components/runner/video-answer-recorder.tsx` (import it — do not duplicate `getUserMedia` logic).
3. `FormBuilder.tsx`: register the `video_prompt` question type (upload → WordPress media library; URL alternative); field stores `{ attachmentId, url, posterUrl }` — never a blob in form JSON. Narrow, additive edits only.
4. Server-side upload constraints (locate the existing upload/media handler via `gitmap aum search "media_handle_upload|wp_handle_upload" includes app`): MIME allowlist `video/mp4`, `video/webm`; size cap 128MB default (filterable); `current_user_can('upload_files')`. Client pre-check mirrors the cap for UX only.
5. Seed: add `video-prompt-demo` (URL-based, no blob) to the demo fixtures.

**Verification:**
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors in touched files
- `npx eslint` on touched files → exit 0
- `python3 03-ai-scripts/05-guideline-autofixer.py src/components/runner --check-only` → zero violations
- `gitmap aum search "getUserMedia" src/components/runner` → hits only in `video-answer-recorder.tsx` (no duplicated capture logic)
- AC-V4: saved form JSON contains `attachmentId`/`url`, never base64 — describe the check for the lead

---

## Worker rules reminder

- NEVER run git commands (`git add`, `git commit`, `git status`, `git diff`, `git push`) — index-lock collisions crash parallel workers. (The two read-only `git diff --stat` / `git ls-files` verification peeks above are the sole exceptions, and only for verification.)
- NEVER run builds or test suites (`npm run build`, `vitest`, `playwright`, `06-cicd-local-runner.py`) — CI verifies. `npx tsc --noEmit` is a typecheck, allowed. `php -l` is a syntax check, allowed.
- Search ONLY via `gitmap aum search` / `gitmap find` / `gitmap cat` — total ban on `rg`, `grep`, `git grep`, `Select-String`.
- Positive booleans only (`is`/`has`), never `== true`, never mixed polarity. Blank line before every `if`, after every `}`, before every `return`.
- Relative repo-root paths only in code/comments; lowercase filenames; Poppins/Ubuntu; "Section" never "Module".
- After the tool-call budget, stop and report; on a twice-failing tool reply `STATUS: BLOCKED` with the exact error.
- Secrets: never write credentials/tokens into code. On finding a secret, report `BLOCKED: secret at <file>:<line>`.
