# ODAPM Open Data Sources

ODAPM derives prices only from publicly available data. This file lists the source *categories* and the specific public series commonly used. When Claude derives or escalates your prices, it should cite the exact series and date it used, written into each item's `basis` note.

> These are public reference series, not a pricing product. None of them is proprietary restoration pricing data.

## Labor escalation
- **Employment Cost Index (ECI)** — BLS *ECI*, wages and salaries, construction. This is the
  correct series for labour escalation: it measures the price of labour directly. Published
  quarterly, free on BLS and FRED.
- Do **not** use CPI for this. CPI-U measures consumer prices, not labour cost. It is a
  plausible-sounding proxy and the first substitution a reviewing economist will challenge.
- **Area wage data** — BLS *Occupational Employment and Wage Statistics (OEWS)* for the relevant
  occupations (construction laborers, etc.) in your metro, to anchor a real local labor rate.
  OEWS uses a **May reference period released the following spring**, so cite it as e.g.
  "OEWS Denver-Aurora-Lakewood, May 2025" — not as a month you happened to download it.
- Accessible free via the BLS site and the FRED (Federal Reserve Bank of St. Louis) data portal.

## Materials escalation
- **Producer Price Index — construction materials** (BLS PPI; e.g. inputs to construction, materials and components). Free via BLS / FRED.

## Equipment
- Local rental-equivalent **day-rates** for restoration equipment (air movers, dehumidifiers, air scrubbers/negative-air, heaters). Sourced from open local rental pricing.
- Escalated with the BLS **PPI for commercial and industrial machinery and equipment rental and
  leasing** — not the wage index. Equipment rental rates are set by capital cost, utilisation and
  competition, and do not track construction wages.

## Tax (sibling, not pricing)
- Your **state Department of Revenue** publishes combined rates and usually a free by-address lookup. ODAPM stores these in `tax.json`. (See `prompts/04-set-your-tax.md`.)

## How to cite in a model
Each item's `basis` should read like:
> "rem: 0.25 hr × $66/hr fully-burdened local labour (BLS OEWS Denver-Aurora-Lakewood,
> May 2025, construction laborers, + 38% disclosed burden) = $16.50; mat: 1 unit × $0.40
> antimicrobial; markup_target 0.25 (= 20% margin). Escalated 2026-06: labour +2.1%
> (BLS ECI construction 2026Q2), materials +3.7% (BLS PPI inputs to construction, 2026-06)."

If you can't cite it, don't ship it.
