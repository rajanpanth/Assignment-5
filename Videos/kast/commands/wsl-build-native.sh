#!/usr/bin/env bash
set -e
export MAMBA_ROOT_PREFIX="$HOME/mmroot"
echo "== add python 3.11 to toolchain env =="
"$HOME/bin/micromamba" install -y -p "$HOME/ctool" -c conda-forge "python=3.11" >/tmp/py.log 2>&1 || { tail -15 /tmp/py.log; exit 1; }
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
export PATH="$HOME/ctool/bin:$PATH"
export CC="$HOME/ctool/bin/gcc" CXX="$HOME/ctool/bin/g++"
export npm_config_python="$HOME/ctool/bin/python3.11"
echo "python: $($npm_config_python --version)  gcc: $($CC -dumpversion)  make: $(make --version|head -1)"
PKG="$HOME/kast-src/node_modules/.pnpm/bigint-buffer@1.1.5/node_modules/bigint-buffer"
cd "$PKG"
echo "== node-gyp rebuild (native addon only) =="
../../../node-gyp-build 2>/dev/null || npx --yes node-gyp rebuild 2>&1 | tail -15
echo "== built .node? =="
find "$PKG/build" -name "*.node" 2>/dev/null
