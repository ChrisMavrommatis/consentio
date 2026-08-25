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

## The next sitting: plan 2

**[plans/2-release-pipeline.md](plans/2-release-pipeline.md), and nothing else.** It is the only thing that
turns "only CI writes `dist/`" from a rule people have to remember into a rule the tooling enforces. Until it
lands, every session is one absent-minded `npm run build` away from a dirty `dist/`, and `.github/workflows/ci.yml`
runs exactly that command on every push.

Its first step - splitting the build targets - is worth doing even if the rest slips. It is one change to
`webpack.config.js` and three lines in `package.json`, and it is what makes every later check possible.

**Before starting it, re-measure the reproducible build.** Plan 2's own deliverable says to prove it in the
session rather than cite [memory/the-build-was-reproducible-once.md](memory/the-build-was-reproducible-once.md).
It has still not been re-measured, in this session or the last, because doing so means running the build that
writes `dist/`. **Do it as the first act of plan 2, after the build split, so it can be measured into
`build/lib/` instead.**

## Then, in this order

1. **Plan 3 (lifecycle and DOM)** - the largest block of open defects, and it now carries defect 27. Read the
   open question below first.
2. **Plan 4 (accessibility)** - independent of 3, either order. The site demos the worst case today:
   `website/data/consentio-config.json` sets `consentRequired: true`, so the blocking overlay has no keyboard
   way out.
3. **Plan 5 (templates)** - after 3, because fixing defect 9 shrinks it.
4. **Plan 6 (docs site)** - after 3 and 4, so it documents fixed behaviour. The page it splits now carries
   icons and explicit `{#id}` anchors; both have to survive the split.
5. **Plan 7 (furnishing)** - any spare sitting. `SECURITY.md` is the one that costs something by being absent.
6. **Plan 8 (release readiness)** - last, and it decides nothing on its own.

## What is still the maintainer's

Settled 25 Aug 2026: **Node 24**; **`0.1.0` then `1.0.0`**; **the published site is the test ground**;
**only the release workflow commits `dist/`, to `main`**; **the release is one `workflow_dispatch` that
builds, commits, tags and publishes**, and refuses a version already tagged; **the four consent categories
are fixed.** The board carries the table.

**One left: where the site publishes.** Project-pages defaults are in `website/_config.yml`; a custom domain
is likely but not chosen. Plan 6 now says to keep the address in that one file, so settling it later costs
one line rather than a re-run.

**Nothing blocks plan 2 or plan 3 any more.**

## What the category decision changed

Defect 27 asked how the loader learns a site's own signal map. It does not have to: there is no site-specific
map. That closes 27 with no code in the loader.

It opens **defect 28** instead. The config layer still accepts a fifth category - `mergeConsents` writes any
key it is given - and `ConsentCategory.signals` still lets a site re-point a built-in one. Both have to go,
and going is a deletion rather than a feature. Plan 3 carries it.

It also narrows **defect 21**: a site cannot add a category, so the silent-denial trap is now only about
Consentio changing its own four, which is a breaking change and a version bump regardless. It survives as a
documentation item for plan 6.

## What this session changed that is easy to miss

- **`rules/releases-move-three-repositories.md` is now `releases-move-two-repositories.md`.** A plain `mv`,
  so git sees a delete and an untracked add. It is a rename.
- **The documentation site's headings carry explicit `{#id}` anchors.** Not decoration: kramdown builds ids
  from heading text, and adding an emoji would have silently broken every in-page link.
- **A comment pass ran over `src/`** - 117 comment lines to 96, no behaviour change. `git diff src/` is not
  empty, and that is deliberate; [plans/1-guidance-truth-up.md](plans/1-guidance-truth-up.md) records why.
- **`design/issues.md` no longer claims defect 24 is half-fixed.** It is not fixed at all.
