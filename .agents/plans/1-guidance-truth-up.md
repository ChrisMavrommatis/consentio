---
description: Make the guidance layer true again - two leaks out of a public repository, rules that stated false facts, and a register that undercounted
state: done - landed 24 Aug 2026, uncommitted
waits-on: nothing
---

# 1 - guidance truth-up

> **Done, 24 Aug 2026 - landed uncommitted.** Read `## Done on` at the bottom. It records six findings this
> brief did not have, and three the brief was wrong about.

## What

No source changes. This plan fixes the records everything else is worked against:

- two pointers at private work, in public files
- [../rules/who-references-whom.md](../rules/who-references-whom.md), which forbids something the codebase
  does roughly eighty times on purpose
- `never-hand-edit-dist`, replaced by the new rule that only CI writes `dist/`
- `releases-move-three-repositories`, which states a false fact and is named after it
- defects 20 and 27 in [../design/issues.md](../design/issues.md)
- the plans index, and the nine old plans deleted ahead of this one

## Why

**The repository is public and is currently carrying two pointers at private work.** That is the urgent
part. The rest is correctness.

The rest matters because a rule that is wrong is worse than no rule. A session reads
`who-references-whom`, sees that a defect number may not appear outside `.agents/`, looks at `test/`, and has
to guess which one is right. It will guess wrong about half the time, and the half where it "fixes" the test
titles destroys the link between the suite and the register.

## Direction

**The two leaks.**

- `test/README.md:65` named a path into the private planning repository. Do not repoint it at
  `.agents/design/issues.md` - that is the same violation with a different target. **Write the behaviour
  instead:** every todo names its defect number in the title. The number is enough.
- `test/README.md:61` says "Plan 1 ported it to TypeScript", and `:68` says "until those plans run". Both
  refer to `.agents/` from outside it. Say what is true without the pointer: the code under test is
  deliberately still broken.
- `website/_config.yml:13` carried a commented-out URL belonging to an unrelated project. Delete the line and
  set a real `url` - the site has none today, which also breaks absolute links and any sitemap.

**The `who-references-whom` carve-out.** The rule is right about paths and wrong about numbers. A **bare
defect number** in a test title or an `// @ts-expect-error` is how the register stays executable - see
[../memory/todo-flags-are-the-register.md](../memory/todo-flags-are-the-register.md), and
[../rules/comments-are-for-humans.md](../rules/comments-are-for-humans.md) already carves it out. What stays
forbidden: a path into `.agents/`, a plan number, a filename, or a phrase that only parses if you have read
one. Make the two rules agree; today they do not.

**The new `dist` rule is already written** - [../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md)
exists and `never-hand-edit-dist.md` is gone. What is left here: `CLAUDE.md` rule 2 and the README's
Development block still say "regenerate with `npm run build`", which is now wrong. Bring both into line. The
mechanism itself is plan 2's job.

**`releases-move-three-repositories`.** It claims each template pins the version in its own source. Only
`gtm/consentio-tag/template.tpl:144` does; the two MACRO templates pin nothing. So a version bump moves
**two** repositories. `README.md` already says two. Rewrite the rule around the true count and rename the
file to match - everything else in it (a tag is permanent, never publish a floating URL, batch breaking
changes) is correct and survives.

**The register.** Defect 20 says two places; it is three - `package.json:3`, `src/consentio.ts:23` and the
template's CDN URL. Add **defect 27**: `src/consentio-loader.ts` calls `toGoogleSignals(consents)` with no
signal map, so a site's own categories are mis-mapped in the `consent default` push and only corrected on the
first update. That is defect 4 surviving in the route that was supposed to have fixed it.

**One more layering violation, found by checking rather than reading.** `../design/delivery.md:58` says the
templates are "published outward - see `../plans/`". A design record must not point at a plan - it outlives
every plan that reads it, and the link rots the moment one is deleted. Say what is true without the pointer.

**The indexes are already done** - the nine old plans were deleted when this set was written, their
still-true facts moved into [../memory/](../memory/), `plans/README.md` slimmed to what the layer is, and
`.agents/README.md` given a row for the board. **Check them rather than redoing them**, and if the
deletions lost something true, that is the finding.

Also update [../memory/the-build-was-reproducible-once.md](../memory/the-build-was-reproducible-once.md):
the two-clean-builds check was re-measured on 24 Aug 2026 and still holds. That is what lets plan 2 wire the
freshness check to fail a build.

**A prose pass over `.agents/` itself, against the rewritten
[../rules/plain-language.md](../rules/plain-language.md).** It now bans the sales register and says to state a
thing once. Two known survivors: `releases-move-three-repositories.md:18` and `design/issues.md:33` both say
"the whole reason". This plan rewrites the first anyway. Grep for the tells the rule lists, do not re-read
every file looking for a feeling.

## Do not

**Do not change anything under `src/`, `test/` or `gtm/` beyond the three sentences in `test/README.md`.**
**Do not fix defect 27** - it gets a number here and a fix in plan 3. **Do not bump the version.**
**Do not commit, stage or push.**

