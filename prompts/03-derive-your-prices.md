# Step 03 — Derive your prices from open data

This is the heart of ODAPM. Instead of copying a list, you **derive** each price from a transparent cost model fed by public data — so every number can be defended with its source.

The model for each line item:

```
unit price = (labor hours × local labor cost)
           + (material quantity × material cost)
           + (equipment share)
           + markup
```

Then prices are escalated over time by public indices (see step 06). Tax is handled separately (step 04) — labor is never taxed.

---

**Paste this:**

> Help me derive prices for the line items in my `model.json`, using the ODAPM methodology in `methodology/METHODOLOGY.md` and the open sources in `methodology/data-sources.md`. Do NOT use any proprietary price list.
>
> Recipe: fb_hourly = labor_basis.rate × (1 + burden_pct/100). cost = labor + material + equipment. markup = cost × markup_target. rem = tear-out labor; rep = install labor (+ equipment share if this SKU is the machine); mat = taxable materials only.
>
> Before any SKU, a baseline table I must accept: fb_hourly (OEWS + ECEC B/W, or my wage), consumable unit costs with public source + date, equipment day-rates with rental source + date, production rates (ask me; else assumed and labeled). Hours = work / production_rate. No “market” or proprietary list.
>
> Then group by group. Show the math. basis is one line: rem: {h} hr × ${fb}/hr FB (OEWS … + ECEC …) = ${n}; mat: {q} × ${u} (source, date) = ${n}; markup {m} on cost. If you can’t cite it, leave the price null.

---

**The payoff:** when an adjuster lowballs a line, you don't argue from a list you don't control. You show your derivation — local wage data, material cost, the math — and ask them to show theirs. That's price discovery, in the open.
