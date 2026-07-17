# Invariant Registry — KAST m_ext (USDKY scaled-ui / USDK no-yield)
Repo m0-foundation/solana-m-extensions @ b69d1f8. Status legend: HELD (verified sound) / HELD-BOUNDED (holds within acknowledged rounding) / N-A.

## I1 — Authority integrity
Statement: privileged state changes require the intended authority signer; unprivileged callers cannot reach them.
- Protected: admin config, wrap/unwrap, mint/burn, multiplier updates.
- Enforcement: `has_one=admin` (set_fee, claim_fees, transfer_admin, manage_wrap_authority, migrate); `wrap_authorities.contains` (wrap/unwrap validate); pending_admin signer+constraint (accept_admin); PDA seeds+bump for all program authorities.
- Adversarial: pass substituted account / call without signer.
- Status: **HELD** (attack-surfaces/account-validation-sweep.md). sync is the only permissionless ix and mutates only the multiplier upward via pinned accounts.

## I2 — Account/mint/vault non-substitution
Statement: a caller cannot substitute an attacker-controlled account where a trusted PDA/mint/vault is expected.
- Enforcement: global has_one m_mint & ext_mint; m_vault/ext_mint_authority = seeds PDAs w/ global bumps; vault = ATA(m_mint,m_vault); sync re-checks token_program==spl_token_2022.
- Status: **HELD**.

## I3 — Value conservation across wrap/unwrap
Statement: wrap(amount) then unwrap(amount) at constant index returns vault & supply to start; no dust extraction.
- Enforcement: both use amount_to_principal_down(amount, index) with identical index.
- Test: 200k fuzz, 0 non-neutral (evidence/wrap-unwrap-swap-solvency-sim.md).
- Status: **HELD**.

## I4 — Solvency: vault M UI value >= ext supply UI value
Statement: vault always collateralizes outstanding ext.
- Enforcement: conversions round DOWN (mint less / require more); claim_fees checks excess=vault_m(down)-required_m(up) with checked_sub→InsufficientCollateral; M index growth (m_index>=ext_index) makes vault UI grow >= required UI.
- Adversarial: repeated swap-into-no-yield erodes per-vault collateral.
- Test: per-swap erosion <= 2e-6 token, non-amplifiable, non-profitable, globally M-conserved.
- Status: **HELD-BOUNDED** (within acknowledged rounding; not attacker-extractable/insolvency-inducing).

## I5 — Ext index monotonic & <= mathematically-true (cannot overshoot backing)
Statement: sync only increases ext_index and never above the true value ⇒ cannot mint present value beyond backing.
- Enforcement: calculate_new_index domain guard (last_ext>=1, last_m>=last_ext, new_m>=last_m, new_m<=100e12, fee<=1e4); floors intermediate + final; early-return if unchanged.
- Status: **HELD** (rounds down ⇒ conservative; acknowledged trunc off-by-one is the only deviation, protocol-favorable).

## I6 — Multiplier update timing consistency
Statement: internal M valuation matches the Token-2022 effective multiplier.
- Enforcement: M earn program sets multiplier effective_ts = now (never future); m_ext reads new_multiplier (already effective) and copies M's effective_ts to ext.
- Status: **HELD** (H1 disproved — rejected-candidates/H1).

## I7 — No unprivileged freeze
Statement: no unprivileged caller can permanently/temporarily freeze user funds or unclaimed yield.
- Facts: ext-mint Pausable authority = program mint_authority PDA but NO pause instruction exists ⇒ dead code. TransferHook program = null. Freeze authority = external (earn/governance), not reachable by unprivileged m_ext path.
- Status: **HELD** (architecture/token2022-extensions.md).

## I8 — Multisig threshold correctness (accepted impact)
Statement: N/A to m_ext — no multisig-threshold computation exists in the in-scope programs (governance/admin is an external Squads key). 
- Status: **N-A / OOS**.
