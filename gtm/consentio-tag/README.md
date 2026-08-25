# Consentio Tag

A Google Tag Manager template for [Consentio](https://github.com/ChrisMavrommatis/consentio), a small
consent banner for static sites.

The tag does two things, in this order:

1. **sets the Google consent default** from the Consentio cookie, in sandboxed code, before it loads anything
2. **loads the banner** and hands it your settings, so a visitor who has not answered is asked

Full documentation: <https://chrismavrommatis.github.io/consentio/install/tag-manager/>

## ⏱️ Fire it on Consent Initialization {#trigger}

Use the **Consent Initialization - All Pages** trigger, and nothing else. Tag Manager guarantees that
trigger runs before every other trigger in the container, and Google reads consent the moment a tag loads.
On any other trigger the default arrives after the tags it is meant to hold back.

## ⚠️ What this route covers {#what-it-covers}

**Only tags in this container.** Anything pasted straight into the page - a chat widget, an embedded map, a
pixel in the HTML - sits outside consent control. If you cannot move everything into Tag Manager, install
Consentio directly in your HTML instead.

## ⚙️ Fields {#fields}

| Field | What it does |
|---|---|
| Version | The version of your consent question. Raise it and every visitor is asked again |
| Debug | Logs what the tag decided to the console |
| Consent Required | Shows the banner as a full-screen overlay the visitor has to answer |
| Preferences / Statistics / Marketing Default State | What each category starts at in the settings panel |
| Text source | Where the banner's wording comes from - see below |
| Texts | Every string it shows, filled in with the English text. Shown when Text source is *Custom* |
| Texts Variable | A variable holding the whole set. Shown when Text source is *From a variable* |
| Cookies Variable | A **Consentio Tag - Cookies** variable, listing the cookies your site sets |

## 💬 Where the wording comes from {#text-source}

| Text source | What happens |
|---|---|
| **Built-in English** | the tag sends no strings and the banner uses its own, so a later correction to them reaches you with the next version |
| **Custom** | every string appears in a field, already filled in with the English text. Edit what you want, or paste a translation over it |
| **From a variable** | the whole set comes from any Tag Manager variable - a Custom JavaScript variable, or a Lookup Table keyed on the page's language |

Pick one. There is no blending: a language you supply is a language you own.

The Cookies variable is optional and independent of all three. At *None* the banner shows no cookie table.

## 🍪 The cookie {#the-cookie}

The tag reads a cookie named `consentio` and so does the banner it loads. They are two separate pieces of
code, in two languages, that have to agree about it.

The value is one JSON object, URI-encoded:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

**How it is read**, and the order matters:

1. no cookie, or a value that will not parse as a JSON object - **no stored answer**
2. `version` is not the Version field's value - **no stored answer.** The whole value is discarded, never
   partly applied
3. no `consents` key - **no stored answer**
4. otherwise `consents` is the answer

**No stored answer is not everything denied.** It is a single granted category, `strictly_necessary`, which
grants `security_storage` and nothing else. Reading it as four denied categories would deny `security_storage`
too, and this route would then disagree with the direct one about the same visitor.

The cookie name is fixed at `consentio`. Reading a cookie needs a permission naming it, and a name that could
drift from the banner's is one more way the two can disagree.

## 🔒 Permissions {#permissions}

| Permission | Why |
|---|---|
| Reads cookie value(s): `consentio` | the stored answer |
| Accesses consent state, write | the consent default |
| Writes data layer: `ads_data_redaction` | redacts ad identifiers while ad storage is denied |
| Injects script: `cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio*` | the banner |
| Accesses globals: `Consentio.Create`, `ConsentioInstance` | starts the banner, and stops a second trigger starting a second one |
| Template storage | the same guard, before the banner has loaded |
| Logging | debug output |

## 🧪 Tests {#tests}

The template's own tests carry worked cookie values - a first-time visitor, a returning one, a version
mismatch, a value written in an older shape. The banner's test suite asserts the same values, which is the
only way the two readers can be kept in step.

## 📄 Licence {#licence}

Apache 2.0. See [LICENSE](LICENSE).
