# m_ext — Instruction Inventory & Authority Map
Repo: m0-foundation/solana-m-extensions @ b69d1f8 (HEAD, main, 2026-07-09). File cites are this commit.

## Variant model (compile-time, `programs/m_ext/src/lib.rs:26-47`)
Exactly one yield feature: `no-yield` (default) | `scaled-ui` | `crank`. `migrate` optional; `wm=crank+migrate`.
- **USDK (in scope)** => hypothesis **no-yield**
- **USDKY (in scope)** => hypothesis **scaled-ui**  (Y = yield, Token-2022 ScaledUiAmount rebasing)
- `crank`/`wm` = M0's own wM program `wMXX1K1nca5W4pZr1piETe78gcAVVrEFi9f4g46uXko` => **OUT OF SCOPE** (different program ID).
CONFIRM variant per program ID in Phase 3.

## State: ExtGlobalV2 (`state/mod.rs:7-19`), PDA seeds=[b"global"], one per program.
Fields: admin, pending_admin, ext_mint, m_mint, m_earn_global_account, bump, m_vault_bump, ext_mint_authority_bump, yield_config(variant-specific), wrap_authorities: Vec<Pubkey>.
YieldConfig scaled-ui: {yield_variant, fee_bps, last_m_index, last_ext_index}. no-yield: {yield_variant}.
PDAs: global=[b"global"]; m_vault=[b"m_vault"] (authority of vault_m_token_account ATA); ext_mint_authority=[b"mint_authority"] (mint AND scaled-ui multiplier authority of ext_mint).

## Instruction inventory (handler | gate | features | notes)
| ix | auth gate | features | permissionless? |
|---|---|---|---|
| initialize | signer becomes admin; global PDA init (one-time) | all | one-time bootstrap |
| set_fee | has_one admin | scaled-ui | admin |
| add_wrap_authority / remove_wrap_authority | has_one admin | all | admin |
| claim_fees | has_one admin | scaled-ui, no-yield | admin (mints excess ext to recipient) |
| transfer_admin / accept_admin / revoke_admin_transfer | has_one admin / pending_admin signer | all | two-step, standard |
| set_earn_authority, add/remove_earn_manager | admin/earn | crank only | OOS (wM) |
| migrate_m | has_one admin (via old_global) | migrate only | admin; resizes+rewrites global |
| **wrap** | caller ∈ wrap_authorities | all | **gated to wrap_authorities** |
| **unwrap** | caller ∈ wrap_authorities | all | **gated to wrap_authorities** |
| **sync** | NONE | scaled-ui, crank | **PERMISSIONLESS** |
| claim_for, add_earner, configure_earn_manager, remove_earner, transfer_earner, set_recipient, remove_orphaned_earner | earn roles | crank only | OOS (wM) |

## Value flow
- **wrap** (`wrap.rs`): caller∈wrap_authorities. sync_index; m_principal=amount_to_principal_down(amount,m_index); ext_principal=amount_to_principal_down(amount,ext_index); transfer m_principal user->vault; mint ext_principal to to_ext_token_account. Both round DOWN (protocol-favorable).
- **unwrap** (`unwrap.rs`): caller∈wrap_authorities. sync_index; ext_principal & m_principal both amount_to_principal_down(amount,·); burn ext_principal from user; transfer m_principal vault->user. Rounds down.
- **claim_fees** (`claim_fees.rs`): admin. required_m=principal_to_amount_UP(ext_supply,ext_index); vault_m=principal_to_amount_DOWN(vault.amount,m_index); excess=vault_m-required_m (checked_sub -> InsufficientCollateral); mints excess_principal ext to recipient. Solvency-preserving.
- **sync** (`sync.rs` + `conversion::sync_index`): permissionless. Reads M scaled-ui new_multiplier, computes new_ext_index=last_ext_index*(new_m/last_m)^(1-fee) [floor], calls Token-2022 update_multiplier on ext_mint via ext_mint_authority PDA. Monotonic increasing. Early-returns if ext_index unchanged, or if vault frozen (only updates last_m_index).

## CPIs
- Token-2022 (ext_mint): mint_to, burn, transfer_checked, update_multiplier (scaled_ui) — signer = ext_mint_authority PDA / m_vault PDA.
- earn program (mz2vDzjbQDUDXBH6FPF5s4odCJ4y8YLE5QWaZ8XdZ9Z) crate `earn` rev 972e896: get_scaled_ui_config(m_mint), EarnGlobal account (m_earn_global_account) validated by seeds::program=EARN_PROGRAM.

## Key checks
- global has_one m_mint & ext_mint everywhere -> can't substitute mints.
- vault_m_token_account = ATA(m_mint, m_vault) -> can't substitute vault.
- ext_mint_authority/m_vault validated by seeds+bump from global.
- sync_index re-checks token_program==spl_token_2022::ID before CPI.

## Unprivileged attack surface (in-scope programs)
- no-yield: essentially none in-program (all gated). Surface = Token-2022 ext_mint config + reachability via ext_swap.
- scaled-ui: **`sync`** only. Plus ext_swap-mediated wrap/unwrap (ext_swap OOS but m_ext impact in scope) and Token-2022 ext_mint config.
