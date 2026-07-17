# KAST Research — Handoff

## Scope timestamp
Live Immunefi KAST verified 2026-07-17. Max $50k, PoC all severities, KYC, Immunefi-triaged. Last updated 24 Jun 2026.

## In-scope (CONFIRMED on-chain)
- USDKY `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85` = m_ext **ScaledUi**, ext_mint usdkyPP..., fee_bps=0.
- USDK `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw` = m_ext **NoYield**, ext_mint usdkbee..., 4 wrap authorities.
- Both upgradeable; upgrade_authority=admin=9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW; pending_admin=5WVYUVe... on both.
- m_mint (M v2) = mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH. earn program mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z.

## Repos/commits reviewed
- m0-foundation/solana-m-extensions @ b69d1f8 (main, 2026-07-09). programs: m_ext (in scope), ext_swap (OOS program MSwap..., but a permissionless entry into m_ext wrap/unwrap).

## Files/functions reviewed (m_ext @ b69d1f8)
lib.rs (variant gating), state/mod.rs (ExtGlobalV2, YieldConfig), utils/conversion.rs (amount<->principal round up/down, multiplier_to_index trunc[known issue], calculate_new_index powf, sync_index), utils/token.rs (mint/burn/transfer CPIs), wrap.rs, unwrap.rs, scaled_ui/sync.rs, scaled_ui/set_fee.rs, claim_fees.rs, initialize.rs, transfer_admin.rs (2-step), manage_wrap_authority.rs, migrate.rs. ext_swap/instructions/swap.rs.

## Architecture facts confirmed
- Yield variant chosen at COMPILE time. Crank/wM is a DIFFERENT program (wMXX..., OOS).
- wrap/unwrap gated to global.wrap_authorities (privileged). **sync = only permissionless in-program ix (scaled-ui only).** claim_fees/set_fee/admin all admin-gated.
- ext_swap::swap is permissionless (any signer); CPIs m_ext unwrap(from)+wrap(to) with swap_global PDA as wrap authority (swap must be whitelisted as a wrap_authority on each ext). Same `amount` both legs. -> unprivileged path into m_ext rounding.
- Solvency model: vault M UI value >= ext supply UI value (required_m). claim_fees mints "excess" ext to admin recipient (over-collateral skim). All conversions round down (protocol-favorable) except claim_fees required_m rounds UP.
- ext_mint authorities: mint_authority PDA=[b"mint_authority"] also holds scaled-ui multiplier authority; m_vault PDA=[b"m_vault"] authority of vault ATA.

## Audits digested (audits/*.txt)
All crit/high were in ext_swap(OOS) or portal(OOS), resolved. m_ext acknowledged/known: trunc off-by-one, crank retroactive fee(L01), earners lose yield(L03), ext_mint CloseMint+PermanentDelegate(L06). Risk-accepted: yield over-distribution (Halborn V2), init front-running (Halborn V1), migration donate DoS L05 (fixed). See documentation/known-issues-index.md.

## Invariants tested
None runtime yet. Registry not yet written.

## Candidates created/rejected
None yet.

