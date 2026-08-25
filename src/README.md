# src

The TypeScript source. Two entry points, and the split between them is the whole design — it is not
recoverable from the filenames, which is why this page exists.

## 🧩 Two entry points, and they cannot be one bundle

| | `consentio-loader.ts` | `consentio.ts` |
|---|---|---|
| Ships as | `consentio-loader.js` / `.min.js` | `consentio.js` / `.min.js` |
| Size, minified | **4.6 KB**, 2.0 KB gzipped | **36.3 KB**, 11.3 KB gzipped |
| Output shape | a plain script. Exports nothing | a UMD library named `Consentio` |
| Runs | **blocking, in `<head>`, before the tag manager** | async, after |
| Does | reads the cookie, pushes `consent default`, then injects and configures the banner | the banner itself — six custom elements, the SCSS, the HTML templates, the state |

**One thing has to be blocking, and it is not the banner.** A tag manager reads consent the moment it
loads. A consent default pushed after that gates nothing at all, so the push cannot wait for a fetch, for
the banner, or for anything async. But the banner is 36.3 KB with the stylesheet and the templates
compiled into it, and blocking a page's first paint on that would be indefensible.

So the split is: **the smallest thing that must be blocking, blocking; everything else after.** The loader
reads the cookie and pushes the signals in its first pass, and only then fetches the config, injects
`consentio.min.js` and calls `Consentio.Create`.

**The tag manager route never loads the loader.** A custom template cannot inject a blocking script —
`injectScript` is always async — so the template pushes the default itself through the tag manager's own
consent API, then injects `consentio.min.js` and calls `Consentio.Create(config, cookies)`. That is why
the banner is a named UMD library and the loader is not: one of them is called by name from outside.

## ⚖️ Three modules are in both bundles, twice

The loader imports two of these and the banner imports all three. Webpack builds the two entry points
independently, so **each bundle carries its own copy**.

| Module | Holds |
|---|---|
| `lib/consent-signals.ts` | the seven Google signal names, the category-to-signal map, `toGoogleSignals()`. The only file where a Google name appears |
| `lib/consent-store.ts` | `readConsents` / `writeConsents` / `clearConsents`, and `BASELINE_CONSENTS`. No DOM beyond `document.cookie` |
| `lib/cookies.ts` | reading and writing a cookie, and its attributes |

A couple of duplicated kilobytes is the price. The alternative was a third file — a shared core, built and
tried, and deleted the same day: it meant a second blocking request and a second version to keep pinned,
which costs more than the bytes it saves.

## 📂 Layout

```text
src/
├── consentio-loader.ts    # entry point 1 - the blocking loader
├── consentio.ts           # entry point 2 - the banner, and Consentio.Create
├── types.ts               # the config shape, shared
├── globals.d.ts           # the .scss and .html import declarations, and the version constant
├── elements/              # the six custom elements. They extend HTMLElement at module load
├── lib/                   # the modules above, plus state, logging, focus, the DOM helpers
├── scss/                  # the stylesheet. Compiled to a string and inlined, not shipped as a file
└── templates/             # the four HTML templates. Also inlined as strings
```

**The stylesheet and the templates end up inside the bundle as strings** and are put into a closed shadow
root at run time. There is no CSS file to serve and no markup for a site's own styles to reach.

**The elements extend `HTMLElement` the moment their module loads.** That is why the test suite gives each
test file its own process, and why a module that needs no page must not import them.

## ⚙️ The version

**No file here carries a version literal.** `__CONSENTIO_VERSION__` is substituted at build time from
`package.json` by webpack's `DefinePlugin`, and the test harness does the same substitution in
`test/resolve.mjs`. One source, so a bundle cannot claim to be a version it is not.

## 🚫 No runtime dependencies

The shipped bundles contain no third-party code. Everything in `package.json` is a devDependency, jsdom
included. Keep it that way — a consent banner is a script other people put in their `<head>`, and every
dependency added here is one they cannot audit.
