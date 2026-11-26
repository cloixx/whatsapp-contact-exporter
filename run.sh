#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure output directory exists with secure permissions
mkdir -p "$SCRIPT_DIR/output"
chmod 700 "$SCRIPT_DIR/output" 2>/dev/null || true

# Execute within the isolated Nix Flake environment
if ! command -v nix >/dev/null 2>&1; then
  echo "[Error] Nix is required but not found in PATH." >&2
  exit 1
fi

exec nix develop --command node "$SCRIPT_DIR/src/index.js" "$@"
