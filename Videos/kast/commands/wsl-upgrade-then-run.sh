#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$HOME/.nvm/nvm.sh"
# upgrade under node 22 (pnpm needs it)
nvm use 22 >/dev/null; corepack enable >/dev/null 2>&1 || true
cd "$HOME/kast-src"
echo "== upgrade (node 22) =="
corepack pnpm add -w -D litesvm@0.3.3 anchor-litesvm@0.2.1 2>&1 | tail -5
echo "litesvm now: $(node -e 'console.log(require("litesvm/package.json").version)')  anchor-litesvm: $(node -e 'console.log(require("anchor-litesvm/package.json").version)')"
ls node_modules/.pnpm | grep -iE "litesvm-linux" | head
# run under node 20 (more stable native abi)
nvm use 20 >/dev/null; echo "run node: $(node --version)"
cp /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold.ts pocs/run_scaffold.ts
echo "== run scaffold =="
npx ts-node --transpile-only pocs/run_scaffold.ts 2>&1 | grep -vE "ExperimentalWarning|--import|bigint: Failed|Deprecation" | tail -25
echo "EXIT=${PIPESTATUS[0]}"
