# Step 05 — Validate and finalize

Now confirm your model is complete and conforms to the ODAPM standard, so any compatible app can read it.

---

**Paste this:**

> Validate my ODAPM `model.json` (`meta.schema` odapm/v1) and `tax.json` (`meta.schema` odapm-tax/v1). Run `tools/validate.py` against both (or validate them directly against the schemas in `schema/`). Then report:
>
> - Any schema errors or missing required fields.
> - `tax_applies_to` must be material; sourcing destination.
> - Every line item still priced at 0 / null (so I can decide if that's intentional).
> - Any priced item missing a `basis` note (un-auditable numbers).
> - A quick sanity scan: prices that look implausible high/low vs. their derivation.
> - Jurisdiction count and `zip_candidates` (5-digit ZIP keys).
>
> Then build me one test estimate that touches several line types and show the math — line item total = (qty × remove) + (qty × replace) + tax, where tax = qty × material × rate. Confirm the totals are internally consistent. Fix any schema issues you find, but never invent a price to fill a gap — flag it for me instead.

---

**When this passes:** drop both `model.json` and `tax.json` at [odapm.org/rate-sheet/](https://odapm.org/rate-sheet/) and confirm the check. A compatible app can read the same files; the standard does not depend on any one of them. Keep both files somewhere safe, and version them — see step 06. Do not treat this walk as an account on odapm.ai.

## Update prompt (OpenData)

The rate-sheet check is not the OpenData shop. If you will attach this pack on signup or Admin → Rate pack, you still need a headed **update prompt**. That is a different paste than the validate prompt above. Copy the prompt below into **your** AI. It must write a text block with these six markdown headers as their own lines (case-insensitive). Each section needs a non-empty body. Paste *that block* into OpenData's "Update prompt" field — not a random chat. OpenData's checker looks for these headers. A copied step-03 prompt will fail.

**Paste this:**

> Write one markdown document I will paste into OpenData's "Update prompt" field (signup, or Admin → Rate pack). Not a chat. Not JSON. Not the step-03 price prompt.
>
> OpenData's checker looks for these six headers as their own lines (case-insensitive). Each section needs a non-empty body. A copied step-03 prompt will fail.
>
> Output only that document, headers exactly as written:
>
> ## Labor metro
> The BLS OEWS area I price labor in (from this session / model.json meta). Name the metro.
>
> ## Markup
> My disclosed markup (meta.markup_target). Do not invent one.
>
> ## Service area
> The states / cities / counties I cover.
>
> ## Labor method
> BLS ECEC construction, benefits as a percent of wages. Do not invent a burden percentage. Wage floor is BLS OEWS for that metro (federal local wage survey, construction occupations).
>
> ## Catalog
> Do not invent SKUs. Overlay existing OpenData ids only.
>
> ## Tax
> Destination / rooftop of the loss. Material portion only. Labor is never taxed.
>
> Fill every section from what you already know about this shop. If a fact is missing, ask me once, then write the six-header document.
