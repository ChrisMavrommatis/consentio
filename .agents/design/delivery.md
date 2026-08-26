---
description: What Consentio is delivered as, the two install routes, why each pushes the consent default differently, and the cookie contract in full
---

# Delivery and architecture

**The decisions that outlive the refactor.** Defect numbers refer to [issues.md](issues.md).

## The question, answered on 23 Aug 2026

**Consentio is for other people, but it is not a library.** It is built for static sites and it is
**delivered as a script**, never imported as a package.

So npm publishing, semver ceremony and a stable public API are **out of scope**. The loader stays, and so
does the JSON config/cookies fetching, because that is what lets one bundle serve several sites with
different copy.

Two delivery routes, and the choice between them is a real decision the docs must force, not a footnote:

| Route | How | The catch |
|---|---|---|
| **Directly in the site** | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | it blocks. 4.6 KB has to download before the page paints |
| **Google Tag Manager custom template** | the published template, on the **Consent Initialization - All Pages** trigger, which the tag manager guarantees runs before every other trigger in that container | **only covers tags in that container.** Take this route and *every* tag and cookie-setting script on the site has to be managed from the tag manager. Anything pasted straight into the page sits outside consent control |

## The two routes do not share the deny-by-default

**Corrected on 24 Aug 2026, against the actual template source.** An earlier version of this record said the
tag manager route serves the same file from a Custom HTML tag. It does not, and the difference is the whole
design.

**A custom template cannot inject a blocking script.** `injectScript` is always async, so anything the
template loads is already behind the tag manager's read of consent - which is defect 1 exactly. So:

| Route | What pushes `consent default` |
|---|---|
| Directly in the site | `src/consentio-loader.ts`, on its first pass, before it fetches or injects anything |
| Custom template | the template's own sandboxed code, through the tag manager's consent API, before it calls `injectScript` |

The template does not load the loader at all. It injects `consentio.min.js` and calls
`Consentio.Create(config, cookies)` - which is what `Create` exists for, and why defect 9 matters.

**The cookie is the contract between them, and since 26 Aug 2026 there are two implementations.**
`gtm/consentio-tag/template.tpl` read no cookie at all until then - the injected bundle did the reading, and
a default pushed that late is defect 26. It now reads the cookie itself, in the sandbox, before
`injectScript`. So the name, the version field, the JSON shape and what "no answer yet" means are written
out twice, in two languages, in two repositories, with no shared code path.
`src/lib/consent-store.ts` is the reference; the template matches it by hand.

**What stands in for the test that cannot exist:** `gtm/contract.fixture.json` holds worked cookie values -
a first-time visitor, a returning one, a version mismatch, a value in the pre-nesting flat shape, a malformed
value, and for each the consents it reads as and the seven signals that follow. `test/lib/consent-store/`
asserts the banner against the file, the template's own `___TESTS___` block carries the same values by hand,
and `test/gtm/template-contract.test.mts` fails when the template's cookie name, baseline, signal map,
`wait_for_update` or test values stop matching the file. It cannot execute the sandboxed reader. It can
prove the two readers were written against the same numbers.

**The cookie name is fixed at `consentio` in the template route.** The direct route still takes
`data-cookie-name`. Reading a cookie in the sandbox needs a `get_cookies` permission that names it, and a
permission cannot name a value a site types into a field - so a configurable name would mean declaring
"reads any cookie", and one more way the two readers can disagree. One knob fewer was the better trade.

## The templates need their own repositories

There are **two** templates, developed in `gtm/` in this repository:

| Template | Type | What it is |
|---|---|---|
| `consentio-tag` | TAG | the banner itself. Sets the consent default, injects `consentio.min.js`, calls `Consentio.Create`, and holds every string it renders |
| `consentio-tag-cookies` | MACRO | a variable supplying the cookie table shown in the settings modal |

### How the published site installs Consentio

**Two builds, one difference.** `website/_config.yml` is the local one and
`website/_config.prod.yml` is an overlay the publish build passes alongside it:

```
npm run build:site        _config.yml                          local
npm run build:site:prod   _config.yml,_config.prod.yml         what site.yml runs
```

Three keys move between them, and nothing else does:

| Key | `_config.yml` | `_config.prod.yml` |
|---|---|---|
| `url` | `http://localhost:4001` | the published address |
| `gtm_container_id` | empty, so no container snippet is emitted at all | the maintainer's container |
| `consentio_route` | `direct` | `tag-manager` |

