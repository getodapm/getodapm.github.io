# Step 04 — Set your tax

Tax is kept **separate** from pricing (it updates on a different schedule and comes from a different source). It lives in `tax.json`. In ODAPM, **tax applies to the material portion only — labor is never taxed.**

---

**Paste this:**

> Help me build my `tax.json` from the ODAPM tax template (`seed/tax.template.json`). I work in these jurisdictions: __________ (list cities/areas, or give me your best read from my region in `meta`).
>
> For my state, find the free authoritative rate source (most states' Departments of Revenue publish a downloadable rate file or an address lookup). Tell me what it is and link it. If I can download that file into this folder, use it as the source of truth. Otherwise, populate each jurisdiction's combined rate from that source and mark it approximate.
>
> Important: a single ZIP often spans multiple tax jurisdictions, so build a `zip_candidates` map that lists every rate that can occur in each of my ZIPs (don't guess one). Keep a `lookup_url` to the state's by-address tool for edge cases. Write it all to `tax.json` against `schema/odapm.tax.schema.json`, and note that rates are verified-by-address where it matters.

---

**Why ZIP candidates, not one rate per ZIP:** taxing-jurisdiction boundaries follow legal lines, not ZIP codes. The same ZIP can contain two or three different combined rates. Listing the candidates and confirming by address beats guessing — and tax only hits the material portion, so the impact of a near-miss is small either way.
