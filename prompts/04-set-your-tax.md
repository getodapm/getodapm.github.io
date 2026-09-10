# Step 04 — Set your tax

Tax is kept **separate** from pricing (it updates on a different schedule and comes from a different source). It lives in `tax.json`. In ODAPM, **tax applies to the material portion only — labor is never taxed.**

---

**Paste this:**

> Help me build my `tax.json` (schema odapm-tax/v1) from the ODAPM tax template (`seed/tax.template.json`). Destination-based: the rooftop of the loss picks the rate later; I do not type a shop-wide tax percent. Tax applies to the material portion only (`meta.tax_applies_to` must be `"material"`). Labor is never taxed.
>
> I cover this service area: __________ (states / cities / counties — fill jurisdictions from that area). If I already put a region in `model.json` `meta`, use that.
>
> For each state I cover, find the free authoritative rate source (the state's Department of Revenue combined rate file or address lookup). Tell me what it is and link it. If I can download that file into this folder, use it as the source of truth. Otherwise, populate each jurisdiction's combined rate from that source and mark it approximate.
>
> Important: a single ZIP often spans multiple tax jurisdictions, so build a `zip_candidates` map: keys are 5-digit ZIPs, values are arrays of jurisdiction ids that can occur in that ZIP (don't guess one). Keep a `lookup_url` to the state's by-address tool. Write it all to `tax.json` against `schema/odapm.tax.schema.json`.

---

**Why ZIP candidates, not one rate per ZIP:** taxing-jurisdiction boundaries follow legal lines, not ZIP codes. The same ZIP can contain two or three different combined rates. Listing the candidates and confirming by address beats guessing — and tax only hits the material portion, so the impact of a near-miss is small either way.
