#!/usr/bin/env bash
# Local Test Execution Runner for WP Exam & WP Sam
# Starts development environment and opens browser.

set -euo pipefail

PORT="${1:-5173}"
TARGET_URL="http://127.0.0.1:${PORT}"

echo "===================================================="
echo "  WP Exam & WP Sam — Local Development & Test Runner"
echo "===================================================="

echo ""
echo "[1/3] Checking environment prerequisites..."
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "Error: Node.js and npm are required." >&2
    exit 1
fi

if command -v php &> /dev/null; then
    echo "  ✓ PHP found: $(php -v | head -n 1)"
else
    echo "  ! PHP CLI not found; running with client-side fallback."
fi

echo ""
echo "[2/3] Compiling theme stylesheets..."
npm run build:less || true

echo ""
echo "[3/3] Launching Vite development server on port ${PORT}..."

# Open browser in background
if command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open "${TARGET_URL}") &
elif command -v open &> /dev/null; then
    (sleep 2 && open "${TARGET_URL}") &
fi

exec npm run dev -- --host 127.0.0.1 --port "${PORT}"
