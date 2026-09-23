#!/usr/bin/env bash
#
# WP Exam - Remote Laravel Publishing Automation (Bash / Linux / CI-CD)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SERVER_HOST="${1:-${DEPLOY_HOST:-}}"
REMOTE_USER="${2:-${DEPLOY_USER:-deploy}}"
REMOTE_PATH="${3:-${DEPLOY_PATH:-/var/www/wp-exam}}"
PORT="${4:-${DEPLOY_PORT:-22}}"
KEY_PATH="${5:-${DEPLOY_KEY:-}}"
DRY_RUN="${DRY_RUN:-false}"

echo "===================================================="
echo "  WP Exam - Remote Laravel Publishing Automation"
echo "===================================================="

isHostEmpty=false

if [ -z "${SERVER_HOST}" ]; then
    isHostEmpty=true
fi

if [ "${isHostEmpty}" = "true" ]; then
    echo "[ERROR] Missing remote server host."
    echo "Usage: ./scripts/publish-remote.sh <host> [user] [path] [port] [key]"
    exit 1
fi

echo "  Target: ${REMOTE_USER}@${SERVER_HOST}:${REMOTE_PATH} (Port ${PORT})"

hasDist=false

if [ -d "${REPO_ROOT}/dist" ]; then
    hasDist=true
fi

if [ "${hasDist}" = "false" ]; then
    echo "[1/4] Compiling frontend assets..."
    cd "${REPO_ROOT}" && npm run build
fi

TIMESTAMP=$(date +%Y%m%d%H%M%S)
PACKAGE="deploy-package-${TIMESTAMP}.tar.gz"

echo "[2/4] Packaging production archive (${PACKAGE})..."
cd "${REPO_ROOT}"
tar --exclude-from=.distignore -czf "/tmp/${PACKAGE}" .

KEY_ARG=""
hasKeyPath=false

if [ -n "${KEY_PATH}" ]; then
    hasKeyPath=true
fi

if [ "${hasKeyPath}" = "true" ]; then
    KEY_ARG="-i ${KEY_PATH}"
fi

isDryRun=false

if [ "${DRY_RUN}" = "true" ]; then
    isDryRun=true
fi

if [ "${isDryRun}" = "true" ]; then
    echo "  [DRY-RUN] Would upload /tmp/${PACKAGE} to ${SERVER_HOST}"
    echo "  [DRY-RUN] Would extract and optimize on ${SERVER_HOST}"
    rm -f "/tmp/${PACKAGE}"
    exit 0
fi

echo "[3/4] Uploading payload to remote server..."
scp -P "${PORT}" ${KEY_ARG} "/tmp/${PACKAGE}" "${REMOTE_USER}@${SERVER_HOST}:/tmp/${PACKAGE}"
rm -f "/tmp/${PACKAGE}"

echo "[4/4] Extracting and running remote optimizations..."
ssh -p "${PORT}" ${KEY_ARG} "${REMOTE_USER}@${SERVER_HOST}" << EOF
    mkdir -p "${REMOTE_PATH}"
    tar -xzf "/tmp/${PACKAGE}" -C "${REMOTE_PATH}"
    rm -f "/tmp/${PACKAGE}"
    mkdir -p "${REMOTE_PATH}/storage/framework/cache" "${REMOTE_PATH}/storage/framework/sessions" "${REMOTE_PATH}/storage/framework/views" "${REMOTE_PATH}/storage/logs" "${REMOTE_PATH}/bootstrap/cache"
    chmod -R 775 "${REMOTE_PATH}/storage" "${REMOTE_PATH}/bootstrap/cache"
    cd "${REMOTE_PATH}"
    php artisan route:list || true
EOF

echo "===================================================="
echo "  [SUCCESS] Remote deployment complete!"
echo "===================================================="
