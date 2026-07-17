# REJECTED — H1: sync/wrap valuation via future-effective M multiplier

Status: **Invalid (source-confirmed disproof)**

## Hypothesis
m_ext values M via `multiplier_to_index(m_config.new_multiplier)` immediately (wrap.rs:121, unwrap.rs:125, conversion.rs:226). If M's `new_multiplier` is future-effective while the current effective multiplier is lower, internal valuation and real Token-2022 UI balances diverge → extractable window.

## Disproof
The M `earn` program's `propagate_index` sets the multiplier with `timestamp = Clock::get()?.unix_timestamp` (earn `instructions/portal/propagate_index.rs:57`, `utils/conversion.rs:12-46 update_multiplier`). Token-2022 `update_multiplier(mult, ts)` with ts<=now makes `new_multiplier` immediately effective. Therefore M's `new_multiplier` is ALWAYS already-effective when m_ext reads it — no pending/future window exists under real M operation. m_ext also copies M's effective_timestamp onto the ext multiplier, keeping them consistent.

## Residual
Only exploitable if M could be made to set a future-effective multiplier — that requires the M portal_authority (privileged, different protocol, OOS). Not reachable by an unprivileged KAST actor. REJECTED.
