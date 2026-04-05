#!/usr/bin/env bash
# install-hooks.sh — copy repo hook scripts into .git/hooks/
#
# Usage: bash scripts/install-hooks.sh
# Run once after cloning, or re-run to update.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

if [ ! -d "$HOOKS_DIR" ]; then
  echo "error: .git/hooks not found. Are you inside the repo?" >&2
  exit 1
fi

echo "Installing git hooks from scripts/ → .git/hooks/ ..."

cp "$REPO_ROOT/scripts/pre-commit-slop" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"
echo "  ✅  pre-commit  (slop-guard prose check)"

echo ""
echo "Done. Staged posts/*.md files will be checked before every commit."
echo "Bypass with: SLOP_SKIP=1 git commit ..."
