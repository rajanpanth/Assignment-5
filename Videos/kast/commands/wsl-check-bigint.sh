#!/usr/bin/env bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null
cd "$HOME/kast-src"
node -e '
const p="./node_modules/.pnpm/bigint-buffer@1.1.5/node_modules/bigint-buffer";
try {
  const native = require(p+"/build/Release/bigint_buffer.node");
  console.log("NATIVE .node loads directly:", Object.keys(native));
} catch(e){ console.log("native direct load ERR:", e.message); }
process.env.NODE_NO_WARNINGS="0";
const bb = require(p);   // this prints the warning to stderr if it falls back
console.log("toBigIntLE:", bb.toBigIntLE(Buffer.from([2,0,0,0,0,0,0,0])).toString());
' 2>&1
