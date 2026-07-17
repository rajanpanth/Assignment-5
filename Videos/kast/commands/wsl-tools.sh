#!/usr/bin/env bash
for t in python3 python make cc gcc g++ clang zig conda curl wget xz tar bzip2 ld; do
  if command -v "$t" >/dev/null 2>&1; then echo "$t -> $(command -v $t)"; else echo "$t -> MISSING"; fi
done
echo "glibc: $(ldd --version 2>/dev/null | head -1)"
