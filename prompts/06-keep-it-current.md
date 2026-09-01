# Step 06 — Keep it current

A rate sheet is only fair if it stays current. That is the forever part. ODAPM prices are **escalated by public indices** — labor by an area wage index, materials by a construction-materials producer-price index — so you re-run this prompt instead of re-pricing by hand.

---

**Paste this (on a schedule — quarterly or twice a year):**

> Re-index my ODAPM `model.json`. Using `tools/escalate.py` and the indices listed in `methodology/data-sources.md`, pull the latest published values, compute the change since my model's last `escalated` date, and apply the per-item weighting (labor portion × labor index change, material portion × material index change). Show me the before/after on a few representative items and the overall percentage move before writing. Update each item and stamp a new `escalated` date in `meta`.
>
> Then re-check my `tax.json` against my state's current rate file (rates change too, usually twice a year) and flag any jurisdiction that moved.

---

**Cadence:** quarterly is plenty for materials; labor moves slower. Tax files are typically republished each January and July. Set a reminder, run this prompt, done in minutes.

**The bigger vision:** over time, ODAPM can blend this bottom-up model with real regional cost data contributors choose to share — turning it from a derived estimate into a living, observed market benchmark. That's "controlled by open markets" in the most literal sense.
