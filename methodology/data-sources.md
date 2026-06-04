# ODAPM Open Data Sources

ODAPM derives prices only from publicly available data. This file lists the source *categories* and the specific public series commonly used. When Claude derives or escalates your prices, it should cite the exact series and date it used, written into each item's `basis` note.

> These are public reference series, not a pricing product. None of them is proprietary restoration pricing data.

## Labor (and equipment) escalation
- **Regional CPI** — e.g. U.S. Bureau of Labor Statistics *CPI-U* for your metro area (a proxy for local cost-of-living / wage movement).
- **Area wage data** — BLS *Occupational Employment and Wage Statistics (OEWS)* for the relevant occupations (construction laborers, etc.) in your metro, to anchor a real local labor rate.
- Accessible free via the BLS site and the FRED (Federal Reserve Bank of St. Louis) data portal.

## Materials escalation
- **Producer Price Index — construction materials** (BLS PPI; e.g. inputs to construction, materials and components). Free via BLS / FRED.

## Equipment
- Local rental-equivalent **day-rates** for restoration equipment (air movers, dehumidifiers, air scrubbers/negative-air, heaters). Sourced from open local rental pricing; escalated with the labor/CPI index.

## Tax (sibling, not pricing)
- Your **state Department of Revenue** publishes combined rates and usually a free by-address lookup. ODAPM stores these in `tax.json`. (See `prompts/04-set-your-tax.md`.)

## How to cite in a model
Each item's `basis` should read like:
> "rem: 0.25 hr × $66/hr local labor (BLS OEWS Denver, 2026-01) = $16.50; mat: 1 unit × $0.40 antimicrobial; markup 20%. Escalated 2026-06 (PPI construction materials)."

If you can't cite it, don't ship it.
