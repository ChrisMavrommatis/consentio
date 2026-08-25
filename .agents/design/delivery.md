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
| **Directly in the site** | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | it blocks. 4.3 KB has to download before the page paints |
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

**The cookie is the contract between them - once the template implements it.** It does not yet:
`gtm/consentio-tag/template.tpl` reads no cookie at all, so the injected bundle does the reading and there is
only one implementation today. Fixing defect 26 creates the second, because a template that pushes its own
consent default has to know the stored answer before `injectScript` returns. From that point the name, the
version field and what "no answer yet" means are implemented twice, in two languages, in two repositories,
with no shared code path. `src/lib/consent-store.ts` is the reference; the template has to match it by hand.

## The templates need their own repositories

There are **three** templates, developed in `gtm/` in this repository:

| Template | Type | What it is |
|---|---|---|
| `consentio-tag` | TAG | the banner itself. Injects `consentio.min.js` and calls `Consentio.Create` |
| `consentio-tag-texts` | MACRO | a variable supplying every string the banner renders |
| `consentio-tag-cookies` | MACRO | a variable supplying the cookie table shown in the settings modal |

Google's community gallery requires `template.tpl`, `metadata.yaml`, `LICENSE` and `README.md` at the **root
of a dedicated public repository**, one per template. So three published repositories, none of which can be a
folder inside this one. They are developed here and copied out on publish.

**Only `consentio-tag` pins the banner's version**, in the CDN URL it injects. The two MACRO templates supply
data and pin nothing, so a version bump does not move them.

**Splitting the strings and the cookie table into MACRO templates is deliberate.** A container can then hold
one banner tag and several text variables, and the tag's own settings stay short. It also means a copy change
is a variable edit rather than a tag edit, which is a smaller thing to get wrong.

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

**What has to be enforced in code, and is not yet:**

- `ConsentCategory.signals` exists and lets a site re-route a category. **Remove it.**
- `mergeConsents` merges any key it is given, so an unknown key becomes a fifth category. **It must merge
  into the four and warn on anything else, never add.**
- `signalMapFrom()` then has one possible answer and stops earning its place.

## The cookie contract

**Written down 24 Aug 2026, traced out of the source.** `src/lib/consent-store.ts` and `src/lib/cookies.ts`
are the source of truth; each template implements this a second time by hand. Anything below that changes is
a breaking change for the templates, whatever it does to Consentio's own version number.

**Name.** `consentio` by default. The direct route overrides it with `data-cookie-name` on the loader tag;
the template has its own field.

**Value.** One JSON object, URI-encoded on the way in and out. The `version` field first, then one key per
consent category:

```json
{"version":1,"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}
```

Every value is the string `granted` or `denied` - never a boolean, never absent.

**Attributes**, from `Cookies.defaultAttributes`: `path=/`, `expires` 90 days, `SameSite=Lax`, and `Secure`
**unconditionally** - which is defect 12, and why nothing persists on plain `http`.

**Reading it, and this is the part that is easy to get wrong:**

1. no cookie at all -> **no stored answer**
2. cookie will not parse as JSON -> **no stored answer**
3. `version` does not equal the configured version -> **no stored answer.** Not "partially valid", not
   "merge what is there". The whole thing is discarded and the banner shows again
4. otherwise: drop the `version` key and the rest is the answer

**"No stored answer" is not the same as "everything denied".** It means fall back to `BASELINE_CONSENTS`,
which is a single key - `{"strictly_necessary":"granted"}` - and nothing else. Fed through
`toGoogleSignals`, whose rule is that a signal is granted only when *every* category routed to it is
granted, that yields `security_storage` granted and the other six denied. **A template that instead writes
out four categories all denied will produce the same six denials but a different `security_storage`, and the
two routes will disagree.**

**The trap in the shape:** the version is stored as a sibling of the categories, not above them, so a
category whose key is literally `version` overwrites it. That is defect 18 and it is unfixed.

**The trap in the version:** adding a category without bumping `config.version` leaves every returning
visitor's stored value missing that key, and a missing key reads as denied. Bumping it instead discards
their answer and shows the banner again. There is no third option today - that is defect 21.

## Why the loader carries the default, rather than a second file

A separate `consentio-core.min.js` was built on 24 Aug 2026 and **deleted the same day**, on the maintainer's
call. It was 2.8 KB and correct, but it meant a second blocking request and a second version to keep pinned.
Folding it into the loader costs the loader 2.8 KB - 1.5 KB to 4.3 KB minified - and removes an artifact.

The consequence to keep in view: **the loader is a blocking script.** `async` or `defer` on its tag puts the
default back behind the tag manager, so the loader warns when it sees either.

Three shared modules make it work, and the banner imports them too:

| Module | Holds |
|---|---|
| `src/lib/consent-signals.ts` | the seven Google names, the category-to-signal map, `toGoogleSignals()`. **The only file where a Google name appears** |
| `src/lib/consent-store.ts` | `readConsents` / `writeConsents` / `clearConsents`, and `BASELINE_CONSENTS`. No DOM beyond `document.cookie` |
| `src/lib/cookies.ts` | as today, with defect 12 still open |

**The loader does not use the configured signal map**, because it has no config when it pushes. That was
defect 27, and it is closed: there is no configured map any more. The four categories are fixed, so the
built-in map is the only map - see above. What is left is making the config refuse anything else, which is
defect 28.

**The deny-by-default needs no config file, and that is what keeps it small.** Config only ever affected the
UI. The only defensible default is denied for everything except strictly necessary, so nothing has to be
fetched before the push.

**`toGoogleSignals` must name every signal on every push.** A signal left out of an update keeps its previous
value, which is how a category that was granted and then revoked stays granted. Its return type is
`Record<GoogleSignal, ConsentState>`, so leaving one out is a compile error.

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