`baseurl` deliberately stays in `_config.yml` alone, so a local build serves from the same `/consentio`
prefix the live site does and a link that only breaks under a prefix breaks locally too.

**`consentio_route` decides which install route the site itself uses.** A local build runs the bundle this
repository has just built - that is what makes it useful for testing a change. The published site runs the
**published template**, which is what strangers install, so a template that has drifted from its source is
something the maintainer trips over before a stranger files it.

**A page overrides the route either way**: `loader: true` in its front matter keeps the blocking script
whatever the route says, `loader: false` drops it. `/try-it/` is pinned to `true` and
`/try-it/tag-manager/` to `false`, which is what keeps both routes reachable on one site - the only way to
see whether the two cookie readers agree about one visitor.

**Google's snippet comes from `website/_plugins/gtm_tag.rb`**, two Liquid tags, `gtm_head` and `gtm_body`.
It renders nothing at all when the ID is empty, so the emptiness in `_config.yml` is what keeps a local
build free of Google entirely rather than emitting a snippet with a blank ID. `gtm_body` is the `<noscript>`
iframe, which the hand-inlined snippet it replaced did not have.

**The order in `<head>` matters and is not arbitrary.** The loader is written before the container snippet,
because on the direct route the deny-by-default has to reach the dataLayer before any tag reads it. On the
published route there is no loader in the page at all and the template does that job itself, before it
injects anything - see the deny-by-default section above.

### What the gallery requires

**Checked against Google's own documentation on 26 Aug 2026.** At the **root of a dedicated public
repository**, one per template, on the **main branch**, one `template.tpl` per repository:

| File | Must hold |
|---|---|
| `template.tpl` | the exported template, with a `categories` list added to its `___INFO___` block |
| `metadata.yaml` | `homepage`, `documentation`, and `versions` - a list of `sha` + `changeNotes`, newest first |
| `LICENSE` | the Apache 2.0 text, nothing else. The filename is capitalised |
| `README.md` | optional, recommended |

**A version is a commit SHA in the published repository**, which is what decides how much of a publish can
be automated: not the last step. The template can be prepared here in full, but the `versions` entry can
only be written after the commit it names exists in the other repository, so a publish is always two
commits there - the template, then the metadata naming it.

`categories` takes one or more of ADVERTISING, AFFILIATE_MARKETING, ANALYTICS, ATTRIBUTION, CHAT,
CONVERSIONS, DATA_WAREHOUSING, EMAIL_MARKETING, EXPERIMENTATION, HEAT_MAP, LEAD_GENERATION, MARKETING,
PERSONALIZATION, REMARKETING, SALES, SESSION_RECORDING, SOCIAL, SURVEY, TAG_MANAGEMENT, UTILITY. **There is
no consent category**, so both use `UTILITY` and `TAG_MANAGEMENT`.

So two published repositories, neither of which can be a folder inside this one. They are developed here and
copied out on publish; each `gtm/<name>/` folder holds all four files.

**Only `consentio-tag` pins the banner's version**, in the CDN URL it injects. The MACRO template supplies
data and pins nothing, so a version bump does not move it.

### The sandbox API, checked rather than remembered

**Read from Google's own documentation on 26 Aug 2026**, because a sandboxed API drops a wrong key silently
and a plausible-looking name is how that kind of fault survives. Do not re-derive these from a template that
looks similar:

| API | What is true |
|---|---|
| `getCookieValues(name[, decode])` | returns an **array**, and decodes by default. A single cookie is `[0]`; the reader guards an empty array **and** a falsy return, because which one a missing cookie gives was not confirmed |
| `JSON.parse` | in the sandbox it returns **`undefined` on malformed input** rather than throwing, so a reader needs no `try` |
| `setDefaultConsentState` | needs `access_consent` with **write on all seven** consent types, listed one per entry |
| `gtagSet(object)` | needs `write_data_layer`, whose parameter is `keyPatterns` |

**A web template cannot fetch anything and read the answer.** There is no XHR and no `fetch`; `sendPixel`
and `injectHiddenIframe` send a request but cannot read a response. The only way data comes back in is
`injectScript` plus `copyFromWindow`, which is why a settings fetch and a language pack were both decisions
about whether to, never about whether it was possible.

### Why the strings are in the tag and the cookie table is not

**Decided 26 Aug 2026 by the maintainer, reversing the split of 24 Aug 2026.** The strings were a third
template, `consentio-tag-texts`. They are now twenty-one fields on the tag itself.

