---
name: template-tpl-is-the-source
description: A tag manager template is committed as the one exported .tpl and never generated from parts, because the editor round-trip and the gallery both take that file whole
when: tempted to split a template.tpl into sources plus a build step
paths: ["gtm/**"]
---

Each `gtm/<name>/template.tpl` is the source. There is no build step, no `code.js`, no `permissions.json`.
Inside the sandboxed block the JS is ordered constants, then pure functions, then the effectful main - that
is where the readability comes from.

**Why:** the `.tpl` is an exchange format. The tag manager's template editor imports and exports the whole
file, and that editor is the **only** thing that checks a permission is declared, previews the fields and
runs the `___TESTS___` scenarios. Generating the file breaks that round-trip: every trip through the editor
hands back a whole file, so either a splitter is written too - two tools that have to agree - or the parts go
stale. A generated-and-committed `.tpl` is also `dist/` again, in a directory with no freshness check on it.
The genuine risk in `gtm/` is not file size, it is the cookie being implemented twice with no shared code
path, and a build step does nothing about that.

**How to apply:** edit the `.tpl`, then paste it into the editor and save before calling it done. Revisit
this only if the sandboxed JS passes about 400 lines, the templates start sharing code, or there is a fourth
and a fifth - none of which is true today.
