# Environment

## Host toolchain (installed)
- rustc 1.93.0 (2026-01-19)
- cargo 1.93.0
- solana-cli 1.18.23  ⚠ repo wants **2.1.0**
- anchor-cli 0.30.1  ⚠ repo wants **0.31.1** (Anchor.toml). avm 0.32.1 present -> `avm install 0.31.1 && avm use 0.31.1`.
- node v22.16.0
- pnpm: not on PATH; use `corepack pnpm` (11.13.1) or the login-profile pnpm.
- rust-toolchain file: none in repo.

## Repo
- github.com/m0-foundation/solana-m-extensions cloned to source/solana-m-extensions
- HEAD b69d1f8d8be34f34aaac4d1060cec37f81dba0af (main, 2026-07-09, PR #70)
- Tags: v1.0 (2025-07-25), v1.1 (2025-08-19), v2.0 (2025-09-29)
- Anchor.toml localnet IDs (PLACEHOLDERS, not in-scope): m_ext=3C865D264L4NkAm78zfnDzQJJvXuU3fMjRUvRxyPi5da, ext_swap=MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH
- workspace dep: earn = git solana-m rev 972e896

## Build (from Makefile)
- `anchor build -p m_ext -- --features scaled-ui --no-default-features` (USDKY hypothesis)
- `anchor build -p m_ext -- --features no-yield --no-default-features` (USDK hypothesis)
- Real BPF build needs anchor 0.31.1 + solana 2.1.0 (avm).

## Tests (litesvm — NO build needed)
- Prebuilt test .so checked in: tests/programs/{earn.so, ext_a.so(no-yield), ext_b.so(scaled-ui), ext_c.so, spl_token_2022.so}
- `corepack pnpm jest --preset ts-jest tests/unit/**.test.ts`  (m_ext.test.ts, ext_swap.test.ts)
- Harness: tests/unit/ext_test_harness.ts (reuse for PoCs)
- `cargo test` for Rust unit tests (conversion rounding tests etc.)
- RPC in .env is behind 1Password (op://) — devnet Helius. Not usable; use litesvm locally only.