**What the split actually cost.** Each published template is a repository, a `metadata.yaml` SHA list, and a
gallery review cycle that is neither instant nor yours to schedule. The strings bought none of that back:
they are set once per container and never touched again, so the reuse a variable exists for was reuse nobody
was doing. **The cookie table stays a variable** because it is data - a table, plausibly shared, edited on a
different rhythm from the tag.

**What made the settings page bearable.** The twenty-one fields are hidden unless the tag is asked for them -
see the next section - and when they appear they are already filled in.

### Where the banner's wording comes from

**Decided 26 Aug 2026.** One `textSource` field with three values and no blending:

| Value | The tag sends | Why |
|---|---|---|
| `builtin`, the default | nothing | the banner keeps its own English, so a later correction to a string reaches every container that never overrode it |
| `custom` | the twenty-one fields, which are **pre-filled with the English text** and shown only for this value | the person editing sees real words to change, not blanks with a hidden "empty means default" rule |
| `variable` | one Tag Manager variable holding the whole set | a Custom JavaScript variable, or a Lookup Table keyed on the page's language - the user's own language switching, with no permission and nothing to ship |

**Pre-filled English and a language pack cannot both work.** A filled field submits a real value, so it would
always beat a pack. Making the fields visible only for `custom` is what lets them be pre-filled at all.
`enablingConditions` is the key that does it - `[{paramName, paramValue, type: "EQUALS"}]`, confirmed against
a template published in the gallery rather than from memory. It is set on the fields **and** on their group:
its behaviour on a `GROUP` is unconfirmed, and an ignored key there costs a stray heading, not a fault.

**What `builtin` buys and `custom` gives up.** A container on `builtin` inherits every later fix to the copy.
A container on `custom` has frozen it - which is what choosing to own the wording means.

### Translations are copied, not served

**Decided 26 Aug 2026 by the maintainer, rejecting a runtime language pack.** A published pack would have
been a file on the CDN, injected by the tag and read off a global. It works - a web template cannot fetch,
but `injectScript` plus `copyFromWindow` is the same thing in practice, and the `inject_script` permission
the tag already declares covers the path.

**It was refused because it makes a translation a service.** A pack is then a release-coupled artifact: a
pinned URL, a second request on every page, version skew between pack and bundle, and a new failure where a
pack that does not load costs someone their language. A translation is text. It is downloaded, pasted into
the `custom` fields or into a variable, and changed to taste - and then nothing can fail at runtime.

**Pointing the same trick at a site-hosted settings file is not clean**, and was rejected the same day:
`inject_script` would have to declare a pattern broad enough for a domain unknown at publish time, and the
template would execute whatever that URL returned in page context. Nothing pre-approvable exists for a
customer's own domain, so a settings *fetch* is closed. `copyFromDataLayer` under a static `read_data_layer`
key pattern is the one door that stays open, and the variable slot covers the same ground without it.

## The four categories are fixed

**Decided 25 Aug 2026 by the maintainer. This closes defect 27 and reverses part of defect 4's fix.**

A site gets four consent categories and cannot add, remove or re-point one:

| Key | Google signals it drives |
|---|---|
| `strictly_necessary` | `security_storage` |
| `preferences_functionality` | `functionality_storage`, `personalization_storage` |
| `statistics_performance` | `analytics_storage` |
| `marketing_advertising` | `ad_storage`, `ad_user_data`, `ad_personalization` |

**Where the four come from.** Not from the GDPR - it names no cookie categories. The four-way split is the
ICC UK Cookie Guide's, published 2012 and since adopted as the industry default, which is why every consent
tool ships roughly these names. The duty to ask at all comes from **ePrivacy Directive Article 5(3)**, and
that is also what exempts strictly necessary from consent. The GDPR governs the *quality* of the consent -
freely given, specific, informed, unambiguous - not its shape.

**Why fixing them is the right call, not a limitation.** A site that invents a fifth category is making a
legal claim about it, unprompted and unreviewed. A site that re-points `statistics_performance` at a
different Google signal has made the category name lie. And the loader has to push the consent default
before it can read any config, so **whatever the categories are, the loader has to already know them.**
Fixing the set is what makes that possible without a data attribute or a fetch. See defect 27.

**What a site may still change:** every string, the cookie name, the version, whether consent is required,
and the cookie table. Copy and behaviour, not taxonomy.

**Enforced in code since 25 Aug 2026**, which closes defect 28:

