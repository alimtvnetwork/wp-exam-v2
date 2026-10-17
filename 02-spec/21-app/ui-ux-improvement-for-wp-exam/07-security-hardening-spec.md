# Spec 07 — Security Hardening: Auth, Secrets at Rest, JWT

Parent program: `ui-ux-improvement-for-wp-exam` (task 69)
Sibling specs: `01-focus-minimalism-spec.md`, `02-animated-theme-controls-spec.md` (Spec Agent 1)

## User Request (Verbatim)

> "And also make sure the passwords and things are kept with a very highly secure way so that no one can hack."

## Current-state summary (all findings verified 2026-10-17)

**F1 — Client-side admin auth (critical).** `src/components/auth/AdminLoginModal.tsx`:
- Lines 28–29: `usernameInput.trim().toLowerCase() === 'admin'` and `passwordInput.trim() === 'admin'` — the credential check runs entirely in the browser.
- Lines 21–25 (`useAdminAuth` initializer): `localStorage.getItem('wp_exam_admin_authenticated') === 'true'` — anyone can set this flag in devtools and bypass the modal completely.
- Lines 48–49: username/password fields pre-filled with `'admin'`; line 58: the error message advertises "Default test credentials are admin / admin."
- `src/pages/Index.tsx` (lines ~112–125, 175) renders a second login surface through the same hook — same bypass.

**F2 — Unauthenticated secrets endpoint (critical).** `routes/api.php:50-56`: `GET /api/v1/email/config` has no auth gate and returns `MailboxManager::getConfig()`, which reads repo-root `test-pass.json` (`app/services/email/mailboxmanager.php:14-52`) and returns `'pass' => $pass` **in plaintext** in the JSON response.

**F3 — SMTP password plaintext at rest + false UI claim (high).** `includes/api/EmailSettingsRestController.php` (`getEmailSettings` ~line 55, `saveEmailSettings` ~lines 85–102): `smtp_pass` is stored verbatim and returned verbatim in API responses. The route is gated by `manage_options`, but the secret is plaintext in the database. Meanwhile `src/components/admin/email-settings.tsx:556` and `src/components/admin/mailbox-modal.tsx:231` tell the user it is "Stored in isolated split database `email_passwords.db` with salted SSH RSA identity and machine-bound encryption" — **every word of that is false**: there is no `email_passwords.db`, no SSH identity, no encryption.

**F4 — Hardcoded JWT fallback (high).** `includes/api/authrestcontroller.php` `getSecretKey()` (~line 357): when neither `AUTH_KEY` nor `NONCE_KEY` is defined, it returns the hardcoded string `'wp_exam_jwt_secret_signing_key_44b39fa'`. Any install without salts mints and accepts tokens signed with a key published in this repository.

**Sound (no action):** invite tokens use `bin2hex(random_bytes(16))`; JWT verification uses HMAC-SHA256 with `hash_equals`. Do not touch these.

## Change plan

### 1. Replace client-side auth with WordPress-delegated auth (F1)

- New REST endpoint (in the existing auth controller file, lowercase filename kept): `GET /wp-json/wp-exam/v1/auth/admin-status` → `{ "is_admin": current_user_can('manage_options') }`. WordPress's own cookie/nonce auth applies; no new credential system is invented.
- Rewrite `useAdminAuth` in `src/components/auth/AdminLoginModal.tsx`: on mount, fetch the endpoint (with `credentials: 'same-origin'`); `isAuthenticated` reflects the server answer only. **Delete**: the username/password form, the hardcoded `'admin'` comparison, the pre-filled `useState('admin')` values, the `localStorage` read/write, and the error message advertising default credentials. The modal becomes a "verifying…" → either renders the admin shell or a "sign in to WordPress as an administrator" notice with no credential fields.
- `src/pages/Index.tsx`: route its login surface through the same rewritten hook; delete the duplicated inline check (~lines 112–125, 175).
- Positive booleans only (`isAdmin`, `isVerified`); no `=== 'true'` string comparisons anywhere in the new code.

### 2. Auth-gate and de-secret the email config endpoints (F2)

- `routes/api.php:50-56` (`GET /api/v1/email/config`): require `current_user_can('manage_options')` (401 otherwise). **Remove the `test-pass.json` read path** from `MailboxManager::getConfig()` — delete the file read; the response must never contain a `pass` key (return `has_configured_pass: bool` instead).
- `POST /api/v1/email/verify-connection`: same gate. The `$body['pass']` it accepts is used transiently for the verification attempt only and is never persisted or logged.
- Delete `test-pass.json` from the repo if it is tracked (it is a live credential file sitting at the repo root).

### 3. libsodium secretbox for `smtp_pass` at rest (F3)

