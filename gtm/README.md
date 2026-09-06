# gtm

The two Google Tag Manager templates. They live here and nowhere else, and are provided as they are.

## 🏷️ The two templates

| Folder | Type | What it is | Pins the banner version |
|---|---|---|---|
| [consentio-tag/](consentio-tag/) | TAG | the banner. Sets the consent default from the cookie, injects `consentio.min.js` and calls `Consentio.Create`. Holds every string it renders | **yes**, in its CDN URL |
| [consentio-tag-cookies/](consentio-tag-cookies/) | MACRO | a variable supplying the cookie table shown in the settings modal | no |

**Only the TAG template pins a version**, in the CDN URL at the top of `consentio-tag/src/sandbox.js`. A
version bump moves that one template and leaves the MACRO alone.

## 📥 How anyone gets one

**Download and import.** Every release attaches both `.tpl` files. In Tag Manager: **Templates → Tag
Templates → New**, the **⋮** menu, **Import**, pick the file, Save.

Neither is listed anywhere, so nothing tells anyone a newer one exists. **What someone imported is what
their container runs until they import a newer file** — including the banner version its CDN URL pins.

**The strings live on the tag** rather than in a third template of their own: they are set once per container
and never touched again, so the reuse a variable exists for was reuse nobody was doing. The cookie table
stays a variable because it is data — a table, plausibly shared, edited on a different rhythm.

## 🔗 Why they are developed beside the banner

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

The MACRO template reads no cookie, so the fixture does not reach it.

## 🛠️ Editing them

**`template.tpl` is built, not written.** Each one is assembled from the parts under its `src/`:

| Part | Section it becomes |
|---|---|
| `src/info.json` | `___INFO___` |
| `src/parameters/*.json` | `___TEMPLATE_PARAMETERS___`, one file per field, concatenated in filename order |
| `src/sandbox.js` | `___SANDBOXED_JS_FOR_WEB_TEMPLATE___` |
| `src/permissions.json` | `___WEB_PERMISSIONS___` |
| `src/tests.yaml` | `___TESTS___` |
| `src/notes.txt` | `___NOTES___` |
| `terms-of-service.txt` | `___TERMS_OF_SERVICE___`, shared by both |

**Nothing built lives in this folder.** `build:gtm` writes a folder per template — the file to import, what
it is, and the licence:

```
build/gtm/consentio-tag/
  template.tpl     built from src/
  README.md        copied from gtm/consentio-tag/
  LICENSE          copied from the repository root
```

**The licence is copied at build time** rather than kept as a second copy of the same file.

```bash
npm run build:gtm      # the parts -> build/gtm/<name>/
npm run publish:gtm    # the .tpl alone -> dist/<name>.tpl. The release workflow's
node scripts/gtm.mjs --check                        # do the parts still compose?
node scripts/gtm.mjs --decompose <export.tpl> <name>  # split an export back into parts
```

`test/gtm/template-composed.test.mts` runs `--check`, so bad JSON in a part, or a `$text` naming a string
`i18n/en.yaml` does not have, fails the suite rather than the template editor.

**The TAG template's twenty-one pre-filled strings are references, not copies.** A field holds
`{"$text": "texts.barTitle"}` and the build fills it from `i18n/en.yaml` - the same file the banner falls
back to. Correct a string once and both change.

**The editor is still the only place that checks a permission is declared, runs the tests and previews the
fields.** An edit made here is not finished until the built `.tpl` has been imported into the editor and
saved. Coming back the other way, `--decompose` splits the export into parts again.

## 🚫 Do not ship a template ahead of the tag

The TAG template pins a banner version in its CDN URL, and jsDelivr serves the git tree at that tag. **Tag
first, then move the URL in `src/sandbox.js`.** A template handed out ahead of the tag it points at is a 404
on every site that imports it.
