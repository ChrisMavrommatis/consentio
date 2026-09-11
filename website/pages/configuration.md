---
title: Settings
anchor: configuration
permalink: /configuration/
description: Every option in Consentio's settings file, language file and cookie list, with defaults and a complete example.
---

Three files, all optional, one per concern. The settings file holds how the banner behaves; the language
file holds every word the visitor reads; the cookie list holds the rows shown to a visitor who opens the
panel. On the Tag Manager route there are no files — the same options are fields you fill in.

| File | On the tag | Holds |
|---|---|---|
| settings | `data-settings-url` | behaviour: the cookie, the version, whether an answer is required |
| language | `data-language-url`, or `data-language` for a published pack at the CDN | the words. A [language pack](https://github.com/ChrisMavrommatis/consentio/releases/latest) as published, or one of your own |
| cookies | `data-cookies-url` | the cookie table, one row per cookie your site sets |

**Words and behaviour are separate files because they change on different days, and often by different
people.** A translator gets the language file and can break nothing else; the language file a release
publishes — `en.json`, `el.json` — is exactly the file this route fetches, and exactly the file the Tag
Manager route reads from a variable.

**You only write what you want to change.** Every key is merged over the defaults on its own, so leaving one
out gives you the default. A blank string is not the same as a missing key: `""` is a value you asked for
and shows as an empty string.

## 📄 A complete example {#a-complete-example}

Every top-level option, with something in it. Nothing here is required.

`/data/consentio-settings.json` — behaviour:

```json
{
  "cookieName": "consentio",
  "cookieLifetime": 90,
  "shareAcrossSubdomains": false,
  "version": 1,
  "debug": false,
  "consentRequired": false,
  "policyUrl": "/privacy/",
  "hideFloatingButton": false,
  "consents": {
    "statistics_performance": { "defaultState": "denied" },
    "marketing_advertising": { "defaultState": "denied" }
  }
}
```

`/data/el.json` — the words, in the shape a published language pack has:

```json
{
  "locale": "el",
  "name": "Ελληνικά",
  "policyUrl": "/el/privacy/",
  "texts": {
    "barTitle": "Πολιτική Cookies",
    "buttonAcceptAll": "Αποδοχή όλων"
  },
  "consents": {
    "statistics_performance": {
      "title": "Στατιστικά",
      "description": "Μας δείχνουν πώς χρησιμοποιείται ο ιστότοπος."
    }
  }
}
```

Between them those files change two strings, one category's copy, one category's default state and the
policy address. Everything else — the other thirteen `texts` keys, the three categories not named, every
default — is untouched and keeps working.

## 🔧 The settings file {#top-level}

| Key | Type | Default | What it does |
|---|---|---|---|
| `cookieName` | string | `consentio` | Name of the cookie the answer is stored in. **Not read on the HTML route at all** — set `data-cookie-name` on the tag instead, and Consentio says so on the console if you put it here. **The Tag Manager route always uses `consentio`**: a template has to name the cookie it reads when it is published, so it cannot be a field |
| `cookieLifetime` | number | `90` | Days an answer is kept before the visitor is asked again. **Ignored if you also set `data-cookie-lifetime` on the tag.** Anything that is not a positive number falls back to 90. See [How long it lasts]({{ '/cookie/' | relative_url }}#how-long-it-lasts) |
| `shareAcrossSubdomains` | boolean | `false` | One answer for every hostname your site answers on, instead of one each. There is no domain to type: Consentio works out the one your hosts share by asking the browser. **Ignored if you also set `data-share-across-subdomains` on the tag.** See [One answer across subdomains]({{ '/cookie/' | relative_url }}#one-answer-across-subdomains) |
| `debug` | boolean | `false` | Turns on the banner's informational logging |
| `version` | number | `1` | Raise it to throw away every stored answer and ask everyone again. **Not read on the HTML route at all** — set `data-version` on the tag instead, and Consentio says so on the console if you put it here. See [Asking everyone again]({{ '/versioning/' | relative_url }}#versioning-stored-consent) |
| `consentRequired` | boolean | `false` | Shows a full-screen blocking overlay behind the bar and modal until the visitor answers |
| `policyUrl` | string | none | Where the banner's privacy policy link points, on the bar and in the panel. Leave it out and no link is shown. A language file may name its own address instead — see below. It must start with `http://`, `https://` or a single `/` for a page on your own site — anything else is dropped with a warning on the console, because the address goes into an `href` and is not escaped the way a text is |
| `hideFloatingButton` | boolean | `false` | Removes the round settings button the banner leaves in the bottom right corner. **Only set it once your own link is on every page** — see [Reopening the settings]({{ '/events/' | relative_url }}#reopening-the-settings-from-your-own-link). With it on and no link, a visitor cannot change their answer, and Consentio says so on the console |
| `consents` | object | the four categories | Keyed by category. The only thing in it is `defaultState` |

## 🌍 The language file {#the-language-file}

| Key | Type | What it does |
|---|---|---|
| `locale` | string | The language's code, `en`, `el`. It becomes the `lang` of the banner |
| `name` | string | The language's name in its own language. Nothing reads it at run time — it is there so the file says what it is |
| `policyUrl` | string | Optional. The privacy policy address **for this language**, which wins over the settings file. `""` means this language has no link at all; leaving the key out is what falls back |
| `texts` | object | Every string in the UI. See below |
| `consents` | object | Keyed by category, each with a `title` and a `description` |

**A released pack is a valid language file exactly as downloaded.** `en.json` and `el.json` are attached to
every release; point `data-language-url` at one, or copy it and edit the strings. To run one unedited
without hosting it, put `data-language="el"` on the tag and the pack is fetched from the CDN at the same
version as the script. On the Tag Manager route the same thing is *Text source* set to *A published
language pack*.

**A language file that does not load costs the language, not the banner.** The banner appears in its
built-in English and the console names the file that failed. The other two files are not forgiven that
way: a settings or cookies file that does not load stops the banner with an error.

## 💬 `texts` {#texts}

| Key | Default |
|---|---|
| `barTitle` | `Cookie Policy` |
| `barDescription` | `This site uses cookies. Until you choose, only the ones the site cannot run without are on…` |
| `buttonSettings` | `Settings` |
| `buttonSave` | `Save` |
| `buttonCancel` | `Cancel` |
| `buttonAcceptAll` | `Accept All` |
| `buttonRejectAll` | `Reject All` |
| `modalTitle` | `Cookie Settings` |
| `modalDescription` | A paragraph on what Save and Cancel do, and on GDPR and the ePrivacy directive |
| `alwaysOnLabel` | `Always On` |
| `policyLinkLabel` | `Privacy Policy` — the wording of the link `policyUrl` points at |
| `cookieTableHeaderName` | `Cookie Name` |
| `cookieTableHeaderPurpose` | `Cookie Purpose` |
| `cookieTableHeaderProvenance` | `Provenance` |
| `cookieTableHeaderDuration` | `Duration` |

## 📋 The four categories {#consents}

Each category is one row in the settings modal, and both files may name it — the settings file for what it
does, the language file for what it says.

| Key | In which file | What it does |
|---|---|---|
| `defaultState` | settings | `"granted"` or `"denied"` — what the switch shows to a visitor with no stored answer |
| `title` | language | Heading in the modal |
| `description` | language | Body text under the heading |

**The four categories are fixed. You can change every string, not the set.** A key that is not one of the
four is ignored, with a warning on the console, and the banner still runs. You cannot add a category, remove
one, or point one at a different Google permission. The reason is timing: the answer has to reach Google
before either file has been downloaded, so the four have to be known in advance.

The four are `strictly_necessary`, `preferences_functionality`, `statistics_performance` and
`marketing_advertising`. `strictly_necessary` starts granted and is always on — it shows the `alwaysOnLabel`
text instead of a switch, and no file can change that. The other three start denied.

**Changing one category:** name its key, and only the fields you are changing.

```json
{
  "consentRequired": true,
  "consents": { "marketing_advertising": { "defaultState": "denied" } }
}
```

```json
{
  "texts": { "barTitle": "Cookies on this site" },
  "consents": { "marketing_advertising": { "title": "Advertising" } }
}
```

## 🗂️ The older single settings file {#the-older-single-file}

Before the language file existed, `data-config-url` fetched one file carrying the behaviour, a `texts`
object and a `consents` **array**:

```json
{
  "consentRequired": true,
  "texts": { "barTitle": "Cookies on this site" },
  "consents": [{ "key": "marketing_advertising", "title": "Advertising" }]
}
```

**That still works, and it is deprecated: it is removed in 1.0.0.** `data-config-url` is still read, a file
in that shape is taken apart into a settings and a language for you, and the console says once that the
attribute is going. `alwaysOn` in such a file is ignored —
only `strictly_necessary` is ever always on, and it is now decided by the key rather than by a field.

Move to the three files above before 1.0.0. A translator can then be given one file that contains nothing
but words.

## 🍪 The cookies JSON {#the-cookies-json}

The file at `data-cookies-url` is a flat array. Each entry is one row of the table shown inside a category,
matched by `category` against a consent `key`. An entry whose `category` matches nothing is never shown.

```json
[
  {
    "name": "consentio",
    "purpose": "Stores the answer you gave to this banner, so you are not asked again on every page.",
    "provenance": "This site",
    "duration": "90 days",
    "category": "strictly_necessary"
  },
  {
    "name": "_ga",
    "purpose": "Tells Google Analytics one visitor apart from another.",
    "provenance": "Google",
    "duration": "2 years",
    "category": "statistics_performance"
  }
]
```

All five fields are strings and all five are shown verbatim. `duration` and `provenance` are free text —
nothing parses them.

[The cookie catalogue]({{ '/cookies/catalogue/' | relative_url }}) has rows in this shape for the tools a
site commonly runs, to copy in and check against the vendor.

**List every cookie your site really sets, including Consentio’s own.** The table is what a visitor reads
before deciding, so a name in it that your site does not set is a false statement about your own site, and a
cookie you do set but leave out is the one that matters. Open the browser’s storage inspector on a page
where you have accepted everything, and write down what is actually there.
