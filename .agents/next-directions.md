---
description: What to do next and what the maintainer has to decide. The board owns plan order; this holds what is not on it
---

# Next directions

Written 25 Aug 2026. Updated at the end of the session that deleted plan 4 and landed plan 6.

**[relaunch.md](relaunch.md) owns plan order and state.** This file does not repeat it. It holds what the
next sitting should actually do, and what is waiting on the maintainer.

## Where things stand

Plans 1, 2, 3, 4 and 9 are committed and deleted. Plan 4's accessibility work is in `main`; what it fixed,
compromised and found is defects 14, 15 and 29 in the register, and the two checks it could not run without a
browser are checks 5 and 7 in [plans/8-release-readiness.md](plans/8-release-readiness.md).

**Plan 6 is done and uncommitted.** The docs site is twelve pages, its own stylesheet, and
`.github/workflows/site.yml` - written, never dispatched, publish off. A second pass the same day re-pitched
the landing page and both install pages at someone installing it on their own site, and moved the technical
weight into two new pages rather than cutting it. Nothing was staged or pushed.

**Measured at the end of this session, by running the commands:**

- `npm run typecheck` clean. `npm test` 230 tests, 228 pass, 0 fail, 2 todo. `npm run test:plain` 62, 60,
  0 fail, 2 todo. Both exit 0.
- `git status --porcelain dist/` empty. `git tag -l` unchanged - `0.0.1` to `0.0.4`.
- `npm run build` writes `build/lib/` and leaves `dist/` alone. `npm run build:site` builds the JavaScript
  and then the site, from a tree with no `website/js/` and no `_site/`.
- `consentio-loader.min.js` is **4.6 KB** minified, 2.0 KB gzipped; `consentio.min.js` is **36.3 KB** and
  11.3 KB. The documentation had been saying 4.3 and 32 since before the port. Corrected everywhere.
- The register is at twenty-nine defects. **Open: 20, 21, 24, 25, 26, 29.** Everything else is fixed or
  closed by decision.
- The two todos left are defect 21's, and they are now the whole of what is open on 21 - its documentation
  half is done. **They describe something the code refuses**: one adds a fifth category, which
  `mergeConsents` drops since defect 28 was fixed. Deleting the flag would not make them pass.

## The next sitting: plan 5

[plans/5-gtm-templates.md](plans/5-gtm-templates.md) is the tag manager route, which the test suite does not
cover at all and where the cookie contract has a second implementation still to write. **Write its reader
against the nested shape**, and against defect 26 - the template sets no consent default today.

**It is writable, not finishable.** Every one of its checks is by eye on a real page in both routes. The page
now exists in the tree: `/try-it/tag-manager/` is the one page on the site with no loader, and
`gtm_container_id` in `website/_config.yml` is where a container ID goes. Both are empty of a container
because the container is the maintainer's.

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

- **Publishing the site.** `site.yml` is `workflow_dispatch` only and `publish` defaults to off. Before a
  real publish, **Pages has to be set to the GitHub Actions source in the repository settings** - nothing in
  a repository can set that. A dispatch with `publish` off is free and settles most of the rest.
- **A tag manager container for the site.** Three of plan 8's nine by-hand checks need one, and so does every
  check in plan 5. `gtm_container_id` in `website/_config.yml` is the one key to fill in.
- **The site address.** `https://chrismavrommatis.github.io/consentio/` is confirmed correct for project
  pages and is what `website/_config.yml` says. A custom domain is still likely and is now a one-line change
  in that file - nothing else carries the address.
- **The first dispatch of `release.yml`.** It has never run, not even dry. Five things about it cannot be
  tested off a runner - [plans/8-release-readiness.md](plans/8-release-readiness.md) lists them.
- **`1.0.0`.** `0.1.0` is settled. The second number is taken after `0.1.0` has been on a real site.
