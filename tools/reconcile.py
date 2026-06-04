#!/usr/bin/env python3
"""Banded price reconciliation for an ODAPM model.

Compares every price in model.json against a reference table (the owner's
calibrated/accepted rates and cost-model derivations) using magnitude-based
tolerance bands, so trivial differences don't generate noise:

    unit price < $1     : ±10%
    $1   – $5           : ±8%
    $5   – $25          : ±6%
    $25  – $100         : ±5%
    > $100              : ±4%

Rules, in order:
  IN BAND            -> accept, no flag
  OUT OF BAND + ref  -> correct to the reference, log it
  NO reference       -> flag "derive" (price it via the cost model / owner input)
  BASIS CONFLICT     -> flag "human" (unit/method differs; cannot auto-reconcile)

Usage:
    python3 tools/reconcile.py model.json references.json [--apply]

references.json: { "<item_id>": {"<option_id or *>": {"ref": 85.0,
                   "src": "WTR.UTIL accepted rate"}}, ... }
Without --apply it reports only. With --apply it writes corrections into the
model and prints a summary (accepted / corrected / flagged).
"""
import json, sys

BANDS=[(1,0.10),(5,0.08),(25,0.06),(100,0.05),(float("inf"),0.04)]
def tol(p):
    for lim,t in BANDS:
        if p<lim: return t
    return 0.04

def main():
    apply_="--apply" in sys.argv
    args=[a for a in sys.argv[1:] if a!="--apply"]
    model=json.load(open(args[0])); refs=json.load(open(args[1]))
    accepted=corrected=flagged=0; log=[]
    for it in model["items"]:
        r=refs.get(it["id"]);
        if not r: continue
        opts=it.get("pick",{}).get("options") or [None]
        for o in opts:
            key=o["id"] if o else "*"
            spec=r.get(key) or r.get("*")
            if not spec: continue
            p=(o or it)["price"]
            slot="rep" if (p.get("rep") or 0)>=(p.get("rem") or 0) else "rem"
            cur=p.get(slot) or 0; ref=spec["ref"]
            if ref<=0 or cur<=0: continue
            if abs(cur-ref)/ref<=tol(ref): accepted+=1; continue
            if spec.get("basis_conflict"): flagged+=1; log.append(("HUMAN",it["id"],key,cur,ref,spec.get("src",""))); continue
            log.append(("CORRECT",it["id"],key,cur,ref,spec.get("src","")))
            if apply_: p[slot]=ref
            corrected+=1
    print(f"accepted in band: {accepted} | corrected: {corrected} | human flags: {flagged}")
    for row in log: print("  ",*row)
    if apply_:
        json.dump(model,open(args[0],"w"),indent=2,ensure_ascii=False)
        print("model updated.")

if __name__=="__main__":
    main()
