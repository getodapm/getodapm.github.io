#!/usr/bin/env python3
"""Escalate an ODAPM model's prices by public index changes.

Implements the split in methodology/METHODOLOGY.md: the labour portion of each
price escalates on a wage index, the material portion on a materials index.

Because `mat` is the material portion CONTAINED IN `rep` (not added to it), the
labour part of `rep` is `rep - mat`. Escalating `rep` wholesale on the labour
index -- as this tool did before -- pushes the material content up at the wrong
rate and breaks the identity `rep - mat == escalated labour`.

Usage:
    python3 tools/escalate.py model.json \
        --labor 0.021 --labor-series "BLS ECI, construction, 2026Q2" \
        --materials 0.037 --materials-series "BLS PPI inputs to construction, 2026-06" \
        [--out model.json] [--force]

--labor / --materials are fractional period changes (0.02 = +2%) taken from the
live public series in methodology/data-sources.md. There are deliberately no
default values: an uncited escalation rate is exactly the untraceable number
ODAPM exists to avoid.

Every run appends to meta.escalations, so the escalation history is auditable.
Re-running on a date already logged requires --force.
"""
import json
import sys
import argparse
import datetime

PRICE_KEYS = ("rem", "rep", "mat")

# A rate this large is almost always a percent typed where a fraction belongs
# (--labor 2.1 meaning 2.1%), which would triple a model in a single run. Refuse
# rather than warn: the output file is the input file by default, so a silent
# mistake here overwrites the only copy.
IMPLAUSIBLE_RATE = 0.5


def esc(v, r):
    return round(v * (1 + r), 2) if isinstance(v, (int, float)) and v else v


def is_price_block(d):
    """A price block carries any of rem/rep/mat."""
    return isinstance(d, dict) and any(k in d for k in PRICE_KEYS)


def is_category_map(d):
    """`price` may instead be a map of category -> price block.

    The pricing schema declares item `price` as a oneOf over the flat block and
    this tiered shape. A tool that assumes the flat shape reads rem/rep/mat off
    a tiered block, finds nothing, and writes back {rem: None, rep: None,
    mat: None} -- destroying the tiers in place. Detect it instead.
    """
    return (
        isinstance(d, dict)
        and len(d) > 0
        and not is_price_block(d)
        and all(is_price_block(v) for v in d.values())
    )


def price_block_slots(item):
    """Yield (label, container, key) for EVERY price block on an item.

    An item prices in one of three shapes, and this generator is the single
    place that knows all three. The previous version of this tool walked only
    `price` and `priceByCategory`, so the 96 option-level blocks in the shipped
    seed were skipped while the model was still stamped as escalated -- an audit
    log asserting a re-index that never happened.
    """
    iid = item.get("id", "?")

    if isinstance(item.get("price"), dict):
        yield (iid, item, "price")

    pbc = item.get("priceByCategory")
    if isinstance(pbc, dict):
        for key, value in pbc.items():
            if isinstance(value, dict):
                yield (f"{iid}/{key}", pbc, key)

    # `pick.options[].price` -- the shape tools/reconcile.py already reads, and
    # the majority of the priced blocks in the reference seed.
    pick = item.get("pick")
    if isinstance(pick, dict):
        for index, option in enumerate(pick.get("options") or []):
            if isinstance(option, dict) and isinstance(option.get("price"), dict):
                yield (f"{iid}/{option.get('id', index)}", option, "price")


