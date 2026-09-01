# Step 05 — Validate and finalize

Now confirm your model is complete and conforms to the ODAPM standard, so any compatible app can read it.

---

**Paste this:**

> Validate my ODAPM model. Run `tools/validate.py` against my `model.json` and `tax.json` (or validate them directly against the schemas in `schema/`). Then report:
>
> - Any schema errors or missing required fields.
> - Every line item still priced at 0 / null (so I can decide if that's intentional).
> - Any item missing a `basis` note (un-auditable numbers).
> - A quick sanity scan: prices that look implausible high/low vs. their derivation.
>
> Then build me one test estimate that touches several line types and show the math — line item total = (qty × remove) + (qty × replace) + tax, where tax = qty × material × rate. Confirm the totals are internally consistent. Fix any schema issues you find, but never invent a price to fill a gap — flag it for me instead.

---

**When this passes:** you have a finished `model.json`. Open it at [odapm.org/rate-sheet/](https://odapm.org/rate-sheet/) and confirm the check. A compatible app can read the same file; the standard does not depend on any one of them. Keep both files somewhere safe, and version them — see step 06. Do not treat this walk as an account on odapm.ai.
