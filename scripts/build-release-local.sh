#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Offline release build requires existing dependencies in node_modules." >&2
  echo "Run npm ci once while online, then rerun this script offline." >&2
  exit 1
fi
npm run fixtures:gen
npm run lint
npm test
npm run build
npm run docs:build
npm pack --dry-run
npm pack

echo "Offline release bundle generated in project root (*.tgz)."
