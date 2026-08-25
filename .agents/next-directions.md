---
description: What to do next and what the maintainer has to decide. The board owns plan order; this holds what is not on it
---

# Next directions

Written 24 Aug 2026, at the end of the session that landed plan 1 and the documentation restyle.

**[relaunch.md](relaunch.md) owns plan order and state.** This file does not repeat it. It holds two things
the board has no room for: what the next sitting should actually do, and the four decisions that are the
maintainer's and are currently blocking nothing only because nobody has hit them yet.

## Where things stand

Plans 1 and 9 are done and uncommitted. Everything is in the working tree; nothing was staged or pushed.

**Re-verified 25 Aug 2026**, by running the commands rather than citing them:

- `npm run typecheck` clean. `npm test` 200 tests, 160 pass, 0 fail, 40 todo. `npm run test:plain` 62, 59,
  0 fail, 3 todo. Both exit 0.
- `git status --porcelain dist/` is empty and `dist/` is still the stale bundle - defect 24.
- The register is at twenty-eight defects. Defects 1 to 5 are fixed and 27 is closed by decision; the rest
  are open, each spot-checked at the symbol the register names.
- **The register's `file:line` references were re-checked line by line and corrected** to the post-port
  source. Defect 27 is at `src/consentio-loader.ts:89`, not `:97`. Plans 3 and 4 no longer carry line
  numbers at all - they had drifted within a day, which is what
  [rules/one-fact-one-place.md](rules/one-fact-one-place.md) exists to stop.
- **The 40 todos are defects 6-19 and 21-23 only.** Defects 20 and 27 have no test. 20 is single-sourced by
  plan 2; 27 needs one written, and plan 3 now says so.

## The next sitting: plan 3

**[plans/3-lifecycle-and-dom.md](plans/3-lifecycle-and-dom.md).** Plan 2 is done, so the fixes now land
behind a gate that can prove they reached `dist/`.

**Plan 2, for the record.** `npm run build` writes to `build/lib/` and cannot reach `dist/`;
`npm run build:dist` is the release workflow's. `ci.yml` has both guards - freshness, and a commit guard
that fails a `dist/` written by hand however fresh it is. `release.yml` is a `workflow_dispatch` taking a
version, with a `dry_run` input defaulted on; **it has never been dispatched, not even dry**. The version has
one source, `package.json`, substituted into the bundle by webpack. The build was re-measured and is still
byte-reproducible.

**CI is red until the first release**, because the committed `dist/` is stale - defect 24. That is the
freshness check working. Do not fix it in a working tree.
