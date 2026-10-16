#!/usr/bin/env bash
# WP Exam — one-liner installer (GitMap/AGM style).
#
# Usage:
#   bash scripts/install.sh [flags]          # from a repo checkout
#   curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.sh | bash -s -- [flags]
#
# What it does:
#   1. Detects OS/arch and checks prerequisites (node 20+, npm; php 8.3 optional).
#   2. Installs npm dependencies (`npm ci` when the lockfile is clean, else `npm install`).
#   3. Compiles theme styles (`npm run build:less`).
#   4. Runs the production build (`vite build` via `npm run build`).
#   5. Prints next steps.
#
# Flags:
#   --help        Show this help and exit.
#   --dry-run     Print every action without executing it (zero changes).
#   --skip-build  Install dependencies but skip the vite build step.
#   --port <n>    Dev-server port used in the "next steps" output (default 5174).
#
# The installer is idempotent: safe to re-run; steps already satisfied are
# skipped. It never uploads anything anywhere (zero-storage mandate).

set -euo pipefail

# ---------------------------------------------------------------------------
# Defaults and flag parsing
# ---------------------------------------------------------------------------
DRY_RUN=0
SKIP_BUILD=0
PORT=5174

print_help() {
    # Explicit text (not sed on "$0"): "$0" is not a readable file when the
    # script arrives via `curl ... | bash`.
    cat <<'HELP_EOF'
WP Exam — one-liner installer (GitMap/AGM style).

Usage:
  bash scripts/install.sh [flags]          # from a repo checkout
  curl -fsSL https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.sh | bash -s -- [flags]

What it does:
  1. Detects OS/arch and checks prerequisites (node 20+, npm; php 8.3 optional).
  2. Installs npm dependencies (`npm ci` when the lockfile is clean, else `npm install`).
  3. Compiles theme styles (`npm run build:less`).
  4. Runs the production build (`vite build` via `npm run build`).
  5. Prints next steps.

Flags:
  --help        Show this help and exit.
  --dry-run     Print every action without executing it (zero changes).
  --skip-build  Install dependencies but skip the vite build step.
  --port <n>    Dev-server port used in the "next steps" output (default 5174).

The installer is idempotent: safe to re-run; steps already satisfied are
skipped. It never uploads anything anywhere (zero-storage mandate).
HELP_EOF
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --help|-h)
            print_help
            exit 0
            ;;
        --dry-run)
            DRY_RUN=1
            shift
            ;;
        --skip-build)
            SKIP_BUILD=1
            shift
            ;;
        --port)
            if [ -z "${2:-}" ]; then
                echo "error: --port requires a value" >&2
                exit 2
            fi
            PORT="$2"
            shift 2
            ;;
        --port=*)
            PORT="${1#--port=}"
            shift
            ;;
        *)
            echo "error: unknown flag: $1 (see --help)" >&2
            exit 2
            ;;
    esac
done

case "$PORT" in
    ''|*[!0-9]*)
        echo "error: --port must be a number (got: $PORT)" >&2
        exit 2
        ;;
esac

# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------
log_step()  { echo ""; echo "[$1] $2"; }
log_ok()    { echo "  [ok] $1"; }
log_warn()  { echo "  [warn] $1"; }
log_skip()  { echo "  [skip] $1"; }

run() {
    # Run a command, or print it in dry-run mode. "$@" is the command + args.
    if [ "$DRY_RUN" -eq 1 ]; then
        echo "  [dry-run] would run: $*"
        return 0
    fi
    "$@"
}

# ---------------------------------------------------------------------------
# Repo root detection (works when piped via curl | bash)
# ---------------------------------------------------------------------------
REPO_DIR=""

if [ -f package.json ] && grep -q '"build:less"' package.json 2>/dev/null; then
    # Already inside the wp-exam-v2 checkout.
    REPO_DIR="$PWD"
