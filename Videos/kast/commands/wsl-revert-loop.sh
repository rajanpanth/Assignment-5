#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$HOME/.nvm/nvm.sh"
nvm use 22 >/dev/null; corepack pnpm add -w -D litesvm@0.2.0 anchor-litesvm@0.1.2 >/tmp/rev.log 2>&1
echo "reverted litesvm: $(node -e 'console.log(require("litesvm/package.json").version)')"
nvm use 20 >/dev/null; cd "$HOME/kast-src"
# restore withSplPrograms for 0.2.0
sed 's/\.withDefaultPrograms()/\.withSplPrograms()/' /mnt/c/Users/panth/Videos/kast/pocs/run_scaffold.ts > pocs/run_scaffold.ts
for i in 1 2 3 4 5; do
  echo "=== run $i (node20 litesvm0.2.0) ==="
  timeout 90 npx ts-node --transpile-only pocs/run_scaffold.ts 2>&1 | grep -E "ok|SCAFFOLD|bad_alloc|FAILED|SOLVENCY|Aborted" | tail -6
done
