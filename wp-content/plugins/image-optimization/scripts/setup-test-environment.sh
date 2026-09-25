#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SETUP_SH="/var/www/html/wp-content/plugins/image-optimizer/tests/wp-env/config/setup.sh"

cd "$REPO_ROOT"

echo "[1/5] Building JS assets (npm run build)..."
npm run build

echo "[2/5] Installing Composer dependencies (no-dev)..."
composer install --no-dev --no-interaction --quiet

echo "[3/5] Starting WordPress environment (wp-env start)..."
npx wp-env start

echo "[4/5] Configuring WordPress (wp core install + plugin activate)..."
npx wp-env run cli -- bash "${SETUP_SH}"

echo "[5/5] Installing Playwright Chromium browser..."
npx playwright install chromium --with-deps

echo ""
echo "✔ Environment ready."
echo "  WP Admin : http://localhost:8888/wp-admin/"
echo "  Login    : admin / password"
echo ""
echo "Run tests : npm run test:playwright"
echo "Debug UI  : npm run test:playwright:debug"
