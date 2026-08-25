---
description: What to do next and what the maintainer has to decide. The board owns plan order; this holds what is not on it
---

# Next directions

Written 25 Aug 2026. Updated at the end of the session that deleted plan 6 and landed plan 5.

**[relaunch.md](relaunch.md) owns plan order and state.** This file does not repeat it. It holds what the
next sitting should actually do, and what is waiting on the maintainer.

## Where things stand

Plans 1, 2, 3, 4, 6 and 9 are committed and deleted. **Plan 5 is done and uncommitted** - it is written and
cannot be finished here, because every box left needs a browser, a container or the template editor.

**Measured at the end of this session, by running the commands:**

- `npm run typecheck` clean. `npm test` 256 tests, 254 pass, 0 fail, 2 todo. `npm run test:plain` 78, 76,
  0 fail, 2 todo. Both exit 0.
- `git status --porcelain dist/` empty. `git diff --stat src/ package.json` empty. `git tag -l` unchanged -
  `0.0.1` to `0.0.4`.
- The register is at thirty-one defects. **Open: 20, 21, 24, 29.** Everything else is fixed or closed by
  decision. Plan 5 closed 25 and 26 and added 30 and 31, both fixed the same day.
- The two todos left are defect 21's, and they are now the whole of what is open on 21 - its documentation
  half is done. **They describe something the code refuses**: one adds a fifth category, which
  `mergeConsents` drops since defect 28 was fixed. Deleting the flag would not make them pass.

## The next sitting: plan 7

[plans/7-repo-furnishing.md](plans/7-repo-furnishing.md) is the last plan that can be worked without a
browser, a container or a runner. It waits on nothing, and `SECURITY.md` is the file a visitor checks before
putting a third-party script in their `<head>`.

**After it, nothing is left that a session can finish.** Plan 8 assembles evidence from checks only the
maintainer can run.

## Two things the maintainer has to know before the next commit

**There are two tag manager templates now, not three.** `consentio-tag-texts` is gone; its twenty-one
strings are fields on the tag, chosen by one **Text source** field. `gtm/consentio-tag/` and
`gtm/consentio-tag-cookies/` each hold a complete copy of what its published repository needs.
[design/delivery.md](design/delivery.md) carries the reasoning.

**The templates cannot be published yet.** The tag's CDN URL still pins `@0.0.4`, which is the stale bundle.
A template must never ship ahead of the tag it points at: tag `0.1.0`, then move the URL, then submit.
`metadata.yaml` records a version as a commit SHA in the published repository, so the `versions` list can
only be filled after that commit exists.

**The register gained defect 29.** `TemplateRenderer.domSanitize` escapes `&`, `<` and `>` but not `"`, so a
placeholder inside an attribute value can break out of it. It is latent: every attribute placeholder in
`src/templates/` holds a category key, and the four keys are fixed. Fix it and the templates get their
attributes back - plan 4 had to set the switch's accessible name from `render()` to route around it.

## Still open, and still the maintainer's

- **Publishing the site.** `site.yml` is `workflow_dispatch` only and `publish` defaults to off. Before a
  real publish, **Pages has to be set to the GitHub Actions source in the repository settings** - nothing in
  a repository can set that. A dispatch with `publish` off is free and settles most of the rest.
- **A tag manager container for the site.** Four of plan 8's ten by-hand checks need one, and so does every
  unticked box in plan 5. `gtm_container_id` in `website/_config.yml` is the one key to fill in.
- **Two repositories for the templates**, one per published template, each with `template.tpl`,
  `metadata.yaml`, `LICENSE` and `README.md` at its root and a main branch. The folders in `gtm/` are
  already laid out that way.
- **The site address.** `https://chrismavrommatis.github.io/consentio/` is confirmed correct for project
  pages and is what `website/_config.yml` says. A custom domain is **five** files now, not one: that config,
  `documentation:` in each template's `metadata.yaml`, and the "Full documentation" line in each template's
  `README.md`. A published template repository cannot read the site's config, so those four are copies by
  necessity - and two of them sit behind a gallery review. **Settle the domain before submitting.**
- **The first dispatch of `release.yml`.** It has never run, not even dry. Five things about it cannot be
  tested off a runner - [plans/8-release-readiness.md](plans/8-release-readiness.md) lists them.
- **`1.0.0`.** `0.1.0` is settled. The second number is taken after `0.1.0` has been on a real site.
