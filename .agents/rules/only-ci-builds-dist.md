---
description: dist/ is the shipped product and only the release workflow ever writes it. The tooling enforces it
when: always
paths: ["dist/**", "webpack.config.js", ".github/workflows/**", "package.json"]
---

# Only CI builds `dist/`

**Nobody writes `dist/` by hand, and no session commits a build that lands in it.** The release workflow is
the only thing that should ever produce those bytes.

This replaces the older rule, which said to regenerate `dist/` yourself with `npm run build`. That was true
and is not any more.

## Why it is stricter here than in most repositories

`dist/` is not a convenience copy, it is **the product**. jsDelivr serves those exact bytes out of the git
tag, and the published tag manager template pins that URL in its own source. A `dist/` that no source
produces and no test covers is a shipped file.

It has already gone wrong once - defect 24 in [../design/issues.md](../design/issues.md). The committed
bundle was not what the source built, so anyone using the CDN got a loader that ignored its own
configuration. Nothing failed and nothing said why.

**A hand-run build that happens to be correct is still the problem**, because nothing distinguishes it from
one that is not. The point is not freshness, it is that one process owns the artifact.

## How it is enforced

Three build targets, and only one of them can reach `dist/`:

| Command | Writes to | Who runs it |
|---|---|---|
| `npm run build` | `build/lib/` - gitignored | you, and every session |
| `npm run build:website` | `website/js/` - gitignored | anyone previewing the site |
| `npm run build:dist` | `dist/` | **the release workflow** |

`npm run build` is the default target, so an absent-minded build cannot dirty `dist/`.

Two checks in the `dist` job of `.github/workflows/ci.yml` back it up, and they catch different things:

- **Freshness.** `npm run build:dist`, then `git diff --exit-code -- dist/`. Catches a `dist/` that is not
  what the source builds. It is honest because the build is byte-reproducible - two clean builds of the same
  tree came out identical again on 25 Aug 2026.
- **The commit guard.** `.github/scripts/dist-guard.sh` reads the commits the push carried and fails any that
  wrote `dist/` without being the release bot under a `release <version>` subject. Catches a `dist/` written
  by hand that happens to be correct - which freshness cannot see, because the tree is right and only the
  commit says who made it.

## What this means in a session

- **Do not run `npm run build:dist`.** `npm run build` is what you want, and it writes to `build/lib/`.
- **If a `dist/` diff appears in your working tree, that is a finding, not a chore.** Do not commit it, do
  not `git checkout` it away without saying so, and do not "just rebuild it to be safe". Say what you saw.

## The committed `dist/` is stale right now

Defect 24, still open, and **CI is red on it by design** until the first release regenerates it. That is the
freshness check doing its job, not a break. It is fixed by
[../plans/2-release-pipeline.md](../plans/2-release-pipeline.md)'s release workflow running, not by a working
tree - see [../plans/8-release-readiness.md](../plans/8-release-readiness.md).
