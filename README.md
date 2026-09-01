# ODAPM — Open Data AI Pricing Model

**Build a rate sheet for anyone. Keep it current forever.**

An open standard for trades to describe work as SKUs and price them from public market data — plus the owner's disclosed markup, with a basis that shows the work. Site: [odapm.org](https://odapm.org/). The shop that uses this model is a separate product at [odapm.ai](https://odapm.ai/).

ODAPM is two open things in one project:

1. **A scope schema** — a vendor-neutral way to describe trade SKUs (what work exists, its units, how a job is structured). This is the shared language. v1 ships a restoration catalog as the first seed.
2. **A pricing methodology** — a transparent, auditable way to attach *market-derived* prices to those SKUs using open public data (wage indices, material cost indices, equipment rates), instead of a guessed number or a black-box list.

**Bring your own model.** Any AI that can read this folder and write `model.json` / `tax.json` can run the prompts. Mileage varies by model. This is not a Claude project, not a ChatGPT project, and not a Cursor project. The seed in this repo is restoration; the same method is how other trades will build theirs.

---

## Why this exists

Trade work is sold as SKUs. Install a water heater, hang a door, frame a wall, dry a room. Owners still price that work by guess, by copying a competitor, or by inheriting a list they cannot audit.

ODAPM is a transparent way to price the work you sell: **public data sets the cost floor, you set markup and disclose it, every SKU carries a sourced `basis`.** Restoration is the first catalog because that's what existed — not because the standard is a restoration product.

AI is why the book is cheap to build. Public wage, material, and equipment data plus a model that reasons over it can reconstruct defensible market pricing and show the work.

> ODAPM contains **zero** proprietary or third-party pricing data. Every price is independently derived from cited open sources. (See `methodology/data-sources.md`.)

---

## What you get

When you finish the prompts you'll have:

- `model.json` — your priced instance (your SKUs + your market-derived prices), valid against the ODAPM schema.
- `tax.json` — your jurisdiction tax rates (kept separate; tax ≠ pricing).
- A documented basis for every number, so the prices can be audited.

Any ODAPM-compatible consumer can read these files. The standard does not depend on any one app.

---

## Quickstart

1. Open this `odapm/` folder in **your** AI — whichever one can read the repo and write `model.json` / `tax.json`.
2. Open `prompts/00-START-HERE.md` and follow it.
3. Run the prompts in order. Answer questions about your trade, region, and costs.
4. Check the file on [odapm.org/rate-sheet/](https://odapm.org/rate-sheet/). Re-run `prompts/06-keep-it-current.md` when the market moves.

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
  prompts/             the assistant-driven build workflow (the heart)
  methodology/         the cost model + the open data sources, cited
  tools/               escalate.py (re-index), validate.py (check your model)
  seed/                reference scope + templates to start from
  examples/            sample built instances
```

## Status

Spec line: **odapm/v1** · Project version **0.1.0** · Early — the standard and prompts are taking shape.

## License

Tools and scripts: **MIT**. Spec, schema, methodology, and seed data: **CC-BY-4.0** (use it freely, just keep the attribution so the open provenance stays visible). The standard is free and open. It is owned by no one.
