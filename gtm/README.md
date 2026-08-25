# gtm

The three Google Tag Manager templates, developed here and published one per repository.

## 🏷️ The three templates

| Folder | Type | What it is | Pins the banner version |
|---|---|---|---|
| [consentio-tag/](consentio-tag/) | TAG | the banner. Sets the consent default, injects `consentio.min.js` and calls `Consentio.Create` | **yes**, in its CDN URL |
| [consentio-tag-texts/](consentio-tag-texts/) | MACRO | a variable supplying every string the banner renders | no |
| [consentio-tag-cookies/](consentio-tag-cookies/) | MACRO | a variable supplying the cookie table shown in the settings modal | no |

**Only the TAG template pins a version**, at `consentio-tag/template.tpl:144`. A version bump moves that one
template and leaves the two MACROs alone.

## 📂 Why they are here and published elsewhere

Google's community template gallery requires `template.tpl`, `metadata.yaml`, `LICENSE` and `README.md` at
the **root of a dedicated public repository**, one per template. None of them can be a folder inside this
one, and three templates means three published repositories.

Developing them here instead keeps the tag and the banner in one diff. **The consent cookie is a contract
that the TAG template will implement independently** once it sets its own consent default — it cannot wait
for `injectScript`, so it has to read the stored answer itself, in the sandbox, in its own repository.
Change the cookie in `src/` without changing it there and a returning visitor is asked again, with nothing
failing loudly. Keeping both in one repository is the only place that mismatch can be caught by reading.

> **These folders hold `template.tpl` only.** `metadata.yaml`, `LICENSE` and `README.md` are not here yet, so
> no folder is currently a complete copy of its published repository.

## 🛠️ Editing them

Templates are edited in the tag manager's own template editor and exported, or edited here as text. Either
way the exported file is the source: it carries the parameter definitions, the sandboxed code, the declared
permissions and the tests in one file.

Releasing a new banner version means editing the TAG template's CDN URL, and every edit goes through the
gallery's review. Batch changes accordingly.

## ⚠️ Known problems

Two things are wrong in `consentio-tag/template.tpl` today and are not yet fixed:

- **It sets no consent default.** Nothing in it calls the tag manager's consent API, so the only default is
  the one inside the injected bundle — which arrives after `injectScript`, and `injectScript` is always
  async. In this route that means the banner gates nothing.
- **`setInWindow('ConsentioIntance', ...)` at line 236 is misspelled.** The declared `access_globals`
  permission at line 411 is `ConsentioInstance`, so this is a write to an undeclared key and the sandbox
  rejects it. The double-initialisation guard it exists to feed is therefore dead.
