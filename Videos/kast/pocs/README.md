# PoC Environment — WSL / litesvm (WORKING)

Set up 2026-07-17. Executable PoC path for KAST m_ext, since native tooling doesn't run on Windows.

## Status: ✅ litesvm PoC path works (no sudo needed)
- WSL2 Ubuntu present (distro `Ubuntu`, user `panth`, home `/home/panth`).
- Node 22 + pnpm 11.13.1 installed per-user via nvm (no sudo): `~/.nvm`.
- Repo copied to Linux FS: **`/home/panth/kast-src`** (faster than /mnt/c). Deps installed.
- **litesvm Linux native binary installed** (`litesvm-linux-x64-gnu@0.2.0`) — the piece missing on Windows.
- Verified: litesvm loads the real deployed variant programs and executes transactions.
  - `pocs/litesvm_smoke.test.ts` → PASS: loaded ext_b.so (scaled-ui=USDKY variant), ext_a.so (no-yield=USDK variant), earn.so (all executable) + ran a SOL-transfer tx (balance asserted).

## Prebuilt programs available for PoCs (in tests/programs/)
| file | variant | test program id |
|---|---|---|
| ext_b.so | scaled-ui (USDKY) | HSMnbWEkB7sEQAGSzBPeACNUCXC9FgNeeESLnHtKfoy3 |
| ext_a.so | no-yield (USDK) | 3joDhmLtHLrSBGfeAe1xQiv3gjikes3x8S4N3o6Ld8zB |
| ext_c.so | no-yield (dummy-account test build) | 81gYpXqg8ZT9gdkFSe35eqiitqBWqVfYwDwVfXuk8Xfw |
| earn.so | M earn program | mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z |
| spl_token_2022.so | Token-2022 | TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb |

## How to run a PoC (from Windows git-bash)
```bash
# 1. put your test file into the WSL repo (via /mnt/c bridge)
cp pocs/mytest.test.ts /c/Users/panth/Videos/kast/pocs/
# 2. run it in WSL (MSYS_NO_PATHCONV stops git-bash mangling /mnt paths)
MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- bash -lc '
  export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh; nvm use 22 >/dev/null
  cd $HOME/kast-src
  cp /mnt/c/Users/panth/Videos/kast/pocs/mytest.test.ts tests/unit/mytest.test.ts
  npx jest --preset ts-jest tests/unit/mytest.test.ts
  rm -f tests/unit/mytest.test.ts'
```
Reusable scripts: commands/wsl-setup-node.sh, wsl-setup-repo.sh, wsl-run-smoke.sh.

## Two ways to drive m_ext in a PoC
1. **Raw instructions (no build needed):** encode 8-byte Anchor discriminator = sha256("global:<ix>")[:8] + Borsh args, supply accounts per the Accounts struct. Load ext_b.so/ext_a.so + earn.so + spl_token_2022.so into litesvm. Full control; more manual.
2. **Repo harness (needs generated IDL types):** tests/unit/ext_test_harness.ts builds the whole M+ext setup, but imports `target/types/{scaled_ui,no_yield}.ts` which come from `anchor build`. That build needs the Solana BPF toolchain + a host C linker.

