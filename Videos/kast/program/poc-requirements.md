# KAST — PoC / Payout / Process Requirements (2026-07-17)

- **PoC required for ALL severities.**
- **KYC required** for payout.
- **Triaged by Immunefi.**
- Max bounty **$50,000**.
- Submission: https://bugs.immunefi.com/dashboard/new-submission

## PoC standard (from operating rules)
- Deterministic local repro: litesvm / bankrun / local validator. NO mainnet/devnet/testnet tx.
- Use real deployed instruction set + normal setup paths.
- Identify attacker / victim / protocol / privileged-setup roles.
- Show token balances / account state before & after.
- Assert the EXACT accepted impact.
- Include negative control / non-vacuity counter (a successful legit op).
- Exact commands + actual output.
- Do NOT modify vulnerable production logic to force success.
- Do NOT hide failures behind ignored Results.
