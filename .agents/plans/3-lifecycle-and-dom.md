---
description: The lifecycle, DOM and small-stuff defects - the dead removeEventListener calls, the constructor DOM reads, the cookie on plain http
state: done - 25 Aug 2026, uncommitted
waits-on: nothing
---

# 3 - lifecycle and DOM

> **Done, 25 Aug 2026 - landed uncommitted.** Read `## Done on` at the bottom. It records one change to
> the cookie contract the brief did not price, and two deliverables that could not be checked here.

Read [../design/issues.md](../design/issues.md) for the register. **Defects 6-13, 16-23 and 28.** Mostly
mechanical. Independent of plan 4 - either order.

**Defect 27 is closed and needs no code.** The four categories were fixed on 25 Aug 2026, so the loader's
built-in map is correct by definition. Defect 28 replaces it: making the config refuse a fifth category.

**The register carries every `file:line`; this plan carries none.** They were duplicated here once and drifted
within a day - see [../rules/one-fact-one-place.md](../rules/one-fact-one-place.md). Filenames below, lines
in the register, which was re-checked against the source on 25 Aug 2026.

## What

Every remaining defect in the banner that is not accessibility. Plus direction change A below, which removes
a whole class of bug rather than one instance.

## Why

None of these is the blocker - that was defect 1 and it is fixed. But they are what a reader finds when they
open the source to decide whether to put this on their site, and several of them are live rather than
latent: the cookie really is discarded on `http://localhost`, a second `Consentio.Create()` really does
throw, and an `alwaysOn` category really does leave the element writing `checked` into a detached node.

## Direction

**Defects 6 and 7 interact, and this is the one that needs care.**

`disconectedCallback` - one `n` - is misspelled in `consentio-app.ts` and `consentio-bar.ts` **only**. The
other three elements spell it correctly, which means their broken `removeEventListener` calls are already
live no-ops rather than dead code. So:

- **Fix the spelling without fixing the bind and you turn a dead function into a live leak.** Do both,
  together.
- `this.removeEventListener('x', this.fn.bind(this))` builds a **new** function object every call, so it
  never matches what was added. Bind each handler once in the constructor, store the reference, and add and
  remove *that*.

Every element is affected - all five, and the register lists each line.

**The rest, with the trap named where there is one.**

- **8, 9** - guard `customElements.define` on `customElements.get(name)`; make `Consentio.Create()` set
  `window.ConsentioInstance`. These are one pair: 9 is *why* 8 bites, because the loader's double-init guard
  and the public entry point cannot see each other. Fixing 9 also shrinks plan 5's job.
- **10** - `document.body.appendChild` in `consentio.ts` runs from the constructor. In `<head>`,
  `document.body` is null, and the loader appends the bundle with no `defer`, so this is live.
- **11** - four constructors read the DOM: `consentio-bar.ts`, `consentio-modal.ts`,
  `consentio-consent-item.ts`, `consentio-floating-button.ts`. It works today only because `renderNode`
  builds from an inert `<template>`, so upgrade is deferred until insertion. Move them to
  `connectedCallback`.
- **12** - `cookies.ts` sets `secure: true` unconditionally. Set it from `location.protocol === 'https:'`;
  the serialiser further down the same file already skips falsy attributes.
- **13** - `render()` builds fresh nodes with no inline `display`, but `initState()` only runs from
  `connectedCallback`, so bar and modal end up visible at once. Re-apply visibility after a re-render.
- **16-19, 21** - the dead `{{ consentItems }}`; `data[p1] || ''` dropping falsy values; the `version` key
  collision in `writeConsents`; the unguarded `this.logger.log(event, 'info')`; the silent-denied trap when a
  category is added without a version bump. For 21 a warning is enough - the fix is documentation, in plan 6.
- **22** - `consentio-loader.ts` never null-checks `getAttribute('src')`. Both `@ts-expect-error` lines in
  that file go with it.
- **23** - `consentio-consent-item.ts` clears the switch label with `innerHTML = ''`, which deletes the
  `<input>` the constructor cached. `readState()` returns `'granted'` before it reads the input, which is
  the only reason this is invisible today. Fixing 11 does not fix this on its own.
- **20** - the version is already single-sourced from `package.json`, substituted at build time. Nothing to
  do here but do not re-introduce a literal.

**Defect 28, and direction change A - these are the two worth thinking about.**

**28 - enforce the four categories.** Settled 25 Aug 2026: a site gets four and cannot add, remove or
re-point one. The code does not know that yet. `mergeConsents` writes any key it is handed, so a fifth
category appears and can never reach a Google signal; and `ConsentCategory.signals` lets a site re-point a
built-in one, which is how the loader ends up granting a signal the site never routed anything to.

Three changes, and they are a deletion rather than a feature:

