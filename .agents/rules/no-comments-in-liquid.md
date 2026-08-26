---
description: Layouts and includes carry no comments. The reasoning that would go in one belongs in .agents/
when: editing anything under website/_layouts/, website/_includes/, or a Liquid block in a page
paths: ["website/_layouts/**", "website/_includes/**", "website/_plugins/**"]
---

# No comments in Liquid

**A `{% comment %}` block in a layout or an include is a rule in the wrong place.** Delete it and put what
it said here, under `.agents/`.

This is not the same rule as [comments-are-for-humans](comments-are-for-humans.md), which is about code.
A layout is not code anyone reads to understand the project - it is a template, read while chasing a
rendering problem, and a paragraph of reasoning sitting in the middle of it is noise at the moment it is
opened.

## Why

**A comment in a layout is read by nobody who needs it and skipped by everybody who does not.** Someone
opens `base.html` because a tag is in the wrong place or a variable is empty. They are not there to learn
why the project chose an install route.

**It drifts silently.** Nothing renders a comment, nothing tests it, and no reviewer diffs it against the
thing it describes. The explanation of why the loader blocks was in three places at once; two of them were
prose in a layout, and prose in a layout is where a fact goes to rot.

**`.agents/` already has a home for every kind of it.** A reason a thing is built this way is a design
record. A thing that must always be true is a rule. A thing not done yet is a plan. A layout is none of
those.

## How to apply it

- **No `{% comment %}` and no `<!-- -->`** in `website/_layouts/`, `website/_includes/`, or a Liquid block
  inside a page.
- **Move the sentence, do not just delete it.** If it was worth writing it is worth keeping somewhere it
  will be read; see [one-fact-one-place](one-fact-one-place.md) for choosing where.
- **A Ruby plugin under `website/_plugins/` is code**, so
  [comments-are-for-humans](comments-are-for-humans.md) applies there instead - comments that say why, not
  what.
- **A variable that needs explaining is usually named badly.** `use_loader` needs no comment;
  `flag2` would.
- **Config files are not covered.** `_config.yml` and `_config.prod.yml` are read by a person deciding what
  to set, and the comment beside a key is what tells them. Keep those. So are `_data/` files - `nav.yml`
  carries the reading-order reasoning and that is the right place for it.
