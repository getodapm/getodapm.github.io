#!/usr/bin/env python3
"""Validate an ODAPM model (and optional tax file) against the schemas.

Usage:
    python3 tools/validate.py path/to/model.json [path/to/tax.json]

Reports schema errors, unpriced items, and items missing a `basis` note.

Exit codes:
    0  Conformant. The schema was checked and passed, and every non-zero-priced
       item carries a basis note.
    1  NOT conformant: schema errors, or a priced item with no basis.
    2  UNVERIFIED: the `jsonschema` package is missing, so the schema could not
       be checked. Structural checks may still have passed. This is deliberately
       not 0 -- a gate that cannot validate must not report success.

Unpriced items warn and pass: an unpriced model is a template, not a violation,
and the shipped seed is one.

    pip install -r requirements.txt
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_DIR = os.path.join(os.path.dirname(HERE), "schema")


def load(p):
    with open(p) as f:
        return json.load(f)


def try_jsonschema(instance, schema_path):
    try:
        import jsonschema  # type: ignore
    except ImportError:
        return None  # signal: not available
    schema = load(schema_path)
    errs = sorted(jsonschema.Draft7Validator(schema).iter_errors(instance),
                  key=lambda e: list(e.path))
    return [f"{'/'.join(map(str, e.path)) or '(root)'}: {e.message}" for e in errs]


PRICE_KEYS = ("rem", "rep", "mat")


def price_is_set(p):
    """True when a block carries a non-zero rem/rep/mat.

    Handles the tiered `catPrice` shape too (a map of category -> price block),
    which the pricing schema permits via oneOf. Without that branch a tiered
    item reads as unpriced and slips past the basis requirement below.
    """
    if not isinstance(p, dict):
        return False
    if any(k in p for k in PRICE_KEYS):
        return any(isinstance(p.get(k), (int, float)) and p.get(k) for k in PRICE_KEYS)
    # Not a flat block -- try it as a category map.
    return any(price_is_set(v) for v in p.values())


def item_price_blocks(it):
    """Every price block on an item, across all three shapes it may use.

    `pick.options[].price` is the majority of the priced blocks in the
    reference seed. Omitting it -- as this tool did -- reported those items
    UNPRICED, so the conformance gate never asked them for a `basis` and 34 of
    the seed's 94 items sat outside the check entirely.
    """
    blocks = []
    if isinstance(it.get("price"), dict):
        blocks.append(it["price"])
    for v in (it.get("priceByCategory") or {}).values():
        if isinstance(v, dict):
            blocks.append(v)
    pick = it.get("pick")
    if isinstance(pick, dict):
        for option in pick.get("options") or []:
            if isinstance(option, dict) and isinstance(option.get("price"), dict):
                blocks.append(option["price"])
    return blocks


def check_model(model):
    notes = []
    meta = model.get("meta", {})
    if meta.get("schema") != "odapm/v1":
        notes.append(f"WARN meta.schema is {meta.get('schema')!r}, expected 'odapm/v1'")
    if meta.get("margin_target") is not None and meta.get("markup_target") is None:
        notes.append("WARN meta.margin_target is deprecated (it is a markup, not a margin). "
                     "Use markup_target = m/(1-m); a 20% margin is 0.25.")
    items = model.get("items", [])
    unpriced, no_basis = [], []
    for it in items:
        iid = it.get("id", "?")
        priced = any(price_is_set(b) for b in item_price_blocks(it))
        if not priced:
            unpriced.append(iid)
        if priced and not it.get("basis"):
            no_basis.append(iid)
    print(f"  items: {len(items)}")
    if unpriced:
        # A model may legitimately be unpriced -- that is a template, not a
        # non-conformant model. Warn, do not fail.
        print(f"  UNPRICED ({len(unpriced)}): {', '.join(unpriced)}")
    if no_basis:
        # SPEC.md Conformance: every non-zero-priced item must carry a basis.
        print(f"  FAIL - PRICED BUT NO basis NOTE ({len(no_basis)}): {', '.join(no_basis)}")
    if not unpriced and not no_basis:
        print("  all items priced and carry a basis note ✓")
    return notes, bool(no_basis)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    model_path = sys.argv[1]
    failed = False
    unverified = False
    print(f"Validating model: {model_path}")
    model = load(model_path)
    schema_errs = try_jsonschema(model, os.path.join(SCHEMA_DIR, "odapm.pricing.schema.json"))
    if schema_errs is None:
        print("  SCHEMA NOT CHECKED — the `jsonschema` package is not installed.")
        print("    pip install -r requirements.txt")
        unverified = True
    elif schema_errs:
        print("  SCHEMA ERRORS:")
        for e in schema_errs:
            print("   -", e)
        failed = True
    else:
        print("  schema: valid ✓")
    notes, basis_failed = check_model(model)
    failed = failed or basis_failed
    for n in notes:
        print("  ", n)

    if len(sys.argv) > 2:
        tax_path = sys.argv[2]
        print(f"\nValidating tax: {tax_path}")
        tax = load(tax_path)
        terrs = try_jsonschema(tax, os.path.join(SCHEMA_DIR, "odapm.tax.schema.json"))
        if terrs is None:
            print("  SCHEMA NOT CHECKED — the `jsonschema` package is not installed.")
            unverified = True
        elif terrs:
            print("  SCHEMA ERRORS:")
            for e in terrs:
                print("   -", e)
        else:
            print("  schema: valid ✓")
        if terrs:
            failed = True
        print(f"  jurisdictions: {len(tax.get('jurisdictions', []))}")

    # Three outcomes, three exit codes. "Conformant" is claimed ONLY when the
    # schema was actually checked: this tool previously printed it, and exited
    # 0, on a schema-invalid model whenever `jsonschema` was missing -- which is
    # the stock interpreter. Any CI gate built on it was green by default.
    if failed:
        print("\nNOT CONFORMANT — see failures above.")
        sys.exit(1)
    if unverified:
        print("\nUNVERIFIED — structural checks passed, but the schema was not "
              "checked.\nThis is not a conformance pass. Install jsonschema and "
              "re-run.")
        sys.exit(2)
    print("\nConformant.")


if __name__ == "__main__":
    main()