- drop `signals` from `ConsentCategory` and `ConsentCategoryOverride`
- `mergeConsents` merges into the four known keys only, and warns on anything else instead of adding it
- `signalMapFrom()` then returns the same thing every time - take it out, and let `toGoogleSignals` use its
  default

**Warn, do not throw.** A site with a stray fifth category in its config should get a console warning and a
working banner, not a blank page. The rest of the config is still good.

**Delete the documentation that advertises the removed feature, in the same diff.** `website/pages/home.md`
teaches people to do the thing this plan forbids. Four places, and this plan owns all four - shipping the
removal while the docs still sell it is worse than either alone:

| In `website/pages/home.md` | What to do |
|---|---|
| the `signals` row in the `consents` table | delete the row |
| **Adding your own category**, its prose and its JSON example | delete the section |
| "Adding a category is a consent change..." | delete |
| **Do not name a category `version`** | delete - a site cannot name a category at all now |
| **Versioning stored consent**, the "when you add a category" bullets | rewrite: only Consentio changes the four, and that is a version bump |

State instead, once: **the four categories are fixed; you can change every string, not the set.** Do not
restructure the page while you are in there - that is plan 6, and this is a deletion plus one sentence.

**The reasoning lives in [../design/delivery.md](../design/delivery.md), not here.** It records where the
four come from and why fixing them is what makes the loader possible at all.

**A - let the banner inherit the loader's cookie identity.** `data-cookie-name` and `data-version` on the
tag, and `cookieName` and `version` in the config JSON, are two sources for one fact. Set them differently
and the loader and the banner read different cookies, or the same cookie at different versions, and the
banner appears for someone who already answered. The docs warn about this instead of preventing it.

The loader already publishes what it resolved on `window.ConsentioDefault` - `{ cookieName, version,
consents, consentGiven }`. Have `Consentio`'s constructor **prefer those values when present**, and fall
back to the config JSON when the loader did not run. One direction, no new config surface, and the footgun
stops existing. The tag manager route never runs the loader, so the fallback is the path it keeps taking.

**While you are in every one of these files, do the comment pass.**
[../rules/comments-are-for-humans.md](../rules/comments-are-for-humans.md) now says one line then stop, and
[../rules/plain-language.md](../rules/plain-language.md) lists the vocabulary to avoid. Three comments in
`src/lib/consent-signals.ts` and the block in `consentio-app.ts` run long. Cut or move to
[../design/](../design/) - do not rewrite them into shorter essays.

## Do not

**Do not rewrite the UI components.** **Do not touch defects 14 and 15** - that is plan 4. **Do not bump the
version.** **Do not add a fetch or a dependency.** **Do not write `dist/`.** **Do not commit, stage or push.**

## Deliverables

- [x] The `todo` flags for defects 6-13, 16-19 and 22-23 are gone and those tests pass.
      Defect 21 stays open - the decision to fix the four categories narrowed it to a documentation item
      for plan 6.
      `npm test` and `npm run test:plain` green, with the todo count down from 40 to **14**. The brief
      said 12 and was wrong: defect 21's two todos stay open alongside plan 4's twelve. **Defects 20 and 27 have no `todo` test**, so there is no flag to remove for either; 20 is
      already fixed by the release pipeline, and 27 gets a test written here, see below.
- [x] The spelling and the binding were fixed together.
      `grep -rn "disconectedCallback" src/` is empty **and** no `removeEventListener` in the diff contains
      `.bind(`. Either alone is worse than neither.
- [ ] A second `Consentio.Create()` does not throw, and the loader can see it.
      Call it twice in a browser console; check `window.ConsentioInstance` after the first.
      **Not run - there is no browser here.** `test/consentio/registration.test.mts` and
      `create.test.mts` cover both as unit tests, which is a proxy.
- [x] Nothing reads the DOM from a custom element constructor.
      By eye across all four elements - every `querySelector` sits in `connectedCallback`.
- [ ] A choice persists on plain http.
      Serve the docs over `http://localhost`, accept, reload. The banner does not come back. **This is
      defect 12 and it is the easiest one to check by eye.**
      **Not run - there is no browser here.** The unit test asserts the serialised attribute only, and
      says so in its own comment: jsdom's jar accepts a secure cookie over http.
- [x] An `alwaysOn` category still owns its checkbox.
      Defect 23 - the element is not left holding a detached node.
- [x] Both `@ts-expect-error` lines in the loader are gone.
      `grep -rn "ts-expect-error" src/` returns only defect 19's, and that one goes too.
- [x] The banner reads the cookie the loader read.
      Set `data-cookie-name` on the tag and a *different* `cookieName` in the config JSON. The banner uses
      the tag's. Then remove the loader entirely and it uses the config's.
      Checked as a test rather than by hand - `test/consentio/cookie-identity.test.mts` runs both halves.
- [x] The docs no longer teach the removed feature.
      `grep -n "signals" website/pages/home.md` returns only the Google-signal explanations, and
      `grep -ni "adding your own category\|add a category" website/pages/home.md` returns nothing.
