# Deployment Correspondence (passive mainnet reads, 2026-07-17)

Method: public RPC getAccountInfo (read-only). PDA `global`=[b"global"] derived locally.

## USDKY — `extMahs9bUFMYcviKCvnSRaXgs5PcqmMzcnHRtTqE85`
- Owner: BPFLoaderUpgradeable. **Upgradeable.**
- programdata: 4NGoz1FmBHWPios2HxRKNY94LFJD8Z5QvWmtLwLoJwjh (len 593181, last_deploy_slot 401378485)
- **upgrade_authority: 9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW**
- global PDA: 6FUYfcR1r1TazHMw1hDUgCZfAmh8AK8i5a1c8ue3QeT9 (bump 251, len 329)
  - admin: 9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW (== upgrade authority)
  - pending_admin: 5WVYUVeJvcwD4Fpko5aZgdoB346Ef9ioAG6znohbrbti (⚠ admin transfer pending)
  - **yield_variant = 1 (ScaledUi)** ✅
  - **fee_bps = 0** (currently NO fee on yield)
  - ext_mint: usdkyPPxgV7sfNyKb8eDz66ogPrkRXG3wS2FVb6LLUf
  - m_mint: mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH

## USDK — `extaykYu5AQcDm3qZAbiDN3yp6skqn6Nssj7veUUGZw`
- Owner: BPFLoaderUpgradeable. **Upgradeable.**
- programdata: CK8fFmZLbHUVnCWsrc1kTFeEbgWgDbEtPsPysNgwBaTh (len 525581, last_deploy_slot 401369371)
- **upgrade_authority: 9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW** (same)
- global PDA: AiiXk9Rztiv9E72Ying8byGzvxnVmyaeunysYEmvG1NU (bump 253, len 305)
  - admin: 9QpF8a9TDM9DMiQ556bjEAyAx3WRunzW9HfiDcAPNyJW
  - pending_admin: 5WVYUVeJvcwD4Fpko5aZgdoB346Ef9ioAG6znohbrbti
  - **yield_variant = 0 (NoYield)** ✅
  - wrap_authorities count = 4
  - ext_mint: usdkbee86pkLyRmxfFCdkyySpxRb5ndCxVsK2BkRXwX
  - m_mint: mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH

## Shared
- m_mint (M token) = mzerojk9tg56ebsrEAhfkyc9VgKjTW2zDqp6C5mhjzH (M v2 mint; note README's old wM mint mzeroXDo... differs — this is M v2).
- admin == upgrade_authority == 9QpF8a9... (likely Squads multisig — VERIFY). This is the "governance/privileged" address; attacks requiring it are OOS unless a no-privilege path exists.

## Source correspondence
- HEAD b69d1f8 code matches variant model. To PROVE deployed bytes == repo build: `avm use 0.31.1`, build scaled-ui/no-yield, `solana-verify` hash vs programdata. NOT yet done (build pending). Confidence: HIGH on variant (on-chain yield_variant byte), MEDIUM on exact commit until hash-verified.

## Implication for scope
- USDKY scaled-ui: permissionless `sync` is live. fee_bps=0 now (fee math path dormant unless admin sets fee>0).
- USDK no-yield: no permissionless in-program ix; surface = wrap/unwrap via wrap authorities + ext_swap, Token-2022 mint config.
