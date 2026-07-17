# Workstream #1 notes — permissionless surface (scaled-ui sync + ext_swap path)

## Reachable-by-unprivileged inventory (in-scope programs only)
1. **USDKY `sync`** (no signer). Updates ext scaled-ui multiplier to track M index. Bounded: monotonic up, floors down (ext_index ≤ true), early-returns unless M index actually changed. Attacker cannot force extra index steps. Per-call loss negligible & holder-unfavorable → admin-claimable excess (stays in vault). Cannot overshoot ⇒ no insolvency. **Parked (weak, acknowledged rounding class).**
2. **ext_swap::swap** (permissionless, OOS program) → CPIs m_ext unwrap(from)+wrap(to), same `amount`, swap PDA as wrap authority. M nets zero through swap_m_account (same amount, same m_index). Per-vault solvency preserved: all legs round DOWN (protocol-favorable); round-trips lose the USER dust, not the protocol. No net extraction found by inspection. **Needs litesvm PoC to try to break, but analysis suggests conservative.**

## Open hypotheses to test with litesvm (need BPF build)
- **H1 (sync timestamp w/ future-effective M multiplier):** sync reads M `new_multiplier` + `new_multiplier_effective_timestamp` and applies BOTH to ext. wrap/unwrap compute m_index from M `new_multiplier` immediately (multiplier_to_index of the *new*, possibly future, multiplier). If M has a pending future multiplier, wrap/unwrap value M at the future rate while the token program still applies the current (lower) rate for actual UI balances → possible transient mismatch between internal valuation and real token UI amounts. Check if this lets a wrap authority / ext_swap user get more/less than backing during the pending window. (Wrap/unwrap are wrap-auth gated → only in-scope if reachable & profitable via ext_swap unprivileged.) **Priority test.**
- **H2 (claim_fees excess vs sync rounding):** admin-gated (likely OOS) — deprioritize.
- **H3 (ext_mint Token-2022 config beyond L06):** README requires no transfer hook / transfer fee on ext mint. If a DISTINCT enabled extension (e.g. TransferHook actually present on usdky/usdk mint) could block or redirect transfers = temporary freeze. Verify actual enabled extensions on usdkyPP.../usdkbee... mints on-chain (passive read). **Cheap next step — do this before heavy build.**

## CONCLUSION (2026-07-17) — WS1 permissionless value-conservation: NO submission-ready finding
- H1 (future-effective M multiplier): **disproved** — M sets multiplier effective_ts=now (rejected-candidates/H1).
- wrap↔unwrap at constant index: **exactly neutral** (sim 0/200k). No round-trip dust extraction.
- swap-into-no-yield collateral erosion: **≤2e-6 token/swap, non-amplifiable, non-profitable, globally M-conserved** → acknowledged rounding class, ineligible (evidence/wrap-unwrap-swap-solvency-sim.md).
- sync (permissionless): monotonic-up, floors down (can't overshoot ⇒ no insolvency), bounded by real M index updates (attacker can't force steps).
- Pausable freeze vector: **dead code** (authority=program PDA, no pause ix). TransferHook null. No CloseMint/PermanentDelegate on ext mints.
- ext_swap wrap/unwrap/swap are permissionless BUT burn authority = user's own signer, and all released M is computed by m_ext's conservative math ⇒ OOS swap layer cannot extract beyond m_ext neutrality.
- m_ext has NO multisig-threshold logic (that impact lives in Squads governance = OOS).

## Residual UNEXPLORED surface (lower probability, for a future session)
1. Systematic account-substitution / CPI sweep of EVERY handler (I covered the main ones; has_one/seeds are tight, but a full sweep incl. remaining_accounts handling in ext_swap could still surprise).
2. `remove_wrap_authority` manual lamport refund arithmetic (manage_wrap_authority.rs:104-116) — admin-gated (OOS unless a no-priv path).
3. `migrate` path (only if a in-scope program is built with `migrate`; admin-gated). Adevar L05 (donate-DoS) was fixed — re-check current guard for a distinct variant.
4. init front-running (Halborn risk-accepted) — likely ineligible.

## Next concrete steps
A. Passive read: enumerate Token-2022 extensions actually enabled on ext_mints usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf and usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX, and their freeze/permanent-delegate/close authorities. (H3, and confirms L06 scope.)
B. Passive read: does ext_swap whitelist include USDK & USDKY, and is swap_global a wrap_authority in each global? (Confirms path #2 is live.)
C. Build BPF (avm 0.31.1 + solana 2.1.0) → litesvm PoC harness for H1.
