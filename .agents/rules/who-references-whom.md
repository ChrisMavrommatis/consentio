---
description: Which layer may link to which, the outward boundary, and the one carve-out for bare defect numbers
when: adding a link or a reference anywhere
---

# Who references whom

| From | May point at | May not |
|---|---|---|
| `CLAUDE.md` | `.agents/` | - |
| `.agents/rules/` | any layer, the code | - |
| `.agents/design/` | other design records, the code | plans |
| `.agents/plans/` | design records, other plans, the code | - |
| `.agents/memory/` | anything under `.agents/`, the code | - |
| **anything outside `.agents/`** | **the code, `website/`, `README.md`** | **`.agents/`, in any form** |

## The two that matter

**Design does not point at plans.** A design record outlives every plan that reads it; a link into `plans/`
rots the moment the plan is deleted. Plans link to design, never the other way.

**Nothing outside `.agents/` points into it.** Not `README.md`, not the site, not a template's README, not a
commit message. Not a path, not a plan number, not a filename, not a phrase that only makes sense if you have
read one. `CLAUDE.md` is the only exception. See [the-public-bar](the-public-bar.md).

A path a tool operates on is an operand, not a pointer - a workflow that reads a file under `.agents/` is
fine.

## The carve-out: a bare defect number

**A bare defect number may appear in a test title or a code comment**, and nowhere else outside `.agents/`.
`test('issue 12 - the secure flag follows the page protocol', { todo: true }, ...)` is correct and there are
about sixty of them on purpose.

That is what keeps the register executable: deleting a `todo` flag is the proof a fix landed. See
[../memory/todo-flags-are-the-register.md](../memory/todo-flags-are-the-register.md) and
[comments-are-for-humans](comments-are-for-humans.md), which carves out the same thing for
`// @ts-expect-error`.

**Bare means bare.** A number, and the behaviour described in plain words next to it. Not a path into
`.agents/`, not "see the register", not a plan number, not a sentence that only parses if you have read one.

It does not reach `README.md`, `website/`, `gtm/` or anything else a user reads - there, write the behaviour
and drop the number.
