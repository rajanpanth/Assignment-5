# KAST / solana-m-extensions — Security Research Final Report

**Researcher role:** Solana/Anchor/Token-2022 security review (authorized, Immunefi KAST bug bounty).
**Date:** 2026-07-17. **Scope verified live:** 2026-07-17.
**Result:** **No submission-ready vulnerability found.** This report documents scope, method, what was verified, and why each candidate hypothesis was rejected. No finding is claimed; nothing here should be submitted as a bug.

---

## 1. Scope (authoritative: live Immunefi KAST page)

In-scope assets (exactly two Solana programs, confirmed on mainnet):

| Asset | Program ID | Variant (confirmed on-chain) | ext mint |
|---|---|---|---|
| USDKY Extension Program | `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85` | `m_ext` **ScaledUi** | `usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf` |
| USDK Extension Program | `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw` | `m_ext` **NoYield** | `usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX` |

- Codebase: github.com/m0-foundation/solana-m-extensions @ `b69d1f8` (main). Max bounty $50k, PoC required, KYC, Immunefi-triaged.
- Both programs share admin = upgrade authority `9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW`; both upgradeable; both back the M v2 token `mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH`.
- **Out of scope / excluded** (see program/exclusions.md): the `ext_swap` program (`MSwap…`), the base M `earn`/`portal` programs, the `wM`/crank program (`wMXX…`), privileged-address attacks (except where the contract is intended to have no privileged access), external depeg, Sybil/51%/centralization, and the four acknowledged known issues (trunc/floor off-by-one; crank retroactive fee; earners lose pending yield on removal; ext_mint may have CloseMint+PermanentDelegate).

## 2. Architecture (as deployed)

`m_ext` selects a yield-distribution variant at **compile time**. USDKY = ScaledUi (Token-2022 ScaledUiAmount "rebasing"); USDK = NoYield (all yield to admin). The `crank`/`wM` variant is a **different, out-of-scope program**, which removes a large part of the repo (earn managers, earners, `claim_for`) and 3 of the 4 acknowledged known issues from the in-scope surface.

Deployed instruction sets (verified from the on-chain bytes):
- USDKY: Initialize, SetFee, AddWrapAuthority, ClaimFees, TransferAdmin, AcceptAdmin, RevokeAdminTransfer, RemoveWrapAuthority, Wrap, Unwrap, Sync.
- USDK: the same minus SetFee and Sync.
- **Neither includes `MigrateM`** — the migrate path is not deployed (see §5.6).

Authorization model:
- **Admin-gated:** Initialize (bootstrap), SetFee, ClaimFees, AddWrapAuthority/RemoveWrapAuthority, TransferAdmin/AcceptAdmin/RevokeAdminTransfer.
- **Wrap-authority-gated:** Wrap, Unwrap (caller ∈ `global.wrap_authorities`).
- **Permissionless:** Sync (USDKY only). The user-facing mint/redeem runs through the out-of-scope `ext_swap` (whose `swap` is permissionless), which CPIs `m_ext` wrap/unwrap using the swap PDA as the wrap authority.

Value model: extension present value = principal × index; all conversions round **down** (mint less / require more collateral); solvency = vault M UI value ≥ ext supply UI value, maintained by M-index growth and skimmed as "excess" by the admin via ClaimFees.

## 3. Methodology

1. Phase 0 — normalized live scope, program IDs, accepted impacts, exclusions, known issues.
2. Phase 1 — extracted and read all 5 audit reports (Adevar v1/v2, Halborn v1/v2, OtterSec); built a known-issues dedup index.
3. Phase 2 — cloned repo; host `cargo` build/test works; **native BPF build blocked on this Windows host** (platform-tools extraction) and **litesvm has no Windows binary** (§6).
4. Phase 3 — deployment correspondence via passive RPC reads + `solana program dump` + string/discriminator analysis. HIGH-confidence match to repo (variant bytes, instruction sets, error strings, source paths, security_txt incl. a distinctive typo).
5. Phase 4 — mapped every instruction, account context, PDA, CPI, and Token-2022 extension.
6. Phase 5 — invariant registry (invariants/invariant-registry.md).
7. Phase 6 — audited the ranked workstreams below; each hypothesis was pushed to source proof or deterministic simulation.

