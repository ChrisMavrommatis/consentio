---
description: One pipeline from a triggered release to a CDN-served tag, with CI as the only thing that ever writes dist/
state: done - 25 Aug 2026, uncommitted. Not dispatched for real
waits-on: 1, which writes the rule this implements
---

# 2 - the release pipeline

Read [../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md) and the release rule first. They are
the constraints this whole shape exists to serve.

**This plan pushes no tag.** Build it, prove every job on a dry run, stop.

## What

- split the build targets so a local build cannot touch `dist/`
- the freshness check, and the guard that stops a human writing `dist/`
- one source for the version
- `CHANGELOG.md` and two small scripts
- `release.yml`, dry-run only
- every action pinned by SHA

## Why

There is no npm publish. The CDN serves this repository's committed `dist/` at a tagged URL, so **the tag is
the artifact** and `dist/` at that tag is the product. Two things follow and they drive everything below:

- **A tag is permanent.** The CDN caches it and sites pin it. There is no fixing one after the fact - the
  only remedy is another tag, and another round of template edits and gallery reviews.
- **Whatever is committed in `dist/` is what the world gets**, whether or not it is what `src/` builds.

That second one has already happened. Defect 24: the committed `dist/` was not what the source built, and
anyone using the CDN got a loader that ignored its own configuration. Nothing stops it happening again.

## Direction

**Split the build targets first, because every other check depends on it.**

`webpack.config.js` already switches destination on `--env build=dist|website`. Add a third and make the local
one the default:

| Command | Writes to | Who runs it |
|---|---|---|
| `npm run build` | `build/lib/` - covered by the existing `/build` gitignore | you, and every session |
| `npm run build:website` | `website/js/` - one shot, no watch | anyone previewing the site |
| `npm run build:dist` | `dist/` | **CI only** |

A local build then cannot dirty `dist/`, which is the only reason a rule like this survives contact. Note
`npm run watch` is watch-mode only today, so there is currently **no one-shot docs build at all** - that is
why `build:website` is in this table rather than plan 6's.

**Then the two guards.**

- **Freshness:** `npm ci && npm run build:dist && git diff --exit-code dist/`, on every push, not only on a
  tag. One step of YAML.
- **Human-commit guard:** fail if a push touches `dist/` and did not come from the release workflow. The
  freshness check catches *stale*; this catches *hand-written but coincidentally fresh*, which is the case
  that would otherwise sail through.

**The freshness check is only honest if the build is reproducible.** It is: two clean builds of the same tree
were byte-identical when re-measured on 24 Aug 2026 - see
[../memory/the-build-was-reproducible-once.md](../memory/the-build-was-reproducible-once.md). Re-measure
before wiring it to fail, and if it has stopped being true, find what made it non-deterministic rather than
loosening the check.

**One version.** Defect 20 - hand-written in three places. A CDN URL *is* a version string and a template
pins one, so this is not cosmetic. Have webpack read `package.json` and define the value at build time, so
`src/consentio.ts` stops carrying a literal. Then check at release time that the tag matches `package.json`;
a tag that disagrees with the bundle is a permanent lie.

**The changelog is the release body.** `CHANGELOG.md` at the root, Keep a Changelog, newest first, with an
`## [Unreleased]` section that accumulates. Two plain-Node scripts, no dependency:

| Command | Does |
|---|---|
| `node scripts/changelog.mjs check <section>` | exits non-zero if that section is missing or empty |
| `node scripts/changelog.mjs extract <section>` | prints that section's body |

A tag containing a hyphen (`v0.1.0-beta.1`) publishes `Unreleased`; any other publishes its own version with
the leading `v` stripped.

**Four details the parser has to get right**, settled 25 Aug 2026 - they are what make the printed body
round-trip exactly to what gets published:

1. **A section ends at the next *version* heading, not the next `## `.** Once a body is promoted it carries
   its own `## ` subheadings, and stopping at those truncates the release notes at their first subheading.
   A terminator is a `## ` whose first token parses as `Unreleased` or as semver.
2. **Accept `## 3.0.0`, `## [3.0.0]`, and either with a trailing ` - <date>`.** The file then follows Keep a
   Changelog exactly without the matcher caring which shape was used.
3. **Promote the headings.** In the file a release is `##` and its own sections are `###`, nested under the
   single `# Changelog`. A release body has no such parent and starts at `##`. Shift every heading by
   whatever brings the *shallowest* one to `##`, which preserves relative depth and needs nothing recorded.
4. **Leave headings inside a fenced code block alone.** They are content, not structure.

**`[Unreleased]` is renamed to the version as the last edit before the tag.** That rename is the thing that
makes `check <version>` pass, and it is why the notes gate can run first and cheaply.

**The pipeline.** `ci.yml` grows the two guards. `release.yml` is new and is a **`workflow_dispatch` taking a
version** - not a tag trigger. **Settled 25 Aug 2026.** One dispatch does everything, including making the
tag and the release:

```
you rename [Unreleased] to 0.1.0, bump package.json, push both to main
  |
  v
you dispatch release.yml with 0.1.0
  |
  v
gate      on main; semver; package.json agrees; changelog section exists;
          the tag does not exist here or on origin                              (seconds)
verify    npm ci, typecheck, build:dist, npm test, npm run test:plain           (minutes)
commit    dist/ + the changelog date, to main, as the release bot
tag       from that commit
publish   gh release create, body from CHANGELOG.md, dist files attached
```

