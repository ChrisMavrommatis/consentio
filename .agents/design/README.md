# design

**Why Consentio is built and shipped the way it is**, and the defect register. These outlive every plan.

| File | What it holds |
|---|---|
| [delivery.md](delivery.md) | what Consentio is delivered as, the two install routes, why each pushes the consent default differently, and the cookie contract in full |
| [issues.md](issues.md) | **the defect register** - numbered, with `file:line`. Every plan cites these numbers. **Stable numbering** |

## The one rule

**A session that finds a defect not in `issues.md` adds a number to it.** It does not fix it in passing and
it does not leave it in a commit message. The register is the only place the count is true.

## These do not link to plans

A design record outlives every plan that reads it. Plans cite design; design never cites plans. See
[../rules/who-references-whom.md](../rules/who-references-whom.md).

## When `issues.md` goes

When every defect in it is fixed. `delivery.md` does not go - it is the reasoning behind a design that is
still live.
