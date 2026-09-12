---
title: The cookie table
anchor: the-cookie-table
permalink: /cookies/
description: The file that lists the cookies your site sets - the five keys of a row, how a row finds its category, and where the file goes on each route.
---

The cookie table is the list of cookies your site sets, shown to a visitor who opens the settings panel:
one row per cookie, under the category it belongs to. It is one of three files; the
[settings file]({{ '/configuration/' | relative_url }}) holds how the banner behaves and the
[language pack]({{ '/language/' | relative_url }}) holds the words. It is optional, and an empty array `[]`
is a valid start.

**List every cookie your site really sets, including Consentio's own.** The table is what a visitor reads
before deciding, so a name in it that your site does not set is a false statement about your own site, and a
cookie you do set but leave out is the one that matters. Open the browser's storage inspector on a page
where you have accepted everything, and write down what is actually there.
[The cookie catalogue]({{ '/cookies/catalogue/' | relative_url }}) has rows in this shape for the tools a
site commonly runs: tick the ones you set and it hands back this file for the HTML route, or a variable for
the Tag Manager route — then check every row against the vendor.

## 📄 A complete example {#a-complete-example}

A flat array. Each entry is one row.

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

## 🍪 The keys of a row {#the-keys-of-a-row}

All five are strings. Four are shown to the visitor exactly as written — nothing parses `duration` or
`provenance` — and the fifth decides where.

| Key | What it holds | Shown under |
|---|---|---|
| `name` | The cookie's name as it appears in the browser | `cookieTableHeaderName` |
| `purpose` | What it is for, in words a visitor can read. It is the column they stop on | `cookieTableHeaderPurpose` |
| `provenance` | Who sets it — your site, or the name of the third party that does | `cookieTableHeaderProvenance` |
| `duration` | How long it lasts. `Session` if it goes when the browser closes | `cookieTableHeaderDuration` |
| `category` | Which of the four categories the row appears under — see below | not shown |

The four column headings are words, so they live in the [language pack]({{ '/language/' | relative_url }}#texts).

## 📋 How a row finds its category {#how-a-row-finds-its-category}

`category` is matched, spelled exactly, against one of the four keys: `strictly_necessary`,
`preferences_functionality`, `statistics_performance` or `marketing_advertising`. A row whose `category`
matches nothing is never shown, and nothing says so. The four are fixed, and
[Settings]({{ '/configuration/' | relative_url }}#consents) says why.

## 🚀 On the HTML route {#on-the-html-route}

`data-cookies-url` on the loader tag names the file — `/data/consentio-cookies.json` in the install steps,
but any address your site serves. Leave the attribute out and the panel shows no table.

## 🏷️ On the Tag Manager route {#on-the-tag-manager-route}

The tag's **Cookie table** picker takes the same file, three ways:

- **A Constant variable** holding the JSON text above, pasted in whole. The tag parses it. This is the
  usual way.
- **A Custom JavaScript variable** returning the array, `function () { return [ ... ]; }` — what the
  catalogue's *Copy as Tag Manager variable* gives you.
- **The page itself**, with the picker at *None*: `<script>window.ConsentioCookies = [ ... ]</script>` in
  `<head>`, above the container snippet. A site that runs both routes keeps one file this way.

Left at *None* on a page with no `ConsentioCookies`, the panel shows no table.
[The tag]({{ '/tag/' | relative_url }}#three-ways-in) has the detail.

## ⚠️ When the file is missing or wrong {#when-the-file-is-missing-or-wrong}

- **No `data-cookies-url`, or the variable left at *None*:** every category's table is empty, and nothing
  is said. That is what "not configured yet" looks like.
- **The file does not load:** the banner starts with empty tables, and the console names the address:
  `the cookie table did not load, so the settings panel shows no table`.
- **The file is not an array:** an object, say. It is treated as no table. On the HTML route nothing is
  said; the tag says `the Cookie table is not a JSON array, so the settings panel shows no table` in
  preview mode.
- **Every row's `category` matches none of the four:** the file loaded and the tables are still empty.
  [Troubleshooting]({{ '/troubleshooting/' | relative_url }}#the-settings-panel-tables-are-empty) is the
  page for that symptom.

**Declaring a cookie does not stop the script that sets it.**
[Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) is how the script waits for the
category the row names.
