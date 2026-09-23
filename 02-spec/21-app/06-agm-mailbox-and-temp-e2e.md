# AGM Mailbox Auto-Configuration & Isolated Temp E2E Test Suite

> **/goal** Provide automated SMTP/IMAP domain discovery, AGM-inspired aesthetic styling, and isolated temporary E2E integration test suites.
> **/learn** Adhere to strict skip-by-default execution tags, zero-CI quarantine, and implicit boolean naming conventions.

## 🎯 Actionable CI/CD & Agent Checklist

- [ ] `/goal` Verify automated extraction of host (`mail.<domain>`) and port selection upon email input.
- [ ] `/learn` Ensure all temporary E2E tests are guarded by `RUN_TEMP_E2E=1` and skip by default.
- [ ] `/goal` Verify responsive organic top navigation menu styling matching AGM design tokens.
- [ ] `/learn` Verify zero credentials committed to repository (validate `.gitignore` coverage).

---

## User Request (Verbatim)

```text
wHEN i type the email why it doen't update the mail server smtp and other automatically following AGM project do a git pull and do it and improve the email testing as well

test-pass.json

Okay. So here I have added the password for the email, and I have given you a screenshot of how it works in the AGM project. So each time I try to type a different email, it automatically fills out the mail.domain.com, and it forwards automatically. So if a custom domain is there, it will be automatically set, and the user can actually customize this drop-down and everything else. And I want you to follow the AGM color coding and other stuff to make the drop-down and this website and other, let's say, sites to visit. And also, I gave you the test email pass so that you can send email, read mailboxes. You could do all kinds of end-to-end testing locally and privately. Okay. And also, what I do not like is your menu coloring, how you are putting the UI/UX. It's very terrible. It needs to have much more, let's say, organic way, so you can read into other forms, UI, and things like that, so that you can make it look good. Is it clear?
```

---

## Architecture & Design Specifications

### 1. Real-Time Domain Detection & SMTP/IMAP Autofill
- When an email address is typed into the email field (e.g. `user@example.com` or `ai-agm-tool-v1@hire-seoexperts.com`):
  - Extract domain component (`hire-seoexperts.com`).
  - Automatically configure Outgoing Server (SMTP Host) to `mail.<domain>` (e.g. `mail.hire-seoexperts.com`).
  - Automatically configure Incoming Server (IMAP Host) to `mail.<domain>`.
  - Automatically format Account Alias to `<local_part> (<domain>)`.
  - Automatically default SMTP Port to `465` (SSL) or `587` (TLS) and IMAP Port to `993` (IMAP SSL).
  - Display success feedback badge: `✓ Valid email detected. Host and port settings auto-configured.`.
  - Support instant preset buttons for SMTP (`465 (SSL)`, `587 (TLS)`, `25 (Plain)`) and IMAP (`993 (IMAP SSL)`, `143 (IMAP)`, `995 (POP3)`).
  - Allow manual override if custom hosts are needed.

### 2. Organic Navigation & AGM Aesthetic System
- Replace cramped, overflowing horizontal scroll bar with organic AGM-styled navigation.
- Implement responsive pill tabs with subtle glassmorphic backdrop, crisp borders (`border-slate-800`), hover transitions, and active glow rings (`ring-1 ring-blue-500/50`).
- Ensure consistent color tokens across admin controls, modal dialogs, and form inputs.

### 3. Isolated Temporary E2E Test Suite (`RUN_TEMP_E2E=1`)
- Construct an on-demand temporary end-to-end integration test in `tests/tempe2e/test_email_delivery_tempe2e.py`.
- Apply `@pytest.mark.temp_e2e` and explicit skip guard `if os.getenv("RUN_TEMP_E2E") != "1": pytest.skip(...)`.
- Validate SMTP authentication and IMAP mailbox access using test credentials from `test-pass.json` without leaking secrets.
