# ODAPM Pricing Methodology

ODAPM prices are **built, not copied.** Every unit price is the output of a transparent cost model fed by public data, so it can be defended line by line.

## The cost model

For each line item:

```
unit price = labor_cost + material_cost + equipment_share + markup

  labor_cost     = labor_hours      × local_labor_rate
  material_cost  = material_quantity × material_unit_cost
  equipment_share= equipment_day_rate × expected_days / units_per_job   (where applicable)
  markup         = (labor_cost + material_cost + equipment_share) × markup_target
```

**`markup_target` is a markup, not a margin.** Applying 0.20 yields a 16.7% gross margin,
not 20%. To hit a target *margin* m, use `markup_target = m / (1 - m)` — a 20% margin needs
a markup of 0.25, a 30% margin needs 0.4286. The field was previously named `margin_target`,
which invited exactly this error; `margin_target` is still accepted as a deprecated alias.

Split into the ODAPM price shape:
- `rem` (remove) carries the tear-out/detach/haul labor.
- `rep` (replace) carries the install/reset/service labor.
- `mat` (material) is the taxable material portion only.

Labor is never taxed; only `mat` feeds tax.

## The inputs (all public)

- **Local labor rate** — derived from area wage data for the relevant occupation, plus the contractor's real burden, not a guessed number. See `data-sources.md`.
- **Material unit costs** — typical regional costs for the consumable involved (antimicrobial, poly, bags, filters, etc.).
- **Equipment day-rates** — local rental-equivalent day-rates for air movers, dehus, air scrubbers, etc.
- **Markup target** — the contractor's own.

**Two of these four inputs are not public**, and ODAPM says so rather than letting a reviewer
discover it: `markup_target` and the contractor's labour burden are business decisions, not
open data. The claim ODAPM makes is narrower and stronger than "every number comes from public
data" — it is that **open data sets the cost floor, and the two discretionary inputs are
disclosed on the face of the model** rather than buried in an administered list. A reviewer can
recompute every derived figure once those two are stated.

Each derived price stores a `basis` note recording the inputs and sources used. That note is the difference between an auditable benchmark and a black box.

## Escalation (keeping it current)

Prices don't get re-derived from scratch each cycle; they're **escalated by public indices**, weighted per item:

```
new_price = labor_portion   × (1 + labor_index_change)
          + material_portion× (1 + material_index_change)
          + equipment_portion×(1 + labor_index_change)
```

- **Labor** escalates with a wage index (BLS Employment Cost Index), not a consumer price index.
- **Equipment** escalates with the equipment rental producer-price index, not the wage index —
  rental rates do not track wages.
- **Materials** escalate with a construction-materials producer-price index.

Run quarterly or twice a year (`prompts/06-keep-it-current.md`). **Pull the live figures from
the series named in `data-sources.md` and cite the series and vintage on every run** —
`tools/escalate.py` requires both and writes them to an append-only `meta.escalations` log.
This document deliberately publishes no default escalation rates: an uncited rate is the
untraceable number ODAPM exists to eliminate.

## Calibration target

ODAPM aims to land at genuine local market cost — slightly under inflated administered lists, but never artificially low. The goal is a *fair* number both sides can verify, not a cheap one or a contractor-favorable one.

## What ODAPM never does

- Never copies or stores a proprietary/third-party price list. Not one number.
- Never hides a derivation. If a number can't be explained from open inputs, it doesn't belong in the model.

## Item-priced tasks (flat rates)

Some work is priced **per item, not per hour** — appliance disconnects, fixture pulls, service calls. This matches how the industry (and insurance review) expects them billed. In ODAPM these are `EA`-unit items carrying a **flat rate**: the labor-hours cost model is used **once, to derive and defend the flat number** (and it should be anchored to the owner's accepted invoices where they exist), after which the published price is the item price. Escalation still applies to the flat rate via the labor index.
