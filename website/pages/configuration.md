---
title: Settings
anchor: configuration
permalink: /configuration/
description: Every option in Consentio's settings file and cookie list, with defaults and a complete example.
---

Two files, both optional. The settings file holds your wording and options; the cookie list holds the rows
shown to a visitor who opens the panel. On the Tag Manager route there are no files — the same options are
fields you fill in.

**You only write what you want to change.** `texts` is merged key by key over the defaults, and `consents`
entry by entry, matched on `key`. Leave a key out and you get the default.

## 📄 A complete example {#a-complete-example}

Every top-level option, with something in it. Nothing here is required.

```json
{
  "cookieName": "consentio",
  "version": 1,
  "debug": false,
  "consentRequired": false,
  "texts": {
    "barTitle": "Cookies on this site",
    "barDescription": "We use cookies to run the site and, with your permission, to measure how it is used.",
    "buttonSettings": "Choose",
    "buttonSave": "Save my choice",
    "buttonAcceptAll": "Allow all"
  },
  "consents": [
    { "key": "statistics_performance", "title": "Measurement", "defaultState": "denied" },
    { "key": "marketing_advertising", "title": "Advertising" }
  ]
}
```

That file changes five strings and two category titles. Everything else — the other eight `texts` keys, the
two categories not named, every default — is untouched and keeps working.

## 🔧 Top level {#top-level}

| Key | Type | Default | What it does |
|---|---|---|---|
| `cookieName` | string | `consentio` | Name of the cookie the answer is stored in. **Ignored if you also set `data-cookie-name` on the tag** — the tag wins. This is the one the Tag Manager route uses |
| `debug` | boolean | `false` | Turns on the banner's informational logging |
| `version` | number | `1` | Raise it to throw away every stored answer and ask everyone again. **Ignored if you also set `data-version` on the tag.** See [Asking everyone again]({{ '/versioning/' | relative_url }}#versioning-stored-consent) |
| `consentRequired` | boolean | `false` | Shows a full-screen blocking overlay behind the bar and modal until the visitor answers |
| `texts` | object | see below | Every string in the UI |
| `consents` | array | the four categories | Copy changes to the four. The set is fixed |

## 💬 `texts` {#texts}

| Key | Default |
|---|---|
| `barTitle` | `Cookie Policy` |
| `barDescription` | `This site uses cookies to enhance your experience…` |
| `buttonSettings` | `Settings` |
| `buttonSave` | `Save` |
| `buttonCancel` | `Cancel` |
| `buttonAcceptAll` | `Accept All` |
| `modalTitle` | `Cookie Settings` |
| `modalDescription` | A paragraph on GDPR and the ePrivacy directive |
| `alwaysOnLabel` | `Always On` |
| `cookieTableHeaderName` | `Cookie Name` |
| `cookieTableHeaderPurpose` | `Cookie Purpose` |
| `cookieTableHeaderProvenance` | `Provenance` |
| `cookieTableHeaderDuration` | `Duration` |

## 📋 `consents` {#consents}

Each entry describes one category and one row in the settings modal.

| Key | Type | What it does |
|---|---|---|
| `key` | string | Which of the four categories the entry changes. It is also the cookie's JSON key and the value the cookies JSON matches on. **Required in every entry** |
| `title` | string | Heading in the modal |
| `description` | string | Body text under the heading |
| `alwaysOn` | boolean | `true` replaces the switch with the `alwaysOnLabel` text and forces the category granted |
| `defaultState` | `"granted"` \| `"denied"` | What the switch shows to a visitor with no stored answer |

**The four categories are fixed. You can change every string, not the set.** An entry whose `key` is not one
of the four is ignored, with a warning on the console, and the banner still runs. You cannot add a category,
remove one, or point one at a different Google permission. The reason is timing: the answer has to reach
Google before this file has been downloaded, so the four have to be known in advance.

The four categories are `strictly_necessary` (`alwaysOn: true`, `defaultState: "granted"`),
`preferences_functionality`, `statistics_performance` and `marketing_advertising` (all `alwaysOn: false`,
`defaultState: "denied"`).

**Overriding a built-in category:** give its `key` and only the fields you are changing.

```json
{
  "consentRequired": true,
  "texts": { "barTitle": "Cookies on this site" },
  "consents": [
    { "key": "marketing_advertising", "title": "Advertising" }
  ]
}
```

## 🍪 The cookies JSON {#the-cookies-json}

The file at `data-cookies-url` is a flat array. Each entry is one row of the table shown inside a category,
matched by `category` against a consent `key`. An entry whose `category` matches nothing is never shown.

```json
[
  {
    "name": "session_id",
    "purpose": "Maintains user session",
    "provenance": "First-party",
    "duration": "Session",
    "category": "strictly_necessary"
  },
  {
    "name": "analytics_id",
    "purpose": "Collects anonymous site usage data",
    "provenance": "Third-party",
    "duration": "1 Year",
    "category": "statistics_performance"
  }
]
```

All five fields are strings and all five are shown verbatim. `duration` and `provenance` are free text —
nothing parses them.
