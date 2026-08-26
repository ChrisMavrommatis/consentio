# Consentio

A small, frontend-only consent banner for static sites. It renders a bar and a settings modal inside a
closed shadow root, stores the visitor's answer in one cookie, and pushes Google Consent Mode signals to
`dataLayer`.

No runtime dependencies. Apache-2.0.

## 📝 Overview

**Consentio is delivered as a script.** It is not published to npm and it is not imported as a package — you
copy two built files into your site, or serve them from a CDN mirror of a tagged release.

| | |
|---|---|
| 🚀 **[Install directly](#-direct-install)** | one blocking `<script>` in `<head>`, above your tag manager |
| 🏷️ **[Install as a tag manager template](#-tag-manager-template)** | one template on the Consent Initialization trigger |
| 🍪 **[The cookie](#-the-cookie)** | one JSON object, and the two rules that are easy to get wrong |
| 🛠️ **[Development](#-development)** | build, typecheck, test, serve |

Full documentation: **[`website/pages/`](website/pages/)**, or `npm run serve` to read it as the Jekyll site
it is written for.

## 🧩 Two install routes, and they are not equivalent

| | **Directly in the site** | **Google Tag Manager custom template** |
|---|---|---|
| What you add | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | the published template, on the **Consent Initialization - All Pages** trigger |
| What pushes the consent default | the loader, on its first pass, before it fetches or injects anything | the template's own sandboxed code, before it calls `injectScript` |
| Where settings come from | two JSON files, fetched by URL | the template's own fields |
| Uses the loader | yes | **no — never** |
| The cost | it blocks. 4.6 KB has to download before the page paints | **it only covers tags in that container** |

**The tag manager route's catch belongs in the open.** A template can only gate what the tag manager loads.
Take that route and *every* tag and cookie-setting script on the site has to be managed from the container —
anything pasted straight into the page fires regardless of what the visitor answered. That is worse than no
banner, because it looks compliant.

> **Do not install both.** The template never loads the loader; it injects `consentio.min.js` itself and
> calls `Consentio.Create(config, cookies)`. Run both and the visitor gets two banners that do not know about
> each other.

## 🚀 Direct install

Put `consentio-loader.min.js` and `consentio.min.js` at the same URL prefix — the loader finds the bundle
relative to its own `src` — then:

```html
<head>
  <meta charset="utf-8">

  <!-- 1. Consentio. Blocking, and first. -->
  <script src="/js/consentio-loader.min.js"
          data-consentio-loader
          data-config-url="/data/consentio-config.json"
          data-cookies-url="/data/consentio-cookies.json"></script>

  <!-- 2. The tag manager container snippet, unchanged, AFTER the loader. -->
  <script>(function(w,d,s,l,i){/* ... Google's snippet ... */})
    (window,document,'script','dataLayer','GTM-XXXXXXX');</script>
</head>
```

> **No `async`, no `defer`.** Either one lets the browser run the loader after the tag manager has already
> read consent, which leaves you with a banner that gates nothing. The loader warns on the console when it
> sees one, whatever `data-debug` says.

[`website/_layouts/base.html`](website/_layouts/base.html) is a live working example of this route.

## 🏷️ Tag manager template

Two templates, published one per repository because the gallery requires it: the tag itself, and an optional
variable holding your cookie table. They are developed in **[`gtm/`](gtm/)**, which explains what each one is
and how they are edited.

## 🍪 The cookie

One JSON object, URI-encoded, named `consentio` by default:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

Two things that are easy to get wrong, and that a tag manager template has to match by hand:

- **A version mismatch discards the whole stored value.** It does not merge and it does not partially
  apply — the banner shows again from scratch.
- **"No stored answer" is not "everything denied".** The fallback is the single category
  `strictly_necessary: granted`, which grants `security_storage` and denies the other six signals. A
  reader that falls back to four denied categories instead denies `security_storage` too, and the two routes
  then disagree about the same visitor.
- **The categories nest under `consents`.** A value written flat, beside `version`, reads as no stored
  answer and the banner asks again.

The [documentation](website/pages/cookie.md) states the contract in full — name, value, attributes, the five
reading rules and the traps.

## 📂 Repository structure

```text
/consentio
├── /src         # TypeScript source — the banner, the loader, the web components
├── /test        # node:test suites, one scenario per file
├── /dist        # the shipped bundles. Build output, and what the CDN serves
├── /gtm         # the Google Tag Manager templates
├── /scripts     # the release workflow's helpers — the changelog parser and the version check
└── /website     # the Jekyll documentation site
```

Each folder with something to explain has its own `README.md`.

## 🛠️ Development

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # node --test over test/**/*.test.mts
npm run test:plain    # the same page-free tests again, with no jsdom at all
npm run build         # the bundles, into build/lib/
npm run build:website # the same bundles, into website/js/, for the documentation site
npm run build:site    # the above, then the Jekyll site into website/_site/
npm run build:site:prod  # the same, with website/_config.prod.yml overlaid — what CI publishes
npm run serve         # the bundles, then the site on 127.0.0.1:4001
```

> **A local site build loads no Google Tag Manager and drives the banner from the bundle you just built.**
> `website/_config.prod.yml` is what turns that around for the published site, and only `build:site:prod`
> and the deploy workflow pass it.

> **`npm run serve` builds the JavaScript first, on purpose.** `website/js/` is gitignored, so a fresh clone
> has none, and Jekyll will happily serve a site whose loader is a 404.

> **`dist/` is the shipped product, not a convenience copy.** A CDN serves those exact bytes out of the git
> tag, so it is written by the release and by nothing else. No local build can reach it — `npm run build`
> writes to `build/lib/`. CI fails a push whose `dist/` is not what the source builds, and fails one that
> wrote `dist/` by hand.

**Releases are one dispatch.** `.github/workflows/release.yml` takes a version, checks the changelog section
and that the version is not already tagged, builds and tests, then commits `dist/`, tags that commit and
publishes. Notes come from **[`CHANGELOG.md`](CHANGELOG.md)**; add to its `Unreleased` section as you go.

**The documentation site is deployed by hand.** `.github/workflows/site.yml` builds `website/` and uploads
it; it publishes only when dispatched with `publish` on, and only once Pages is set to the GitHub Actions
source. There is no push trigger.

**Contributing:** [`CONTRIBUTING.md`](CONTRIBUTING.md) has the whole loop — build, test, house style, and
what must never be in a pull request. **[`SECURITY.md`](SECURITY.md)** says how to report a vulnerability
and why a published tag is never patched in place.

**Some tests are marked `todo` on purpose.** They describe behaviour the code does not have yet, so the run
exits 0 with those listed. That is the correct state. See **[`test/README.md`](test/README.md)**.

## 🏁 Release note

Moving the consent default into the loader is a **breaking change** — the loader tag has to stop being
`async` — and the version needs to go to **0.1.0**. It is a two-repository release: `consentio-tag` pins the
version in its CDN URL, so it moves with the tag. The cookie table variable pins nothing and stays put.

## 📄 Licence

[Apache-2.0](LICENSE).
