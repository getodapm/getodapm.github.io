# ODAPM Specification — odapm/v1

ODAPM defines two layers and one separate sibling. An app reads them; this document defines them.

## Layer 1 — Scope schema (the shared language)

The vendor-neutral description of restoration work. It answers *"what line items exist and how is an estimate structured"* — independent of any proprietary code set.

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

Attaches a price to each scope item. The price **shape** is `{rem, rep, mat}`:

- `rem` — **remove** unit price (tear-out / detach / haul)
- `rep` — **replace** unit price (install / reset / perform service)
- `mat` — **material** portion per unit (the *taxable* part; labor is never taxed)

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

A **valid ODAPM model** is a `model.json` whose `meta.schema` is `odapm/v1`, whose items validate against the scope schema, and whose prices validate against the pricing schema. An **ODAPM-compatible app** reads such a model (and an optional `tax.json`) without requiring any proprietary data. No app owns the standard; the reference estimator is merely one consumer.

## Versioning

The **spec** version is `odapm/v1` (breaking changes bump the integer). A **model instance** carries its own `meta.version` and `meta.escalated` date independent of the spec.
