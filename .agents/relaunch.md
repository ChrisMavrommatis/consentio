---
description: The relaunch board - the order the remaining plans are worked in, what gates what, and where it currently stands
---

# The relaunch board

**One place that says what is next.** Each row is one plan, one sitting, one deliverable. Work them top to
bottom; the order is a dependency order, not a preference.

Each plan cites defect numbers from [design/issues.md](design/issues.md) and carries none of its own.

## State

| # | Plan | State | Gated by |
|---|---|---|---|
| 4 | [accessibility](plans/4-accessibility.md) | **done** 25 Aug 2026, uncommitted | nothing |
| 5 | [tag manager templates](plans/5-gtm-templates.md) | ready. **Next** | nothing. Plan 3 fixed defect 9 |
| 6 | [docs site](plans/6-docs-site.md) | ready | nothing. 4 has run, so it documents fixed behaviour |
| 7 | [repo furnishing](plans/7-repo-furnishing.md) | ready | nothing. Fill a gap whenever there is a spare sitting |
| 8 | [release readiness](plans/8-release-readiness.md) | blocked | everything above |

**Plans 1, 2, 3 and 9 are gone**, deleted once their work was committed - 1, 2 and 9 on 25 Aug 2026, 3
right after. They were the guidance truth-up, the release pipeline, lifecycle and DOM, and the repository
restructure. What was still true in them moved out first: the release procedure into
[design/delivery.md](design/delivery.md), the untested parts of the workflow into
[plans/8-release-readiness.md](plans/8-release-readiness.md), the layout decisions into
[memory/the-layout-is-deliberately-flat.md](memory/the-layout-is-deliberately-flat.md), and `git mv` into
[rules/never-commit.md](rules/never-commit.md). Plan 3's two browser checks it could not run - defect 12 on
plain http, and a second `Consentio.Create()` - are checks 4 and 6 in
[plans/8-release-readiness.md](plans/8-release-readiness.md); everything else it recorded is in the register.
**The numbering does not shift** - 4 is still 4.

**Nothing here pushes a tag or creates a repository.** Those are the maintainer's, and plan 8 is where they
are handed over.

**Re-verified 25 Aug 2026, after plan 4.** Typecheck clean, `npm test` 230/228/0 fail/**2** todo,
`npm run test:plain` 62/60/0 fail/2 todo, `git status --porcelain dist/` empty, `git tag -l` unchanged.
**The two todos left are defect 21's**, and they are a documentation item for plan 6.

**The register is at twenty-nine.** Plan 4 added **29**: `TemplateRenderer.domSanitize` does not escape `"`,
so a placeholder inside an attribute value can break out of it. Latent - every attribute placeholder holds a
category key and the four keys are fixed.

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

**The guidance, the pipeline and the restructure went first**, in that order, and they are why the rest is
cheap. The rules everything else is worked under are true now; a tag is permanent, so every check that could
be automated before the first one was; and the paths every later plan names were settled before those plans
were written rather than after.

**3 and 4 before 6.** Documentation written against broken behaviour has to be written twice. Both have run.

**5 after 3, which has run.** The template's `setInWindow` call exists to cover for **defect** 9 in the
register. Plan 3 fixed that defect, so the template's job is smaller than it was written to be.

**8 last, and it decides nothing on its own.** It assembles the evidence; the maintainer decides the version
and pushes the tag.

## Two things settled on 25 Aug 2026 that changed a plan

**The release trigger.** Creating a release by hand cannot work here, because the CDN serves the git tree at
the tag and a workflow firing after the tag exists cannot change the commit it points at. So it is one
`workflow_dispatch` that builds, commits `dist/` to `main`, tags that commit and creates the release. The job
list is in [design/delivery.md](design/delivery.md). It also gained a gate: `0.0.1` to `0.0.4` already exist
on `origin`, so a dispatch naming an existing version must fail before anything is built.

**The four consent categories are fixed.** A site gets `strictly_necessary`,
`preferences_functionality`, `statistics_performance` and `marketing_advertising`, and can change every
string but no key and no signal routing. That **closes defect 27 with no code in the loader** - its built-in
map is correct by definition - and opens **defect 28**, because nothing in the config layer enforces the
rule yet. Plan 3 carried 28 instead of 27 and closed it. The reasoning is in
[design/delivery.md](design/delivery.md).

## The cookie contract changed on 25 Aug 2026

Plan 3 closed defect 18 by **nesting the categories under a `consents` key** instead of leaving them as
siblings of `version`. There is no flat shape in which a category keyed `version` and the version itself both
survive.

`{"version":1,"consents":{...}}`. The full spec is in [design/delivery.md](design/delivery.md).

**Why now:** `gtm/consentio-tag/template.tpl` reads no cookie at all yet - that is defect 26 and plan 5's
job. Until it does there is one implementation. Change the shape after plan 5 and it costs two, in two
languages, plus a gallery review. **Plan 5 must write its reader against the nested shape.**

A value stored in the old flat shape reads as no stored answer, so the visitor is asked again - the same
outcome the contract already gives a version mismatch.

## The thing most likely to be got wrong

**Only CI writes `dist/`** - see [rules/only-ci-builds-dist.md](rules/only-ci-builds-dist.md). If a `dist/`
diff appears in a working tree, that is a finding: do not commit it and do not tidy it away.

**The committed `dist/` is stale** - re-checked 25 Aug 2026: `dist/consentio-loader.js` still reads
`consentioLoaderDebug` where the source reads `dataset.debug`. That is defect 24, **and it is already
shipped**: tags `0.0.1` to `0.0.4` are on `origin`, `dist/` at `0.0.4` is byte-identical to this stale one,
and the template pins `@0.0.4` in its CDN URL. The broken loader is live on jsDelivr today.
That is not fixed by rebuilding it in a working tree. The check that catches it and the release workflow
that regenerates it both exist; until a release runs, leave it alone.

**`npm run build` can no longer reach `dist/`** - it writes to `build/lib/`. `npm run build:dist` is the
release workflow's, and `ci.yml` fails a push whose `dist/` disagrees with `src/` or whose `dist/` was
written by hand.

**So CI is red now, and that is the check working.** The committed `dist/` is stale, so the freshness job
fails on every push until a release regenerates it. Do not fix it in a working tree.

## Delete when

**A plan is deleted once its deliverables are all ticked and its work is committed.** Move anything still
true out of it into [memory/](memory/) first - that is what that layer is for. The register in
[design/](design/) is never deleted with a plan.
