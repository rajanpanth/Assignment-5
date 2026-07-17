#!/usr/bin/env bash
echo "== WSL env =="; uname -sr; echo "home=$HOME"
for t in rustc cargo node npm pnpm corepack solana anchor git curl gcc make bzip2; do
  if command -v "$t" >/dev/null 2>&1; then
    echo "$t -> $($t --version 2>&1 | head -1)"
  else
    echo "$t -> MISSING"
  fi
done
echo "== disk =="; df -h /home 2>/dev/null | tail -1
