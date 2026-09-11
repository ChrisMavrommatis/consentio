---
title: The settings file
anchor: configuration
permalink: /configuration/
description: Every key in Consentio's settings file with its type and default, the four categories, and the older single file.
---

The settings file holds how the banner behaves: the cookie, the version, whether an answer is required,
what each category starts at. It is one of three files, and the only one that is not words. The
[language pack]({{ '/language/' | relative_url }}) holds every word the visitor reads and the
[cookie table]({{ '/cookies/' | relative_url }}) holds the rows shown in the settings panel. On the Tag
Manager route there are no files: the same options are [fields on the tag](#on-the-tag-manager-route).

**You only write what you want to change.** Every key is merged over the defaults on its own, so leaving one
out gives you the default. A blank string is not a missing key: `""` is a value you asked for.

## 📄 A complete example {#a-complete-example}

Every key, with something in it. Nothing here is required.

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
    "strictly_necessary": { "defaultState": "granted" },
    "preferences_functionality": { "defaultState": "denied" },
    "statistics_performance": { "defaultState": "denied" },
    "marketing_advertising": { "defaultState": "denied" }
  }
}
```

## 🔧 The keys {#top-level}

| Key | Type | Default | What it does |
|---|---|---|---|
| `cookieName` | string | `consentio` | Name of the cookie the answer is stored in. **Not read on the HTML route at all** — set `data-cookie-name` on the tag instead, and Consentio says so on the console if you put it here. **The Tag Manager route always uses `consentio`**: a template has to name the cookie it reads when it is published, so it cannot be a field |
| `cookieLifetime` | number | `90` | Days an answer is kept before the visitor is asked again. **Ignored if you also set `data-cookie-lifetime` on the tag.** Anything that is not a positive number falls back to 90. See [How long it lasts]({{ '/cookie/' | relative_url }}#how-long-it-lasts) |
| `shareAcrossSubdomains` | boolean | `false` | One answer for every hostname your site answers on, instead of one each. There is no domain to type: Consentio works out the one your hosts share by asking the browser. **Ignored if you also set `data-share-across-subdomains` on the tag.** See [One answer across subdomains]({{ '/cookie/' | relative_url }}#one-answer-across-subdomains) |
| `debug` | boolean | `false` | Turns on the banner's informational logging |
| `version` | number | `1` | Raise it to throw away every stored answer and ask everyone again. **Not read on the HTML route at all** — set `data-version` on the tag instead, and Consentio says so on the console if you put it here. See [Asking everyone again]({{ '/versioning/' | relative_url }}#versioning-stored-consent) |
| `consentRequired` | boolean | `false` | Shows a full-screen blocking overlay behind the bar and modal until the visitor answers |
| `policyUrl` | string | none | Where the banner's privacy policy link points, on the bar and in the panel. Leave it out and no link is shown. A language pack may name [its own address]({{ '/language/' | relative_url }}#the-keys) instead. It must start with `http://`, `https://` or a single `/` for a page on your own site — anything else is dropped with a warning on the console, because the address goes into an `href` and is not escaped the way a text is |
| `hideFloatingButton` | boolean | `false` | Removes the round settings button the banner leaves in the bottom right corner. **Only set it once your own link is on every page** — see [Reopening the settings]({{ '/events/' | relative_url }}#reopening-the-settings-from-your-own-link). With it on and no link, a visitor cannot change their answer, and Consentio says so on the console |
| `consents` | object | the four categories | Keyed by category. The only thing in it is `defaultState` — see below |

## 📋 The four categories {#consents}

Each category is one row in the settings panel. The settings file says what it does; the
[language pack]({{ '/language/' | relative_url }}#the-four-categories) says what it says.

| Key | Type | What it does |
|---|---|---|
| `defaultState` | string | `"granted"` or `"denied"` — what the switch shows to a visitor with no stored answer. It is not what is sent to Google before the visitor answers; that is always denied |

**The four categories are fixed. You can change every string, not the set.** A key that is not one of the
four is ignored, with a warning on the console, and the banner still runs. You cannot add a category, remove
one, or point one at a different Google permission. The reason is timing: the answer has to reach Google
before any file has been downloaded, so the four have to be known in advance.

The four are `strictly_necessary`, `preferences_functionality`, `statistics_performance` and
`marketing_advertising`. `strictly_necessary` starts granted and is always on — it shows the `alwaysOnLabel`
text instead of a switch, and no file can change that. The other three start denied.

**Changing one category:** name its key, and only the field you are changing.

```json
{
  "consentRequired": true,
  "consents": { "marketing_advertising": { "defaultState": "denied" } }
}
```

## 🚀 On the HTML route {#on-the-html-route}

`data-settings-url` on the [loader tag]({{ '/loader/' | relative_url }}) names the file. Four of the keys
above — `cookieName`, `version`, `cookieLifetime` and `shareAcrossSubdomains` — can also be attributes on
that tag, and [the tag wins]({{ '/loader/' | relative_url }}#the-tag-wins) when both are set. That page
lists every attribute.

## 🏷️ On the Tag Manager route {#on-the-tag-manager-route}

There is no file. Every key above is a field on the Consentio tag, and the cookie's name is fixed at
`consentio`. [The Tag Manager tag]({{ '/tag/' | relative_url }}) lists every field, its default, and the
key it stands for.

## ⚠️ When the file is missing or wrong {#when-the-file-is-missing-or-wrong}

- **No `data-settings-url`:** the built-in defaults, and no message.
- **The file does not load:** the banner does not start, and the console has an initialisation error naming
  the address. The language pack is forgiven that way; this file and the cookie table are not.
- **A category key that is not one of the four:** ignored with a warning, and the banner runs.
- **`cookieName` or `version` in the file on the HTML route:** ignored with a warning saying which tag
  attribute to set instead.
- **A `policyUrl` that does not start with `http://`, `https://` or `/`:** dropped with a warning, and no
  link is shown.

## 🗂️ The older single settings file {#the-older-single-file}

Before the language pack existed, `data-config-url` fetched one file carrying the behaviour, a `texts`
object and a `consents` **array**:

```json
{
  "consentRequired": true,
  "texts": { "barTitle": "Cookies on this site" },
  "consents": [{ "key": "marketing_advertising", "title": "Advertising" }]
}
```

**That still works, and it is deprecated: it is removed in 1.0.0.** `data-config-url` is still read, a file
in that shape is taken apart into settings and a language pack for you, and the console says once that the
attribute is going. `alwaysOn` in such a file is ignored — only `strictly_necessary` is ever always on, and
it is decided by the key rather than by a field.

Move to the three files before 1.0.0. A translator can then be given one file that contains nothing but
words.