## 4. What was verified sound (invariants held)

| # | Invariant | Status | Basis |
|---|---|---|---|
| I1 | Authority integrity (no unprivileged privileged path) | HELD | full account/CPI sweep |
| I2 | No account/mint/vault substitution | HELD | has_one + seeds pinning everywhere |
| I3 | wrap↔unwrap value conservation | HELD | 200k-case fuzz, 0 non-neutral |
| I4 | Solvency (vault ≥ ext supply, UI) | HELD-BOUNDED | erosion ≤2e-6 token/swap, non-amplifiable |
| I5 | Ext index monotonic, cannot overshoot backing | HELD | domain guard + floor rounding |
| I6 | Multiplier timing consistency | HELD | M sets effective_ts=now (H1 disproved) |
| I7 | No unprivileged freeze | HELD | Pausable=dead code; hook=null |
| I8 | Multisig threshold | N/A | no such logic in m_ext (Squads-side, OOS) |

## 5. Hypotheses investigated and rejected

### 5.1 Index-math rounding beyond the acknowledged off-by-one
`calculate_new_index` floors an intermediate `m_increase_factor` and the final value, under-shooting the true index by up to a couple of units. Direction is **protocol-favorable / holder-conservative** and cannot overshoot backing (→ no insolvency). Same rounding class as the acknowledged trunc issue. The repo's own two `calculate_new_index` unit tests fail at HEAD, but that is **stale test expectations** (verified by hand — the code truncates as its comments say), a test-file issue (OOS), not a program bug. **Rejected** (commands/baseline-test-log.md).

### 5.2 Permissionless `sync` manipulation
`sync` only raises the multiplier, floors down, early-returns unless M's on-chain index actually changed, and is fully account-pinned. An attacker cannot force extra index steps (M index is driven by the bridge/earn program). Per-event drift is negligible and holder-unfavorable (stays in vault as admin-claimable excess). **Rejected** (workstreams/ws1-*.md).

### 5.3 wrap/unwrap / ext_swap value extraction (unprivileged path)
wrap↔unwrap at constant index is **exactly neutral** (both legs share `amount_to_principal_down`). The permissionless `ext_swap::swap` conserves M through its passthrough account (same `amount`, same m_index both legs) and a caller can only burn their **own** token account. Swapping into the no-yield vault erodes its collateralization by **≤ 2×10⁻⁶ token per swap**, non-amplifiable, non-profitable, and globally M-conserved (the "missing" M stays in the source vault). Acknowledged rounding class. **Rejected** (evidence/wrap-unwrap-swap-solvency-sim.md).

### 5.4 H1 — future-effective M multiplier valuation gap
m_ext values M via `multiplier_to_index(m.new_multiplier)` immediately. Hypothesis: if M's `new_multiplier` were future-effective, internal valuation would diverge from real UI balances. **Disproved:** the M `earn` program sets its multiplier with `timestamp = Clock::now` — never future-dated — so no window exists. A future-dated M multiplier would require the privileged M portal authority (OOS). **Rejected** (rejected-candidates/H1-sync-future-multiplier.md).

### 5.5 Token-2022 extension freeze/seize vectors
The ext mints carry a **Pausable** extension whose authority is the program's own `mint_authority` PDA — but `m_ext` exposes no pause/resume instruction and never CPIs pause, so pause is **dead code** (no reachable freeze). TransferHook is present but its program is null (`1111…`) and its authority is governance, not the program. No `MintCloseAuthority`/`PermanentDelegate` observed on the ext mints (acknowledged known-issue #4 not currently active). **Rejected** (architecture/token2022-extensions.md).

