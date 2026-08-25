---
description: This repository is public. What may never appear in it, and the rule that nothing outside .agents may point into it
when: always
---

# The public bar

**This repository is public**, including `.agents/`. Every file in it is readable by anyone.

## Never in this repository

Not in code, not in a comment, not in `.agents/`, not in a commit message:

- pricing, revenue, or what anything costs
- a competitor, named or described
- visitor numbers, traffic, or any measured business figure
- which other project pays for this one, or the planning notes that decide it
- the reasoning that produced a public sentence, where that reasoning is commercial

Engineering reasoning is fine and is the point of `design/`. The bar is on commercial reasoning, not on
technical detail.

**If a file needs one of those to make sense, stop and ask the maintainer.** Do not write it, and do not
write around it with a hint.

## Nothing outside `.agents/` points into it

Not a filename, not a link, not a plan number. `README.md`, `website/`, the templates and their READMEs are
written for users, who have no `.agents/` and never will. `CLAUDE.md` is the only exception.

**Defect numbers are `.agents/` currency.** "Defect 12" means nothing to a reader of the site; write the
behaviour instead. **One carve-out - a bare number in a test title or a code comment**, which is what keeps
the register executable. [who-references-whom](who-references-whom.md) states it once and holds the detail.
