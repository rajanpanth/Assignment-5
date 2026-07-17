# Token-2022 extensions on in-scope mints (passive mainnet read 2026-07-17)
NOTE: parsed with a hand-rolled TLV walker; lengths after the first entries may be misaligned. Treat exact list as PROVISIONAL until re-parsed with spl-token-2022 lib post-build. Confident items marked ✓.

## USDKY ext_mint usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf (Token-2022) supply 2,777,664.457571
- mint_authority = EvEenAb6tQdgUCMgv9fpgxMzLw4Cj2PcQLbJbTEreQCm (= ext_mint_authority PDA of USDKY, verify)
- freeze_authority = 7Ahg145ZRP5LASPjAphRcHoR1UgvLjbZR5MP1j3dPpFr (shared w/ USDK)
- ✓ TransferHook: hook_program = 1111..1 (System = NULL, hook disabled), hook_auth = 9QpF8a9 (governance)
- ✓ Pausable: authority = EvEenAb6 (= USDKY mint_authority PDA)
- MetadataPointer, TokenMetadata
- ScaledUiAmountConfig MUST be present (program invariant in initialize.rs:140) — parser drifted, re-confirm.
- NOT clearly observed: MintCloseAuthority(3), PermanentDelegate(12) on ext mint (known-issue #4 = risk they COULD be; appear NOT currently active — confirm).

## USDK ext_mint usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX (Token-2022) supply 24,039,622.844939
- mint_authority = C9eLDmptrnMxFb5QB3J4QuRFYjZFba7393ncm9cM7ot7 (= USDK ext_mint_authority PDA, verify)
- freeze_authority = 7Ahg145... (shared)
- ✓ TransferHook null program; ✓ Pausable authority = C9eLDmpt (USDK mint_authority PDA)
- MetadataPointer, TokenMetadata. No ScaledUi (no-yield variant — correct).

## M mint mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH supply 28,921,096.678073
- mint_authority = 5qRSth9bauYSDcSF6rduiLciDAfCNWWd8EiHhgX1w5Tb  freeze_authority = CQNpruTHcw9QLfCG3gPaLQsFSqNz5XdtJzRDNWoSv3bZ
- ✓ TransferHook null; ✓ Pausable auth = CQNpru...; DefaultAccountState; ✓ **PermanentDelegate = CQNpru...**; MetadataPointer/TokenMetadata. (M is M0-controlled base token.)

## Security implications
1. **Pausable on ext mints, authority = the m_ext program's own mint_authority PDA.** m_ext exposes NO pause/resume instruction and never CPIs Token-2022 `pause`. ⇒ pause is UNREACHABLE by anyone (PDA only signs what the program CPIs). Latent, not a live freeze vector — UNLESS some path makes the program sign a pause, or the authority is also an EOA (it's a PDA). Re-verify EvEenAb6/C9eLDmpt are truly the [b"mint_authority"] PDAs and not EOAs.
2. TransferHook present but null program; hook AUTHORITY = governance 9QpF8a9 (not the program). Governance could set a real hook to block transfers = privileged/OOS.
3. Freeze authority 7Ahg145 shared — likely earn-program-controlled thaw/freeze of vault. Freezing USER ext accounts would be privileged/OOS unless an unprivileged path triggers it.
4. Known-issue #4 (ext_mint CloseMint+PermanentDelegate) does NOT appear activated on the ext mints currently — reduces that surface.

## TODO (cheap, next)
- Re-parse with real spl parser (after build) to lock exact extension set + confirm no CloseMint/PermanentDelegate on ext mints + confirm ScaledUi on USDKY.
- Confirm EvEenAb6 == PDA([b"mint_authority"], USDKY) and C9eLDmpt == PDA([b"mint_authority"], USDK). If they are PDAs, pause is dead. If EOA, investigate.