## Commands + outputs
Scope: browser reads (program IDs, impacts, exclusions) -> program/*.md.
Passive RPC getAccountInfo: variants/upgrade authority confirmed (deployments/program-register.md).
`corepack pnpm install` OK. TS jest baseline BLOCKED: needs target/types/*.ts from `anchor build` (not checked in). Rust `cargo test -p m_ext --features scaled-ui` running (bg be2405q5h).

## Unresolved questions
- Is admin/upgrade_authority 9QpF8a9 a Squads multisig? (relevant to "multisig signer threshold" impact — likely governance-side, may be OOS).
- Are USDKY/USDK deployed bytes == repo b69d1f8 build? (need solana-verify hash).
- Does M v2 mint have a PENDING (future-effective) scaled-ui multiplier ever? (matters for sync/wrap valuation timing).
- ext_swap: is swap_global actually whitelisted as wrap_authority on USDK/USDKY? (determines if the permissionless swap path is live).

## SESSION 9 — Tried to get scaffold green (no-sudo); hit environment-level litesvm VM crash
- Installed FULL C toolchain WITHOUT sudo: micromamba -> gcc/g++/make in ~/ctool (+python3.11). Built native bigint_buffer.node via node-gyp. It LOADS -> ruled OUT bigint-buffer as the cause.
- Tried Node 18/20/22 (20 furthest: reached "vault thawed ok") and litesvm 0.2.0 AND 0.3.3 (anchor-litesvm 0.1.2/0.2.1). ALL crash non-deterministically with std::bad_alloc during litesvm's BPF execution of earn.so/ext_b.so.
- Conclusion: environment-level memory/JIT fault in litesvm's rbpf VM on THIS WSL2 host (crash point moves; setup phases pass reliably). NOT scaffold logic, NOT fixable from user space. Runs on native Linux/CI (repo's own tests use same stack). Documented pocs/README.md.
- Currently installed in ~/kast-src: litesvm 0.3.3 + anchor-litesvm 0.2.1; run_scaffold.ts uses .withDefaultPrograms().
- Cannot run sudo (no password) -> could not use the apt path. The scaffold + IDLs are complete; only green execution is blocked, only on this host.

## SESSION 8 — Fuller m_ext scaffold built
- Fetched EXACT on-chain Anchor IDLs (decompressed from deployed programs): pocs/USDKY_idl.json, USDK_idl.json.
- pocs/run_scaffold.ts: standalone that drives the REAL prebuilt scaled-ui program via IDL (M mint+earn.initialize+ext mint+earner-thaw+ext.initialize+wrap+sync+unwrap+solvency). No anchor build needed.
- Setup phases run reliably (M mint / earn.initialize / ext mint OK every run) => wiring correct.
- BLOCKER: deep token-2022 scaled-ui txs hit litesvm 0.2.0 native std::bad_alloc — missing native bigint-buffer binding (no C compiler). Proven environmental (bundled token-2022 = clean error, no crash; repo CI passes on native Linux). Fix = 1 sudo cmd (build-essential) + pnpm rebuild, OR native Linux. Documented pocs/README.md.

## SESSION 7 — WSL PoC path SET UP & VERIFIED
- WSL2 Ubuntu: Node22 + pnpm via nvm (no sudo). Repo at /home/panth/kast-src. litesvm linux binary installed.
- pocs/litesvm_smoke.test.ts PASSES: loads ext_b.so(scaled-ui/USDKY), ext_a.so(no-yield/USDK), earn.so + runs a tx. => executable PoCs now possible.
- Full anchor build (harness IDL types) needs 1 USER sudo cmd: `sudo apt-get install -y build-essential pkg-config libssl-dev bzip2`. Then rustup+solana2.1.0+anchor0.31.1 (no sudo). Documented in pocs/README.md.
- Run any PoC: MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- bash -lc '... cd $HOME/kast-src; npx jest ...' (see pocs/README.md).
- No PoC pending (no candidate). Environment ready for any future finding.

## SESSION 6 — closed last two open items (both SAFE)
- ext_swap permissionless path LIVE: swap_global 6U4ZZZ... IS a wrap_authority on both USDKY & USDK (on-chain). Reachable + safe (wrap/unwrap math proven neutral).
- Freeze/thaw/sync solvency: exact-arithmetic sim (300k seqs) worst shortfall ~4 atomic units (~$0.000004), non-accumulating. Intended frozen-yield-skip is solvent both directions. No finding.
- Folded into reports/final-report.md §5.7–5.9. evidence/freeze-thaw-sync-solvency-and-path-liveness.md.

## SESSION 5 — FINAL REPORT written
- reports/final-report.md (comprehensive, honest: NO submission-ready finding).
- invariants/invariant-registry.md (I1-I8, all HELD or N-A).
- Engagement conclusion: across the full unprivileged surface of USDKY(scaled-ui)+USDK(no-yield), no in-scope accepted-impact vulnerability. Migrate not deployed (OOS). Deploy correspondence HIGH.
- If resumed: move to WSL/Linux for executable litesvm PoCs (prebuilt ext_a/ext_b.so) + solana-verify byte hash. Otherwise research complete.

## SESSION 4 update (toolchain + migrate) — honest outcome
- **MIGRATE: CLOSED / OUT OF SCOPE.** `migrate_m` is NOT compiled into either deployed program (proven via `solana program dump` + embedded `Instruction:` strings + no migrate.rs path + no MigrateM). Any migrate.rs issue is unreachable on-chain. (deployments/source-correspondence.md)
- **Deploy correspondence: HIGH confidence** — deployed instruction sets, #[msg] error strings, source file paths, and security_txt (incl. the "solana-extensions" typo) all match repo m_ext @ b69d1f8. Byte-hash not done (needs WSL). (deployments/version-confidence.md)
- **Toolchain: host cargo + deployed-bytes analysis WORK.** Native BPF cross-compile BLOCKED (Windows platform-tools rust/lib extraction fails). litesvm 0.2.0 has NO Windows native binary → TS litesvm unavailable on Windows. **On-chain/litesvm PoCs require WSL/Linux** (there: `pnpm i` pulls linux litesvm + load prebuilt ext_a.so/ext_b.so, ids in build-log.md). Not needed now (no candidate).
- Prebuilt variant .so verified valid ELF: ext_a.so=no-yield(USDK), ext_b.so=scaled-ui(USDKY).

## SESSION 3 update (WS5 account/CPI sweep) — honest outcome
- Swept EVERY handler in m_ext + ext_swap for account-substitution / missing-signer / PDA-seed / CPI-signer flaws.
- m_ext: all unchecked accounts are seeds-pinned PDAs; all mints/vaults pinned via has_one; signer gates correct; sync permissionless but fully pinned + re-checks token program. **No gap.**
- ext_swap: whitelist ix all admin-gated (v1 findings FIXED); swap permissionless but M conserved + attacker can only burn own account; mint pinned via ext-program global PDA + CPI has_one. Cannot break m_ext. **No candidate.**
- Detail: attack-surfaces/account-validation-sweep.md.
- STILL OPEN: invariant-registry.md (formalize); migrate-guard re-check IF a deployed program ships `migrate` (unknown — needs solana-verify/hash to confirm build features); governance/multisig impact confirmed NOT in m_ext (Squads-side, OOS).

## SESSION 2 update (build + WS1) — honest outcome
- BPF build via anchor 0.31.1 BLOCKED on this host (agave-install unsupported arch); host cargo build works for analysis. On-chain PoC not needed this round — analysis+simulation resolved the top hypotheses. (commands/build-log.md)
- **H1 (future-effective M multiplier) DISPROVED** by source (M sets effective_ts=now). rejected-candidates/H1.
- **WS1 permissionless value-conservation: NO submission-ready finding.** wrap↔unwrap exactly neutral (sim); swap-into-no-yield erosion ≤2e-6 token/swap, non-amplifiable/non-profitable/M-conserved (acknowledged rounding class); sync can't overshoot; Pausable=dead code; ext_swap can't extract beyond m_ext neutrality; no multisig logic in m_ext. Evidence in evidence/ and workstreams/ws1-*.md.
- NEXT: WS5 systematic account-substitution/CPI sweep of every handler (+ ext_swap remaining_accounts), then invariant-registry.md, then re-examine migrate guard.

## Progress this session 1 (Phase 0-4 DONE, honest)
- Scope normalized+verified; variants CONFIRMED on-chain (USDKY=ScaledUi, USDK=NoYield).
- Deployment correspondence: upgrade authority, admin, pending_admin, mints, PDAs all read on-chain and PDA math matches (account model validated).
- Toolchain works for HOST analysis (cargo test compiled). 2 conversion unit tests fail = STALE test expectations (verified by hand; test-only/OOS; rounding is protocol-favorable/acknowledged). Not a vuln.
- Token-2022 extension recon: ext mints have TransferHook(NULL prog), Pausable(authority = program mint_authority PDA => pause is DEAD CODE, no freeze vector), MetadataPointer/TokenMetadata. No CloseMint/PermanentDelegate observed on ext mints (known-issue #4 not currently active). M mint has PermanentDelegate (M0-controlled).
- Permissionless surface fully characterized: only `sync` (USDKY) + `ext_swap::swap`. Both bounded/conservative on inspection. NO reproduced vulnerability yet (honest).

## EXACT NEXT TASK
1. Phase 2 BPF build: `avm install 0.31.1 && avm use 0.31.1`; solana 2.1.0; `make build-programs` (generates target/types/*.ts) -> unblock `corepack pnpm jest` baseline. Record commands/build-log.md.
2. Re-parse ext mint extensions with real spl-token-2022 (confirm ScaledUi present on USDKY; confirm NO CloseMint/PermanentDelegate on ext mints).
3. Write invariants/invariant-registry.md.
4. WORKSTREAM #1 PoC (litesvm on ext_test_harness.ts) — priority hypothesis **H1**: `sync` reads M `new_multiplier` + future `new_multiplier_effective_timestamp` and applies both to ext; wrap/unwrap value M via `multiplier_to_index(new_multiplier)` IMMEDIATELY. If M has a PENDING (future-effective) multiplier, internal valuation uses the future rate while the token program still applies the current lower rate to real UI balances — test whether, during that window, an unprivileged ext_swap user (or wrap authority) can extract value / break vault solvency. Disprove or build deterministic PoC.
5. Confirm ext_swap whitelist includes USDK & USDKY and swap_global is a wrap_authority in each global (path liveness for unprivileged reachability).
