# Deployment Version Confidence (2026-07-17)

## USDKY / USDK vs repo m_ext @ b69d1f8 — confidence: HIGH (short of byte-hash)
Evidence tying deployed bytes to this repo's source:
1. On-chain `yield_variant` byte: USDKY=1(ScaledUi), USDK=0(NoYield). ✓
2. Deployed instruction set (from embedded `Instruction:` strings) exactly matches the variant's #[program] handlers:
   - USDKY: Initialize, SetFee, AddWrapAuthority, ClaimFees, TransferAdmin, AcceptAdmin, RevokeAdminTransfer, RemoveWrapAuthority, Wrap, Unwrap, Sync.
   - USDK: same minus SetFee & Sync.
   - Neither has MigrateM or any earn/crank instruction.
3. Embedded `#[msg]` error strings == errors.rs (ExtError) verbatim.
4. Embedded source file paths == repo m_ext file tree (no migrate.rs).
5. security_txt in deployed bytes == repo lib.rs security_txt VERBATIM, including the "solana-extensions" typo in source_code URL and auditor list (Asymmetric Research, Adevar Labs, OtterSec, Halborn).

## NOT done: byte-identical solana-verify hash
- Requires reproducing the exact build env (platform-tools ver, Cargo.lock, features) and is blocked by the Windows BPF toolchain failure. A verifiable-build check would need WSL/Linux + the exact toolchain used by M0's CI.
- NOT required to establish reachable-surface scope or to close the migrate question.

## Upgradeability
- Both programs UPGRADEABLE (BPFLoaderUpgradeable), upgrade_authority = 9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW (== admin). Governance can change bytes; current bytes analyzed above.
