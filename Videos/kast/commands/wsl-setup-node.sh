#!/usr/bin/env bash
set -e
export PROFILE=/dev/null
echo "== installing nvm (no sudo) =="
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash >/tmp/nvm_install.log 2>&1 || { tail -5 /tmp/nvm_install.log; exit 1; }
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
echo "== installing node 22 LTS =="
nvm install 22 >/tmp/node_install.log 2>&1 || { tail -10 /tmp/node_install.log; exit 1; }
nvm use 22 >/dev/null
corepack enable >/dev/null 2>&1 || true
echo "node: $(node --version)"
echo "npm:  $(npm --version)"
corepack prepare pnpm@11.13.1 --activate >/dev/null 2>&1 || true
echo "pnpm: $(pnpm --version 2>&1 || echo missing)"
