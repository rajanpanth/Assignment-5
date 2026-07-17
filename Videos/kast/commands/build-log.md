# BPF Build Log

## Attempt 1 — anchor 0.31.1 BPF build (2026-07-17)
- `avm install 0.31.1` OK; binary at ~/.avm/bin/anchor-0.31.1 (anchor-cli 0.31.1). NOTE: PATH `anchor` (~/.cargo/bin) is still 0.30.1 — must call the avm binary explicitly.
- `~/.avm/bin/anchor-0.31.1 build -p m_ext -- --features scaled-ui --no-default-features`
- **FAILED** (despite shell exit 0): anchor tried to bootstrap `agave-install` → `agave-install-init: machine architecture is currently unsupported` → `Failed to install agave-install`. No target/deploy/*.so, no target/types/*.ts produced.
- Root cause: anchor 0.31.1 wants an agave/solana 2.x sbf toolchain; this Windows host's active solana is 1.18.23 (/c/solana/bin) and agave-install can't self-install here. platform-tools 2.1.6/2.2.13 ARE present under ~/.local/share/solana/install/releases.

## Options for a future on-chain PoC (not needed so far — analysis+sim resolved top hypotheses)
A. Point cargo-build-sbf at existing platform-tools 2.1.6 and build the .so directly (bypass anchor toolchain bootstrap), then hand-generate IDL or drive via raw instructions.
B. Rust `litesvm` harness loading the CHECKED-IN prebuilt test .so (tests/programs/ext_b.so=scaled-ui, ext_a.so=no-yield, earn.so, spl_token_2022.so) + manual instruction encoding (discriminators from source). No anchor build needed.
C. Fix agave toolchain (SOLANA 2.1.0 via alternate installer).

## Attempt 2 — cargo-build-sbf directly (solana 2.1.6 & 2.2.13), 2026-07-17
- Bypassed anchor; ran `cargo-build-sbf --features scaled-ui --no-default-features` with the installed solana 2.1.6 and 2.2.13 `cargo-build-sbf`.
- BOTH FAIL identically: `error: not a directory: '...\platform-tools\rust\lib'`. The platform-tools cross-toolchain (rust/lib) is NOT extracted under either release; forcing re-download did not complete extraction (Windows tar.bz2 extraction of platform-tools fails on this host — same root cause as anchor's agave-install "unsupported architecture").
- **Verdict: native BPF cross-compile is BLOCKED on this Windows host (environment limitation).** Not fixable via config; would need manual download+extract of the correct platform-tools-windows archive into `.../sbf/dependencies/platform-tools/`, or building on Linux/WSL.

## RESOLUTION — toolchain is sufficient for the research WITHOUT native cross-compile
1. **Deployed-bytes analysis** (solana program dump + strings) answers deploy-correspondence and feature questions (migrate, variant, instruction set, security_txt) — see deployments/source-correspondence.md. No build needed.
2. **Prebuilt variant binaries exist and are valid ELF** (usable ONCE a litesvm runtime is available):
   - tests/programs/ext_a.so = **no-yield** (Init/ClaimFees/Wrap/Unwrap) = USDK variant, id 3joDhmLtHLrSBGfeAe1xQiv3gjikes3x8S4N3o6Ld8zB.
   - tests/programs/ext_b.so = **scaled-ui** (+SetFee/Sync) = USDKY variant, id HSMnbWEkB7sEQAGSzBPeACNUCXC9FgNeeESLnHtKfoy3.
   - tests/programs/earn.so, spl_token_2022.so present.
3. **Host cargo** works for logic/rounding analysis (used for conversion tests).

### ⚠ CORRECTION / honest limitation: litesvm CANNOT run on this Windows host
- Smoke test loading ext_b.so into litesvm FAILED: litesvm 0.2.0's native binding is missing for win32.
- Root cause: **litesvm 0.2.0 publishes NO Windows native binary** — optionalDependencies cover only darwin-x64/arm64/universal and linux-x64-gnu/musl. Windows is unsupported by this litesvm version. Not a config fix.
- Combined with the platform-tools cross-compile failure, **executable on-chain/litesvm PoCs require WSL or a Linux box.** On Windows only static analysis + deployed-bytes + host-cargo + Python simulation are available.
=> For the CURRENT no-candidate state this is fine (no PoC needed). If a candidate arises, run the PoC under WSL/Linux: `pnpm i` (pulls linux litesvm binary) + load ext_a/ext_b.so, OR build BPF there. The migrate/deploy-correspondence questions were fully answered WITHOUT any of this.

## Attempt 3 — WSL2 Ubuntu (RESOLVED for litesvm PoCs), 2026-07-17
- WSL2 Ubuntu present. Installed Node 22 + pnpm 11.13.1 per-user via nvm (NO sudo). Repo copied to Linux FS `/home/panth/kast-src`; `pnpm install` pulled the **litesvm Linux native binary** (the piece missing on Windows).
- **litesvm PoC path VERIFIED WORKING**: pocs/litesvm_smoke.test.ts PASSES in WSL — loads ext_b.so (scaled-ui), ext_a.so (no-yield), earn.so (all executable) + executes a real tx. See pocs/README.md for exact run commands.
- Full `anchor build` (for the repo's TS harness IDL types) still needs a host C toolchain (`build-essential`) = ONE sudo command the USER must run (I can't enter passwords). Not required for raw-instruction litesvm PoCs.
- Net: executable, deterministic PoCs are now possible on this machine via WSL+litesvm+prebuilt .so. The Windows-only limitation is lifted.

## Host cargo (non-BPF) WORKS — used for analysis
`cargo test -p m_ext --features scaled-ui` compiled fine (rust 1.93 + anchor 0.31 crates). Sufficient for logic/rounding verification. Python simulators used for value-conservation fuzzing.
