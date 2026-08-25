---
name: the-site-is-written-for-a-self-installer
description: Every reader-facing page on the docs site is pitched at someone installing this on their own site, and /how-it-works/ is the one page where jargon is allowed
when: writing or editing any page on the docs site
paths: ["website/pages/**"]
---

The install pages open with **four numbered steps** and put the explanation under them. The route choice is
written in terms of what the reader has - *can you edit your `<head>`?* - not what the code does. Titles are
plain: "Put it in your HTML", "Settings". **`/how-it-works/` is the one page where jargon is allowed**, and
`/troubleshooting/` is symptom, cause, fix. Anything cut from a reader page went to one of those two.

**Why:** the first split of the documentation was accurate and read like a specification. Two passes on
25 Aug 2026 fixed it, and the second one found the maintainer's voice in five more pages - a release note
about breaking changes moving two repositories, a cookie page opening on "two implementations in two
languages", a versioning page describing what the code does. None of it was wrong. None of it was
actionable by the person reading it.

**How to apply:** before adding a paragraph to a reader-facing page, ask what the reader does with it. If the
answer is "nothing, but it is true", it belongs on `/how-it-works/`. Cutting it is the wrong fix - the
technical weight is meant to be somewhere, just not first.
