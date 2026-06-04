# Step 02 — Build your scope (your line items)

This builds your **scope schema**: the catalog of work items you actually perform, structured the ODAPM way. This is the shared language your estimates speak — independent of any proprietary code set.

Each item has: a plain name, a unit (SF/LF/EA/HR/day), a group (setup, demolition, cleaning, equipment, fixtures, labor…), an optional set of choices (e.g. detach vs. remove & dispose), and a short note explaining what it covers. Prices come later (step 03).

---

**Paste this to Claude:**

> Help me build my ODAPM scope — the line items I perform. Start from the reference catalog in `seed/model.seed.json` so I don't begin from scratch: walk me through it group by group (setup, demolition, cleaning, equipment, fixtures, labor), and for each item ask whether I (a) keep it, (b) skip it, or (c) need to add something that's missing for my trade.
>
> For anything I add, capture: plain name, unit, group, any action choices (e.g. *detach* vs *remove & dispose*), category sensitivity (does the price change by water Cat 1/2/3?), and a one-line note. Keep names in plain language — no proprietary codes.
>
> Write the result into the `items` array of my `model.json`, conforming to the ODAPM scope schema in `schema/odapm.scope.schema.json`. Leave every price null for now. When a group is done, summarize what we kept and added.

---

**Tip:** Don't over-build. Start with the items you use on most jobs; you can add edge-case items anytime by re-running this step. A tight, real catalog beats an exhaustive one you never touch.
