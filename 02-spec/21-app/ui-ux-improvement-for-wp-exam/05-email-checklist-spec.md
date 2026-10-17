# Spec 05 — Token-Scoped Checklist Dashboard + Checklist Emails

Parent program: `ui-ux-improvement-for-wp-exam` (task 69)
Sibling specs: `01-focus-minimalism-spec.md`, `02-animated-theme-controls-spec.md` (Spec Agent 1)

## User Request (Verbatim)

> "Also sending this to user email as a checklist. That means user can log in and also see their checklist, how many quizzes and exam that they have to do, or projects that they have to complete."

## Current-state summary

- Invite emails exist: `includes/api/UserInviteRestController.php` sends via `wp_mail` when an admin invites a candidate. Invite links carry a token (`bin2hex(random_bytes(16))` — sound).
- **No candidate login exists.** Candidates are identified by invite token only. There is no account system, no password, no session for candidates.
- **No checklist surface exists** — neither a dashboard nor checklist emails. Admins cannot see per-candidate completion at a glance, and candidates get no "what's left" view.

## Logged assumption (morning decision)

**No new candidate login is built in this program.** The user asked for login, but introducing passwords/sessions for candidates is a security and scope decision that needs the user's explicit morning confirmation (it interacts directly with spec 07's hardening). This spec designs everything around the **existing invite-token identity**, with a clean seam where login can be attached later: every checklist read is keyed by `token`, and the controller resolves the token to an invite row. When login arrives, the same endpoints accept a session identity instead — no dashboard rewrite.

## Change plan

1. New PHP controller `includes/api/checklistrestcontroller.php` (lowercase per repo constraint):
   - `GET /api/v1/checklist/{token}` — returns the candidate's assigned items: quizzes, exams, projects, each with `{ id, title, kind, status: 'pending'|'in_progress'|'completed', due_at, invite_url }`. Token is validated against the invite table; unknown/expired token → 404 with no data leakage (identical response shape for unknown vs. expired).
   - All reads go through the existing QueryWrapper-style data access (no raw unshielded queries — see `strictly-avoid.md`).
2. New dashboard component `src/components/checklist/candidate-checklist.tsx`:
   - Route: `/checklist/{token}` (public, token in path — same pattern as `/preview/:slug` and `/f/:slug`).
   - Single-focus layout: one list, grouped by status (To do → In progress → Done), each row showing title, kind badge, due date, and a Resume/Start button. Progress header: "2 of 5 complete" with a thin progress bar (hairline `h-0.5` accent per AGENTS.md §9).
   - Empty states: "Nothing assigned yet" and "All done 🎉" (no emoji in UI chrome per restraint — use a CheckCircle2 icon).
   - Motion: list rows enter with 60–80ms stagger, `--ease-out-editorial`, transform/opacity only.
3. Checklist emails via `wp_mail` (reusing the invite mail path):
   - On assignment: "You have N new items" email with the checklist URL (`/checklist/{token}`), using the existing template-token style (`{user_name}`, `{quiz_title}` → extend with `{checklist_url}`, `{pending_count}`).
   - Reminders: WP-Cron daily job for items due within 48h and still pending. Cron callback lives in the plugin PHP (`wp-exam.php` or the existing cron registration point — worker to locate via `gitmap aum search "wp_schedule_event"`).
   - Templates editable in the existing email templates store (`templates_json` in `email_settings`) — no new settings table.
4. Admin visibility: extend the existing invite/submission admin view with a per-invite completion summary (count pending/in-progress/completed) — additive columns only, no redesign of the admin table in this spec.

## Acceptance criteria

- AC-C1: `GET /api/v1/checklist/{valid-token}` returns the assigned items with correct statuses; `{invalid-token}` returns 404 with the same envelope shape and no item data. Evidence: curl against a local WP instance.
- AC-C2: The dashboard at `/checklist/{token}` renders grouped rows and the progress bar; completing a quiz flips its row to Done on next load. Evidence: dev-browser walkthrough with a seeded invite.
- AC-C3: Assigning a quiz triggers exactly one checklist email containing `{checklist_url}` and `{pending_count}`; the WP-Cron reminder fires for a due-soon item. Evidence: mail log / WP-Cron event list.
- AC-C4: No password, session, or account code is introduced for candidates anywhere in this change. Evidence: `gitmap aum search -r "password|wp_set_auth_cookie|wp_signon" src/components/checklist includes/api/checklistrestcontroller.php` → 0 hits.

## Non-goals

- No candidate login/registration (morning decision — see assumption).
- No push notifications (email only).
- No admin-side checklist editing UI beyond the additive completion columns (full management UI is a future program).
- No changes to the invite token generation (sound: `random_bytes(16)`).

## For future AI

**Why token-scoped instead of login:** the user explicitly asked for login, and this spec deliberately defers it. Reason: candidates currently have no accounts, and bolting a password system onto invite tokens without a designed auth story would create exactly the kind of client-side-auth shortcut that spec 07 is removing elsewhere. The token already *is* a capability URL — it identifies and authorizes in one step. The controller is written so a session identity can replace the token lookup later without touching the dashboard.

**Why WP-Cron and not an external scheduler:** the plugin already lives inside WordPress; WP-Cron is the zero-dependency option and matches how the existing invite emails are sent (synchronously via `wp_mail`). If the site has real cron disabled, reminders degrade gracefully — the dashboard remains the source of truth.

**Why the 404 shape is identical for unknown vs. expired tokens:** to avoid an oracle that lets anyone enumerate valid invite tokens. This is the same reasoning behind generic login error messages — applied to token URLs.