- `ConsentCategory.signals` is gone, so a site cannot re-route a category.
- `mergeConsents` merges into the four known keys and **warns on anything else rather than adding it**. It
  copies field by field rather than spreading the override, because a spread carries through whatever else
  the site wrote.
- `signalMapFrom()` is gone - it had one possible answer. `DEFAULT_SIGNAL_MAP` is the only map there is.

**Warned, not thrown.** A config with a stray fifth category gets a console warning and a working banner.
The rest of it is still good, and a blank page is a worse answer.

## The cookie contract

**Written down 24 Aug 2026, traced out of the source.** `src/lib/consent-store.ts` and `src/lib/cookies.ts`
are the source of truth; each template implements this a second time by hand. Anything below that changes is
a breaking change for the templates, whatever it does to Consentio's own version number.

**Name.** `consentio` by default. The direct route overrides it with `data-cookie-name` on the loader tag.
**The template route cannot override it** - see above.

**One identity, not two.** `data-cookie-name` and `data-version` on the tag, and `cookieName` and `version`
in the config JSON, used to be two sources for one fact - set them differently and the loader and the banner
read different cookies, or the same cookie at two versions, and the banner appeared for someone who had
already answered. Since 25 Aug 2026 the loader publishes what it resolved on `window.ConsentioDefault` and
**the banner's constructor prefers those values**, falling back to the config JSON when no loader ran. The
tag manager route never runs the loader, so the fallback is the path it keeps taking, and the footgun stops
existing rather than being documented.

**Value.** One JSON object, URI-encoded on the way in and out. Two keys: `version`, and `consents` holding
one key per category.

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

Every consent value is the string `granted` or `denied` - never a boolean, never absent.

**The categories nest rather than sitting beside `version`.** They were siblings until 25 Aug 2026, which
meant a category keyed `version` overwrote it - defect 18. Nesting removes the collision rather than
documenting it. **This changed the contract**, so a reader written against the flat shape finds no
`consents` and must treat that as no stored answer, which is what `readConsents` does.

**Attributes**, from `Cookies.defaultAttributes` plus one computed at write time: `path=/`, `expires` 90
days, `SameSite=Lax`, and `Secure` **over `https` only**. It was unconditional until 25 Aug 2026, which is
why nothing persisted on plain `http` - defect 12.

**Reading it, and this is the part that is easy to get wrong:**

1. no cookie at all -> **no stored answer**
2. cookie will not parse as JSON, or parses as something other than an object -> **no stored answer**
3. `version` does not equal the configured version -> **no stored answer.** Not "partially valid", not
   "merge what is there". The whole thing is discarded and the banner shows again
4. there is no `consents` object -> **no stored answer.** This is also how a flat, pre-25 Aug 2026 value reads
5. otherwise: `consents` is the answer

**"No stored answer" is not the same as "everything denied".** It means fall back to `BASELINE_CONSENTS`,
which is a single key - `{"strictly_necessary":"granted"}` - and nothing else. Fed through
`toGoogleSignals`, whose rule is that a signal is granted only when *every* category routed to it is
granted, that yields `security_storage` granted and the other six denied. **A template that instead writes
out four categories all denied will produce the same six denials but a different `security_storage`, and the
two routes will disagree.**

**The trap in the version:** adding a category without bumping `config.version` leaves every returning
visitor's stored value missing that key, and a missing key reads as denied. Bumping it instead discards
their answer and shows the banner again. There is no third option - that is defect 21, and since the four
categories were fixed only Consentio itself can trigger it, which is a breaking change and a bump anyway.

## Why the loader carries the default, rather than a second file

A separate `consentio-core.min.js` was built on 24 Aug 2026 and **deleted the same day**, on the maintainer's
call. It was 2.8 KB and correct, but it meant a second blocking request and a second version to keep pinned.
Folding it into the loader costs the loader 2.8 KB - 1.5 KB to 4.3 KB minified - and removes an artifact.
**Those are the sizes as measured then.** Re-measured 25 Aug 2026 from a clean build: the loader is 4.6 KB
minified and 2.0 KB gzipped, and `consentio.min.js` is 36.3 KB and 11.3 KB. Plan 4's focus module is most of
the growth in the second.

The consequence to keep in view: **the loader is a blocking script.** `async` or `defer` on its tag puts the
default back behind the tag manager, so the loader warns when it sees either.

Three shared modules make it work, and the banner imports them too:

