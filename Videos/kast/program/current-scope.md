# KAST — Current Scope (Phase 0 normalization)

**Scope checked (browser view):** 2026-07-17 (session date). Immunefi page live.
**Program name:** KAST (M0 `solana-m-extensions` framework — `m_ext` extensions)
**Platform:** Immunefi, Triaged by Immunefi. Max bounty **$50,000**. PoC required (all severities). KYC required.
**Live Since:** 20 April 2026. **Last Updated:** 24 June 2026.
**Bounty pages:**
- https://immunefi.com/bug-bounty/KAST/information/
- https://immunefi.com/bug-bounty/KAST/scope/
- https://immunefi.com/bug-bounty/KAST/resources/

**Codebase (resource link):** https://github.com/m0-foundation/solana-m-extensions  (repo root — NO commit/tag/branch pinned on the resource link; must establish source-correspondence to deployed program data in Phase 3)
**Documentation:** https://docs.m0.org/home/technical-documentations/solana/#3-m-extension-framework-programsm_ext
**Project site:** https://www.kast.xyz/

## In-scope assets (Smart Contract) — EXACT program IDs
| Program ID (mainnet) | Name | Added |
|---|---|---|
| `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85` | USDKY Extension Program | 9 March 2026 |
| `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw` | USDK Extension Program | 9 March 2026 |

Solscan targets:
- https://solscan.io/account/extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85 (USDKY)
- https://solscan.io/account/extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw (USDK)

**Total Assets in Scope:** 2. **Total Impacts in Scope:** 15.

## Scope discipline notes
- Only these TWO program IDs are in scope. Do NOT infer scope from the m0-foundation org or from other crates/programs in the repo (base `M` token program, swap facility, other extension variants) unless they are the code that these two deployed program IDs actually run.
- Both are "Extension Programs" built on `m_ext`. They are almost certainly two *instances/deployments* of the same `m_ext` extension program code (or close variants) parameterized for USDK vs USDKY. Confirm in Phase 2/3 whether both program IDs map to the same source or different variants.
- Live Immunefi scope is authoritative over this prompt if they differ. None observed so far.
