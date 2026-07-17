#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install 20 >/tmp/n20.log 2>&1; nvm use 20 >/dev/null
echo "node: $(node --version)"
cd "$HOME/kast-src"
cp /mnt/c/Users/panth/Videos/kast/pocs/USDKY_idl.json pocs/USDKY_idl.json 2>/dev/null
cp /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold.ts pocs/run_scaffold.ts
npx ts-node --transpile-only pocs/run_scaffold.ts 2>&1 | grep -vE "ExperimentalWarning|--import|bigint: Failed" | tail -25
echo "EXIT=${PIPESTATUS[0]}"
