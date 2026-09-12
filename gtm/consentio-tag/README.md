# Consentio Tag

A Google Tag Manager template for [Consentio](https://github.com/ChrisMavrommatis/consentio), a small
consent banner for static sites.

The tag does two things, in this order:

1. **sets the Google consent default** from the Consentio cookie, in sandboxed code, before it loads anything
2. **loads the banner** and hands it your settings, so a visitor who has not answered is asked

**If Consentio's own script tag is on the page - the direct install route - the tag stands down** before
either, and prints one line on the console saying so. A page cannot get two banners from this template.

Full documentation: <https://chrismavrommatis.github.io/consentio/install/tag-manager/>

## ⏱️ Fire it on Consent Initialization {#trigger}

Use the **Consent Initialization - All Pages** trigger, and nothing else. Tag Manager guarantees that
trigger runs before every other trigger in the container, and Google reads consent the moment a tag loads.
On any other trigger the default arrives after the tags it is meant to hold back.

## ⚠️ What this route covers {#what-it-covers}

**Only tags in this container.** Anything pasted straight into the page - a chat widget, an embedded map, a
pixel in the HTML - sits outside consent control. The direct install route can hold a script like that back
until its category is granted; this one cannot.

## ⚙️ Pickers {#pickers}

Three inputs, the same three files the direct route fetches, each from a variable - the file's JSON text in
a Constant, or the parsed value from any other variable. Left at *None*, the tag reads the matching global
off the page instead, which is how a site running both routes keeps one copy of each file.

| Picker | What it takes | At *None* |
|---|---|---|
| Settings | `consentio-settings.json` - how the banner behaves | `window.ConsentioSettings`, or the banner's defaults |
| Language | *Built-in English*, *From a variable* or *A published language pack* - see below | `window.ConsentioLanguage`, or the built-in English |
| Language pack variable | a whole language pack, `en.json` or `el.json` as published. Shown for *From a variable* | - |
| Language pack | which published pack to load from the CDN. Shown for *A published language pack* | - |
| Cookie table | `consentio-cookies.json` - the rows the settings panel shows | `window.ConsentioCookies`, or no table |

Two keys of the settings file read differently here. `cookieName` is ignored - the permission below names
the cookie, so it is always `consentio`, and the tag logs one line when the file says otherwise. `version`
is read from the file, before the cookie, because there is no script tag to carry it.

## 💬 Where the wording comes from {#language}

| Language | What happens |
|---|---|
| **Built-in English** | the tag sends no words and the banner uses its own, so a later correction to them reaches you with the next version. A page that carries `window.ConsentioLanguage` is read here |
| **From a variable** | the whole pack comes from any Tag Manager variable - the JSON text in a Constant, a Custom JavaScript variable, or a Lookup Table keyed on the page's language |
| **A published language pack** | the tag loads `dist/i18n/<locale>.js` from the CDN at the same version as the banner, before the banner, so the words move with each release. If the pack does not load, the tag logs one line and the banner keeps its built-in English |

Pick one. There is no blending: a language you supply is a language you own.

**Until 1.0.0 every setting was a field, the words could be typed into fields under a *Custom* source, and
a second template held the cookie table a row at a time.** All three are gone; the three files are the
whole interface, on both routes.

## 🍪 The cookie {#the-cookie}

The tag reads a cookie named `consentio` and so does the banner it loads. They are two separate pieces of
code, in two languages, that have to agree about it.

The value is one JSON object, URI-encoded:

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

**How it is read**, and the order matters:

1. no cookie, or a value that will not parse as a JSON object - **no stored answer**
2. `version` is not the settings file's `version` (1 when the file says nothing) - **no stored answer.** The
   whole value is discarded, never partly applied
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
| Injects script: `cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio*` | the banner, and a published language pack |
| Accesses globals: `Consentio.Create`, `ConsentioInstance` | starts the banner, and stops a second trigger starting a second one |
| Reads globals: `ConsentioDefault`, `ConsentioSettings`, `ConsentioLanguage`, `ConsentioCookies` | stands down when the direct route's script tag ran; reads the pack it loaded and whatever the page carries at *None* |
| Template storage | the same guard, before the banner has loaded |
| Logging | what it read and decided, in preview mode |

## 🧪 Tests {#tests}

The template's own tests carry worked cookie values - a first-time visitor, a returning one, a version
mismatch, a value written in an older shape. The banner's test suite asserts the same values, which is the
only way the two readers can be kept in step.

## 📄 Licence {#licence}

Apache 2.0, the same licence as Consentio itself. The full text is at
<https://github.com/ChrisMavrommatis/consentio/blob/main/LICENSE>.