else
    # One-liner mode: clone (or reuse) the repo into the current directory.
    REPO_URL="https://github.com/alimtvnetwork/wp-exam-v2.git"
    if [ -d wp-exam-v2 ] && [ -f wp-exam-v2/package.json ]; then
        log_skip "wp-exam-v2 directory already exists; reusing it (idempotent)."
        REPO_DIR="wp-exam-v2"
    else
        log_step "0" "Cloning wp-exam-v2 (one-liner mode)..."
        if ! command -v git >/dev/null 2>&1; then
            echo "error: git is not on PATH; needed to clone the repo in one-liner mode." >&2
            echo "       Clone it manually: git clone $REPO_URL" >&2
            exit 1
        fi
        if [ "$DRY_RUN" -eq 1 ]; then
            echo "  [dry-run] would run: git clone $REPO_URL"
        else
            git clone "$REPO_URL"
        fi
        REPO_DIR="wp-exam-v2"
    fi
fi

if [ "$DRY_RUN" -eq 1 ]; then
    echo "  [dry-run] would cd into: $REPO_DIR"
else
    cd "$REPO_DIR"
fi

REPO_ROOT="$PWD"

echo "===================================================="
echo "  WP Exam — one-liner installer"
echo "===================================================="
echo "  repo root : $REPO_ROOT"
echo "  dry run   : $([ "$DRY_RUN" -eq 1 ] && echo yes || echo no)"

# ---------------------------------------------------------------------------
# [1] OS / arch detection
# ---------------------------------------------------------------------------
log_step "1/5" "Detecting OS and architecture..."

OS_NAME="$(uname -s)"
ARCH_RAW="$(uname -m)"

case "$OS_NAME" in
    Linux*)  OS_LABEL="linux" ;;
    Darwin*) OS_LABEL="macos" ;;
    MINGW*|MSYS*|CYGWIN*) OS_LABEL="windows" ;;
    *)       OS_LABEL="unknown" ;;
esac

case "$ARCH_RAW" in
    x86_64|amd64) ARCH_LABEL="x64" ;;
    arm64|aarch64) ARCH_LABEL="arm64" ;;
    *)            ARCH_LABEL="$ARCH_RAW" ;;
esac

echo "  os   : $OS_LABEL ($OS_NAME)"
echo "  arch : $ARCH_LABEL ($ARCH_RAW)"

# ---------------------------------------------------------------------------
# [2] Prerequisites: node 20+, npm, php 8.3 (optional)
# ---------------------------------------------------------------------------
log_step "2/5" "Checking prerequisites..."

version_at_least() {
    # version_at_least <actual> <required> — both "major.minor"
    # Returns 0 when actual >= required.
    _actual="$1"
    _required="$2"
    _a_major="${_actual%%.*}"
    _a_rest="${_actual#*.}"
    _a_minor="${_a_rest%%.*}"
    _r_major="${_required%%.*}"
    _r_rest="${_required#*.}"
    _r_minor="${_r_rest%%.*}"
    if [ "$_a_major" -gt "$_r_major" ]; then return 0; fi
    if [ "$_a_major" -lt "$_r_major" ]; then return 1; fi
    [ "$_a_minor" -ge "$_r_minor" ]
}

if command -v node >/dev/null 2>&1; then
    NODE_VER="$(node --version | sed 's/^v//')"
    if version_at_least "$NODE_VER" "20.0"; then
        log_ok "node $NODE_VER (>= 20 required)"
    else
        echo "error: node $NODE_VER found; node 20+ is required." >&2
        exit 1
    fi
else
    echo "error: node is not on PATH. Install node 20+ from https://nodejs.org and re-run." >&2
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    log_ok "npm $(npm --version)"
else
    echo "error: npm is not on PATH. Reinstall node 20+ (ships with npm) and re-run." >&2
    exit 1
fi

if command -v php >/dev/null 2>&1; then
    PHP_VER="$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;' 2>/dev/null || echo "0.0")"
    if version_at_least "$PHP_VER" "8.3"; then
        log_ok "php $PHP_VER (>= 8.3, optional prerequisite satisfied)"
    else
        log_warn "php $PHP_VER found (< 8.3); backend features need php 8.3+. Continuing with frontend-only setup."
    fi
else
    log_warn "php not found; the WordPress/PHP backend stays optional — continuing with the frontend app."
fi

# ---------------------------------------------------------------------------
# [3] npm dependencies (idempotent)
# ---------------------------------------------------------------------------
log_step "3/5" "Installing npm dependencies..."

