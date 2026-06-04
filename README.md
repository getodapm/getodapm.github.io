# ODAPM — Open Data AI Pricing Model

**An open standard for describing and pricing restoration work — derived from public market data, buildable by anyone with an AI assistant, owned by no one.**

ODAPM is two open things in one project:

1. **A scope schema** — a vendor-neutral way to describe restoration line items (what work exists, its units, how an estimate is structured). This is the shared language.
2. **A pricing methodology** — a transparent, auditable way to attach *market-derived* prices to those line items using open public data (wage indices, material cost indices, equipment rates), instead of a proprietary list.

You don't need to be a developer. You open this folder in an AI assistant (Claude), run the prompts in order, answer questions about your trade and your region, and walk away with your own complete, defensible pricing model.

---

## Why this exists

The restoration industry prices work against a single proprietary list. Insurers use that same list, then discount the contractor's submission below it — and the contractor has no independent reference to push back with. That isn't a market; it's an administered price set by a party with an interest in keeping it low.

ODAPM restores the thing that makes a market fair: **a transparent benchmark that neither the insurer nor the contractor controls, where every number can be traced back to its open-data source.** It is not anti-pricing and not anti-profit — it's pro–price-discovery. The honest answer to a lowball is: *"the open-market rate is X, here is the sourced basis — show me yours."*

And the moat is gone. The value of the old list was never the numbers — it was the cost of collecting the data. In an AI world, public wage, material, and equipment data plus a model that reasons over it can reconstruct defensible market pricing for almost nothing. **Their data no longer matters.**

> ODAPM contains **zero** proprietary or third-party pricing data. Every price is independently derived from cited open sources. (See `methodology/data-sources.md`.)

---

## What you get

When you finish the prompts you'll have:

- `model.json` — your priced instance (your line items + your market-derived prices), valid against the ODAPM schema.
- `tax.json` — your jurisdiction tax rates (kept separate; tax ≠ pricing).
- A documented basis for every number, so your estimates are defensible.

Any ODAPM-compatible app can read these files. A reference estimator app is one example consumer; the standard does not depend on any one app.

---

## Quickstart (no coding)

1. Open this `odapm/` folder in Claude (Cowork).
2. Open `prompts/00-START-HERE.md` and follow it.
3. Run the prompts in order. Answer Claude's questions about your trade, region, and costs.
4. You're done — your `model.json` and `tax.json` are built and validated.

Start here → [`prompts/00-START-HERE.md`](prompts/00-START-HERE.md)

---

## Project map

```
odapm/
  README.md            ← you are here
  MANIFESTO.md         the why, in full
  SPEC.md              the standard, human-readable
  CHANGELOG.md
  LICENSE-CODE         MIT (tools/scripts)
  LICENSE-DATA         CC-BY-4.0 (spec, schema, methodology, seed)
  schema/              machine-readable JSON Schemas (scope + pricing + tax)
  prompts/             the Claude-driven build workflow (the heart)
  methodology/         the cost model + the open data sources, cited
  tools/               escalate.py (re-index), validate.py (check your model)
  seed/                reference scope + templates to start from
  examples/            sample built instances
```

## Status

Spec line: **odapm/v1** · Project version **0.1.0** · Early — the standard and prompts are taking shape.

## License

Tools and scripts: **MIT**. Spec, schema, methodology, and seed data: **CC-BY-4.0** (use it freely, just keep the attribution so the open provenance stays visible). ODAPM is free and open. It will not be monetized.
