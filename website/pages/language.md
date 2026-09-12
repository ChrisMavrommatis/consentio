---
title: The language pack
anchor: language-pack
permalink: /language/
description: The file that holds every word the banner shows - each text key with its English, the four categories, and how to load a published pack or your own.
---

The language pack is the words file: every string the visitor reads, the title and description of each of
the four categories, and the address of a privacy policy in that language. Nothing in it changes how the
banner behaves — that is the [settings file]({{ '/configuration/' | relative_url }}). A translator can be
given this one file and can break nothing else.

**A published pack is a valid language pack exactly as downloaded.** `en.json` and `el.json` are attached
to [every release]({{ site.repository_url }}/releases/latest), built from one YAML file per language in
the source repository. Point the banner at one, or copy it and edit the strings.
[Tag Manager language packs]({{ '/language/tag-manager/' | relative_url }}) has the same packs as
variables to paste.

Keys merge the way the [settings file's]({{ '/configuration/' | relative_url }}) do: leave one out and the
banner uses its built-in English for that one, and `""` is a value, not a gap.

## 📄 A complete example {#a-complete-example}

Every key, with a site's own wording. Nothing here is required.

```json
{
  "locale": "en",
  "name": "English",
  "policyUrl": "/privacy/",
  "texts": {
    "barTitle": "Cookies on this site",
    "barDescription": "We use cookies. Until you choose, only the ones the site needs are on.",
    "buttonSettings": "Choose",
    "buttonSave": "Save my choice",
    "buttonCancel": "Back",
    "buttonAcceptAll": "Allow all",
    "buttonRejectAll": "Only the necessary ones",
    "modalTitle": "Your cookie choices",
    "modalDescription": "Turn a category on or off, then save.",
    "alwaysOnLabel": "Always on",
    "policyLinkLabel": "How we use cookies",
    "cookieTableHeaderName": "Cookie",
    "cookieTableHeaderPurpose": "What it is for",
    "cookieTableHeaderProvenance": "Who sets it",
    "cookieTableHeaderDuration": "How long it lasts"
  },
  "consents": {
    "strictly_necessary": {
      "title": "Necessary",
      "description": "The site does not work without these."
    },
    "preferences_functionality": {
      "title": "Preferences",
      "description": "Remember choices you make, like your language."
    },
    "statistics_performance": {
      "title": "Statistics",
      "description": "Tell us which pages are read, without identifying you."
    },
    "marketing_advertising": {
      "title": "Advertising",
      "description": "Let advertisers show you things you are more likely to want."
    }
  }
}
```

## 🌍 The keys {#the-keys}

| Key | Type | What it does |
|---|---|---|
| `locale` | string | The language's code, `en`, `el`. It becomes the `lang` of the banner |
| `name` | string | The language's name in its own language. Nothing reads it at run time — it is there so the file says what it is |
| `policyUrl` | string | Optional. The privacy policy address **for this language**, which wins over the one in the [settings file]({{ '/configuration/' | relative_url }}#top-level). `""` means this language has no link at all; leaving the key out is what falls back |
| `texts` | object | Every string in the UI. See below |
| `consents` | object | Keyed by category, each with a `title` and a `description` |

## 💬 `texts` {#texts}

Every key, with the built-in English a missing one falls back to.

| Key | Default |
|---|---|
| `barTitle` | `Cookie Policy` |
| `barDescription` | `This site uses cookies. Until you choose, only the ones the site cannot run without are on. Accept them all, reject the rest, or open the settings to choose category by category.` |
| `buttonSettings` | `Settings` |
| `buttonSave` | `Save` |
| `buttonCancel` | `Cancel` |
| `buttonAcceptAll` | `Accept All` |
| `buttonRejectAll` | `Reject All` |
| `modalTitle` | `Cookie Settings` |
| `modalDescription` | `Choose which cookies this site may use. Save stores your choice, Cancel leaves it as it was. Under the European general data protection regulation (GDPR) and the ePrivacy directive, a site must have your consent before it uses any cookie besides the strictly necessary ones. Expand a category to read what it covers.` |
| `alwaysOnLabel` | `Always On` — shown in place of the switch on `strictly_necessary` |
| `policyLinkLabel` | `Privacy Policy` — the wording of the link `policyUrl` points at |
| `cookieTableHeaderName` | `Cookie Name` |
| `cookieTableHeaderPurpose` | `Cookie Purpose` |
| `cookieTableHeaderProvenance` | `Provenance` |
| `cookieTableHeaderDuration` | `Duration` |

## 📋 The four categories {#the-four-categories}

Each category is one row in the settings panel, and this file holds its wording. The set is fixed and what
each one starts at is a [setting]({{ '/configuration/' | relative_url }}#consents).

| Key | Type | Default | What it does |
|---|---|---|---|
| `title` | string | `Strictly Necessary Cookies`, `Preferences Cookies`, `Statistics Cookies`, `Marketing Cookies` | Heading in the panel |
| `description` | string | a sentence or two on what the category covers | Body text under the heading |

**Changing one category:** name its key, and only the field you are changing.

```json
{
  "texts": { "barTitle": "Cookies on this site" },
  "consents": { "marketing_advertising": { "title": "Advertising" } }
}
```

## 🚀 On the HTML route {#on-the-html-route}

Two attributes on the loader tag, and you set one of them:

- **`data-language-url`** names a file you host — a published pack put beside your other files, or one of
  your own.
- **`data-language="el"`** fetches the published pack for that code from the CDN at the same version as
  the script, so there is no file to host and the words move with each release. It comes from
  `https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@<version>/dist/i18n/el.json`.

Set both and `data-language-url` wins, with a line on the console. Set neither and the banner uses its
built-in English.

**The page picks the language, not the browser.** Consentio reads neither `<html lang>` nor the browser's
language list. A site with pages in two languages puts a different `data-language` or `data-language-url`
on each page's tag, which a static site knows when it builds the page. A visitor's browser setting and
the page's language are different things, and the banner should read as the page does.

## 🏷️ On the Tag Manager route {#on-the-tag-manager-route}

The tag's **Language** picker has three choices: its built-in English, a published pack it loads itself,
or a variable holding a pack — the same file as above, pasted into a Constant as JSON text or returned by a
Custom JavaScript variable. With the picker at *Built-in English*, a page that carries
`window.ConsentioLanguage` — which is what a published `<locale>.js` sets — is read as the pack.
[Tag Manager language packs]({{ '/language/tag-manager/' | relative_url }}) has the packs ready to paste
into a variable, and the one paragraph on letting the tag load one.
[The tag]({{ '/tag/' | relative_url }}#the-three-language-choices) has the detail.

## ⚠️ When the file is missing or wrong {#when-the-file-is-missing-or-wrong}

**A language pack that does not load costs the language, not the banner.** The banner appears in its
built-in English and the console names the file that failed:

```
[Consentio Loader] the language file did not load, so the banner keeps its built-in English: <url>
```

[Troubleshooting]({{ '/troubleshooting/' | relative_url }}#the-banner-is-in-english) has the usual causes.

A `consents` key that is not one of the four is ignored with a warning, and the rest of the file is used.
A `policyUrl` that does not start with `http://`, `https://` or `/` is dropped with a warning, the same as
in the settings file, and no link is shown.
