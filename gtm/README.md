# gtm

The Google Tag Manager template. It lives here and nowhere else, and is provided as it is.

## 🏷️ The template

| Folder | Type | What it is | Pins the banner version |
|---|---|---|---|
| [consentio-tag/](consentio-tag/) | TAG | the banner. Sets the consent default from the cookie, injects `consentio.min.js` and calls `Consentio.Create` with three objects - settings, language, cookie table - each taken whole from a variable or off the page | **yes**, in its CDN URL |

**It pins a version** in the CDN URL at the top of `consentio-tag/src/sandbox.js`, filled in at build time
from `package.json`, so a released template loads the release it shipped in.

**There used to be a second one.** `consentio-tag-cookies` was a MACRO template with the cookie table typed
in one field at a time; 0.3.0 was the last release to attach it. The tag's **Cookie table** field takes the site's
`consentio-cookies.json` as text in a Constant, or the rows from any variable.

## 📥 How anyone gets one

**Download and import.** Every release attaches the `.tpl` file. In Tag Manager: **Templates → Tag
Templates → New**, the **⋮** menu, **Import**, pick the file, Save.

It is not listed anywhere, so nothing tells anyone a newer one exists. **What someone imported is what
their container runs until they import a newer file** — including the banner version its CDN URL pins.

**No string lives on the tag.** The words arrive as a whole language pack - one the tag loads from the CDN,
or a variable holding the file - and the settings and the cookie table arrive the same way, as the site's
own files in a Constant or from any variable.

## 🔗 Why it is developed beside the banner

**The consent cookie is a contract the TAG template implements independently** — it cannot wait for
`injectScript`, so it reads the stored answer itself, in the sandbox, in its own language. Change the cookie
in `src/` without changing it here and a returning visitor is asked again, with nothing failing loudly.
Keeping both in one repository is the only place that mismatch can be caught by reading.

## 🧪 The one fixture both readers answer to

[contract.fixture.json](contract.fixture.json) holds worked cookie values — a first-time visitor, a returning
one, a version mismatch, a value written in the older flat shape, a malformed value. The banner's test suite
asserts against the file; the TAG template's `src/tests.yaml` carries the same values by hand. No test can
span the two implementations, so this is what stands in for one: a disagreement shows up as a diff in one
file, and `test/gtm/template-contract.test.mts` fails when the two stop matching.

## 🛠️ Editing it

**The `.tpl` is built, not written.** It is assembled from the parts under `src/`:

| Part | Section it becomes |
|---|---|
| `src/info.json` | `___INFO___` |
| `src/parameters/*.json` | `___TEMPLATE_PARAMETERS___`, one file per field, concatenated in filename order |
| `src/sandbox.js` | `___SANDBOXED_JS_FOR_WEB_TEMPLATE___` |
| `src/permissions.json` | `___WEB_PERMISSIONS___` |
| `src/tests.yaml` | `___TESTS___` |
| `src/notes.txt` | `___NOTES___` |
| `terms-of-service.txt` | `___TERMS_OF_SERVICE___`, one file for the folder |

**Nothing built lives in this folder.** The template composes to one file, named after it:

```bash
npm run build:gtm      # the parts -> build/<name>.tpl
npm run publish:gtm    # the same file -> dist/<name>.tpl. The release workflow's, not yours
node scripts/gtm.mjs --check                          # do the parts still compose?
node scripts/gtm.mjs --decompose <export.tpl> <name>  # split an export back into parts
```

`build/` mirrors `dist/`, so what a release would ship can be looked at without writing `dist/`.

**`--decompose` is a true inverse**: composing a template, splitting the result back into parts and
composing again returns the same bytes, and the parts it writes match the committed ones exactly. The
format it writes is the editor's own — the byte order mark, the section markers in Google's order, and
apostrophes escaped and nothing else — so an export should split cleanly too. **That last step has not been
run against a real export yet**; it needs the editor, like everything else here.

`test/gtm/template-composed.test.mts` runs `--check`, so bad JSON in a part, or a `$text` naming a string
`i18n/en.yaml` does not have, fails the suite rather than the template editor.

**A part may reference `i18n/en.yaml` rather than copy it.** A field holding `{"$text": "texts.barTitle"}`
is filled from that file at build time, the same file the banner falls back to. No field does now -
the words reach the tag as a whole pack - but the mechanism stays, and `{"$locales": true}` in the pack
picker is the same idea for the list of published languages.

**The editor is still the only place that checks a permission is declared, runs the tests and previews the
fields.** An edit made here is not finished until the built `.tpl` has been imported into the editor and
saved. Coming back the other way, `--decompose` splits the export into parts again.

## 🚫 Do not ship a template ahead of the tag

The TAG template pins a banner version in its CDN URL, and jsDelivr serves the git tree at that tag. The
version is filled in from `package.json` when the `.tpl` is built, so **a built template is handed out only
once its tag exists**. One handed out ahead of the tag it points at is a 404 on every site that imports it.
