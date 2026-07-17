#!/usr/bin/env bash
set -e
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
cd "$HOME/kast-src"
cp /mnt/c/Users/panth/Videos/kast/commands/litesvm_smoke.test.ts tests/unit/litesvm_smoke.test.ts
npx jest --preset ts-jest tests/unit/litesvm_smoke.test.ts 2>&1 | tail -30
rm -f tests/unit/litesvm_smoke.test.ts
