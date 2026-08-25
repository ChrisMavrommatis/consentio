---
description: Consentio's twenty-eight numbered defects, found by reading the source. Every plan cites these numbers and carries none of its own
---

# Consentio - the issue register

**The diagnosis of record.** Twenty-eight numbered defects, found by reading the source. **The numbering is
stable** - every plan cites a number here instead of restating the problem.

**Defects 6 to 28 cite the current layout**, re-checked line by line against the source on 25 Aug 2026.
Defects 1 to 5 are fixed and are left citing the pre-port layout - `src/js/*.js`, as the source was on 23 Aug
2026. The port moved every file and TypeScript renamed several.

| Pre-port | Now |
|---|---|
| `consentio.js` | `src/consentio.ts` |
| `consentio-loader.js` | `src/consentio-loader.ts` |
| `consentio-gtm.js` | `src/lib/gtm.ts` |
| `consentio-state.js` | `src/lib/state.ts` |
| `cookies.js` | `src/lib/cookies.ts` |
| `template-renderer.js` | `src/lib/template-renderer.ts` |
| `consentio-app.js`, `consentio-bar.js`, `consentio-modal.js`, `consentio-consent-item.js`, `consentio-floating-button.js` | `src/elements/`, same name, `.ts` |
| `consentio-modal.html` and siblings | `src/templates/`, same name |

**A line number belongs here and nowhere else** - see
[../rules/one-fact-one-place.md](../rules/one-fact-one-place.md). A plan cites a defect number and at most a
filename; it never carries a line. If a line below has moved, grep the symbol and correct it here.

**Do not re-derive this.** If a session finds something not listed here, it adds a number here rather than
fixing it in passing.

## The state of the repository

Last commit 6 Nov 2025. Working tree clean. Around 1,000 lines of source, webpack build, web components in a
closed shadow root, UMD bundle plus an async loader. **It works** - it is not wreckage.

What was not there when this was written: no tests, no CI, not published to npm, the documentation page was
the single word `test`, and the version `0.0.4` written by hand in both `package.json` and
`src/js/consentio.js`. Defects 1 to 5 have since been fixed, and the tests, the CI workflow and the
documentation page exist.

---

## The defects

Found by reading the source on 23 Aug 2026, extended from ten items to twenty-one, to twenty-seven on
24 Aug 2026, and to twenty-eight on 25 Aug 2026. **Numbering is stable - every plan cites these numbers.**
Ranked: defect 1 is what this work
exists for; the rest are cleanup.

### Blocker

**1. The consent default fires far too late. This is architectural.**
`consentio-app.js:76` - `this.gtm?.defaultConsent(...)` is the **only** `consent default` push in the
codebase, and it runs at the end of: loader parses -> injects `consentio.js` -> `onload` -> `fetch` config +
`fetch` cookies -> `new Consentio()` -> `document.body.appendChild` -> `connectedCallback`. Two network
round-trips and a DOM insert after `{% gtm_head %}` has already started the tag. Google reads consent at tag
load; anything later is ignored. Google's own wording: *"If your consent code is called out of order, consent
defaults won't work."* **Shipped as-is the banner gates nothing.** Not patchable - a default cannot be async.
The fix is the split below.

### Google Consent Mode correctness

**2. `essential_storage` is not a Google signal.** `consentio-gtm.js:21`. The real set is `ad_storage`,
`ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`,
`personalization_storage`, `security_storage`. Google drops unknown keys silently, which is why it looks like
it works. The other seven mappings are correct, so this is a pure deletion.

**3. No `wait_for_update`, no `ads_data_redaction`.** Neither appears anywhere. `wait_for_update` exists
precisely for banners that load async and is the mitigation for the residual gap in defect 1.

**4. The signal map is hardcoded to the four default category keys.** `consentio-gtm.js:19-31`.
`mergeConsents` (`consentio.js:84`) lets a site **add** a category, but a category added that way can never
reach a Google signal. Across several sites this will bite.

**5. A revoked category stays granted.** A signal omitted from a `consent update` keeps its previous value.
The map only ever emits keys it knows, so `toGoogleSignals` must name **all seven on every push**.

### Lifecycle and DOM

**6. Two lifecycle callbacks are misspelled.** `disconectedCallback` - one `n` - in
`src/elements/consentio-app.ts:107` and `src/elements/consentio-bar.ts:30`. They never fire. The other three
elements spell it correctly, so their broken `removeEventListener` calls are live no-ops, not dead code.

**7. Every `removeEventListener` is a no-op.** `this.removeEventListener('x', this.fn.bind(this))` builds a
**new** function object, so it never matches what was added. `src/elements/consentio-app.ts:108-111`,
`consentio-bar.ts:31-32`, `consentio-modal.ts:37-38`, `consentio-consent-item.ts:139`,
`consentio-floating-button.ts:14`.
**6 and 7 interact:** fixing the spelling without fixing the bind turns a dead function into a live leak.

**8. `customElements.define` throws on a second instance.** `src/consentio.ts:140-145` defines six names
unconditionally. Guard on `customElements.get(name)`.

