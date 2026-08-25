---
description: What to do next and what the maintainer has to decide. The board owns plan order; this holds what is not on it
---

# Next directions

Written 25 Aug 2026, at the end of the session that landed plan 4 and deleted plan 3.

**[relaunch.md](relaunch.md) owns plan order and state.** This file does not repeat it. It holds what the
next sitting should actually do, and what is waiting on the maintainer.

## Where things stand

Plans 1, 2, 3 and 9 are committed and deleted. Plan 4 is done and **uncommitted** - everything is in the
working tree, nothing was staged or pushed by this session.

**Measured at the end of this session, by running the commands:**

- `npm run typecheck` clean. `npm test` 230 tests, 228 pass, 0 fail, 2 todo. `npm run test:plain` 62, 60,
  0 fail, 2 todo. Both exit 0.
- `git status --porcelain dist/` empty. `git tag -l` unchanged - `0.0.1` to `0.0.4`.
- `npm run build` writes `build/lib/` and leaves `dist/` alone.
- The register is at twenty-nine defects. **Open: 20, 21, 24, 25, 26, 29.** Everything else is fixed or
  closed by decision.
- The two todos left are defect 21's.

## The next sitting: plan 5 or plan 6

**Both are unblocked now.** [plans/5-gtm-templates.md](plans/5-gtm-templates.md) is the tag manager route,
which the suite does not cover at all; [plans/6-docs-site.md](plans/6-docs-site.md) can now be written
against behaviour that will not move again, because plan 4 was the last code work before it.

Plan 5 first, on the board's order: it is the only remaining place where the cookie contract has a second
implementation to write, and writing it late costs a gallery review.

**Plan 7 is the alternative** if a short sitting is what is available. It waits on nothing, and `SECURITY.md`
is the file a visitor checks before putting a third-party script in their `<head>`.

## Two things the maintainer has to know before the next commit

**The cookie contract changed in plan 3.** The categories are nested under `consents` to close defect 18.
The board and [design/delivery.md](design/delivery.md) both carry it. **Plan 5 must write the template's
reader against the nested shape** - it is the second implementation, and it does not exist yet.

**The register gained defect 29.** `TemplateRenderer.domSanitize` escapes `&`, `<` and `>` but not `"`, so a
placeholder inside an attribute value can break out of it. It is latent: every attribute placeholder in
`src/templates/` holds a category key, and the four keys are fixed. Fix it and the templates get their
attributes back - plan 4 had to set the switch's accessible name from `render()` to route around it.

## Still open, and still the maintainer's

- **The site address.** Project-pages defaults are in `website/_config.yml`; a custom domain is likely and
  not chosen. Plan 6 needs the answer before it writes a deploy workflow.
- **The first dispatch of `release.yml`.** It has never run, not even dry. Five things about it cannot be
  tested off a runner - [plans/8-release-readiness.md](plans/8-release-readiness.md) lists them.
- **`1.0.0`.** `0.1.0` is settled. The second number is taken after `0.1.0` has been on a real site.