| Module | Holds |
|---|---|
| `src/lib/consent-signals.ts` | the seven Google names, the category-to-signal map, `toGoogleSignals()`. **The only file where a Google name appears** |
| `src/lib/consent-store.ts` | `readConsents` / `writeConsents` / `clearConsents`, and `BASELINE_CONSENTS`. No DOM beyond `document.cookie` |
| `src/lib/cookies.ts` | as today, with defect 12 still open |

**The loader does not use a configured signal map**, because there is no such thing any more and because it
has no config when it pushes. That was defect 27, and closing it is what defect 28's enforcement finished.

**The deny-by-default needs no config file, and that is what keeps it small.** Config only ever affected the
UI. The only defensible default is denied for everything except strictly necessary, so nothing has to be
fetched before the push.

**`toGoogleSignals` must name every signal on every push.** A signal left out of an update keeps its previous
value, which is how a category that was granted and then revoked stays granted. Its return type is
`Record<GoogleSignal, ConsentState>`, so leaving one out is a compile error.

## How a release actually runs

**Built 25 Aug 2026, never dispatched.** The plan that built it has been deleted, so this is the record.
The only other copy is a comment inside `release.yml` itself.

**Why a dispatch and not a tag trigger**, which is the shape most people expect. The CDN serves the git tree
at the tag: `consentio@0.1.0/dist/consentio.min.js` is whatever `dist/` held in the commit the tag points at.
A workflow that fires *after* the tag exists cannot change that commit, so it would publish whatever `dist/`
happened to be sitting there. **That is exactly how `0.0.4` shipped stale.** The dispatch builds and commits
`dist/` first, then tags that commit, so a tag can only ever point at a fresh build.

**The workflow does not bump the version, and it does not name the release.** Three things are the
maintainer's, by hand on `main`, **before** dispatching:

1. rename `## [Unreleased]` in `CHANGELOG.md` to the version, and open a fresh empty `## [Unreleased]` above it
2. set the same version in `package.json`
3. push both to `main`

Then dispatch `release.yml` with that version. `dry_run` defaults to **on** - it runs every gate and the
full verify, and skips the commit, the tag and the publish.

**What the workflow then does, in order.** Nothing before `commit` is irreversible; nothing after it is
reversible:

| Job | Does |
|---|---|
| `gate` | the dispatch is on `main`; the version is semver with no leading `v`; `package.json` agrees; the changelog section exists and is not empty; the tag does not already exist here **or on `origin`** |
| `release` | `npm ci`, typecheck, `build:dist`, both test suites, then prints the release body and what it would commit |
| `release` | commits `dist/` and the changelog date to `main` as `github-actions[bot]`, subject `release <version>` |
| `release` | tags that commit, pushes the tag, creates or edits the release with the four `dist/` files attached |

**Two things this depends on that are not in the repository:**

- **`main` must let `github-actions[bot]` push.** If it is protected, the bypass has to name that actor, or
  the release stops after building and before tagging. That is a safe place to stop, but it stops.
- **The commit subject `release <version>` and the bot's committer address are how `dist-guard.sh` tells a
  released `dist/` from a hand-written one.** Changing either shape silently disarms the guard. It catches
  mistakes, not someone deliberately setting that email - and that is the right bar for it. The guard is a
  script in `.github/scripts/` rather than inline YAML for one reason: as a script it has tests, and inline
  the one thing it exists to decide could only ever be exercised by a real push.

**CI is red until the first release.** The freshness job rebuilds `dist/` and diffs it, and the committed
`dist/` is stale - defect 24. Every file differs, plus one the build emits and `dist/` does not have. That
is the check working, and it goes green when a release regenerates `dist/`.

## What not to do

**Do not rewrite the UI.** The web components work and the shadow-root isolation is the right call for a
widget that drops onto someone else's page. This is a correctness job, not a redesign.

**Do not bump the version as a side effect.** Moving the default into the loader is a breaking change - the
loader tag has to stop being `async` - and deserves `0.1.0`. But that is a release decision, and
`consentio-tag` pins the version in its CDN URL, so a bump moves two repositories.

**Do not touch `dist/`, and do not rebuild it either.** It is committed build output and it is what the CDN
serves, so one process has to own it and that process is CI.
[../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md) is the whole of it.

**Do not add a framework, a bundler change, or a dependency.** The build is webpack with four entries and no
runtime dependencies. That is a feature of a consent banner.

**Do not put the deny-by-default anywhere that has to wait.** Not behind a fetch, not behind the banner, not
behind `injectScript`. Everything about this design falls out of that one rule.
