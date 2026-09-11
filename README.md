# Consentio

**A tag manager reads consent as it loads.** Whatever the visitor answered has to be on the page before that
moment — a banner that renders afterwards gates nothing while looking like it does. Consentio puts the answer
there first: one blocking `<script>` in `<head>` above the tag manager snippet, or a Tag Manager template on
the Consent Initialization trigger.

It is a cookie consent banner for static sites — a bar and a settings modal in a closed shadow root, the
visitor's answer in one cookie, and Google Consent Mode signals on `dataLayer`.

**What it is not.** Not an npm package. No account, no server, nothing to keep running. Four consent
categories, fixed — a site changes their wording, not the set. Google Consent Mode is the only thing it
speaks; a script that does not read it runs unless you mark it, and Consentio intercepts no cookie. If
what you need is a consent platform, this is not one.

No runtime dependencies. Apache-2.0.

## 📝 Overview

**Consentio is delivered as a script.** It is not published to npm and it is not imported as a package — you
copy two built files into your site, or serve them from a CDN mirror of a tagged release.

| | |
|---|---|
| 🚀 **[Install directly](#-direct-install)** | one blocking `<script>` in `<head>`, above your tag manager |
| 🏷️ **[Install as a tag manager template](#-tag-manager-template)** | one template on the Consent Initialization trigger |
| 🍪 **[The cookie](#-the-cookie)** | one JSON object, and the three rules that are easy to get wrong |
| 🛠️ **[Development](#-development)** | build, typecheck, test, serve |

Full documentation: **[`website/pages/`](website/pages/)**, or `npm run serve` to read it as the Jekyll site
it is written for.

## 🧩 Two install routes, and they are not equivalent

| | **Directly in the site** | **Google Tag Manager custom template** |
|---|---|---|
| What you add | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | the Consentio tag, on the **Consent Initialization - All Pages** trigger |
| What pushes the consent default | the loader, on its first pass, before it fetches or injects anything | the template's own sandboxed code, before it calls `injectScript` |
| Where settings come from | three JSON files, fetched by URL | the template's own fields |
| Where the words come from | built-in English, a language file at any URL, or `data-language="el"` for the published pack at the CDN | built-in English, the tag's fields, a variable, or a published pack the tag loads from the CDN |
| Uses the loader | yes | **no — never** |
| What it holds back | scripts marked `type="text/plain" data-consentio`, released when their category is granted — nothing it is not told about | tags in the container |
| The cost | it blocks. 5.3 KB has to download before the page paints | **it only covers tags in that container** |

**The tag manager route's catch belongs in the open.** A template can only gate what the tag manager loads.
Take that route and *every* tag and cookie-setting script on the site has to be managed from the container —
anything pasted straight into the page fires regardless of what the visitor answered, while the banner looks
as if it is working. The [routes page](website/pages/routes.md) puts the two side by side.

> **Do not install both.** The template never loads the loader; it injects `consentio.min.js` itself and
> calls `Consentio.Create` on its own. The template stands down on a page where the loader ran, and says
> so on the console; an older one does not, and the visitor gets two banners that do not know about each
> other.

## 🚀 Direct install

Put `consentio-loader.min.js` and `consentio.min.js` at the same URL prefix — the loader finds the bundle
relative to its own `src` — then:

```html
<head>
  <meta charset="utf-8">

  <!-- 1. Consentio. Blocking, and first. -->
  <script src="/js/consentio-loader.min.js"
          data-consentio-loader
          data-settings-url="/data/consentio-settings.json"
          data-language-url="/data/en.json"
          data-cookies-url="/data/consentio-cookies.json"></script>

  <!-- 2. The tag manager container snippet, unchanged, AFTER the loader. -->
  <script>(function(w,d,s,l,i){/* ... Google's snippet ... */})
    (window,document,'script','dataLayer','GTM-XXXXXXX');</script>
</head>
```

> **No `async`, no `defer`.** Either one lets the browser run the loader after the tag manager has already
> read consent, which leaves you with a banner that gates nothing. The loader warns on the console when it
> sees one, whatever `data-debug` says.

`data-language="el"` in place of `data-language-url` fetches the published Greek pack from the CDN at the
loader's own version. A language file that does not load costs the language, not the banner: it falls back
to built-in English with one warning on the console.

A script pasted into the page — a widget, an embed, a vendor's pixel — runs whatever the visitor answered,
unless it is marked:

```html
<script type="text/plain" data-consentio="statistics_performance"
        src="https://vendor.example/analytics.js"></script>
```

Consentio replaces it with a live copy once that category is granted, and not before.
[`website/pages/hold-scripts.md`](website/pages/hold-scripts.md) has what it reaches and what it does not.

[`website/_layouts/base.html`](website/_layouts/base.html) is a live working example of this route.

## 🏷️ Tag manager template

Two templates you import into your container by hand: the tag itself, and an optional variable holding your
cookie table. They are built by `npm run build:gtm` from the parts in **[`gtm/`](gtm/)**, which explains what
each one is and how they are edited. Both are attached to every release as a `.tpl` file.

**They are provided as they are.** Neither is listed anywhere, and there is nothing to subscribe to - a fix
reaches your container when you import the newer file.

The tag's *Text source* has four values: built-in English, its own pre-filled fields, a variable, or a
published language pack it loads from the CDN at the same version as the banner. A pack that does not
load is logged and the banner keeps its English.

## 🍪 The cookie

One JSON object, URI-encoded, named `consentio` by default:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"},"date":"2026-09-09T10:00:00.000Z"}
```

Three things that are easy to get wrong, and that a tag manager template has to match by hand:

- **A version mismatch discards the whole stored value.** It does not merge and it does not partially
  apply — the banner shows again from scratch.
- **"No stored answer" is not "everything denied".** The fallback is the single category
  `strictly_necessary: granted`, which grants `security_storage` and denies the other six signals. A
  reader that falls back to four denied categories instead denies `security_storage` too, and the two routes
  then disagree about the same visitor.
- **The categories nest under `consents`.** A value written flat, beside `version`, reads as no stored
  answer and the banner asks again.

The [documentation](website/pages/cookie.md) states the contract in full — name, value, attributes, the five
reading rules and the traps. [`website/_data/cookie-catalogue.yml`](website/_data/cookie-catalogue.yml) is
the catalogue of other tools' cookies the site renders for copying into a cookie table.

## 📂 Repository structure

```text
/consentio
├── /src         # TypeScript source — the banner, the loader, the web components
├── /test        # node:test suites, one scenario per file
├── /dist        # what the CDN serves: the bundles, the two templates, the language packs
├── /gtm         # the Google Tag Manager templates, as the parts they are built from
├── /i18n        # the banner's words, one yaml file per language
├── /scripts     # the build and release helpers — the packs, the templates, the changelog
└── /website     # the Jekyll documentation site
```

Each folder with something to explain has its own `README.md`.

## 🛠️ Development

```bash
npm install
npm run typecheck     # tsc --noEmit
npm test              # node --test over test/**/*.test.mts
npm run test:plain    # the same page-free tests again, with no jsdom at all
npm run build:js      # the bundles,        into build/
npm run build:i18n    # the language packs, into build/i18n/
npm run build:gtm     # the two templates,  into build/<name>.tpl
npm run build:site    # the site's assets,  then Jekyll into website/_site/
npm run serve         # the same, served on 127.0.0.1:4001
npm run watch         # the bundles, rebuilt into website/js/ as you edit
```

**Two verbs.** `build:` is yours - `build:js`, `build:i18n` and `build:gtm` write `build/`, which mirrors
what a release ships, and `build:site` writes the site into `website/`. `publish:` is the workflows' -
`publish:js`, `publish:i18n` and `publish:gtm` write `dist/`, `publish:site` builds the published site.

> **A local site build loads no Google Tag Manager and drives the banner from the bundle you just built.**
> `website/_config.prod.yml` is what turns that around for the published site, and only `publish:site`
> and the deploy workflow pass it.

> **`npm run serve` builds the site's assets first, on purpose.** `website/js/` is gitignored, so a fresh
> clone has no bundles at all, and Jekyll will happily serve a site whose loader is a 404. It also rebuilds
> the language packs into `website/data/i18n/`, which — unlike the bundles — are committed.

> **`dist/` is the shipped product, not a convenience copy.** A CDN serves those exact bytes out of the git
> tag, so it is written by the release and by nothing else. No `build:` or `site:` script can reach it.
> CI fails any commit that wrote `dist/` and was not the release.

**Releases are one dispatch.** `.github/workflows/release.yml` takes a version, checks the changelog section
and that the version is not already tagged, builds and tests, then commits `dist/`, tags that commit and
publishes. Notes come from **[`CHANGELOG.md`](CHANGELOG.md)**; add to its `Unreleased` section as you go.

**The documentation site is deployed by hand.** `.github/workflows/site.yml` builds `website/` and uploads
it; it publishes only when dispatched with `publish` on, and only once Pages is set to the GitHub Actions
source. There is no push trigger.

**Contributing:** [`CONTRIBUTING.md`](CONTRIBUTING.md) has the whole loop — build, test, house style, and
what must never be in a pull request. **[`SECURITY.md`](SECURITY.md)** says how to report a vulnerability
and why a published tag is never patched in place.

**A test marked `todo` describes behaviour the code does not have yet**, and the run exits 0 with it
listed. There are none at the moment, so one turning up is something new. See
**[`test/README.md`](test/README.md)**.

## 📄 Licence

[Apache-2.0](LICENSE).
