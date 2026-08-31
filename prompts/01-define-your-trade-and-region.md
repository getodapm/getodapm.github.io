# Step 01 — Define your trade and region

This sets the foundation: what kinds of work you price, and where — which drives the labor, material, and equipment data your assistant will use to derive your prices.

---

**Paste this:**

> I'm building my ODAPM pricing model in this folder. Read `README.md` and `SPEC.md` first so you understand the standard, then help me set my foundation. Ask me, one topic at a time:
>
> - The loss types I handle (e.g. water/Cat 1–3, fire & smoke, mold, storm, contents).
> - My service region (metro area / counties), and my home base city + ZIP.
> - My crew structure and **real** hourly labor cost (technician, supervisor) — or tell me you'll help me estimate it from public wage data for my area if I don't know.
> - My typical markup/margin target.
> - The unit system I think in (SF, LF, EA, HR, day).
>
> Don't pull in any proprietary pricing list. When we're done, write my answers into a new `model.json` under a `meta` block (region, base location, labor basis, margin target, loss types) following the ODAPM pricing schema in `schema/`. Leave the line items empty for now — we build those in step 02.

---

**Why region matters:** prices are derived from *local* open data — area wage indices and regional material/equipment costs. The more precise your region, the more defensible your numbers. You can always widen or narrow it later.
