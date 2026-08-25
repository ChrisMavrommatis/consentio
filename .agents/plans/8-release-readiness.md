---
description: Assemble the evidence that the next tag is safe, run the checks no unit test can reach, and hand the version decision to the maintainer
state: blocked
waits-on: 1 through 7
---

# 8 - release readiness

**This plan decides nothing.** It assembles evidence and hands over. The maintainer picks the version and
triggers the release.

## What

The gate list, the by-hand checks no automated test reaches, and a written version recommendation.

## Why

A tag is permanent. The CDN caches it, sites pin it, and the published template pins it in its own source.
There is no fixing one after the fact - the only remedy is another tag, and another round of template edits
and gallery reviews, which are not instant and are not yours.

**This is not the first tag, and that changes the urgency.** `0.0.1` to `0.0.4` already exist on `origin`.
The `dist/` at `0.0.4` is the stale bundle - defect 24 - and the template pins it, so jsDelivr is serving a
loader that ignores its own configuration right now. The next tag is the remedy for a live fault, not a
first release.

**So everything that can be checked before a tag must be checked before it.** This plan is where that
becomes a list rather than a feeling.

## Direction

**The automated gates.** All of these already exist in the pipeline; this is where they are all run green at
once, on one commit:

- `npm ci`, `npm run typecheck`, `npm run build:dist`, `npm test`, `npm run test:plain`
- `git diff --exit-code dist/` - the committed output is what the source builds
- two clean builds byte-identical - the reproducibility the freshness check rests on
- `node scripts/changelog.mjs check <version>` - the release body exists
- the version in `package.json` matches what is about to be tagged

**The first dispatch must be a dry run, and it is the first time five things are tested at all.**
`release.yml` was proven on 25 Aug 2026 by running the same commands in the same order against a throwaway
copy of the tree - **no runner was used**, because there is no `gh` here and nothing may be pushed. Gate,
verify, notes and the commit preview all passed. These five were not exercised and cannot be, off a runner:

1. that the YAML parses on GitHub's side at all
2. that `GITHUB_TOKEN` with `contents: write` may push to `main` and push a tag, under whatever branch
   protection is set - see the release procedure in [../design/delivery.md](../design/delivery.md)
3. that `gh release create` behaves as expected against an existing release
4. that `${{ !inputs.dry_run }}` gates the commit, tag and publish steps the way it reads
5. that the `main`-only ref check fires

`dry_run` defaults to on, so a first dispatch costs nothing and settles 1, 4 and 5. **Do not turn it off to
save a run.**

**The checks nothing automated reaches.** `test/README.md` is honest about where the suite cannot go; this
is that list, executed:

1. **Defect 1, properly, for the first time.** A real page with the loader as a blocking `<script>` above a
   real container snippet, and Tag Assistant showing `consent default` on the dataLayer **before** the
   container loads. The unit tests check the properties that make correct ordering possible; that is a
   proxy and a weak one.
2. **The same, in the tag manager route**, which the suite does not cover at all.
3. **The two routes agree about one visitor.** Accept on a page using the direct route, then load a page
   using the template route with the same cookie. Both report the same `security_storage`. This is the
   failure mode that never fails loudly.
4. **Defect 12 on plain http.** Serve over `http://localhost`, accept, reload. The banner does not return.
5. **Keyboard only.** Unplug the mouse. With `consentRequired: true`, answer the banner and escape it.
6. **A second `Consentio.Create()`** in a console does not throw.

**The version, decided 25 Aug 2026: `0.1.0` now, `1.0.0` once it has proven itself.** Moving the consent
default into the loader is a breaking change - the loader tag has to stop being `async`, and the loader now
warns when it sees one - so `0.1.0` is the honest number for a release nobody has run in anger yet. `1.0.0`
is the second decision and it is not this plan's: it is taken after `0.1.0` has been on a real site.

A bump moves two repositories: this one, and the `consentio-tag` repository, which pins the version in its
CDN URL.

**What has to be true before the templates are published**, and it is easy to get the order wrong: a
published template pins a banner version, so **a template must never ship ahead of the tag it points at**.
Tag first, then update the templates, then submit them for review.

**Subresource integrity.** Once the first tag exists, the docs should carry an `integrity` hash for the
direct-route script tag. Only ever against an exact version - an SRI hash on a floating URL is a broken page
waiting for the next release. Have the release print the hashes so they can be pasted in.

## Do not

**Do not push a tag.** **Do not trigger the release workflow for real.** **Do not create the three template
repositories.** **Do not publish anything to the gallery.** **Do not bump the version.** **Do not commit,
stage or push.**

## Deliverables

- [ ] Every automated gate is green on one commit, and which commit is written down.
- [ ] `release.yml` has been dispatched at least once with `dry_run` on, **on a real runner**, and what it
      proved and did not prove is written down.
- [ ] All six by-hand checks are done and their results recorded - including the ones that failed, if any.
      **A check nobody ran is reported as not run, never as passed.**
- [ ] The two routes are confirmed to agree about the same visitor, by hand, on a real page.
- [ ] `0.1.0` is confirmed as still the right number, with its reasoning, and not applied.
      If anything found in this plan changes that, say so - the number was chosen before these checks ran.
- [ ] The publish order is written down: tag, then templates, then review.
- [ ] The SRI hashes are produced by the release and there is somewhere for them to go in the docs.
- [ ] No tag was pushed and no repository was created.
      `git tag -l` is unchanged.
