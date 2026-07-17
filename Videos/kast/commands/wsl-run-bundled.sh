#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
cd "$HOME/kast-src"; mkdir -p pocs
cp /mnt/c/Users/panth/Videos/kast/pocs/USDKY_idl.json pocs/USDKY_idl.json
cp /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold_bundled.ts pocs/run_scaffold_bundled.ts
npx ts-node --transpile-only pocs/run_scaffold_bundled.ts 2>&1 | grep -vE "ExperimentalWarning|--import|bigint: Failed" | tail -20
echo "EXIT=${PIPESTATUS[0]}"
