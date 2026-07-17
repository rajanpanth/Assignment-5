# KAST — Accepted Impacts (verbatim from scope page, 2026-07-17)

## Critical
- Incorrect calculation of multisig signers required for transaction processing
- Permanent freezing of funds
- Manipulation of governance voting result deviating from voted outcome and resulting in a direct change from intended effect of original results
- Direct theft of any user funds, whether at-rest or in-motion, other than unclaimed yield
- Protocol insolvency

## High
- Permanent freezing of unclaimed yield
- Permanent freezing of unclaimed royalties
- Temporary freezing of funds
- Theft of unclaimed yield
- Theft of unclaimed royalties
- Prevention of governance participation despite design parameters providing participation rights

## Medium
- Smart contract unable to operate due to lack of token funds

(15 impacts listed on page; list above is the enumerated set shown across pages 1–2.)

## Mapping to workstreams
- Multisig threshold miscalc -> Governance/multisig workstream (#6)
- Permanent/temporary freezing -> Token-2022 authority + close-account + solvency (#1,#7,#9)
- Governance manipulation / participation prevention -> Governance (#6)
- Direct theft (not unclaimed yield) -> mint/burn authority + index math + CPI (#1,#2,#5)
- Protocol insolvency -> value-conservation math + yield accounting (#2,#3)
- Theft/permanent-freeze of unclaimed yield/royalties -> yield/earner + royalty accounting (#3,#8)
- Unable to operate due to lack of token funds -> crank/griefing + solvency (#4,#9)
