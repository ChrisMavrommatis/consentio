# i18n

The banner's words, one file per language.

| File | What it is |
|---|---|
| `en.yaml` | English. Also the key list every other language is checked against |
| `el.yaml` | Greek |

`src/consentio.ts` imports `en.yaml` directly, the way it imports its stylesheet and its HTML templates -
webpack parses it with a `json`-type rule and `test/resolve.mjs` does the same for the test harness. So
there is nothing to generate and nothing to keep in step.

## 🛠️ Building

```
npm run build:i18n     # -> build/i18n/<code>.json, .js and .gtm.js
npm run build:site     # -> website/data/i18n/, what the site hands out
npm run publish:i18n   # -> dist/i18n/. The release workflow's
```

All three write the same three files per language. **`<code>.json` is the yaml, parsed, with nothing done
to it**: `locale`, `name`, an optional `policyUrl`, `texts`, and the four categories keyed under `consents`.
`<code>.js` is the same object assigned to `window.ConsentioLanguage`, which is how a Tag Manager template
can load it. `<code>.gtm.js` is the same object wrapped in `function () { return ...; }` - a Custom
JavaScript variable to paste into Tag Manager, shown on the site's tag-manager page with a copy control.

The json is read three ways, which is the point of it: it is argument two of `Consentio.Create`, it is
what `data-language-url` fetches on the direct route, and it is what a **Language pack variable** holds on
the tag manager route. None of the three needs it edited first.

`node scripts/i18n.mjs --check` reads the language files and writes nothing.

## 🌍 Where a pack is fetched from

**Pasting still works**: a pack is text you can open, put on your own site, or paste into a variable, and
a translation you host cannot go down with anyone else's server. Since the release after 0.2.0 a published
pack can also be loaded from the CDN, at the same version as the banner, so the words move with each
release:

- on the direct route, `data-language="el"` on the loader tag fetches `dist/i18n/el.json` at the loader's
  own version. `data-language-url` wins when both are set
- on the tag manager route, **Language** set to *A published language pack* injects `dist/i18n/el.js`
  before the banner and reads it off `window.ConsentioLanguage`

**A pack that does not load costs the language, not the banner.** Both routes log one line naming the
file and the banner appears in its built-in English. On the direct route that used to be an initialisation
failure - no language file, no banner - for any file that did not load; it is one now only for the
settings file, and a cookie table that does not load costs the table.

## 🌍 Adding a language

1. Copy `en.yaml` to `<code>.yaml` and translate the values in place. The English is what you are replacing,
   so nothing has to be looked up
2. Change `locale` and `name`
3. `npm test`
4. `node scripts/i18n.mjs --website`, and commit what it writes into `website/data/i18n/` with your yaml.
   Those files are site data and are committed on purpose, so the site serves your language from a clean
   checkout

`test/i18n/packs.test.mts` refuses a file that is missing a key, carries one English does not have, or
leaves a value blank. **A blank is not a fallback** - at runtime an empty string counts as a supplied value,
so it shows as an empty title rather than as the English. Leaving the key out is what falls back.

## 🚫 What is not in here

**`defaultState`.** It is behaviour, not words, and it lives in the settings file - `src/consentio.ts` holds
the default. **`alwaysOn` is not anywhere:** only `strictly_necessary` is ever always on, so it is derived
from the key rather than written down.

**`policyUrl` is the one address that may be here**, because a Greek site links a Greek policy page. It is
optional: leave it out and the settings file's address is used, and a blank one means this language has no
link at all.

**The cookie table.** The rows are one site's own cookies, not a translation. Only the four column headings
are here.

## 📖 Long text

`>-` means the paragraph carries on over the following indented lines, joined with single spaces. It keeps a
long paragraph readable instead of one very long line.
