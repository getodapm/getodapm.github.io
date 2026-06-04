#!/usr/bin/env python3
"""Escalate an ODAPM model's prices by public index changes.

Applies a labor index change to the labor-driven portions (rem/rep) and a
materials index change to the material portion (mat), then stamps meta.escalated.

Usage:
    python3 tools/escalate.py model.json --labor 0.02 --materials 0.04 [--out model.json]

--labor / --materials are fractional period changes (0.02 = +2%) pulled from the
public series in methodology/data-sources.md. Always review the before/after the
prompt prints (prompts/06-keep-it-current.md) before committing.
"""
import json, sys, argparse, datetime


def esc(v, r):
    return round(v * (1 + r), 2) if isinstance(v, (int, float)) and v else v


def bump_price(p, labor, materials):
    if not isinstance(p, dict):
        return p
    return {
        "rem": esc(p.get("rem"), labor),
        "rep": esc(p.get("rep"), labor),
        "mat": esc(p.get("mat"), materials),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model")
    ap.add_argument("--labor", type=float, required=True, help="labor/equipment index change, e.g. 0.02")
    ap.add_argument("--materials", type=float, required=True, help="materials index change, e.g. 0.04")
    ap.add_argument("--out")
    args = ap.parse_args()

    with open(args.model) as f:
        model = json.load(f)

    changed = 0
    for it in model.get("items", []):
        if isinstance(it.get("price"), dict):
            it["price"] = bump_price(it["price"], args.labor, args.materials); changed += 1
        if isinstance(it.get("priceByCategory"), dict):
            for k, v in it["priceByCategory"].items():
                it["priceByCategory"][k] = bump_price(v, args.labor, args.materials)
            changed += 1

    model.setdefault("meta", {})["escalated"] = datetime.date.today().isoformat()
    out = args.out or args.model
    with open(out, "w") as f:
        json.dump(model, f, indent=2)
    print(f"Escalated {changed} item price blocks (labor +{args.labor:.1%}, materials +{args.materials:.1%}). Wrote {out}.")


if __name__ == "__main__":
    main()
