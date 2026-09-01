# ODAPM Specification — odapm/v1

ODAPM is a model for trade SKUs. **`odapm/v1` is the restoration catalog.** Tear-out vs replace (`rem` / `rep`), water categories (`cat1`–`cat3`), and rooms are restoration shape. They are not the kernel.

The kernel that would be shared with another trade is: named SKU, unit, a unit price built from labor + materials + equipment + markup, and a `basis` on every non-zero price. A plumber does not inherit a tear-out price or a water category.

**Do not pretend v1 is a plumber spec.** When another trade has a real catalog, it gets its own spec line (for example `odapm-plumbing/v1`), not a fake generic overlay on restoration fields. Empty specs for trades we do not have are not a spec.

An app reads a `model.json`; this document defines v1.

## Layer 1 — Scope schema (the shared language)

The vendor-neutral description of the work you sell as SKUs. v1's catalog is restoration work: it answers *"what line items exist and how is an estimate structured"* — independent of any proprietary code set.

An ODAPM **item** has:

| field | meaning |
|---|---|
| `id` | stable slug, unique within the model |
| `name` | plain-language label (no proprietary codes) |
| `group` | section: `setup`, `demolition`, `cleaning`, `equipment`, `fixtures`, `labor`, … |
| `unit` | `SF`, `LF`, `EA`, `HR`, `DAY` |
| `pick` | *(optional)* a choice set, e.g. action `detach` vs `remove & dispose`, or a material/size option |
| `categoryPriced` | *(optional)* `true` if the price varies by water category (cat1/cat2/cat3) |
| `repeatable` | *(optional)* `true` if it can appear per-room/per-area |
| `desc` | one-line explanation of what the item covers |
| `estVerb` | *(optional)* verb used when rendering the estimate line |

Machine schema: [`schema/odapm.scope.schema.json`](schema/odapm.scope.schema.json).

## Layer 2 — Pricing (market-derived values)

v1 attaches a **restoration** price to each scope item. The shape is `{rem, rep, mat}` because restoration lines are often tear-out, reset, or both:

- `rem` — **remove** unit price (tear-out / detach / haul)
- `rep` — **replace** unit price (install / reset / perform service)
- `mat` — **material** portion per unit (the taxable share of replace, when tax applies)

This shape is the restoration profile. It is not how a plumber SKU should look.

`mat` is **contained within `rep`, not added to it.** For a replace line, `rep` is the full
unit price and `mat` is the material share of it, so `rep − mat` is the labour share. A line
total never adds `mat` as a cost term — it appears only as the tax basis. An implementation
that adds `mat` to the total double-counts materials.

Category-priced items carry a tier set, e.g. `{ "cat1": {...}, "cat2": {...}, "cat3": {...} }`.

Each priced item should carry a `basis` note: the inputs and sources used to derive it (labor hrs, material qty/cost, equipment share, markup, index source). This is what makes a number auditable — the core ODAPM promise.

Machine schema: [`schema/odapm.pricing.schema.json`](schema/odapm.pricing.schema.json).

### Derivation
```
unit price = (labor hours × local labor cost)
           + (material qty × material cost)
           + equipment share
           + markup
```
Escalated over time by public indices (labor index for labor portion, materials index for material portion). Full method: [`methodology/METHODOLOGY.md`](methodology/METHODOLOGY.md).

## Sibling — Tax (not part of the pricing model)

Jurisdiction tax rates live in `tax.json`, separate because they come from a different source (state revenue departments) on a different cadence. **Tax applies to the material portion only.** Per line: `qty × mat × (rate/100)`. Schema: [`schema/odapm.tax.schema.json`](schema/odapm.tax.schema.json).

## The estimate identity

For any line: `total = (qty × rem) + (qty × rep) + tax`, where `tax = qty × mat × (rate/100)`.

## Conformance

A **valid ODAPM model** is a `model.json` whose `meta.schema` is `odapm/v1`, whose items
validate against the scope schema, whose prices validate against the pricing schema, and in
which **every item carrying a non-zero price also carries a `basis` note**.

That last condition is normative but not expressible in JSON Schema; `tools/validate.py`
enforces it and exits non-zero when it fails. A model with uncited prices is not conformant,
however cleanly it validates structurally — auditability is the standard, not a convention. An **ODAPM-compatible app** reads such a model (and an optional `tax.json`) without requiring any proprietary data. No app owns the standard; the reference estimator is merely one consumer.

## Versioning

The **spec** line `odapm/v1` means this restoration catalog. Breaking changes to *this* catalog bump the integer (`odapm/v2`). A **model instance** carries its own `meta.version` and `meta.escalated` date independent of the spec.

A second trade is a second spec, written when that catalog exists — not a v1 field we leave unused.