**The version bump is the maintainer's, before the dispatch** - it is what lets `gate` refuse a version
`package.json` disagrees with rather than papering over it. `dry_run` is an input and defaults to on.

**Why not a tag trigger, which is the shape most people expect.** The CDN serves the git tree at the tag:
`consentio@0.1.0/dist/consentio.min.js` is whatever `dist/` held in the commit the tag points at. A workflow
that fires *after* the tag exists cannot change that commit, so it would publish whatever `dist/` happened to
be sitting there. That is precisely how `0.0.4` shipped stale. The dispatch builds and commits `dist/`
**first**, then tags that commit, so the tag can only ever point at a fresh build.

**The tag-exists gate is not optional.** `0.0.1` to `0.0.4` already exist on `origin`. A dispatch naming a
version that is already tagged must fail in the `exists` job, before anything is built and long before
anything is pushed - re-releasing a version silently is worse than not releasing at all. Check the local tag
list **and** `git ls-remote --tags origin`; a tag can be on the remote and not in the runner's checkout
depending on fetch depth.

**Cheapest check first** - a missing changelog section and an already-used version are both reported in
seconds, not after a full suite. **Nothing is irreversible until `commit`,** and nothing is public until
`tag`. Only the release workflow ever commits to `main`.

`gh release create` must tolerate an existing release: the GitHub web UI cannot create a bare tag, so tagging
from the site makes the release at the same time. Edit if it exists, create if it does not.

**Pin every action by SHA.** `ci.yml` uses `actions/checkout@v4` and `actions/setup-node@v4` today - floating
tags, both. Call npm directly; there is no task-runner layer in this repository and there should not be one.

**Node 24 everywhere**, decided 25 Aug 2026. `ci.yml` already runs 24; `package.json` says `>=22.15` and
moves up to `>=24`. The floor exists because the test harness needs Node's built-in type stripping, so this
is a real bump and not a formality. `.nvmrc` gets the same number in plan 7. Revisit only if 24 causes
trouble.

## Do not

**Do not push a tag, and do not run the dispatch for real.** **Do not bump the version.** **Do not hand-edit
`dist/`** - if a `dist/` diff appears in the working tree while you work, say so rather than tidying it.
**Do not touch `src/`** beyond removing the hard-coded version. **Do not commit, stage or push.**

## Deliverables

- [x] A local build cannot touch `dist/`.
      `npm run build && git status --porcelain dist/` is empty.
- [x] A stale `dist/` fails CI.
      Change one line in `src/`, do not rebuild, and watch the freshness job go red.
- [x] A hand-written `dist/` fails CI even when it is fresh.
      Say which job catches it and how it tells the two cases apart.
- [x] The build is reproducible enough for that check to be honest.
      Two clean builds of the same commit, diffed. **Prove it in this session, do not cite the note.**
- [x] `npm run build:website` produces the docs JS in one shot, no watch.
- [x] The version has one source and the bundle still reports it.
      `grep -rn "0\.0\.4" src/` returns nothing.
- [x] `CHANGELOG.md` exists with an `Unreleased` section and both script commands work.
      `node scripts/changelog.mjs check Unreleased` exits 0.
- [x] `release.yml` has been dry-run end to end with the tag and publish steps disabled.
      **Simulated locally, not on a runner** - see the note below.
- [x] A version that disagrees with `package.json` fails before anything is tagged.
- [x] Dispatching a version that is already tagged fails in seconds.
      Run it with `0.0.4`. It stops at the `exists` job, nothing is built, nothing is committed. Check the
      remote too, not only the runner's checkout.
- [x] Every action in every workflow is pinned by SHA.
      `grep -rnE "uses:.*@v[0-9]" .github/` returns nothing.
- [x] No tag was pushed.
      `git tag -l` is unchanged.

## What the dry run actually proved, 25 Aug 2026

`release.yml` has a `dry_run` input, default **on**. With it on, the commit, tag and publish steps are
skipped and everything else runs.

**No runner was used.** There is no `gh` here and nothing may be pushed, so the dry run was the same commands
in the same order against a throwaway copy of the tree - bumped to `0.1.0` and with `Unreleased` renamed, as
the maintainer would. Gate, verify, notes and the commit preview all pass; the date stamp was run separately
and printed `## [0.1.0] - 2026-08-25`.

**Unproven until a real dispatch:** that the YAML parses on GitHub's side, that `GITHUB_TOKEN` with
`contents: write` may push to `main` and to a tag under whatever branch protection is set, that
`gh release create` behaves as expected, that `${{ !inputs.dry_run }}` gates the three steps the way it
reads, and that the `main`-only ref check fires. **The first dispatch should be a dry run.**

## Two things that changed shape while building this

**The guard moved into `.github/scripts/dist-guard.sh`** rather than staying inline in the YAML. Inline, the
one thing that tells a hand-written `dist/` from a released one could never be exercised except by a real
push. As a script it has tests - `test/scripts/dist-guard.test.mts` builds a throwaway repository and feeds
it the commit shapes it has to sort.

**There is a third script, `scripts/version.mjs`.** The pipeline needs to refuse a version `package.json`
disagrees with before anything is built, and that check is not the changelog's job.