def bump_price(p, labor, materials, item_id, warnings):
    """Escalate one price block, splitting rep into labour and material parts."""
    if not isinstance(p, dict):
        return p

    if is_category_map(p):
        return {
            key: bump_price(value, labor, materials, f"{item_id}/{key}", warnings)
            for key, value in p.items()
        }

    if not is_price_block(p):
        warnings.append(
            f"{item_id}: price block carries none of rem/rep/mat and is not a "
            f"category map; left unchanged rather than guessed at."
        )
        return p

    rem = p.get("rem")
    rep = p.get("rep")
    mat = p.get("mat")

    new_mat = esc(mat, materials)

    rep_is_num = isinstance(rep, (int, float))
    mat_is_num = isinstance(mat, (int, float))

    # `mat > 0` rather than a truthiness test on rep: a block with rep == 0 and
    # mat > 0 is exactly the containment violation this warning exists to catch,
    # and the old truthy-rep guard let it through silently.
    if rep_is_num and mat_is_num and mat > 0:
        if mat > rep:
            warnings.append(
                f"{item_id}: mat ({mat}) exceeds rep ({rep}); mat must be the material "
                f"portion contained in rep. Escalated rep wholesale on the labour index."
            )
            new_rep = esc(rep, labor)
        else:
            labor_part = rep - mat
            # Round the labour part on its own and add the already-rounded
            # material part, so `new_rep - new_mat` equals the escalated labour
            # exactly. Rounding the combined product instead leaves the two off
            # by a cent on roughly a quarter of inputs -- bounded, but this
            # module's entire claim is that the identity holds.
            new_rep = round(round(labor_part * (1 + labor), 2) + new_mat, 2)
    else:
        new_rep = esc(rep, labor)

    # rem is tear-out/haul labour; it carries no material portion of its own.
    return {"rem": esc(rem, labor), "rep": new_rep, "mat": new_mat}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model")
    ap.add_argument("--labor", type=float, required=True,
                    help="wage index change for the period, e.g. 0.021")
    ap.add_argument("--labor-series", required=True,
                    help='cited source, e.g. "BLS ECI, construction, 2026Q2"')
    ap.add_argument("--materials", type=float, required=True,
                    help="materials index change for the period, e.g. 0.037")
    ap.add_argument("--materials-series", required=True,
                    help='cited source, e.g. "BLS PPI inputs to construction, 2026-06"')
    ap.add_argument("--out")
    ap.add_argument("--force", action="store_true",
                    help="allow a second escalation on a date already logged, and "
                         "permit an implausibly large rate")
    args = ap.parse_args()

    for name, rate in (("--labor", args.labor), ("--materials", args.materials)):
        if abs(rate) > IMPLAUSIBLE_RATE and not args.force:
            print(f"{name} {rate} is a {rate:.0%} change in one period. These are "
                  f"fractions, not percents: 2.1 percent is 0.021, not 2.1. "
                  f"Use --force if that really is intended.", file=sys.stderr)
            sys.exit(1)

    with open(args.model) as f:
        model = json.load(f)

    meta = model.setdefault("meta", {})
    log = meta.setdefault("escalations", [])
    today = datetime.date.today().isoformat()

    if any(e.get("date") == today for e in log) and not args.force:
        print(f"An escalation is already logged for {today}. "
              f"Re-running would compound it. Use --force if that is intended.",
              file=sys.stderr)
        sys.exit(1)

    warnings: list[str] = []
    blocks = 0
    moved = 0
    for item in model.get("items", []):
        for label, container, key in price_block_slots(item):
            before = container[key]
            container[key] = bump_price(before, args.labor, args.materials, label, warnings)
            blocks += 1
            if container[key] != before:
                moved += 1

    log.append({
        "date": today,
        "labor": args.labor,
        "labor_series": args.labor_series,
        "materials": args.materials,
        "materials_series": args.materials_series,
        # Recorded so a later reader can tell a no-op run over an all-zero
        # template apart from one that genuinely moved prices.
        "blocks": blocks,
        "blocks_changed": moved,
    })
    meta["escalated"] = today

    out = args.out or args.model
    with open(out, "w") as f:
        json.dump(model, f, indent=2)

    for w in warnings:
        print(f"WARN {w}", file=sys.stderr)
    print(f"Escalated {moved} of {blocks} price blocks "
          f"(labour +{args.labor:.2%} via {args.labor_series}; "
          f"materials +{args.materials:.2%} via {args.materials_series}). Wrote {out}.")


if __name__ == "__main__":
    main()
