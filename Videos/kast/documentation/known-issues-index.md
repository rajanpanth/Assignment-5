# Known Issues Index (audits + bounty acknowledged) — dedup reference

## Bounty-page ACKNOWLEDGED (ineligible, verbatim in program/exclusions.md)
1. Unsupported Mint Extensions — trunc/floor `multiplier*INDEX_SCALE_F64`→int index off-by-one (`utils/conversion.rs:173 multiplier_to_index`). Also OtterSec OS-MSE-SUG-00/01.
2. Retroactive Fee Application for Crank Version — Adevar V2 **L01** (crank `configure.rs`). Crank=wM, OOS anyway.
3. Earners Will Lose Pending Yield When Removed — Adevar V2 **L03** (crank). OOS anyway.
4. ext_mint Can Have CloseMintAuthority & PermanentDelegate Extensions Activated — Adevar V2 **L06**.

## Audit findings (5 reports in /audits, extracted to .txt)

### Adevar V2 (adevar_v2_audit) — current v2 code. 0 crit/high, 1 med, 6 low.
- M01 (med, portal OOS) rate-limit bypass — RESOLVED.
- L01 crank retroactive fee — ACK (=known#2).
- L02 inactive earn manager redirect yield (crank/set_recipient) — RESOLVED.
- L03 earners lose pending yield — ACK (=known#3).
- L04 earn manager block yield via frozen fee acct (crank) — RESOLVED? (fixed set).
- L05 DoS in migration via donating few M to old vault — RESOLVED. **(migration path; re-examine current migrate.rs)**
- L06 ext_mint CloseMint+PermanentDelegate — ACK (=known#4).

### Halborn V2 (halborn_v2_audit) — 0 crit, 1 high, 2 low, 4 info.
- HIGH: InboxItem release not enforced (portal OOS) — SOLVED.
- LOW: **RISK OF YIELD OVER-DISTRIBUTION — RISK ACCEPTED** (m_ext yield). ⚠ examine but likely ineligible/known.
- LOW: insufficient M-token mint validation during earn program init — SOLVED.
- INFO: token2022 not enforced (SOLVED), missing field in ExtGlobalV2 initializer (SOLVED), DoS insufficient accounts validation (SOLVED), unhandled index OOB (SOLVED).

### OtterSec V1 (ottersec_m_extensions) — ext_swap (OOS). All RESOLVED.
- OS-MSE-ADV-00 CRIT: missing admin auth in 4 ext_swap whitelist ix — RESOLVED PR#20.
- OS-MSE-ADV-01 MED: from_token_account validated vs to_token_program — RESOLVED PR#21.
- OS-MSE-SUG-00: ext_mint may include unsupported extensions (=known#1 area).

### Halborn V1 (halborn_m_extensions) — 0 crit,1 high,1 low,3 info. ext_swap + init.
- HIGH: missing access control whitelist manipulation (ext_swap) — SOLVED 06/23.
- LOW: **RISK OF FRONT-RUNNING DURING PROGRAM INITIALIZATION — RISK ACCEPTED**. ⚠ applies to init; likely ineligible.
- INFO: inconsistent docs, unnecessary system program acct, incorrect token program constraint — SOLVED.

### Adevar V1 (adevar_m_extensions) — TODO: detail findings titles (not yet fully parsed).

## Dedup rule
Anything above = ineligible. New finding must be materially distinct AND in-scope (USDK/USDKY = m_ext no-yield/scaled-ui) AND unprivileged-reachable AND an accepted impact. Re-examine especially: migration (L05), yield over-distribution (Halborn V2 risk-accepted), init front-running (Halborn V1 risk-accepted) — for a DISTINCT non-excluded path only.
