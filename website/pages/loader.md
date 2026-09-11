---
title: The loader tag
anchor: loader
permalink: /loader/
description: Every attribute on the loader script tag, which ones win over the settings file, what it leaves on window, and what goes wrong when it is placed late.
---

The loader is the one script tag on the HTML route. It runs before anything else on the page, reads the
cookie, pushes the first consent message to Google, then fetches your files and starts the banner. Every
option it has is an attribute on the tag, because it has to read the cookie before it has fetched anything.
The Tag Manager route has no loader: the template does this job, with [fields on the
tag]({{ '/tag/' | relative_url }}#the-fields).

## 📄 A complete example {#a-complete-example}

```html
<script src="/js/consentio-loader.min.js"
        data-consentio-loader
        data-settings-url="/data/consentio-settings.json"
        data-language-url="/data/el.json"
        data-cookies-url="/data/consentio-cookies.json"
        data-cookie-lifetime="365"
        data-version="1"></script>
```

First in `<head>`, above your tag manager, with no `async` and no `defer`. Only `data-consentio-loader` is
required; the smallest working tag is the `src` and that one attribute.

## ⚙️ The attributes {#the-attributes}

| Attribute | Required | Default | What it does |
|---|---|---|---|
| `data-consentio-loader` | **yes** | — | Marks the tag so the script can find itself. Without it you get `script not found` on the console and nothing happens. Put it on exactly one tag |
| `data-settings-url` | no | none | Where the [settings file]({{ '/configuration/' | relative_url }}) is. Leave it out and the built-in defaults are used |
| `data-language-url` | no | none | Where the [language pack]({{ '/language/' | relative_url }}) is. Leave it out and the banner speaks its built-in English |
| `data-language` | no | none | A language code, `el`, for a published pack fetched from the CDN at this loader's own version. `data-language-url` wins if both are set, and the console says so |
| `data-cookies-url` | no | none | Where the [cookie table]({{ '/cookies/' | relative_url }}) is. Leave it out and the settings panel shows no table |
| `data-config-url` | no | none | **Deprecated, removed in 1.0.0.** [The older single settings file]({{ '/configuration/' | relative_url }}#the-older-single-file). Still read, with a console warning |
| `data-cookie-name` | no | `consentio` | Name of the cookie the answer is stored in |
| `data-cookie-lifetime` | no | `90` | Days an answer is kept before the visitor is asked again |
| `data-share-across-subdomains` | no | `false` | `"true"` stores one answer for every hostname your site answers on, instead of one each |
| `data-version` | no | `1` | Which stored answers are still valid. [Asking everyone again]({{ '/versioning/' | relative_url }}) is what raising it does |
| `data-debug` | no | `false` | `"true"` prints what it is doing to the console. Errors and the async/defer warning are always printed |
| `data-wait-for-update` | no | `500` | Milliseconds tags should wait for an answer before giving up. Only sent to a visitor who has not answered yet |

## 🥇 The tag wins over the settings file {#the-tag-wins}

**Four of these can also be keys in the settings file, and the tag wins.** If you put `cookieName`,
`version`, `cookieLifetime` or `shareAcrossSubdomains` in both places, the value on the tag is the one used
— everywhere, including inside the banner. You cannot end up with the tag reading one cookie and the banner
writing another. The settings-file versions exist for the Tag Manager route, which has no tag.

**`cookieName` and `version` are decided by the tag even when it does not name them**, because the script
has to read the cookie before any file has been fetched: leave them off the tag and you get `consentio` and
`1`, not what the settings file says. **Putting either in a settings file on this route does nothing at
all**, and Consentio says so on the console rather than leaving you to find it. The other two are not read
that early, so leaving them off the tag is what lets the settings file name them.

## 🔍 What it leaves on `window` {#what-it-leaves-on-window}

Three things. You do not need them to run the banner — they are there for when you are working out what
happened.

| Type this | You get |
|---|---|
| `window.ConsentioDefault` | What the first message to Google was built from: the cookie name, the version, the answers, and `consentGiven` — which is `false` when the visitor has not answered yet |
| `window.ConsentioInstance` | The banner itself. While this exists, the script will not start a second one, and a Tag Manager tag on the same page stands down |
| `window.Consentio` | The code that builds a banner, once the main file has loaded |

[Troubleshooting]({{ '/troubleshooting/' | relative_url }}#how-to-check-what-actually-happened) uses all
three.

## ⚠️ When it is placed wrong or a file is missing {#when-it-goes-wrong}

- **`async` or `defer` on the tag:** the consent default arrives after your tag manager has already
  decided. The console says `loaded with async or defer, so the consent default cannot arrive before the
  tag manager`, whatever `data-debug` says. [Why the tag has to be
  first]({{ '/install/direct/' | relative_url }}#do-not-put-async-or-defer-on-the-loader-tag).
- **No `data-consentio-loader`:** `script not found` on the console, and nothing happens.
- **The settings file or the cookie table does not load:** the banner does not start, and the console has
  an initialisation error naming the address.
- **The language pack does not load:** the banner starts in its built-in English, and the console names
  the address. Only this file is forgiven.
- **`data-language` names a code with no published pack:** the same — English, and the address on the
  console.
- **Both `data-language` and `data-language-url`:** the URL wins, and the console says so.
- **Both `data-config-url` and `data-settings-url`:** `data-settings-url` wins, and the console says so.
