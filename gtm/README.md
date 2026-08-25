# gtm

The two Google Tag Manager templates, developed here and published one per repository.

## 🏷️ The two templates

| Folder | Type | What it is | Pins the banner version |
|---|---|---|---|
| [consentio-tag/](consentio-tag/) | TAG | the banner. Sets the consent default from the cookie, injects `consentio.min.js` and calls `Consentio.Create`. Holds every string it renders | **yes**, in its CDN URL |
| [consentio-tag-cookies/](consentio-tag-cookies/) | MACRO | a variable supplying the cookie table shown in the settings modal | no |

**Only the TAG template pins a version**, at `consentio-tag/template.tpl:148`. A version bump moves that one
template and leaves the MACRO alone.

## 📂 Why they are here and published elsewhere

Google's community template gallery requires `template.tpl`, `metadata.yaml`, `LICENSE` and `README.md` at
the **root of a dedicated public repository**, one per template. Neither can be a folder inside this one, so
two templates means two published repositories - and two gallery review cycles, which are not instant and
are not yours. That is why the strings live in the tag rather than in a third template of their own.

Each folder here holds all four, so it is a complete copy of what its published repository contains. The one
thing that cannot be filled in from here is the `versions` list in `metadata.yaml`: a version is a commit SHA
**in the published repository**, so the first entry can only be written once the file has been committed
there.

Developing them here instead keeps the tag and the banner in one diff. **The consent cookie is a contract
the TAG template implements independently** — it cannot wait for `injectScript`, so it reads the stored
answer itself, in the sandbox, in its own repository. Change the cookie in `src/` without changing it there
and a returning visitor is asked again, with nothing failing loudly. Keeping both in one repository is the
only place that mismatch can be caught by reading.

## 🧪 The one fixture both readers answer to

[contract.fixture.json](contract.fixture.json) holds worked cookie values — a first-time visitor, a returning
one, a version mismatch, a value written in the older flat shape, a malformed value. The banner's test suite
asserts against the file; the TAG template's `___TESTS___` block carries the same values by hand. No test can
span the two implementations, so this is what stands in for one: a disagreement shows up as a diff in one
file, and `test/gtm/template-contract.test.mts` fails when the two stop matching.

The MACRO template reads no cookie, so the fixture does not reach it.

## 🛠️ Editing them

Templates are edited in the tag manager's own template editor and exported, or edited here as text. Either
way the exported file is the source: it carries the parameter definitions, the sandboxed code, the declared
permissions and the tests in one file. **The editor is the only place that checks a permission is declared,
runs the tests and previews the fields**, so an edit made here is not finished until it has been pasted back
into the editor and saved.

Releasing a new banner version means editing the TAG template's CDN URL, and every edit goes through the
gallery's review. Batch changes accordingly.

## 🚫 Do not publish ahead of the tag

A published template pins a banner version in its CDN URL, and the CDN serves that tag. **Tag first, then
update the templates, then submit them for review.** A template published ahead of the tag it points at is a
404 on every site that installs it.
