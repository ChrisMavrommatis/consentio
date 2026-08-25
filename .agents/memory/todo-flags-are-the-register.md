---
name: todo-flags-are-the-register
description: A failing test marked { todo: true } naming a defect number is how the register is kept executable - removing the flag is the proof a fix landed
when: fixing a defect, or wondering why a test is marked todo
paths: ["test/**"]
---

Tests were written against ported-but-still-broken code. A test for behaviour that does not work yet is
marked `{ todo: true }` and **names its defect number in the title**. `node:test` reports a todo that
unexpectedly passes, and does not fail the suite on one that does not.

So the suite **is** [../design/issues.md](../design/issues.md), executable.

**Why:** a fix session's diff then contains the deletion of a `todo` flag next to the code change, which is
the cleanest possible proof the fix landed and is checkable by a reader who knows nothing about the defect.

**How to apply:** fixing a defect means removing its `todo` flag in the same diff. Never add a `todo` without
a defect number - a todo with no number is a defect nobody has written down. Never delete a todo test because
it fails.
