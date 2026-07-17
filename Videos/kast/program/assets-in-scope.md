# KAST — Assets in Scope (canonical)

Exactly TWO in-scope Solana program IDs (mainnet-beta):

1. **USDKY Extension Program** — `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85`
2. **USDK Extension Program** — `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw`

Both built on M0 `solana-m-extensions` / `m_ext`.

Nothing else is in scope: not the base `M` program, not the M portal/hub, not other extension deployments, not tests/mocks/configs — unless it is the exact code these two program IDs execute AND a bug in it produces an accepted impact reachable via these programs.
