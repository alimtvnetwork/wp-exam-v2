# CI/CD & Run Script Issue 02: Resilient Browser Launching and UI Architecture Standard

## 1. Why it happened

When executing `run.ps1`, the script attempted to spawn the default web browser using `Start-Process $TargetUrl` inside a background asynchronous task. Depending on the calling shell session (e.g. background job, non-interactive execution, or specific Windows terminal profiles), protocol handler invocation failed silently. In parallel, the root URL served an unauthenticated developer interface lacking enterprise branding, navigation grouping, and input validation capabilities.

## 2. How it happened

`Start-Process` relies on Windows shell file association mappings which may not resolve HTTP protocol schemes when invoked from non-interactive background sub-processes. The application also lacked a public entrypoint, forcing users into an unauthenticated admin dashboard.

## 3. Root Cause

1. `run.ps1`: Single-point-of-failure browser invocation lacking `cmd.exe /c start` fallback.
2. `src/App.tsx`: Missing public corporate landing page and authentication barrier.
3. `src/components/forms/FormBuilder.tsx`: Lack of advanced input types (Link, Regex) and conditional dependency rules.

## 4. Code Fix

1. Update `run.ps1` to implement dual-layer launch with fallback:
   ```powershell
   try {
       Start-Process $TargetUrl
   } catch {
       Start-Process "cmd.exe" -ArgumentList "/c start $TargetUrl"
   }
   ```
2. Implement public business landing page (`src/components/public/LandingPage.tsx`) explaining platform capabilities and providing admin login (`admin` / `admin`).
3. Overhaul FormBuilder with Link and Regex field types, string verification rules, and conditional logic.
4. Auto-fill SMTP/IMAP settings across major email providers.
