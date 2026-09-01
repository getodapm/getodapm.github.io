# Start here

Build a rate sheet for anyone. Keep it current forever. No proprietary list.

**Bring your own model.** This is not tied to Claude, ChatGPT, Cursor, or any other vendor. Use whatever AI can read this folder and write files. Mileage varies — some models follow the spec cleanly, some invent fields, some skip `basis`. You are the check. When a step finishes, drop `model.json` on [odapm.org/rate-sheet/](https://odapm.org/rate-sheet/).

This run's seed is restoration. The same method is how other trades will build theirs.

## What you'll end up with
- `model.json` — your line items and your prices, every number traceable to an open source.
- `tax.json` — your jurisdiction tax rates.
- A documented basis for the whole thing, so the numbers can be audited.

## What you need

**Any AI that can read a local folder and write files.** This workflow relies on that. It does not rely on a particular brand of model.

## Before you begin
- Open this `odapm/` folder in the AI you actually use, as long as it can read these files and write your model directly.
- Have a rough idea of: the types of losses you handle (water, fire, mold, etc.), the region you work in, and your real costs (crew wage, typical material costs, equipment day-rates). Don't worry if some are fuzzy — public data fills gaps; your own costs are welcome.

## Run these in order
1. **`01-define-your-trade-and-region.md`** — who you are, what you do, where.
2. **`02-build-your-scope.md`** — the line items you actually perform (your scope schema).
3. **`03-derive-your-prices.md`** — market-derived prices from open data (the heart of it).
4. **`04-set-your-tax.md`** — your jurisdiction tax rates.
5. **`05-validate-and-export.md`** — check it against the ODAPM schema and finalize.
6. **`06-keep-it-current.md`** — re-index your prices over time so they track the market.

## How to run a prompt
Open the prompt file, copy everything under the **"Paste this:"** line, send it to **your** AI in this session, and answer the questions. When a step is done, move to the next file. Do not switch products mid-walk unless the one you started with cannot write files.

## The one rule
Never paste in numbers from a licensed proprietary pricing platform. ODAPM derives prices independently from open public data — that's the entire point, and it's what keeps your model clean and defensible. If you already know your *own* real costs, those are welcome; a competitor's licensed list is not.

Ready? Open **`01-define-your-trade-and-region.md`**.
