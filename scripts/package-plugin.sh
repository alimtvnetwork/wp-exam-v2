#!/usr/bin/env bash
# Packages WP Exam and WP Sam plugins into installable zip archives.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${1:-dist}"
DIST_PATH="${REPO_ROOT}/${OUTPUT_DIR}"

mkdir -p "${DIST_PATH}"

PLUGINS=("wp-exam" "wp-sam")

for PLUGIN in "${PLUGINS[@]}"; do
    SOURCE_PATH="${REPO_ROOT}/wp-plugins/${PLUGIN}"
    ZIP_PATH="${DIST_PATH}/${PLUGIN}.zip"

    if [ -d "${SOURCE_PATH}" ]; then
        rm -f "${ZIP_PATH}"
        echo "Packaging ${PLUGIN} from ${SOURCE_PATH} -> ${ZIP_PATH}..."
        (cd "${SOURCE_PATH}" && zip -r -q "${ZIP_PATH}" .)
        ZIP_SIZE=$(du -k "${ZIP_PATH}" | cut -f1)
        echo "  ✓ Created ${PLUGIN}.zip (${ZIP_SIZE} KB)"
    else
        echo "  ! Source directory missing: ${SOURCE_PATH}"
    fi
done

echo ""
echo "Plugin packaging completed successfully!"
