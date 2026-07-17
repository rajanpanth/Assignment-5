# KAST — Prohibited Actions (operating safety rules)

MUST NOT:
- Attack/probe/alter production programs or mainnet/devnet state.
- Send exploit tx to mainnet-beta or public devnet/testnet.
- Affect user funds or third-party systems.
- DoS / high-traffic testing.
- Use leaked credentials/private keys.
- Publish an unpatched vulnerability / push private findings to a public repo.
- Claim reproduction when a test did not pass.
- Classify a source hypothesis as runtime-confirmed.

ALLOWED:
- Browse public resources; clone public repos; inspect history; build locally; run local tests/mocks; local validator / litesvm / bankrun; deterministic PoCs.
- Passive public-data reads (solscan/RPC read-only) for deployment correspondence.