**9. `Consentio.Create()` never sets `global.ConsentioInstance`.** `src/consentio.ts:87`. This is *why* 8
bites - the loader's double-init guard and the public entry point cannot see each other.

**10. The constructor writes to `document.body`.** `src/consentio.ts:135`. In `<head>`, `document.body` is
null. The loader appends the main script with no `defer`, so this is live, not theoretical.

**11. `querySelector` in custom element constructors.** `src/elements/consentio-bar.ts:11-12`,
`consentio-modal.ts:15-18`, `consentio-consent-item.ts:16-18`, `consentio-floating-button.ts:6`. Works
today only because `renderNode` builds from an inert `<template>`, so upgrade is deferred until insertion.
Breaks the moment one is upgraded in place. Belongs in `connectedCallback`.

**12. The cookie is dropped on plain http.** `src/lib/cookies.ts:11` sets `secure: true` unconditionally. On
`http://localhost` the browser silently discards it, so local dev never persists a choice and every reload
shows the banner. Set it from `location.protocol === 'https:'`.

**13. `render()` does not re-apply visibility.** `set config`
(`src/elements/consentio-app.ts:60-64`) re-renders, building fresh nodes with no inline `display`, but
`initState()` only runs from `connectedCallback` (`:92`). Bar and modal end up visible at once. Latent
today because the loader assigns config before `appendChild`.

**22. A loader tag with no `src` throws and the banner never loads.** `src/consentio-loader.ts:55-58`.
`getAttribute('src')` returns `null` for a loader tag pasted inline rather than linked, and `null` goes
straight into `.substring()`. The `TypeError` kills the loader before the double-init guard on `:66`, so
nothing loads and nothing says why. Both `@ts-expect-error` lines in that file belong to this defect.
**Found on 24 Aug 2026 while writing the loader tests.**

### Accessibility

**14. There is none.** No `role="dialog"`, no `aria-modal`, no focus trap, no Escape, no label association
on the switches: `src/templates/consentio-consent-item.html:5-8` wraps the checkbox in a `<label>` carrying
no text, so every category checkbox is unnamed. The modal footer uses `<a>` without `href`
(`src/templates/consentio-modal.html:15-16`), so neither button is focusable or keyboard-activatable.
`src/elements/consentio-app.ts:40` attaches the shadow root with `{ mode: 'closed' }`, so
`document.activeElement` returns the host and not the focused node - which is what makes focus management
harder here than usual. With `consentRequired: true` the overlay is a full-screen `position: fixed` block
with no keyboard way out.
**`website/data/consentio-config.json` sets `consentRequired: true`, so the docs site demos the worst case.**
For a compliance tool that is the wrong thing to ship, independent of any law.

**15. Clicking the switch also toggles the description body.**
`src/elements/consentio-consent-item.ts:135` binds `click` on the whole host and the switch is inside it.

**23. An `alwaysOn` category loses its checkbox and leaves `this.input` dangling.**
`src/elements/consentio-consent-item.ts:85-87`. `render()` clears the switch label with `innerHTML = ''` to
write the "Always On" text, which deletes the `<input>` the constructor cached on `:18`. The element is left
holding a reference to a detached node, so `updateState()` (`:63`) writes `checked` into nothing.
`readState()` (`:56`) returns `'granted'` before it reads the input, which is the only reason this is
invisible today. **Found on
24 Aug 2026 while writing the consent-item tests.**

### Minor

**16.** `{{ consentItems }}` in `src/templates/consentio-modal.html:6` is never supplied - dead placeholder.
**17.** `TemplateRenderer.render` uses `data[p1] || ''` (`src/lib/template-renderer.ts:11`) - falsy values
silently dropped.
**18.** `{ version, ...consents }` (`src/lib/consent-store.ts:31`) - a category keyed `version` clobbers
the version. The port folded the two pre-port sites into this one. **Unreachable from a config as of 25 Aug
2026** - the four categories are fixed and none is called `version` - so it is a latent shape problem, not a
live one. Fix the shape anyway; do not document the trap.
**19.** `this.logger.log(event, 'info')` (`src/elements/consentio-app.ts:259`) - unguarded, and logs a whole
event object. Carries the third `@ts-expect-error` in the source.
**20.** Version `0.0.4` hand-written in **three** places: `package.json:3`, `src/consentio.ts:23`, and the
CDN URL in `gtm/consentio-tag/template.tpl:144`. The third is the one that ships.
**Two of the three are closed, 25 Aug 2026.** `package.json` is the one source; webpack substitutes it into
the bundle and the test harness does the same, so `src/` carries no literal. The release gate refuses a
version `package.json` disagrees with. **The template's CDN URL is still by hand** and moves with the
release - see [../rules/releases-move-two-repositories.md](../rules/releases-move-two-repositories.md).
**21.** Adding a category without bumping `config.version` leaves stored consents missing that key - it
reads as denied, silently. **Narrowed by the decision of 25 Aug 2026**: a site cannot add a category, so this
is now only about Consentio itself changing the four, which is a breaking change and a version bump anyway.
It stays open as a documentation item.