deps_satisfied() {
    # Idempotent when: node_modules exists AND the installed lockfile matches
    # the committed lockfile (npm's own marker).
    if [ ! -d node_modules ]; then
        return 1
    fi
    if [ ! -f package-lock.json ]; then
        return 0
    fi
    if [ ! -f node_modules/.package-lock.json ]; then
        return 1
    fi
    _committed="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("package-lock.json","utf8")).lockfileVersion)' 2>/dev/null || echo "")"
    _installed="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("node_modules/.package-lock.json","utf8")).lockfileVersion)' 2>/dev/null || echo "")"
    if [ -z "$_committed" ]; then
        return 0
    fi
    [ "$_committed" = "$_installed" ]
}

if deps_satisfied; then
    log_skip "node_modules already matches the lockfile; nothing to install."
elif [ "$DRY_RUN" -eq 1 ]; then
    if [ -f package-lock.json ]; then
        echo "  [dry-run] would run: npm ci"
    else
        echo "  [dry-run] would run: npm install"
    fi
else
    if [ -f package-lock.json ]; then
        # Prefer ci for reproducible installs; fall back to install when the
        # lockfile is out of sync with package.json (ci would refuse).
        if npm ci 2>/dev/null; then
            log_ok "dependencies installed via npm ci."
        else
            log_warn "npm ci refused (lockfile out of sync); falling back to npm install."
            npm install
            log_ok "dependencies installed via npm install."
        fi
    else
        log_warn "no package-lock.json; using npm install (non-reproducible)."
        npm install
        log_ok "dependencies installed via npm install."
    fi
fi

# ---------------------------------------------------------------------------
# [4] Theme styles + production build (idempotent)
# ---------------------------------------------------------------------------
log_step "4/5" "Compiling theme styles and building the app..."

LESS_SRC="src/styles/theme.less"
LESS_OUT="src/styles/theme.css"

if [ -f "$LESS_SRC" ]; then
    if [ -f "$LESS_OUT" ] && [ "$LESS_OUT" -nt "$LESS_SRC" ] && [ "$DRY_RUN" -eq 0 ]; then
        log_skip "$LESS_OUT is newer than $LESS_SRC; theme styles already compiled."
    else
        echo "  compiling theme styles (npm run build:less)..."
        if [ "$DRY_RUN" -eq 1 ]; then
            echo "  [dry-run] would run: npm run build:less"
        else
            # Same pattern as run.sh: warn and keep going on style errors.
            if npm run build:less; then
                log_ok "theme styles compiled."
            else
                log_warn "build:less reported an error; keeping the existing compiled css."
            fi
        fi
    fi
else
    log_warn "$LESS_SRC not found; skipping theme compilation."
fi

if [ "$SKIP_BUILD" -eq 1 ]; then
    log_skip "--skip-build given; skipping vite build."
elif [ -f dist/index.html ] && [ "$DRY_RUN" -eq 0 ]; then
    # dist is fresh when nothing under src/ is newer than dist/index.html.
    if [ -z "$(find src -newer dist/index.html -print -quit 2>/dev/null)" ]; then
        log_skip "dist/ is up to date; skipping vite build."
    else
        echo "  building the app (npm run build)..."
        run npm run build
        log_ok "production build written to dist/."
    fi
elif [ "$DRY_RUN" -eq 1 ]; then
    echo "  [dry-run] would run: npm run build"
else
    echo "  building the app (npm run build)..."
    run npm run build
    log_ok "production build written to dist/."
fi

# ---------------------------------------------------------------------------
# [5] Next steps
# ---------------------------------------------------------------------------
log_step "5/5" "Done. Next steps:"

cat <<EOF

  Start the dev server (hot reload):
    npm run dev -- --host 127.0.0.1 --port $PORT

  Then open:
    http://127.0.0.1:$PORT

  Backend (WordPress/PHP) quick start, if php 8.3+ is installed:
    php -S 127.0.0.1:8080 router.php

  Full local-dev runner (backend + frontend + browser):
    bash run.sh $PORT

  Re-run this installer any time — steps already satisfied are skipped.

  Zero-storage note: this installer only downloads from npm/github and
  writes local files; it never uploads anything anywhere.
EOF

if [ "$DRY_RUN" -eq 1 ]; then
    echo "[dry-run] no changes were made."
fi
