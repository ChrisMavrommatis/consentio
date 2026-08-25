---
description: What the plans layer is. Order and state live on the board, not here
---

# plans

**One file, one sitting, one deletion.** Each plan cites defect numbers from
[../design/issues.md](../design/issues.md) and carries none of its own.

**The order they are worked in, and where each one stands, is on the board:
[../relaunch.md](../relaunch.md).** It is not repeated here - two indexes of the same thing is exactly what
[../rules/one-fact-one-place.md](../rules/one-fact-one-place.md) forbids, and the one that gets stale is
always the second.

## What a plan looks like

Front matter carrying `description:`, `state:` and `waits-on:`, then five headings:

| Heading | Holds |
|---|---|
| **What** | the scope, as defect numbers. Never a restatement of a defect |
| **Why** | what breaks for a user if it is skipped |
| **Direction** | the traps, named. What a session gets wrong without being told |
| **Do not** | the fence |
| **Deliverables** | a checkbox each, with the command or the by-eye check that settles it |

A deliverable that cannot be checked is not a deliverable. "By eye" is a legitimate check and several of
them are the only check available - say so rather than inventing a command.

## Delete when

**A plan is deleted once its deliverables are ticked and its work is committed.** Landed means committed,
not "sitting in the working tree".

**Move anything still true out of it first.** Every plan dies with whatever it was the only record of;
[../memory/](../memory/) exists for exactly that, and its README says so. The register in
[../design/](../design/) is never deleted with a plan - it outlives all of them.
