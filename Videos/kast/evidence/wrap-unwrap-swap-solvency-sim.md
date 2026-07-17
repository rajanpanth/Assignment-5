# Evidence — wrap/unwrap/swap value-conservation simulation (2026-07-17)

Faithful Python re-implementation of the exact integer formulas (conversion.rs amount_to_principal_down / principal_to_amount_down/up). Fuzzed 200k–500k random cases, m_multiplier ∈ [1.00,1.05], ext_index ≤ m_index.

## Results
1. **wrap(amount) → unwrap(amount) at constant index = EXACTLY neutral** (0/200000 non-neutral). Both legs use `amount_to_principal_down(amount, index)` with identical index ⇒ vault and supply return to start. No dust extraction from round-trips at constant index.
2. **Swap into no-yield (USDK) collateral shortfall ≤ 2 UI units** (=2e-6 token ≈ $0.000002) per swap. Worst case: amount=350577680, m_index=1032129957783 → required 350577680 vs vault-UI 350577678.
3. **Non-amplifiable / non-profitable:** attacker burns source ext worth ~amount, receives ~amount destination ext (their own net change is ∓dust); the 2-unit "shortfall" is M that remains in the SOURCE vault (global M conserved — inter-vault micro-rebalance, absorbed by each vault's yield surplus). To erode USDK (supply 24.0M tokens) by even $1 needs ~500k separate txs, each paying fees + attacker dust, gaining nothing.

## Conclusion
Core value-conservation math is sound and uniformly conservative within the acknowledged trunc/floor rounding tolerance. No materially-distinct, profitable, or insolvency-producing path found in wrap/unwrap/sync/swap. This is the acknowledged rounding class → INELIGIBLE. Not a candidate.
