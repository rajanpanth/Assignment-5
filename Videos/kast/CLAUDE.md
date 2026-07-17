# CLAUDE.md — KAST / solana-m-extensions Security Research Operating Rules

## Mission
Find the smallest number of previously-unknown, in-scope, reproducible vulnerabilities in the two in-scope KAST extension programs with realistic unprivileged-attacker paths and demonstrated accepted impact. One proven finding beats 100 speculative ones.

## Target (authoritative: live Immunefi page)
- USDKY Extension Program: `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85`
- USDK Extension Program: `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw`
- Repo: https://github.com/m0-foundation/solana-m-extensions
- Docs: https://docs.m0.org/home/technical-documentations/solana/
- Max bounty $50k, PoC required all severities, KYC, Immunefi-triaged.

## This is Solana/Anchor/Token-2022 — NOT EVM
Reason in accounts, owners, signers, PDAs/seeds/bumps, CPIs, rent, discriminators, Token-2022 extension semantics. No msg.sender, no default reentrancy, no proxy/delegatecall.

## Hard safety rules (never break)
- No mainnet/devnet/testnet tx. Passive read-only chain inspection only.
- Local only: litesvm / bankrun / anchor test / local validator / mocks.
- Never edit production program logic to force a build/test to pass.
- Never claim reproduction unless the test actually passed.
- Never publish/push unpatched findings publicly.
- Evidence classification is mandatory (Hypothesis → Source-confirmed → Locally reproducible → Validator/litesvm-reproducible → Deployment-correspondence confirmed → Submission-ready; or Invalid / Known issue / Out of scope / Validation blocked).

## Known issues = INELIGIBLE (see program/exclusions.md). Do not re-report:
1. trunc/floor multiplier→index off-by-one (Unsupported Mint Extensions).
2. Retroactive fee application for crank version.
3. Earners lose pending yield when removed.
4. ext_mint can have CloseMintAuthority & PermanentDelegate activated.
Only pursue MATERIALLY DISTINCT, non-excluded paths.

## Candidate gates (all must pass before submission-ready)
exact program ID in scope; exact impact accepted; code active/deployed; unprivileged reachable path; deterministic PoC; not expected behavior; checked audits/issues/known-limitations/dupes; survives hostile triager review.

## Workstream order
1. ext_mint mint/burn authority + Token-2022 extension authority model
2. Index/multiplier math + present-value conservation
3. Yield accrual + earner add/remove accounting
4. Crank-version fee application (unprivileged trigger)
5. Account-validation / PDA-seed / CPI-safety sweep
6. Governance vote/execute + multisig threshold
7. Close-account / revival / rent edge cases
8. Royalty/fee accounting & rounding
9. Deployment correspondence

## Productivity rules
- Audit one subsystem per session. Store long output on disk (source/, evidence/, commands/).
- Don't reread the whole repo; reuse architecture/invariant notes.
- Exclude deps/build artifacts/generated files from broad review.
- Stop weak candidates early; move to rejected-candidates/ with reason.
- Every material architecture claim cites repo, commit, file, instruction, line range.

## Workflow per finding
trace instructions/state → state exact invariant → source-supported hypotheses → try to disprove each → smallest deterministic test for survivors → bounded fuzz/property → quantify impact → deployment relevance + dedup → hostile review → draft report only after all gates pass.

## Handoff
Update session-log/current-handoff.md at end of every workstream.
