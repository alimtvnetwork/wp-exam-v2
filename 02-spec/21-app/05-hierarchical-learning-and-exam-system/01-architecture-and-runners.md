# Architecture & Deployment Runners Specification

## 1. Overview & Objectives

The platform provides a dual-surface execution paradigm:
1. **Local Development & Testing Runner**: A one-click automated orchestration script (`run.ps1` for Windows PowerShell, `run.sh` for POSIX environments) that boots a background PHP CLI server (port 8080), compiles theme stylesheets, launches the Vite development server (port 5173), opens the default browser, and cleanly terminates background processes on exit.
2. **Remote Deployment Uploader Client**: An automated packaging and deployment pipeline (`scripts/package-plugin.ps1` and `scripts/uploader.php`, accompanied by the `BackupManager` UI card) that uploads production zip packages to remote WordPress hosts using the `riseup-asia-uploader` protocol.

---

## 2. Local Test Execution Runners

### 2.1 PowerShell Runner (`run.ps1`)
- **Location**: `run.ps1`
- **Responsibilities**:
  - Environment Prerequisites Check: Verifies `node`, `npm`, and `php` binaries in `PATH`.
  - Background PHP Server: If PHP is present, launches `php -S 127.0.0.1:8080 -t .` in a hidden background process.
  - Less Theme Compilation: Executes `npm run build:less` to compile theme styles.
  - Vite Frontend Server: Launches `npm run dev -- --host 127.0.0.1 --port 5173`.
  - Browser Automation: Asynchronously triggers `Start-Process http://127.0.0.1:5173` after a 2-second warmup delay.
  - Lifecycle Cleanup: `finally` block ensures any active background PHP server process is forcefully terminated on exit.

### 2.2 Bash Runner (`run.sh`)
- **Location**: `run.sh`
- **Responsibilities**:
  - Environment Prerequisites Check: Verifies `node`, `npm`, and `php`.
  - Background PHP Server: Executes `php -S 127.0.0.1:8080 -t . > /dev/null 2>&1 &`.
  - Signal Traps: Sets `trap 'kill -9 $PHP_PID 2>/dev/null || true' EXIT INT TERM` for clean shutdown.
  - Browser Automation: Detects `xdg-open` or `open` and launches default browser.

---

## 3. Remote Server Deployer (`scripts/uploader.php`)

### 3.1 Protocol Contract
- Connects to remote WordPress instances via REST upload endpoints:
  - `POST /wp-json/riseup/v1/plugins/upload`
  - `POST /wp-json/wp-exam/v1/plugins/upload`
  - `POST /wp-json/wp/v2/plugins`
- Authentication Methods:
  - Basic Authentication with WordPress Application Passwords (`Authorization: Basic base64(user:pass)`).
  - Bearer Token Authentication (`Authorization: Bearer <token>`).
- Fallbacks: Reads CLI flags (`--host`, `--user`, `--password`, `--token`, `--file`, `--activate`) with environment variable fallbacks (`WP_REMOTE_HOST`, `WP_REMOTE_USER`, etc.).

### 3.2 In-App Browser Deployer (`BackupManager`)
- UI component in `src/components/admin/backup-manager.tsx`.
- Provides an interactive Remote WordPress Server Deployer card with connection testing, package selection (`wp-exam.zip`, `wp-sam.zip`), deployment logs, and terminal CLI syntax display.