- [x] A fifth category cannot exist, and defect 28 has a test.
      Put an unknown key in a config. The banner still runs, the console warns, and the category is not
      there. `grep -rn "signals" src/types.ts` returns nothing. Defect 28 has no `todo` test yet - write one
      first, marked `todo`, then remove the flag with the fix, so it proves itself like every other defect.
      See [../memory/todo-flags-are-the-register.md](../memory/todo-flags-are-the-register.md).
- [x] Every comment left in a file this plan touched is one line, or is a carve-out the rule names.
      By eye down the diff.
- [x] `git status --porcelain dist/` is empty.

---

## Done on 25 Aug 2026

**Landed, uncommitted.** Every defect in the brief is fixed and both suites are green.

### The numbers

`npm run typecheck` clean. `npm test` **213 tests, 199 pass, 0 fail, 14 todo**, exit 0. `npm run test:plain`
**62, 60, 0 fail, 2 todo**, exit 0. `git status --porcelain dist/` empty. `git tag -l` unchanged.

The todos went 40 to 14: defect 14 has ten, defect 15 two, defect 21 two. **The brief said 12 and was
wrong** - it forgot defect 21's pair, which it also says elsewhere stays open.

### The one thing the brief did not price: the cookie shape changed

**Defect 18 cannot be closed without it.** The version and the categories were siblings in the stored JSON,
so a category keyed `version` overwrote the version. There is no flat shape in which both survive. The
stored value is now:

```json
{"version":1,"consents":{"strictly_necessary":"granted", ...}}
```

**That is a change to the cookie contract**, and [../rules/the-cookie-is-a-contract.md](../rules/the-cookie-is-a-contract.md)
asks for three things before one is made. All three were done in this session: it is stated plainly here, the
full spec in [../design/delivery.md](../design/delivery.md) is rewritten, and the docs page is rewritten.
The template's reader is the fourth and **does not exist yet** - defect 26 - which is precisely why this was
the moment to do it. Change it after plan 5 and it costs two implementations and a gallery review instead of
one file.

**What it costs a visitor:** a value written in the old flat shape has no `consents`, reads as no stored
answer, and the banner asks again. Same outcome as a version mismatch, which is behaviour the contract
already had.

### Defect 28's test did not run the todo cycle, and here is what stands in for it

The brief asked for a `todo` test written first, then un-flagged with the fix. The fix landed first, so that
sequence was not run. What proves the tests would have failed: `test/consentio/config.test.mts` carried a
**passing** test named *a category the defaults do not have is appended*, green in the 25 Aug 2026 baseline,
asserting exactly the behaviour defect 28 forbids. It is now *issue 28 - a category the defaults do not have
is refused, not appended*, and four more beside it. The old `mergeConsents` body was re-run in isolation to
confirm it appended `house_analytics` to the four.

### Two things that changed shape while fixing them

**Defect 11 needed getters, not a move to `connectedCallback`.** The brief says move the `querySelector`
calls. One of its own tests connects an element and adds the children *afterwards*, which a
`connectedCallback` read cannot serve. Each child reference is a getter that queries on access, and the
click handling became **one delegated listener on the host** - which is also what lets `connectedCallback`
attach a listener before the buttons exist. Bar, modal and floating button.

**Defect 28 needed the merge to copy field by field.** Dropping `signals` from the type is not enough: the
override was spread whole into the category, so a site writing `signals` by hand in its JSON still had it
carried through. `mergeConsents` now copies the four fields a site may change and nothing else.

### Two deliverables that were not checked here, and are not claimed

Both need a browser, and there is none in this session. They are **not run**, not passed:

- **Defect 12 on plain `http`.** The unit test asserts the serialised attributes only -
  `test/lib/cookies/secure-flag.test.mts` says in its own comment that jsdom's jar accepts a secure cookie
  over http, so a green suite is not evidence. Serve the docs over `http://localhost`, accept, reload.
- **A second `Consentio.Create()` in a browser console**, and `window.ConsentioInstance` after the first.
  The suite covers both as unit tests - `test/consentio/registration.test.mts` and `create.test.mts` - which
  is a proxy.

The cookie-identity check is covered by `test/consentio/cookie-identity.test.mts` rather than by hand.

### Also done

**The comment pass ran over every file this plan touched.** Every comment in `src/elements/`,
`src/lib/consent-store.ts`, `src/lib/cookies.ts`, `src/lib/consent-signals.ts` and
`src/lib/template-renderer.ts` is now one line. The loader's file-level block is the carve-out the rule
names and is untouched.

**`test/lib/consent-signals/derivation.test.mts` was deleted.** Every test in it exercised `signalMapFrom`
and per-category `signals`, both of which this plan removes. Its one still-meaningful assertion - that an
unknown key routes nowhere - moved into `test/lib/gtm/update.test.mts` as defect 28's.
