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
| 5 | [tag manager templates](plans/5-gtm-templates.md) | **written** 26 Aug 2026. Cannot be finished here | its remaining checks need the site published and a container on it |
| 7 | [repo furnishing](plans/7-repo-furnishing.md) | ready. **Next** | nothing. Fill a gap whenever there is a spare sitting |
| 8 | [release readiness](plans/8-release-readiness.md) | blocked | 5 and 7 |

**Plans 1, 2, 3, 4, 6 and 9 are gone**, deleted once their work was committed - all on 25 Aug 2026 except 6,
deleted on 26 Aug 2026 once the site commit landed. They were the guidance truth-up, the release pipeline,
lifecycle and DOM, accessibility, the repository restructure and the documentation site. What was still true
in them moved out first: the release procedure into
[design/delivery.md](design/delivery.md), the untested parts of the workflow into
[plans/8-release-readiness.md](plans/8-release-readiness.md), the layout decisions into
[memory/the-layout-is-deliberately-flat.md](memory/the-layout-is-deliberately-flat.md), and `git mv` into
[rules/never-commit.md](rules/never-commit.md). **Plan 6's four durable facts became four memory files** -
the site owning its stylesheet, kramdown eating indented HTML, the two `/try-it/` pages being test equipment,
and the site being written for a self-installer. Its `{:toc}` finding went into the icon rule.
Plan 3's two browser checks it could not run - defect 12 on
plain http, and a second `Consentio.Create()` - are checks 4 and 6 in
[plans/8-release-readiness.md](plans/8-release-readiness.md); everything else it recorded is in the register.
Plan 4's two it could not run - the accessible names in the tree, and keyboard-only operation - are checks 7
and 5 there, and what it fixed, compromised and found is defects 14, 15 and 29 in the register.
**The numbering does not shift** - 5 is still 5.

**Nothing here pushes a tag, creates a repository or publishes the site.** Those are the maintainer's, and
plan 8 is where they are handed over. `site.yml` deploys only when dispatched with `publish` on, and Pages
has to be switched to the GitHub Actions source by hand before that can work at all.

**The docs site is twelve pages, and every page of it is written for someone installing it themselves.**
The reasoning is in [memory/the-site-is-written-for-a-self-installer.md](memory/the-site-is-written-for-a-self-installer.md).
It also corrected two published figures that had gone stale since the port: the blocking loader is 4.6 KB,
not 4.3, and `consentio.min.js` is 36.3 KB, not 32. [design/delivery.md](design/delivery.md) carries the
re-measurement.

**Plan 5 landed on 26 Aug 2026, and two decisions during it changed the product's shape.** There are now
**two** tag manager templates, not three - `consentio-tag-texts` is gone and its twenty-one strings are
fields on the tag, because a third published template costs a repository and a gallery review cycle and
bought nothing back. And the strings are chosen by one **Text source** field: built-in English, custom
fields pre-filled with that English, or any Tag Manager variable. **Runtime language packs were proposed and
refused** - a translation is text to download and paste, not a service to keep running.
[design/delivery.md](design/delivery.md) holds both, and what was checked against Google rather than
remembered is in the plan.

**Re-verified 26 Aug 2026, after plan 5.** Typecheck clean, `npm test` 256/254/0 fail/**2** todo,
`npm run test:plain` 78/76/0 fail/2 todo, `git status --porcelain dist/` empty, `git diff --stat src/
package.json` empty, `git tag -l` unchanged. Plan 5 touched no source; the extra tests are the cookie
contract fixture and the check that the template has not drifted from it.

**The register is at thirty-one, and defect 21 is half closed.** Plan 5 closed 25 and 26 and found 30 and
31 while writing - a template field reaching the config as a string, and one category's description silently
dropped. Both fixed the same day.

**Defect 21's documentation half is done** - the site's versioning page carries it. **Its two `todo` flags
are what is left**, and they now describe something
the code refuses: one of them adds a fifth category, which `mergeConsents` has warned on and dropped since
defect 28 was fixed. Deleting the flag would not make them pass. Retiring or rewriting them is a change to
the suite that nobody has scoped. Defect 29 is plan 4's and is still latent.

## Settled by the maintainer, 25 Aug 2026

| Question | Answer |
|---|---|
| Node floor | **24.** `package.json` moves to `>=24`, `.nvmrc` and every workflow say 24 |
| First version off this work | **`0.1.0`**, then `1.0.0` once it has run on a real site |
| Where the by-hand checks happen | **the published documentation site.** It is the fixture, not a demo |
| Site address | **still open, and no longer blocking.** `https://chrismavrommatis.github.io/consentio/` is confirmed correct for project pages. `website/_config.yml` is the only place the *site* writes it, but plan 5 put it in four more: `documentation:` in each `metadata.yaml` and the "Full documentation" line in each template `README.md`. Those are published-repo files and cannot read the config, so a custom domain is **five** files, two of them behind a gallery review |
| Who commits `dist/` | **the release workflow, to `main`, and nothing else** |
| Release trigger | **`workflow_dispatch` with a version.** It builds, commits `dist/` to `main`, then tags and releases. It also refuses a version that is already tagged |
| Consent categories | **the four are fixed.** A site cannot add, remove or re-point one |

## Settled by the maintainer, 26 Aug 2026

| Question | Answer |
|---|---|
| How many published templates | **two.** The strings moved onto the tag; a third repository cost a review cycle and bought nothing back |
| Where the banner's wording comes from | **one `Text source` field** - built-in English, custom fields pre-filled with that English, or any Tag Manager variable. No blending |
| Translations | **downloaded and pasted, never served.** A runtime language pack was proposed and refused: a translation is text, not a service that can fail |
| Settings fetched from the site's own URL | **closed.** No permission can be pre-approved for a domain unknown at publish time |
| The cookie name on the tag manager route | **fixed at `consentio`**, for the same reason. The direct route keeps `data-cookie-name` |

## Why this order

**The guidance, the pipeline and the restructure went first**, in that order, and they are why the rest is
cheap. The rules everything else is worked under are true now; a tag is permanent, so every check that could
be automated before the first one was; and the paths every later plan names were settled before those plans
were written rather than after.

**3 and 4 before 6.** Documentation written against broken behaviour has to be written twice. All three have
run.

**6 before 5 reversed the original order, and it was right.** Plan 3 shrank plan 5 by fixing defect 9, so 5
became writable - but not finishable. Every one of its checks is "by eye, on a real page in both routes", and
the page is the published site. That page now exists in the tree, and 5 is written against it.

**Nine deliverables are stuck on the same thing, and it is four dispatches away.** Plans 3, 4, 5 and 6 each
left work honestly marked *not run - there is no browser here*: defect 12 on plain `http`, a second
`Consentio.Create()` in a console, the accessible names in the accessibility tree, keyboard-only operation
with `consentRequired: true`, the cookie reset control, `site.yml` itself, the tag manager route's consent
default, the two routes agreeing about one visitor, and both templates saved in the editor. They are the ten
checks in [plans/8-release-readiness.md](plans/8-release-readiness.md). **Publishing the site turns most of
them from proxies into checks**; the last one needs the template editor, which no repository can reach.

So: **7, then 8.** Plan 5 is written and its remaining boxes are all somebody standing in front of a
browser: `/try-it/tag-manager/` is the one page on the site with no loader, and `gtm_container_id` in
`website/_config.yml` is where a container ID goes. They are checks 2, 3 and 10 in
[plans/8-release-readiness.md](plans/8-release-readiness.md).

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
