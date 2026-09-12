---
title: The loader tag
anchor: loader
permalink: /loader/
description: Every attribute on the loader script tag, which ones win over the settings file, what it leaves on window, and what goes wrong when it is placed late.
---

The loader is the one script tag on the HTML route. It runs before anything else on the page, reads the
cookie, pushes the first consent message to Google, then fetches your files and starts the banner. Every
option it has is an attribute on the tag, because it has to read the cookie before it has fetched anything.
The Tag Manager route has no loader: the template does this job, with the same three files
[picked from variables]({{ '/tag/' | relative_url }}#the-pickers).

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
| `data-cookie-name` | no | `consentio` | Name of the cookie the answer is stored in |
| `data-cookie-lifetime` | no | `90` | Days an answer is kept before the visitor is asked again |
| `data-share-across-subdomains` | no | `false` | `"true"` stores one answer for every hostname your site answers on, instead of one each |
| `data-version` | no | `1` | Which stored answers are still valid. [Asking everyone again]({{ '/versioning/' | relative_url }}) is what raising it does. A value that is not a whole number is read as `1`, with a warning |
| `data-debug` | no | `false` | `"true"` prints each address it fetches, what came back, and the consent default it pushed. Every other line — the errors, the warnings and `Initialized successfully` — is printed either way. The banner's own logging is `debug` in the [settings file]({{ '/configuration/' | relative_url }}#top-level) |
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
| `window.ConsentioDefault` | What the first message to Google was built from: `cookieName`, `version`, `consents`, and `consentGiven` — which is `false` when the visitor has not answered yet. `cookieLifetime` and `shareAcrossSubdomains` are there too when their attributes are on the tag |
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
- **The settings file does not load:** the banner does not start, and the console has
  `Initialization failed:` naming the address and the reason — `/data/consentio-settings.json did not
  load: HTTP 404` for a missing file. This is the one file that is not forgiven.
- **The language pack does not load:** the banner starts in its built-in English, and the console names
  the address.
- **The cookie table does not load:** the banner starts with empty tables in the settings panel, and the
  console names the address.
- **`data-language` names a code with no published pack:** the same — English, and the address on the
  console.
- **Both `data-language` and `data-language-url`:** the URL wins, and the console says so.
- **The tag is pasted inline instead of linked:** `the loader tag has no src, so the banner cannot be
  located`. The consent default is still pushed; nothing else happens.
- **`consentio.min.js` does not load:** `Failed to load script:` with the address it tried. The two files
  have to sit in the same folder under the same name stem.
- **A second loader tag:** put one on the page, and only one. A second tag that runs after the banner has
  loaded stops and says `Consentio is already initialized` with `data-debug="true"`; one that runs before
  that is not noticed, reads the first tag's attributes and loads the banner twice.
- **`data-config-url` on the tag:** no longer read — 0.3.0 was the last release that read it.
  [The older single file]({{ '/configuration/' | relative_url }}#the-older-single-file) says what to split
  it into. The banner starts with its built-in settings as if the attribute were not there.
