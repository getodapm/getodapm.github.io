# Step 02 — Build your scope (your line items)

This builds your **scope schema**: the catalog of work items you actually perform, structured the ODAPM way. This is the shared language your estimates speak — independent of any proprietary code set.

Each item has: a plain name, a unit (`SF`, `LF`, `EA`, `HR`, `DAY`, `DA`, `PR`), a group (`setup`, `demo`, `demolition`, `extraction`, `cleaning`, `equipment`, `fixtures`, `service`, `labor`, `other`), an optional set of choices (e.g. detach vs. remove & dispose), and a short note explaining what it covers. Prices come later (step 03). Those group and unit lists are the closed Layer 1 enums — the same list as `schema/odapm.scope.schema.json`. The seed uses a subset (`demo`, `extraction`, `service`, `DA`, `PR` rather than `demolition`, `labor`, `DAY`).

---

**Paste this to Claude:**

> Help me build my ODAPM scope — the line items I perform. Start from the reference catalog in `seed/model.seed.json` so I don't begin from scratch: walk me through it group by group (`setup`, `demo`, `demolition`, `extraction`, `cleaning`, `equipment`, `fixtures`, `service`, `labor`, `other`), and for each item ask whether I (a) keep it, (b) skip it, or (c) need to add something that's missing for my trade. Allowed groups and units are exactly that Layer 1 enum (units: `SF`, `LF`, `EA`, `HR`, `DAY`, `DA`, `PR`) — do not invent a fourth list.
>
> For anything I add, capture: plain name, unit, group, any action choices (e.g. *detach* vs *remove & dispose*), category sensitivity (does the price change by water Cat 1/2/3?), and a one-line note. Keep names in plain language — no proprietary codes.
>
> Write the result into the `items` array of my `model.json`, conforming to the ODAPM scope schema in `schema/odapm.scope.schema.json`. Leave every price null for now. When a group is done, summarize what we kept and added.

---

**Tip:** Don't over-build. Start with the items you use on most jobs; you can add edge-case items anytime by re-running this step. A tight, real catalog beats an exhaustive one you never touch.
