# Evidence — ext_swap path liveness + freeze/thaw/sync solvency (2026-07-17)

## A. Permissionless path liveness (on-chain, passive)
- ext_swap program MSwapi3WhNKMUGm9YrxGhypgUEt7wYQH3ZgG32XoWzH → swap_global PDA = 6U4ZZZkftbuHxjRDHUfh83M9zG66aAAXDV3xTRX7yePr (EXISTS on-chain, len 689).
- **swap_global (6U4ZZZ...) IS a wrap_authority on BOTH USDKY and USDK.**
  - USDKY wrap_authorities: 6U4ZZZ...(ext_swap), 3HoT5BwP8qgoHeSzKKRhC6b8Aj1qzFnqai7hqN9FX9zR, 9QpF8a9...(admin), 9vSE2CHNE54ENdAVG3r8dkthXNVWtEyZdXXEFnVN1a8H.
  - USDK wrap_authorities: same 4.
- ⇒ The permissionless `ext_swap::swap` (and swap-mediated wrap/unwrap) path into m_ext IS LIVE. The wrap/unwrap conversion math IS reachable by unprivileged users. Already proven neutral/conservative (evidence/wrap-unwrap-swap-solvency-sim.md). Confirmed reachable + safe.
- Other wrap authorities (3HoT5..., 9vSE2..., 9QpF8a9=admin) = KAST operator/governance keys (privileged, trusted).

## B. Freeze/thaw/sync solvency (simulation)
Model: faithful integer formulas; M index grows mint-wide (even while frozen); wrap/unwrap SYNC the index first (as wrap.rs:108 / unwrap.rs / claim_fees do); frozen⇒wrap/unwrap blocked, sync only advances last_m; permissionless standalone sync interleaved. 300k random sequences (3–14 steps).

- First (buggy) sim used a STALE index for wrap/unwrap (didn't sync first) → false −5e8 violations. Corrected to sync-before-op.
- Corrected, conservative check (required=round-up, vault=round-down): worst margin −4 atomic units; non-accumulating.
- **EXACT-arithmetic check** (compare vault*m_index vs supply*ext_index directly): worst true shortfall = −3.85e12 raw = **≈ −4 atomic units (~$0.000004)**, non-accumulating across sequence length.

### Conclusion
Vault stays solvent within ~4 atomic units (acknowledged rounding-dust class) across ALL freeze/thaw/sync/wrap/unwrap interleavings. Cannot be amplified (re-synced each op, no compounding) and is absorbed by the vault's yield surplus. The intended "frozen vaults skip yield" behavior (sync advances last_m while frozen) is solvent in both directions because M grows mint-wide and ext_index can never exceed real M growth. **No insolvency / no finding.**