**24. The committed `dist/` is stale - it is not what the source builds.** All five files differ from a
clean `npm run build` at `35a8b31`. `dist/consentio-loader.js` still reads
`dataset.consentioLoaderDebug`, `dataset.consentioConfig` and `dataset.consentioCookies`, while
`src/consentio-loader.ts:51,61,62` reads `dataset.debug`, `dataset.configUrl` and `dataset.cookiesUrl` -
which is what `website/_layouts/page.html` actually sets. **Anyone using the committed bundle gets a loader
that ignores its own configuration.** It also destroys the one check the port depends on: `dist/` cannot be
the pre-port baseline, so the baseline has to be rebuilt from the tag. **Found on 24 Aug 2026 while diffing
the port.**

**It is already shipped, and this was missed until 25 Aug 2026.** Tags `0.0.1` to `0.0.4` exist and are on
`origin`. The `dist/` at tag `0.0.4` is byte-identical to the working tree's, stale marker and all, and
`gtm/consentio-tag/template.tpl:144` pins
`https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@0.0.4/dist/consentio.min.js`. So the broken loader is
being served from a permanent, cached URL now - this is live, not a hazard the next release might introduce.
A tag cannot be recalled, so the only remedy is a new one. Plan 2 built the pipeline that makes it - and the
freshness check that now fails CI on this exact staleness - and plan 8 hands the dispatch over.

## In the Google Tag Manager template

The templates are developed in `gtm/` and published one per repository, as the gallery requires. These are
recorded here because the register is where the count is true, and because both defects are about how a
template meets the code in this repository.

**25. The template writes `ConsentioIntance`, missing the `ns`.** `gtm/consentio-tag/template.tpl:236`.
Everything else looks for `ConsentioInstance`, and so does the template's own declared `access_globals`
permission at `:411`. **So it is not a write to the wrong key - it is a write to an undeclared key**, which
the sandbox rejects. That `setInWindow` call is there to cover for defect 9, and it covers for nothing. In
the tag manager route the double-initialisation guard is dead, and defect 8 turns a second trigger firing
into a thrown error. **Found on 24 Aug 2026, reading the template source.**

**26. The template sets no consent default at all.** Nothing in it calls the tag manager's consent API. The
only default is the one inside the banner, which arrives after `injectScript` - and `injectScript` is always
async. This is defect 1 in the route where it is worst, and the fix is not the one in this repository: the
template has to push the default itself, in sandboxed code, before it injects anything. That means it also
has to read the consent cookie itself, which is the second implementation of the contract - see
[delivery.md](delivery.md). **Found on 24 Aug 2026.**

## Found after the register was written

**27. The loader maps consents with the built-in four-key map, whatever the site configured.**
`src/consentio-loader.ts:89` calls `toGoogleSignals(consents)` with no second argument, so it falls back to
`DEFAULT_SIGNAL_MAP`. A site that adds a category, or points an existing one at different signals, gets a
`consent default` computed from the wrong map; the first `consent update` from the banner then corrects it.
**This is defect 4 surviving in the route that was supposed to have fixed it**, and it lands on the one push
that has to be right, because Google reads consent at tag load.

**Measured 25 Aug 2026**, by running both maps through `toGoogleSignals`. It goes wrong in both directions.
A site that renames its categories gets everything denied on the default push, which is wrong but safe. A
site that keeps a built-in key and re-points it gets `analytics_storage` **granted** on the default push
when it routed nothing there - consent nobody gave, on the one push Google reads.

**Closed 25 Aug 2026 by decision, with no change to the loader.** The four categories are fixed and a site
cannot add or re-point one - see [delivery.md](delivery.md). The loader's built-in map is therefore correct
by definition, and there is nothing for it to learn. **Found on 24 Aug 2026 while checking the guidance
against the source.**

**The work this creates is elsewhere:** the config still *accepts* a fifth category and a `signals`
override, so the rule is not enforced. That is defect 28.

### Fixed since

Defects **1 to 5** were fixed on 24 Aug 2026 and their tests pass - each has a test with no `todo` flag.
The tests, the CI workflow, the README and the documentation page exist.

**Defect 24 is not fixed.** `dist/` is untouched: `git status --porcelain dist/` is empty and no commit since
`35a8b31` has written it, so the committed bundle is still the stale one. Rebuilding it in a working tree
would not fix it either - see [../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md). It is
fixed by the release workflow owning the artifact.

**Defect 27 is closed by decision, not by code.** Its replacement is defect 28.

**28. Nothing enforces the four categories.** `src/consentio.ts:91` - `mergeConsents` writes any key it is
handed into the map, so a config naming a fifth category gets one, and it can never reach a Google signal.
`ConsentCategory.signals` (`src/types.ts:32`) lets a site re-point a built-in category at different signals.
Both contradict the decision of 25 Aug 2026 that the four are fixed. Remove the `signals` field, make
`mergeConsents` merge into the four known keys and warn on anything else, and `signalMapFrom()` then has one
possible answer. **This is what closing defect 27 costs, and it is the fix defect 4 should have had.**
**Found on 25 Aug 2026, when the categories were settled.**
