---
description: A fact lives in exactly one file. Everywhere else links to it
when: adding a fact to any file under .agents/
---

# One fact, one place

Before writing a fact down, find where it already lives. Link to it rather than restating it.

The facts most likely to get duplicated here, and where each one lives:

| Fact | Its one place |
|---|---|
| the cookie name, value, attributes and reading rules | [../design/delivery.md](../design/delivery.md) |
| the two install routes and why they cannot share code | [../design/delivery.md](../design/delivery.md) |
| a defect, its `file:line` and its number | [../design/issues.md](../design/issues.md) |
| what a user needs to install it | `README.md`, and the pages under `website/pages/` |

**A plan cites a defect number. It never restates the defect.** That is what keeps the register the only
place the count is true.

**Where a fact must appear twice because two audiences need it** - the cookie contract is in `design/` for
agents and in `website/` for template authors - the design record is the source and the docs page is derived
from it. If they disagree, the design record is right and the source settles it.