### 5.6 Migrate path
`migrate_m` is **not compiled into either deployed program** (confirmed from the deployed bytes). The migrate code (and the fixed Adevar-L05 donate-DoS) is unreachable on the in-scope assets. **Out of scope / not applicable** (deployments/source-correspondence.md).

### 5.7 Freeze/thaw/sync yield accounting (solvency)
When the vault is frozen (extension not an approved M earner), `sync` advances `last_m_index` but not `last_ext_index`, so frozen-period yield is skipped for holders (intended). I stress-tested 300,000 random interleavings of sync/wrap/unwrap/freeze/thaw (with wrap/unwrap syncing first, as the code does). Exact-arithmetic solvency never breaks by more than **~4 atomic units (~$0.000004)**, and it does not accumulate over sequence length — because the index is re-synced on every operation and `ext_index` can never exceed real (mint-wide) M growth. Acknowledged rounding-dust class. **Rejected** (evidence/freeze-thaw-sync-solvency-and-path-liveness.md).

### 5.8 Permissionless path liveness (confirmation, not a bug)
Confirmed on-chain that `ext_swap`'s `swap_global` PDA (`6U4ZZZ…`) **is a registered wrap authority on both USDKY and USDK**, so the permissionless swap/wrap/unwrap path into the in-scope conversion math is genuinely live and reachable by unprivileged users — and, per §5.3, that math holds. This confirms reachability without introducing a finding.

### 5.9 Account substitution / missing signer / CPI safety (full sweep)
Every `UncheckedAccount`/`AccountInfo` in `m_ext` is a seeds-pinned PDA; every mint/vault is pinned by `has_one`/ATA derivation; CPI signer seeds use canonical bumps from the global account; signer gates are correct. `ext_swap`'s whitelist instructions all carry `has_one=admin` (the OtterSec critical / Halborn-v1 high are confirmed fixed), and its permissionless paths cannot break m_ext invariants. **No candidate** (attack-surfaces/account-validation-sweep.md).

## 6. Environment limitations (disclosed)

On this Windows host: host `cargo` analysis, passive RPC reads, `solana program dump` + string analysis, and Python simulation all work and were sufficient to resolve every hypothesis above. **Not** available on this host: native BPF cross-compile (platform-tools `rust/lib` won't extract) and litesvm (0.2.0 publishes no Windows binary). Executable on-chain/litesvm PoCs would require WSL/Linux, where the checked-in prebuilt variant binaries (`ext_a.so`=no-yield, `ext_b.so`=scaled-ui) can be loaded directly. No PoC was blocked because no candidate arose.

## 7. Conclusion

Within the realistic **unprivileged** attack surface of the two in-scope programs — permissionless `sync`, the `ext_swap`-mediated wrap/unwrap path, the index/value-conservation math, Token-2022 extension configuration, and a complete account/CPI-validation sweep — **no previously-unknown, in-scope, accepted-impact vulnerability was found.** The code is conservatively rounded, tightly account-validated, and consistent with its five prior audits; the accepted-impact classes (theft, insolvency, freezing, governance/multisig manipulation) either do not have an unprivileged path in `m_ext` or fall within acknowledged/known-issue tolerance. The multisig-threshold impact does not apply because `m_ext` contains no threshold logic (that lives in the external Squads governance, out of scope).

### Residual (for a future WSL/Linux session, diminishing returns)
- Executable litesvm PoCs to empirically re-confirm §5.3/§5.4 (analysis already strong).
- `solana-verify` byte-hash to upgrade deployment correspondence from HIGH to exact.
- Re-parse ext-mint Token-2022 extensions with the real spl parser to lock the exact extension set (already provisional-confirmed no CloseMint/PermanentDelegate).

### Artifacts
program/ (scope), documentation/known-issues-index.md, deployments/ (program-register, source-correspondence, version-confidence), architecture/ (instructions, token2022-extensions), invariants/invariant-registry.md, workstreams/ws1, attack-surfaces/account-validation-sweep.md, evidence/, rejected-candidates/, commands/ (environment, build-log, baseline-test-log), session-log/current-handoff.md.
