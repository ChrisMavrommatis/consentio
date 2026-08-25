---
description: The relaunch board - the order the nine plans are worked in, what gates what, and where it currently stands
---

# The relaunch board

**One place that says what is next.** Each row is one plan, one sitting, one deliverable. Work them top to
bottom; the order is a dependency order, not a preference.

Each plan cites defect numbers from [design/issues.md](design/issues.md) and carries none of its own.

## State

| # | Plan | State | Gated by |
|---|---|---|---|
| 1 | [guidance truth-up](plans/1-guidance-truth-up.md) | **done** 24 Aug 2026, uncommitted | nothing |
| 2 | [release pipeline](plans/2-release-pipeline.md) | ready | 1, now done. **Next** |
| 3 | [lifecycle and DOM](plans/3-lifecycle-and-dom.md) | ready | 2, so the fix lands behind a green gate |
| 4 | [accessibility](plans/4-accessibility.md) | ready | 2. Independent of 3 - either order |
| 5 | [tag manager templates](plans/5-gtm-templates.md) | ready | 3, for defect 9 |
| 6 | [docs site](plans/6-docs-site.md) | ready | 3 and 4, so it documents fixed behaviour |
| 7 | [repo furnishing](plans/7-repo-furnishing.md) | ready | nothing. Fill a gap whenever there is a spare sitting |
| 8 | [release readiness](plans/8-release-readiness.md) | blocked | everything above |
| 9 | [repo restructure](plans/9-repo-restructure.md) | **done** 24 Aug 2026, uncommitted | ran first, ahead of 1 |

**Nothing here pushes a tag or creates a repository.** Those are the maintainer's, and plan 8 is where they
are handed over.

**Re-verified 25 Aug 2026.** Typecheck clean, `npm test` 200/160/0 fail/40 todo, `npm run test:plain`
62/59/0 fail/3 todo, `git status --porcelain dist/` empty, defects 6-27 all still present at the symbols the
register names. The build was **not** re-run - it writes straight into `dist/` - so the reproducibility
claim plan 2 rests on is still unproven this side of that plan.

## Settled by the maintainer, 25 Aug 2026

| Question | Answer |
|---|---|
| Node floor | **24.** `package.json` moves to `>=24`, `.nvmrc` and every workflow say 24 |
| First version off this work | **`0.1.0`**, then `1.0.0` once it has run on a real site |
| Where the by-hand checks happen | **the published documentation site.** It is the fixture, not a demo |
| Site address | **still open.** Project-pages defaults are in `_config.yml`; a custom domain is likely |
| Who commits `dist/` | **the release workflow, to `main`, and nothing else** |
| Release trigger | **`workflow_dispatch` with a version.** It builds, commits `dist/` to `main`, then tags and releases. It also refuses a version that is already tagged |
| Consent categories | **the four are fixed.** A site cannot add, remove or re-point one |

## Why this order

**1 first, because everything else is done under those rules** and two of them were wrong. It is done: the
two pointers at private work are gone, the release rule is renamed and states the true count, the `dist`
rule describes what the tooling actually does, and defect 27 is in the register.

**2 before any fix.** A tag is permanent - the CDN caches it and sites pin it - so every check that can be
automated before the first tag pays for itself on every release after. It also implements the rule that only
CI writes `dist/`, which changes how every later plan is verified.

**9 ran first.** It renamed `docs/` to `website/`, split the two build outputs and deleted `config/`. Nothing
depended on it, but everything written after it names paths, so landing it late would have meant writing
those paths twice. Its number is 9 only because 1-8 were written first.

**3 and 4 before 6.** Documentation written against broken behaviour has to be written twice.

**5 after 3.** The template's `setInWindow` call exists to cover for **defect** 9 in the register - not plan
9; the collision is unfortunate. Plan 3 fixes that defect, and the template's job gets smaller for it.

**8 last, and it decides nothing on its own.** It assembles the evidence; the maintainer decides the version
and pushes the tag.

## Two things settled on 25 Aug 2026 that changed a plan

**The release trigger.** Creating a release by hand cannot work here, because the CDN serves the git tree at
the tag and a workflow firing after the tag exists cannot change the commit it points at. So it is one
`workflow_dispatch` that builds, commits `dist/` to `main`, tags that commit and creates the release. Plan 2
carries the job list. It also gained a gate: `0.0.1` to `0.0.4` already exist on `origin`, so a dispatch
naming an existing version must fail before anything is built.

**The four consent categories are fixed.** A site gets `strictly_necessary`,
`preferences_functionality`, `statistics_performance` and `marketing_advertising`, and can change every
string but no key and no signal routing. That **closes defect 27 with no code in the loader** - its built-in
map is correct by definition - and opens **defect 28**, because nothing in the config layer enforces the
rule yet. Plan 3 now carries 28 instead of 27. The reasoning is in
[design/delivery.md](design/delivery.md).

## The thing most likely to be got wrong

**Only CI writes `dist/`** - see [rules/only-ci-builds-dist.md](rules/only-ci-builds-dist.md). If a `dist/`
diff appears in a working tree, that is a finding: do not commit it and do not tidy it away.

**The committed `dist/` is stale** - re-checked 25 Aug 2026: `dist/consentio-loader.js` still reads
`consentioLoaderDebug` where the source reads `dataset.debug`. That is defect 24, **and it is already
shipped**: tags `0.0.1` to `0.0.4` are on `origin`, `dist/` at `0.0.4` is byte-identical to this stale one,
and the template pins `@0.0.4` in its CDN URL. The broken loader is live on jsDelivr today.
That is not fixed by rebuilding it in a working tree. Plan 2 adds the check that catches it and the release
workflow that regenerates it; until then, leave it alone.

**And `npm run build` writes straight into `dist/` today** - there is no local build target yet, so the rule
is enforced by hand until plan 2 lands. `.github/workflows/ci.yml` runs it on every push, inside its own
checkout.

## Delete when

**A plan is deleted once its deliverables are all ticked and its work is committed.** Move anything still
true out of it into [memory/](memory/) first - that is what that layer is for. The register in
[design/](design/) is never deleted with a plan.
