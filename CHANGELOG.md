# Changelog — ODAPM

## 0.2.0 — unreleased (methodology audit)

Fixes found by auditing the spec, methodology and tools against ODAPM's own core claim:
that every number can be traced to a citable source.

**Corrected — pricing bug**
- `tools/escalate.py` escalated the whole of `rep` on the labour index, including the material
  content inside it, while separately escalating `mat` on the materials index. Prices drifted
  low on material-heavy items and `rep - mat` stopped reconciling with the escalated labour.
  It now splits `rep` into `rep - mat` (labour) and `mat` (material) and escalates each on its
  own index, as `METHODOLOGY.md` always specified.

**Clarified — spec ambiguity**
- `SPEC.md` now states that `mat` is *contained within* `rep` rather than added to it. Two
  conforming implementations could previously disagree on the line total by the full material cost.

**Tightened — conformance**
- A conformant model must now carry a `basis` note on every non-zero-priced item. Previously
  a model with no citations at all validated cleanly, contradicting the standard's core promise.
  Normative in `SPEC.md`; enforced by `tools/validate.py`.
- `tools/validate.py` **always exited 0**, including on schema errors and uncited prices — it
  printed findings and passed regardless, so any CI gate built on it would have green-lit a
  non-conformant model. It now exits non-zero on schema errors and on any non-zero-priced item
  without a `basis`. Unpriced items still warn and pass: an unpriced model is a template, not a
  violation, and the shipped seed is one.
- Deprecated `margin_target` now raises a warning naming the correct conversion.

**Corrected — data sources**
- Labour escalation moves from CPI-U to the **BLS Employment Cost Index**. CPI measures consumer
  prices, not labour cost.
- Equipment escalation moves from the wage index to the **BLS PPI for machinery and equipment
  rental and leasing**. Rental rates do not track wages.
- OEWS citations now use the May reference period rather than a download date.

**Corrected — markup vs margin**
- `margin_target` computed a markup, so a stated 20% "margin" realised 16.7%. Added
  `markup_target` with the `m/(1-m)` conversion documented; `margin_target` deprecated but
  still accepted.

**Removed — uncited numbers**
- `METHODOLOGY.md` published "~2%/yr labor, ~4%/yr materials, ~3% blended" with no series or
  vintage, in the document that forbids exactly that. Removed. `escalate.py` now *requires*
  `--labor-series` and `--materials-series` and has no default rates.

**Added — auditable escalation**
- `meta.escalations` is an append-only log recording the date, rate and cited series of every
  escalation. `escalate.py` refuses to run twice on the same date without `--force`, which
  previously compounded silently.

**Disclosed — the two non-public inputs**
- `METHODOLOGY.md` now states plainly that `markup_target` and labour burden are contractor
  decisions rather than open data, and narrows ODAPM's claim accordingly: open data sets the
  cost floor, and the discretionary inputs are disclosed on the face of the model.

## 0.1.0 — 2026-06-02 (initial scaffold, in development)
- Established ODAPM as a standalone, prompt-driven open project — usable by anyone in Claude, no coding.
- Spec line **odapm/v1**: two layers (scope schema + pricing) plus a separate tax sibling.
- Added: README, MANIFESTO, SPEC, JSON Schemas (scope/pricing/tax), the 7-step Claude build workflow, methodology + open data sources, escalate/validate tools, reference seed scope, tax template, MIT + CC-BY-4.0 licenses.
- Contains zero proprietary/third-party pricing data by design.
