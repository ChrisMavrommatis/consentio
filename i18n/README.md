# i18n

The banner's words, one file per language.

| File | What it is |
|---|---|
| `en.yaml` | English. Also the key list every other language is checked against |
| `el.yaml` | Greek |

`src/consentio.ts` imports `en.yaml` directly, the way it imports its stylesheet and its HTML templates -
webpack parses it with a `json`-type rule and `test/resolve.mjs` does the same for the test harness. So
there is nothing to generate and nothing to keep in step.

## Building

```
npm run build:i18n     # -> build/i18n/<code>.json
npm run build:site     # -> website/data/i18n/<code>.json, what the site hands out
npm run publish:i18n   # -> dist/i18n/<code>.json. The release workflow's
```

All three write the same file: `{ texts, consents: [...] }`, which is what `Consentio.Create` takes.

`node scripts/i18n.mjs --check` reads the language files and writes nothing.

## Nothing is downloaded at runtime

A pack is text you open and paste. No page fetches one, so a pack that fails to load cannot cost anyone
their language, and a translation is never a service that can go down.

## Adding a language

1. Copy `en.yaml` to `<code>.yaml` and translate the values in place. The English is what you are replacing,
   so nothing has to be looked up
2. Change `locale` and `name`
3. `npm test`

`test/i18n/packs.test.mts` refuses a file that is missing a key, carries one English does not have, or
leaves a value blank. **A blank is not a fallback** - at runtime an empty string counts as a supplied value,
so it shows as an empty title rather than as the English. Leaving the key out is what falls back.

## What is not in here

**`alwaysOn` and `defaultState`.** They are behaviour, not words, and live in `src/consentio.ts`.

**The cookie table.** The rows are one site's own cookies, not a translation. Only the four column headings
are here.

## Long text

`>-` means the paragraph carries on over the following indented lines, joined with single spaces. It keeps a
long paragraph readable instead of one very long line.
