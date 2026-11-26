#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure output directory exists with secure permissions
mkdir -p "$SCRIPT_DIR/output"
chmod 700 "$SCRIPT_DIR/output" 2>/dev/null || true

# Check if Nix is available and flake.nix exists
if command -v nix >/dev/null 2>&1 && [ -f "$SCRIPT_DIR/flake.nix" ]; then
  exec nix develop --command node "$SCRIPT_DIR/src/index.js" "$@"
fi

# Fallback for standard macOS, Ubuntu, Debian, Fedora, Arch, etc.
if ! command -v node >/dev/null 2>&1; then
  echo "================================================================================" >&2
  echo " [ERROR] Node.js is not installed!" >&2
  echo " Please install Node.js (v18 or newer) from: https://nodejs.org/" >&2
  echo " Or on macOS using Homebrew: brew install node" >&2
  echo " Or on Ubuntu/Debian:        sudo apt install nodejs npm" >&2
  echo "================================================================================" >&2
  exit 1
fi

if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "[Setup] Installing required dependencies (one-time setup)..."
  npm install
fi

exec node "$SCRIPT_DIR/src/index.js" "$@"
