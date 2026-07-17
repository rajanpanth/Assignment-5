# Source Correspondence — deployed instruction sets (2026-07-17)

Method: `solana program dump <id> file.so --url mainnet-beta` (passive), then `strings` for the
Anchor-embedded `Instruction: <Name>` logs (repo does NOT set `no-log-ix-name`) + `#[msg]` error strings + embedded source file paths. Confirms which handlers/features are in the DEPLOYED bytes.

## USDKY extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85 (deployed 593136 B)
Instructions in binary: Initialize, **SetFee**, AddWrapAuthority, ClaimFees, TransferAdmin, AcceptAdmin, RevokeAdminTransfer, RemoveWrapAuthority, Wrap, Unwrap, **Sync**.
- Has SetFee + Sync ⇒ **scaled-ui** (matches on-chain yield_variant=1). ✓
- **NO MigrateM** ⇒ `migrate` feature NOT compiled in.
- NO earn/crank instructions (claim_for/add_earner/etc.) ⇒ not crank.
- Embedded file paths: set_fee.rs, claim_fees.rs, initialize.rs, manage_wrap_authority.rs, transfer_admin.rs, unwrap.rs, wrap.rs, sync.rs, state/mod.rs, conversion.rs. NO migrate.rs.

## USDK extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw (deployed 525536 B)
Instructions in binary: Initialize, AddWrapAuthority, ClaimFees, TransferAdmin, AcceptAdmin, RevokeAdminTransfer, RemoveWrapAuthority, Wrap, Unwrap.
- NO SetFee, NO Sync ⇒ **no-yield** (matches on-chain yield_variant=0). ✓
- **NO MigrateM** ⇒ `migrate` NOT compiled in.
- NO earn/crank instructions.

## CONCLUSIONS
1. **migrate path is OUT OF SCOPE / not applicable** — `migrate_m` is not present in either deployed program. Any issue in `migrate.rs` (incl. Adevar L05 donate-DoS variants) is UNREACHABLE on the in-scope assets. Closed.
2. Deployment correspondence CONFIRMED at instruction-set + variant level: deployed handler sets exactly match repo m_ext scaled-ui (USDKY) and no-yield (USDK) at HEAD b69d1f8. Confidence: HIGH (variant + full ix set + source paths + error strings all match). Full byte-hash (solana-verify) still not done (build env reproduction), but not required to establish reachable-surface scope.
3. The security-relevant surface previously mapped is exactly the deployed surface — no extra hidden instructions.
