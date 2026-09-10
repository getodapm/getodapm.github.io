# Step 01 — Define your trade and region

This sets the foundation: what kinds of work you price, and where — which drives the labor, material, and equipment data your assistant will use to derive your prices.

Labor burden is **derived**, not asked. BLS Employer Costs for Employee Compensation (ECEC), construction, benefits as a percent of wages. Do not ask the shop for a burden %. The local wage floor is BLS OEWS for **their metro** — the federal local wage survey for construction occupations. Markup is still theirs and disclosed. Crew wage is optional; otherwise it is derived from OEWS + ECEC.

---

**Paste this:**

> I'm building my ODAPM pricing model in this folder. Read `README.md` and `SPEC.md` first so you understand the standard, then help me set my foundation. Ask me, one topic at a time:
>
> - The loss types I handle (e.g. water/Cat 1–3, fire & smoke, mold, storm, contents).
> - My service region (metro area / counties), and my home base city + ZIP.
> - Which metro to price labor in. Use the federal local wage survey for construction occupations — BLS Occupational Employment and Wage Statistics (OEWS) — for that metro as the wage floor. Name the metro you picked and why it matches my region.
> - My markup target. This is mine, as a fraction: 0.25 means cost × 1.25. Do not ask me for a labor-burden percentage.
> - The unit system I think in (SF, LF, EA, HR, day).
>
> Crew wage: if I give you my own number, use it and note that. Otherwise derive the hourly rate from OEWS for that metro (construction occupations) plus BLS Employer Costs for Employee Compensation (ECEC) for construction — benefits as a percent of wages. Labor burden is derived from ECEC and disclosed in `basis`. It is not a number I type.
>
> Don't pull in any proprietary pricing list. When we're done, write my answers into a new `model.json` under a `meta` block (region, base location, labor basis, markup target, loss types) following the ODAPM pricing schema in `schema/`. Leave the line items empty for now — we build those in step 02.

---

**Why region matters:** prices are derived from *local* open data — OEWS for the metro, ECEC for burden, regional material/equipment costs. The more precise your region, the more defensible your numbers. You can always widen or narrow it later.
