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


def esc(v, r):
    return round(v * (1 + r), 2) if isinstance(v, (int, float)) and v else v


def bump_price(p, labor, materials, item_id, warnings):
    """Escalate one price block, splitting rep into labour and material parts."""
    if not isinstance(p, dict):
        return p

    rem = p.get("rem")
    rep = p.get("rep")
    mat = p.get("mat")

    new_mat = esc(mat, materials)

    if isinstance(rep, (int, float)) and rep and isinstance(mat, (int, float)) and mat:
        if mat > rep:
            warnings.append(
                f"{item_id}: mat ({mat}) exceeds rep ({rep}); mat must be the material "
                f"portion contained in rep. Escalated rep wholesale on the labour index."
            )
            new_rep = esc(rep, labor)
        else:
            labor_part = rep - mat
            new_rep = round(labor_part * (1 + labor) + mat * (1 + materials), 2)
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
                    help="allow a second escalation on a date already logged")
    args = ap.parse_args()

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
    changed = 0
    for it in model.get("items", []):
        iid = it.get("id", "?")
        if isinstance(it.get("price"), dict):
            it["price"] = bump_price(it["price"], args.labor, args.materials, iid, warnings)
            changed += 1
        if isinstance(it.get("priceByCategory"), dict):
            for k, v in it["priceByCategory"].items():
                it["priceByCategory"][k] = bump_price(v, args.labor, args.materials,
                                                      f"{iid}/{k}", warnings)
            changed += 1

    log.append({
        "date": today,
        "labor": args.labor,
        "labor_series": args.labor_series,
        "materials": args.materials,
        "materials_series": args.materials_series,
    })
    meta["escalated"] = today

    out = args.out or args.model
    with open(out, "w") as f:
        json.dump(model, f, indent=2)

    for w in warnings:
        print(f"WARN {w}", file=sys.stderr)
    print(f"Escalated {changed} item price blocks "
          f"(labour +{args.labor:.2%} via {args.labor_series}; "
          f"materials +{args.materials:.2%} via {args.materials_series}). Wrote {out}.")


if __name__ == "__main__":
    main()
