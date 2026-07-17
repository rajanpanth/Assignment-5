#!/usr/bin/env bash
set -e
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
cd "$HOME"
if [ ! -d kast-src ]; then
  echo "== copying repo into Linux FS (excluding node_modules/target) =="
  mkdir -p kast-src
  rsync -a --exclude node_modules --exclude target --exclude '.git' \
    /mnt/c/Users/panth/Videos/kast/source/solana-m-extensions/ kast-src/ 2>/dev/null || \
  cp -r /mnt/c/Users/panth/Videos/kast/source/solana-m-extensions/* kast-src/ 2>/dev/null
fi
cd kast-src
echo "== files present =="; ls tests/programs/*.so 2>&1
echo "== pnpm install (pulls linux litesvm binary) =="
pnpm install 2>&1 | tail -15
echo "== litesvm linux binary? =="
find node_modules -ipath '*litesvm-linux*' -name '*.node' 2>/dev/null | head