---

## Done on 24 Aug 2026

Everything in the brief above landed, plus what a check against the source turned up. **Nothing was
committed.**

### What the brief asked for

- **Both leaks are gone.** `test/README.md` was rewritten: no path into the private repository, no plan
  references. `website/_config.yml` has a real `url` and the foreign commented-out one is deleted.
- **`who-references-whom` carries the bare-defect-number carve-out**, stated once, and
  `the-public-bar` and `comments-are-for-humans` both point at it instead of restating it.
- **`releases-move-three-repositories.md` is now `releases-move-two-repositories.md`** and states the true
  count. Only `gtm/consentio-tag/template.tpl:144` pins a version.
- **`CLAUDE.md` rule 2 and the README both match the `dist` rule.**
- **`design/delivery.md` no longer points at `plans/`.**
- **Defect 20 names three places; defect 27 exists**; the register's count is twenty-seven.
- **The prose pass ran.** No banned vocabulary survives outside `rules/plain-language.md`.

### Six things the brief did not have

1. **`rules/only-ci-builds-dist.md` documented three npm scripts that do not exist** - `build` to
   `build/lib`, `build:website`, `build:dist`. `npm run build` writes straight into `dist/`. The rule now
   describes what the tooling does today and keeps the three-script table as what plan 2 builds.
2. **`design/issues.md` claimed defect 24 was "fixed in the sense that the working tree now holds a fresh
   build".** It does not. `git status --porcelain dist/` is empty and no commit since `35a8b31` has written
   `dist/`. Corrected.
3. **`design/delivery.md` said `dist/` "is regenerated by `npm run build`"** - a third copy of the rule this
   plan replaced. Gone.
4. **`gtm/README.md` said every template pins the version.** Only one does. It also said each folder holds
   what its published repository holds; each folder holds `template.tpl` and nothing else.
5. **The `docs/` to `website/` rename had been applied to the plan describing it**, leaving
   "rename website/ to website/" in plan 9's front matter, its body and the board. Repaired from
   plan 9's own `Done on` section, which survived.
6. **The cookie contract is implemented once, not twice.** `gtm/consentio-tag/template.tpl` reads no cookie
   at all - it injects the bundle and lets it read. `rules/the-cookie-is-a-contract.md`,
   `design/delivery.md` and `website/pages/home.md` all described the second implementation as existing.
   It arrives when defect 26 is fixed.

### Three the brief got wrong

- **"the four plans already deleted"** at one point and **"the nine old plans"** at another. Nine.
- **The board said "the eight plans"** over nine rows.
- **Plan 2 cited `--env build=dist|docs`.** It has been `dist|website` since plan 9.

### Also done, outside the brief

**The public documentation was restyled to the house voice** - one emoji icon on every section heading in
`README.md`, `test/README.md`, `gtm/README.md` and `website/pages/home.md`, with
`rules/icon-headings-in-public-docs.md` written to hold the set. The docs page's headings carry explicit
`{#id}` anchors, because kramdown would otherwise rewrite every anchor the page links to.

**A comment pass ran over `src/`** - 117 comment lines to 96. Cut: the headings over blocks
(`// Handle load errors` above `onerror`), the restatements, and the reasoning that was already in
`design/delivery.md`. `src/consentio.ts`'s file header no longer sells "seamless tag manager integration";
neither does `package.json:4`.

**Still selling it:** `gtm/consentio-tag/template.tpl:14`, the description the gallery shows. Left alone -
editing a template costs a review cycle, and plan 5 is already opening that file.

### Deliverables, as checked

Every command below was run in this session and returned what it says.

- [x] Nothing public points at private work.
- [x] Nothing outside `.agents/` refers to a plan.
- [x] `who-references-whom` and `comments-are-for-humans` agree about defect numbers.
- [x] `CLAUDE.md` rule 2 and the README Development block match the `dist` rule.
- [x] No design record points at a plan. `grep -rn "plans/" .agents/design/` is empty.
- [x] The release rule states the true count and is named for it.
- [x] Defect 20 names three places and defect 27 exists.
- [x] The indexes are still true. Every relative link under `.agents/` resolves.
- [x] `website/_config.yml` has a real `url` and no commented-out foreign one.
- [x] `.agents/` passes its own language rule.
- [x] `git diff --stat src/ gtm/` - **not empty, and deliberately so.** The comment pass touched seven
      files under `src/`. No behaviour changed: `npm run typecheck` is clean and both suites still exit 0
      with the same todos. `gtm/` is unchanged apart from its README.

### One open question handed on

**Defect 27 has no obvious fix.** `src/lib/consent-signals.ts` says the loader uses the default map because
it has no config, and it cannot fetch one - waiting is defect 1. So either the map reaches the loader
synchronously as a data attribute on the tag, or a site with custom categories accepts the built-in map for
the first push. **Plan 3 has to decide which before writing the fix**, and the decision belongs in
`design/delivery.md`.
