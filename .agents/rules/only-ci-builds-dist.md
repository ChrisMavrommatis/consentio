---
description: dist/ is the shipped product and only CI ever writes it. Today nothing enforces that, so it is enforced by hand
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

## What the build does today

**There is one build script and it writes straight into `dist/`.** `npm run build` is
`webpack --env build=dist`. `npm run watch` is `--env build=website` and is watch-mode only. There is no
local library build and no one-shot site build.

So the rule cannot be enforced by the tooling yet, and this is what it means in practice:

- **Do not run `npm run build` unless you mean to inspect the output**, and revert `dist/` afterwards.
- **`.github/workflows/ci.yml` runs `npm run build`**, so CI dirties `dist/` inside its own checkout on every
  push. Harmless - nothing commits it - but it is not the release build and it proves nothing about the
  committed bytes.
- **If a `dist/` diff appears in your working tree, that is a finding, not a chore.** Do not commit it, do
  not `git checkout` it away without saying so, and do not "just rebuild it to be safe". Say what you saw.

## What it becomes

[../plans/2-release-pipeline.md](../plans/2-release-pipeline.md) splits the targets so the ordinary build
cannot reach `dist/`:

| Command | Writes to | Who runs it |
|---|---|---|
| `npm run build` | `build/lib/` - gitignored | you, and every session |
| `npm run build:website` | `website/js/` - gitignored | anyone previewing the site |
| `npm run build:dist` | `dist/` | **CI only** |

**None of those three exist yet.** Until they do, the rule holds by hand.

**As of 24 Aug 2026 the committed `dist/` is stale** - defect 24, still open. It is fixed by the release
workflow regenerating it, not by a working tree.
