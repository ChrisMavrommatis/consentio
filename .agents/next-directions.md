---
description: What to do next and what the maintainer has to decide. The board owns plan order; this holds what is not on it
---

# Next directions

Written 25 Aug 2026, at the end of the session that landed plan 3 and deleted plans 1, 2 and 9.

**[relaunch.md](relaunch.md) owns plan order and state.** This file does not repeat it. It holds what the
next sitting should actually do, and what is waiting on the maintainer.

## Where things stand

Plans 1, 2 and 9 are committed and deleted. Plan 3 is done and **uncommitted** - everything is in the
working tree, nothing was staged or pushed.

**Measured at the end of this session, by running the commands:**

- `npm run typecheck` clean. `npm test` 213 tests, 199 pass, 0 fail, 14 todo. `npm run test:plain` 62, 60,
  0 fail, 2 todo. Both exit 0.
- `git status --porcelain dist/` empty. `git tag -l` unchanged - `0.0.1` to `0.0.4`.
- `npm run build` writes `build/lib/` and leaves `dist/` alone.
- The register is at twenty-eight defects. **Open: 14, 15, 21, 24, 25, 26.** Everything else is fixed or
  closed by decision.
- The fourteen todos are defect 14 (ten), 15 (two) and 21 (two).

## The next sitting: plan 4

**[plans/4-accessibility.md](plans/4-accessibility.md).** Defects 14 and 15, and it is the last code work
before the docs site can be written against behaviour that will not move again. Plan 3 fixed defect 23, so
the switch label now keeps its input and the accessible name has somewhere to go.

**Plan 7 is the alternative** if a short sitting is what is available. It waits on nothing, and `SECURITY.md`
is the file a visitor checks before putting a third-party script in their `<head>`.

## Two things the maintainer has to know before the next commit

**The five release-pipeline paths were not in `224043b`.** `.github/scripts/`, `.github/workflows/release.yml`,
`CHANGELOG.md`, `scripts/` and `test/scripts/` were left untracked by that commit and are staged now.
`ci.yml` runs `.github/scripts/dist-guard.sh` and `package.json` names `scripts/`, so a push without them is
a red build for a reason nothing explains.

**The cookie contract changed.** Plan 3 nested the categories under `consents` to close defect 18. The board
and [design/delivery.md](design/delivery.md) both carry it. It was taken now because the tag manager template
still reads no cookie, so there is one implementation to change rather than two.

## Still open, and still the maintainer's

- **The site address.** Project-pages defaults are in `website/_config.yml`; a custom domain is likely and
  not chosen. Plan 6 needs the answer before it writes a deploy workflow.
- **The first dispatch of `release.yml`.** It has never run, not even dry. Five things about it cannot be
  tested off a runner - [plans/8-release-readiness.md](plans/8-release-readiness.md) lists them.
- **`1.0.0`.** `0.1.0` is settled. The second number is taken after `0.1.0` has been on a real site.
