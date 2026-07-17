# WS5 — Account-validation / CPI-safety sweep (2026-07-17)

Scope: every handler in m_ext (in scope) + ext_swap (OOS program, checked for m_ext-impacting confusion).

## Method
Enumerated every `UncheckedAccount`/`AccountInfo`, `Signer`, `has_one`, `seeds`, and CPI. For each account asked: can an unprivileged caller substitute an attacker-controlled account where a trusted PDA/mint/vault/authority is expected, or bypass a signer/owner check?

## m_ext — every unchecked/AccountInfo is a seeds-pinned PDA
| Account | Handler(s) | Pinning |
|---|---|---|
| global_account | all | seeds=[global] + bump; has_one m_mint, ext_mint |
| m_vault (AccountInfo/Unchecked) | wrap,unwrap,sync,set_fee,claim_fees,migrate | seeds=[m_vault], bump=global.m_vault_bump |
| ext_mint_authority (AccountInfo) | wrap,unwrap,sync,set_fee,claim_fees,init | seeds=[mint_authority], bump=global.ext_mint_authority_bump |
| vault_m_token_account | all | ATA(m_mint, m_vault[, token_program]) |
| m_mint / ext_mint | all | has_one from global (+ mint::token_program) |
| from_m/ext_token_account, to_* | wrap/unwrap | token::mint pinned; authority checked by token program on transfer/burn (signer=token_authority) |
| recipient_ext_token_account | claim_fees | token::mint=ext_mint; recipient arbitrary but ADMIN-gated |

- Signer gates: initialize/set_fee/claim_fees/transfer_admin/manage_wrap_authority/migrate = admin (has_one admin or old_global.admin). accept_admin = pending_admin + constraint. wrap/unwrap = caller ∈ wrap_authorities. sync = none (safe: all accounts pinned, CPI re-checks token_program==spl_token_2022).
- CPI signer seeds: mint_to/update_multiplier signed by [mint_authority,bump]; vault transfer signed by [m_vault,bump]. Bumps sourced from global (canonical). No seed injection.
- **No account-substitution or missing-signer gap found in m_ext.**

## ext_swap (OOS program; checked for m_ext-breaking confusion)
- whitelist_extension / remove / whitelist_unwrapper / remove: ALL have `has_one = admin` (OtterSec OS-MSE-ADV-00 / Halborn v1 HIGH now FIXED). ✓
- swap (fully permissionless): from_global/to_global = seeds=[global], seeds::program=from/to_ext_program (whitelisted). from/to vaults & authorities = PDAs of the ext program. from_mint pinned by m_ext CPI has_one=ext_mint. Same `amount` both legs; M passes through swap_m_account and nets zero (same m_index). Attacker can only burn their OWN from_token_account (token_authority=signer). No drain path.
- unwrap/wrap (standalone): gated to whitelisted_unwrappers (unwrap) / swap_global-as-wrap-authority. Same pinning.
- `is_extension_whitelisted` matches program_id only; stored mint/token_program vestigial — but ext_mint still pinned via ext program's global PDA + CPI has_one. No mint confusion. (Code-quality note, not a vuln.)
- remaining_accounts in swap forwarded to m_ext CPIs but m_ext handlers don't read them; ext mints have NULL transfer hook so no hook accounts needed. No effect.

## CONCLUSION
No missing-signer, account-substitution, PDA-seed, or CPI-signer vulnerability found in m_ext (in scope). ext_swap authorization is correctly admin-gated and cannot be used to break m_ext invariants by an unprivileged caller. **No candidate.**