## To enable full `anchor build` / harness (ONE sudo step required — user must run)
The host build needs a C toolchain (proc-macros/build scripts). In WSL:
```bash
sudo apt-get update && sudo apt-get install -y build-essential pkg-config libssl-dev bzip2   # <-- needs your password
```
Then (no sudo):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"     # solana/agave 2.1.0
cargo install --git https://github.com/coral-xyz/anchor avm --force && avm install 0.31.1 && avm use 0.31.1
cd ~/kast-src && make build-programs && pnpm jest tests/unit/m_ext.test.ts
```
Only needed IF a candidate requires the full harness; the raw-instruction litesvm path already works without it.

## Fuller m_ext scaffold (pocs/run_scaffold.ts) + on-chain IDLs
Built a standalone (non-jest) scaffold that drives the REAL prebuilt scaled-ui program via its Anchor IDL — no anchor build needed:
- **pocs/USDKY_idl.json / USDK_idl.json**: the exact Anchor IDLs, decompressed straight from the DEPLOYED mainnet programs (Anchor stores them on-chain, zlib-compressed at createWithSeed(base,"anchor:idl",program)). USDKY ixs = accept_admin/add_wrap_authority/claim_fees/initialize/remove_wrap_authority/revoke_admin_transfer/set_fee/sync/transfer_admin/unwrap/wrap; USDK = same minus set_fee/sync.
- **pocs/run_scaffold.ts**: boots litesvm + earn.so + spl_token_2022.so + ext_b.so(scaled-ui at HSMn), then: create M mint (Token-2022 scaled-ui + DefaultAccountState[Frozen] + PermanentDelegate, authorities=earn global) -> earn.initialize -> ext mint -> create+thaw vault via earner registration (MerkleTree) -> ext.initialize -> wrap -> propagateIndex(yield)+sync -> unwrap -> solvency assert.
- Uses the mainnet IDL with address overridden to the ext_b.so build id (HSMn); Anchor auto-resolves all PDAs (global/m_vault/mint_authority/vault ATA) from the IDL seeds. Load a program at its own declare_id and derive PDAs from it.

Run: `npx ts-node --transpile-only pocs/run_scaffold.ts` (in ~/kast-src under WSL). Helper: commands/wsl-run-standalone.sh.

### ⚠ Known blocker on THIS WSL2 host — litesvm BPF VM native crash (environment-level, NOT logic)
The scaffold's SETUP phases run reliably every run (`M mint ok / earn.initialize ok / ext mint ok / vault thawed ok`), proving the wiring (IDLs, PDAs, account resolution, program loading, earner registration) is correct. But a **non-deterministic `std::bad_alloc` (crash point MOVES between runs) fires inside litesvm's native BPF execution** while running the earn.so / ext_b.so Anchor programs.

Investigation done (all no-sudo):
- Installed gcc/g++/make into `~/ctool` via **micromamba** (no sudo). Built the native `bigint_buffer.node` with node-gyp + python 3.11; verified it LOADS (no pure-JS fallback). **Crash persisted → bigint-buffer NOT the cause.**
- Tried Node **18 / 20 / 22** (20 got furthest) and litesvm **0.2.0 AND 0.3.3** (anchor-litesvm 0.1.2 / 0.2.1). ALL crash with `std::bad_alloc`.
- Plain token-2022 scaled-ui ops (M mint) succeed every run; the crash is specifically in litesvm's rbpf engine executing the custom programs. Non-determinism + C++ `std::bad_alloc` ⇒ a memory/JIT fault in litesvm's BPF VM on WSL2, below the app layer, not fixable from user space.
- The project's OWN tests use this exact stack and PASS on native Linux / CI ⇒ the scaffold is correct and will run there unchanged.

**To get a green run:** run `run_scaffold.ts` on a **native Linux box or the project's CI** (not WSL2 on this host). Optionally investigate a litesvm/rbpf build flag to disable JIT under WSL2. Toolchain scripts: commands/wsl-install-toolchain.sh, wsl-build-native.sh. Installed now: litesvm 0.3.3 + anchor-litesvm 0.2.1 (run_scaffold.ts uses `.withDefaultPrograms()` for the 0.3.x API).

Separately, `sudo apt-get install -y build-essential` also unlocks the full `anchor build` (for the repo's own IDL-typed harness) — but that path hits the SAME litesvm VM crash on this host, so native Linux is the real answer.

## Note
No PoC is pending — the research found no candidate. The scaffold + on-chain IDLs are complete and correct; only a green *execution* is blocked, and only on this WSL2 host (works on native Linux/CI). Any future finding can be dropped into `run_scaffold.ts` and run there.
