# Step 02 — Build your scope (your line items)

This keeps or skips items from the **OpenData restoration catalog** (the seed / administered list). SKU ids are not yours to invent. Prices come later (step 03).

Each kept item has: a plain name, a unit (SF/LF/EA/HR/day), a group (setup, demolition, cleaning, equipment, fixtures, labor…), an optional set of choices (e.g. detach vs. remove & dispose), and a short note explaining what it covers.

---

**Paste this:**

> Help me build my ODAPM scope from the OpenData restoration catalog in `seed/model.seed.json` (the seed / administered list). Walk me through it group by group (setup, demolition, cleaning, equipment, fixtures, labor). For each item ask whether I (a) keep it or (b) skip it.
>
> Do not add SKU ids. Do not invent proprietary codes. If I perform work that is not on the catalog, record a short note for Support — not a new `id`.
>
> Write the kept items into the `items` array of my `model.json`, conforming to the ODAPM scope schema in `schema/odapm.scope.schema.json`. Leave every price null for now. When a group is done, summarize what we kept and skipped, plus any Support notes.

---

**Tip:** Don't over-build. Start with the items you use on most jobs. Missing work is a Support note, not a new SKU. A tight, real catalog beats an exhaustive one you never touch.
