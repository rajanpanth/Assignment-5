# KAST — Exclusions & Known Issues (verbatim, 2026-07-17)

## KNOWN ISSUES — INELIGIBLE (do NOT re-report). Hunt only for MATERIALLY DISTINCT paths.
1. **Unsupported Mint Extensions — Acknowledged.** In `m_ext`, the code uses `trunc`/`floor` to convert `multiplier * INDEX_SCALE_F64` into an integer index, which may discard edge cases with small fractional parts such as `.9995`, creating an off-by-one error.
2. **Retroactive Fee Application for Crank Version of Extensions — Acknowledged.**
3. **Earners Will Lose Pending Yield When Removed — Acknowledged.**
4. **`ext_mint` Can Have CloseMintAuthority & PermanentDelegate Extensions Activated — Acknowledged.**

> Plus: any unfixed vulnerability mentioned in linked audit reports is ineligible. MUST pull those reports in Phase 1.

## Out of scope (All Categories)
- Attacks the reporter already exploited themselves causing damage
- Attacks requiring leaked keys/credentials
- Attacks requiring access to privileged addresses (governance, strategist) — EXCEPT where contracts are intended to have NO privileged access to the functions making the attack possible
- Depegging of an external stablecoin where attacker does not directly cause it via a code bug
- Secrets/keys in GitHub without proof of production use
- Best practice recommendations
- Feature requests
- Impacts on test/config files unless stated otherwise
- Phishing / social engineering
- Theoretical user interactions without demonstration of regular/significant occurrence

## Default Out of Scope (Smart Contract specific)
- Incorrect data supplied by third-party oracles
  - **NOT excluded: oracle manipulation / flash loan attacks**
- Basic economic & governance attacks (e.g. 51% attack)
- Lack of liquidity impacts
- Sybil attacks
- Centralization risks

## Key nuance for hunting
- Privileged-address attacks excluded EXCEPT where the contract is *intended to have no privileged access* to the function enabling the attack. => A missing-signer/authority-check bug that lets an UNPRIVILEGED caller reach a function is IN scope.
- Oracle manipulation / flash-loan IS in scope.
