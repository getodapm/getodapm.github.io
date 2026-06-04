#!/usr/bin/env python3
"""Validate an ODAPM model (and optional tax file) against the schemas.

Usage:
    python3 tools/validate.py path/to/model.json [path/to/tax.json]

Reports schema errors, unpriced items, and items missing a `basis` note.
Falls back to structural checks if the `jsonschema` package isn't installed.
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


def price_is_set(p):
    if not isinstance(p, dict):
        return False
    return any(isinstance(p.get(k), (int, float)) and p.get(k) for k in ("rem", "rep", "mat"))


def check_model(model):
    notes = []
    meta = model.get("meta", {})
    if meta.get("schema") != "odapm/v1":
        notes.append(f"WARN meta.schema is {meta.get('schema')!r}, expected 'odapm/v1'")
    items = model.get("items", [])
    unpriced, no_basis = [], []
    for it in items:
        iid = it.get("id", "?")
        priced = price_is_set(it.get("price")) or any(
            price_is_set(v) for v in (it.get("priceByCategory") or {}).values())
        if not priced:
            unpriced.append(iid)
        if priced and not it.get("basis"):
            no_basis.append(iid)
    print(f"  items: {len(items)}")
    if unpriced:
        print(f"  UNPRICED ({len(unpriced)}): {', '.join(unpriced)}")
    if no_basis:
        print(f"  PRICED BUT NO basis NOTE ({len(no_basis)}): {', '.join(no_basis)}")
    if not unpriced and not no_basis:
        print("  all items priced and carry a basis note ✓")
    return notes


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    model_path = sys.argv[1]
    print(f"Validating model: {model_path}")
    model = load(model_path)
    schema_errs = try_jsonschema(model, os.path.join(SCHEMA_DIR, "odapm.pricing.schema.json"))
    if schema_errs is None:
        print("  (jsonschema not installed — running structural checks only; `pip install jsonschema` for full validation)")
    elif schema_errs:
        print("  SCHEMA ERRORS:")
        for e in schema_errs:
            print("   -", e)
    else:
        print("  schema: valid ✓")
    for n in check_model(model):
        print("  ", n)

    if len(sys.argv) > 2:
        tax_path = sys.argv[2]
        print(f"\nValidating tax: {tax_path}")
        tax = load(tax_path)
        terrs = try_jsonschema(tax, os.path.join(SCHEMA_DIR, "odapm.tax.schema.json"))
        if terrs is None:
            print("  (jsonschema not installed — skipped)")
        elif terrs:
            print("  SCHEMA ERRORS:")
            for e in terrs:
                print("   -", e)
        else:
            print("  schema: valid ✓")
        print(f"  jurisdictions: {len(tax.get('jurisdictions', []))}")


if __name__ == "__main__":
    main()