- New helper `app/services/security/secretbox.php` (lowercase):
  - `seal(string $plaintext): string` → `base64_encode($nonce . sodium_crypto_secretbox($plaintext, $nonce, $key))`, `$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES)`.
  - `open(string $sealed): string|false` → split nonce/ciphertext, `sodium_crypto_secretbox_open`.
  - Key derivation: `$key = sodium_crypto_generichash('wp-exam-smtp-v1', AUTH_KEY)` — the key comes from the deployment secret `AUTH_KEY`, which already exists on every WordPress install, is never stored in the database, and is never committed to the repo. **Never invent a new key file or a new stored secret** — that would just move the problem.
  - If `AUTH_KEY` is not defined or empty: throw — fail closed, do not fall back.
- `EmailSettingsRestController::saveEmailSettings`: if the incoming `smtp_pass` is empty or equals the mask sentinel (`'••••••'`), keep the stored value; otherwise `seal()` it before insert/update.
- `EmailSettingsRestController::getEmailSettings`: never return the sealed value — return `'smtp_pass' => ''` plus `'has_smtp_pass' => !empty($stored)`. The frontend shows the mask and a "replace" affordance.
- Migration: on read, if the stored value does not parse as sealed secretbox (legacy plaintext), seal it in place on the next save; document this in a code comment. No bulk migration script — opportunistic and safe.
- Fix the false UI claim in `src/components/admin/email-settings.tsx:556` and `src/components/admin/mailbox-modal.tsx:231` to describe reality: "Encrypted with libsodium secretbox; the key is derived from your WordPress AUTH_KEY and never stored in the database." Delete any mention of `email_passwords.db` / SSH RSA identity.

### 4. JWT fails closed without salts (F4)

- `authrestcontroller.php` `getSecretKey()`: delete the hardcoded fallback. If neither `AUTH_KEY` nor `NONCE_KEY` is defined/non-empty, throw a `\RuntimeException('WordPress salts are not configured')` — token minting and verification both fail closed. No fallback, no default, no warning-and-continue.

## Acceptance criteria

- AC-H1: `gitmap aum search -r "=== 'admin'|wp_exam_admin_authenticated" src` → 0 hits. Evidence: search output.
- AC-H2: Setting `localStorage` flags in devtools no longer grants admin access; the admin shell renders only when the server reports `is_admin: true`. Evidence: devtools walkthrough.
- AC-H3: Unauthenticated `GET /api/v1/email/config` → 401/403; authenticated response contains no `pass` key (only `has_configured_pass`). Evidence: curl.
- AC-H4: The `smtp_pass` database column contains base64 secretbox blobs (nonce + ciphertext), decryptable only with the install's `AUTH_KEY`; `getEmailSettings` never returns it. Evidence: DB dump inspection + a `php -l`-clean round-trip driver.
- AC-H5: `gitmap aum search "wp_exam_jwt_secret_signing_key_44b39fa" .` → 0 hits; with salts undefined, token issuance throws. Evidence: search output + code path review.
- AC-H6: `gitmap aum search "salted SSH RSA identity" src` → 0 hits; the UI text describes libsodium secretbox accurately. Evidence: search output.
- AC-H7: `test-pass.json` is not tracked in the repo. Evidence: `git ls-files | grep test-pass` → empty.

## Non-goals

- Do not change invite-token generation (`random_bytes(16)` — sound).
- Do not change JWT HMAC-SHA256 verification / `hash_equals` (sound).
- Do not build a candidate login system here (deferred to the morning decision per spec 05).
- Do not add new key-management infrastructure (no vault, no key files — AUTH_KEY is the key).
- No changes to mail sending logic itself (`wp_mail` path untouched).

## For future AI

**Why WordPress-delegated auth instead of a "real" login form:** any credential check implemented in this plugin would be the third auth system on the site (after WP itself and the invite tokens), and the history here shows exactly how that ends — a client-side `admin`/`admin` string comparison. WordPress already authenticates administrators with cookies, nonces, and brute-force protections. Delegating to `current_user_can('manage_options')` removes an entire class of bug (credential storage, session fixation, timing attacks) by deleting the code instead of hardening it. If a standalone login is ever truly needed (e.g., headless deployments), it must be a server-side, rate-limited, Argon2id-hashed credential check — never anything the browser can bypass.

**Why libsodium secretbox keyed from AUTH_KEY:** the threat model is "database dump" (SQL injection, backup leak, shared hosting read). Secretbox with a key outside the database defeats that: the dump alone is useless. AUTH_KEY is the right key source because it already exists, is already treated as a deployment secret, is already rotated by hosts, and keeping it out of the DB is what makes the encryption meaningful. A plugin-generated key stored next to the data would be security theater.

**Why fail closed on missing salts:** the old fallback meant the *least* configured installs (no salts — exactly the ones most likely to be soft targets) all shared one published key. Failing closed converts a silent vulnerability into a loud, immediately-fixable configuration error. WordPress itself has required salts for years; aligning with that is correct.

**Why the false UI claim is a security fix, not copy editing:** the claim told administrators their secrets were encrypted in an isolated database. An admin who believes that will happily paste production SMTP credentials into the field. Correcting the claim is what makes the actual encryption (spec item 3) trustworthy — users must be able to verify what the UI promises.
