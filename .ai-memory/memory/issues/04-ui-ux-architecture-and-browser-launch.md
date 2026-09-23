# Issue 04: UI/UX Architecture, Admin Layout Clutter, and Browser Launch Fallback

## 1. Why it happened

The WP Exam platform previously exposed an unauthenticated prototype admin dashboard directly at the root route (`/`). The admin interface suffered from severe navigation layout clutter—wrapping 11 arbitrary emoji buttons across a cramped horizontal bar without hierarchical domain grouping. The FormBuilder lacked essential input types (Link/URL and Regex Verified inputs), string matching criteria (`starts_with`, `ends_with`, `contains`, `regex`), and visual conditional logic. Concurrently, the email gateway required manual typing of SMTP/IMAP configurations without provider auto-fill or template syntax highlighting, and `run.ps1` relied on an unshielded `Start-Process` call that could fail silently in background or non-interactive shells.

## 2. How it happened

1. **Root Route Defaulting to Raw Admin:** `src/App.tsx` mapped `<Route path="/" element={<Index />} />`, presenting raw unauthenticated controls rather than a professional public landing page explaining the system architecture.
2. **Navigation Pill Bloat:** `src/pages/Index.tsx` rendered an unwieldy set of 11 buttons (`Builder`, `Projects`, `Focus Quiz`, `Live Runner`, `Invites`, `History`, `Analytics`, `Email`, `AI Studio`, `Backups`, `SQLite`) inside a single flex container without category segmentation.
3. **Missing Form Types & Conditional Engine:** `src/components/forms/FormBuilder.tsx` and `src/lib/types/form.ts` supported only generic choice and text fields. Users could not build link fields, regex-validated inputs, or configure field-level conditional rules (`show_if`, `hide_if`, `require_if`).
4. **Email Gateway Lack of Automation:** `src/components/admin/email-settings.tsx` provided only raw text fields for SMTP credentials without auto-populating standard provider ports (Gmail, Office 365, Mailgun, SendGrid) or syntax-highlighting template variables (`{{candidate_name}}`, `{{score}}`).
5. **Background Process Browser Invocation:** `run.ps1` used PowerShell `[System.Threading.Tasks.Task]::Run` with `Start-Process $TargetUrl`. In certain background sessions or headless terminal contexts, protocol associations for HTTP URLs failed without triggering a shell fallback.

## 3. Root Cause

1. `run.ps1`: Lacked an explicit cross-platform Windows fallback (`cmd.exe /c start $TargetUrl`) when `Start-Process` encounters non-interactive shell constraints.
2. `src/App.tsx`: Route `/` bypassed authentication and brand presentation, lacking a public business landing page.
3. `src/pages/Index.tsx`: Flat, unsegmented navigation tabs rather than a structured enterprise app shell with domain grouping and presentation color themes.
4. `src/components/forms/FormBuilder.tsx` & `src/lib/types/form.ts`: Omission of `link` and `regex_text` field types, string verification rules, and conditional logic branching structures.
5. `src/components/admin/email-settings.tsx`: Hardcoded defaults without provider configuration presets or template syntax highlighting.

## 4. Code Fix

1. **Resilient Browser Launch (`run.ps1`):** Wrapped browser launching in a structured try-catch block with `cmd.exe /c start $TargetUrl` fallback.
2. **Public Presentation Landing Page (`src/components/public/LandingPage.tsx`):** Introduced a professional corporate landing page explaining the 4-tier curriculum engine, DAG visual canvas, candidate application wizard, and enterprise split-DB architecture.
3. **Admin Authentication Gate (`src/components/auth/AdminLoginModal.tsx`):** Secured backend administration behind credentials (`admin` / `admin`) with session persistence.
4. **Enterprise Admin Shell (`src/pages/Index.tsx`):** Structured navigation grouped into *Curriculum & Authoring*, *Candidate Delivery*, and *Operations & Data*, styled with presentation palettes (*Rise Up Asia*, *Letterly*, *Obsidian Slate*, *Clean Light*).
5. **FormBuilder Enhancements (`src/components/forms/FormBuilder.tsx`):** Compacted Actions dropdown, added Link and Regex field types, string match validation, visual conditional logic, and field grouping.
6. **Email Auto-Fill & Syntax Highlighting (`src/components/admin/email-settings.tsx`):** Added multi-provider auto-detection (Gmail, Outlook, Mailgun, SendGrid, SES) and syntax-highlighted template editing.
7. **AI Instruction Studio Integration (`src/components/admin/ai-section-assistant.tsx`):** Added contextual AI prompt generation across all administrative sections.
