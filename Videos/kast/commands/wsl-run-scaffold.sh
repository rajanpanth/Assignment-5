#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
cd "$HOME/kast-src"; mkdir -p pocs
cp /mnt/c/Users/panth/Videos/kast/pocs/USDKY_idl.json pocs/USDKY_idl.json
cp /mnt/c/Users/panth/Videos/kast/pocs/m_ext_scaffold.ts tests/unit/m_ext_scaffold.test.ts
rm -f /tmp/prog.txt
npx jest --preset ts-jest --runInBand tests/unit/m_ext_scaffold.test.ts > /tmp/scaffold.log 2>&1
echo "EXIT=$?"
echo "=== marks ==="; cat /tmp/prog.txt 2>/dev/null
echo "=== raw tail (30) ==="; tail -30 /tmp/scaffold.log | grep -viE "at Object|node_modules|^\s+[0-9]+ \||^\s+\| |ts-jest\[versions\]"
rm -f tests/unit/m_ext_scaffold.test.ts
