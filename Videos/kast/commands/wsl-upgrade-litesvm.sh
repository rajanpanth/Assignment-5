#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$HOME/.nvm/nvm.sh"; nvm use 20 >/dev/null
corepack enable >/dev/null 2>&1 || true
cd "$HOME/kast-src"
echo "== upgrade litesvm + anchor-litesvm via corepack pnpm =="
corepack pnpm add -D litesvm@0.3.3 anchor-litesvm@0.2.1 2>&1 | tail -8
echo "litesvm: $(node -e 'console.log(require("litesvm/package.json").version)')"
echo "anchor-litesvm: $(node -e 'console.log(require("anchor-litesvm/package.json").version)')"
ls node_modules/.pnpm | grep -iE "litesvm-linux" | head
cp /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold.ts pocs/run_scaffold.ts
echo "== run scaffold =="
npx ts-node --transpile-only pocs/run_scaffold.ts 2>&1 | grep -vE "ExperimentalWarning|--import|bigint: Failed|Deprecation" | tail -25
echo "EXIT=${PIPESTATUS[0]}"
