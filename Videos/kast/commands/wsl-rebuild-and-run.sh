#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
export MAMBA_ROOT_PREFIX="$HOME/mmroot"
eval "$("$HOME/bin/micromamba" shell hook -s posix)" 2>/dev/null || true
micromamba activate "$HOME/ctool" 2>/dev/null || true
export PATH="$HOME/ctool/bin:$PATH"
export CC="$HOME/ctool/bin/gcc" CXX="$HOME/ctool/bin/g++"
echo "gcc: $($CC --version | head -1)"; echo "make: $(make --version | head -1)"; echo "python3: $(python3 --version)"
cd "$HOME/kast-src"
echo "== rebuild bigint-buffer native binding =="
npm rebuild bigint-buffer 2>&1 | tail -12
echo "== does native binding load now? =="
node -e 'try{require("bigint-buffer");const b=require("bigint-buffer");console.log("toBigIntLE test:", b.toBigIntLE(Buffer.from([1,0,0,0,0,0,0,0])).toString());}catch(e){console.log("ERR",e.message)}' 2>&1 | grep -vi "pure JS" || true
node -e 'const p=require("bigint-buffer/package.json");console.log("bigint-buffer",p.version)'
