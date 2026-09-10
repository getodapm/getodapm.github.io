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
> For my region (from `meta`), first establish the open-data baselines with me: local labor cost (research the area wage data if I didn't give you a firm number), typical material unit costs, and equipment day-rates. Show me each baseline and its source before using it.
>
> Then go group by group. For each item, propose: the labor hours, material quantity + cost, equipment share, and markup that build the unit price — and show the math and the sources. Let me adjust any assumption. Where an item splits into *remove* / *replace* / *material* portions, fill each. Where price varies by category (Cat 1/2/3), derive each tier.
>
> Write the resulting numbers into `model.json` against the pricing schema, and keep a short per-item `basis` note (the inputs + sources used) so the number is auditable. After each group, give me the running list of anything still unpriced.

---

**The payoff:** when an adjuster lowballs a line, you don't argue from a list you don't control. You show your derivation — local wage data, material cost, the math — and ask them to show theirs. That's price discovery, in the open.
