#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install 18 >/tmp/n18.log 2>&1; nvm use 18 >/dev/null
echo "node: $(node --version)"
cd "$HOME/kast-src"
cp /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold.ts pocs/run_scaffold.ts
npx ts-node --transpile-only pocs/run_scaffold.ts 2>&1 | grep -vE "ExperimentalWarning|--import|bigint: Failed|Deprecation" | tail -25
echo "EXIT=${PIPESTATUS[0]}"
