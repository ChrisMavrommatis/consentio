---
title: Put it in your HTML
anchor: route-1-directly-in-the-site
permalink: /install/direct/
description: Add Consentio to your site with one script tag. Four steps, then the detail.
---

You are adding **one `<script>` tag** to the top of every page, and the small settings files it reads. This
route covers everything on the page, not just what a tag manager loads.

## 🚀 Four steps {#four-steps}

**1. Put two files where your site can serve them.**

`consentio-loader.min.js` and `consentio.min.js`, both in the same folder — say `/js/`. Get them from a
release on the [source repository]({{ site.repository_url }}/releases).

**They have to sit together and keep their names.** The small file finds the big one by looking next to
itself, and it decides which one to ask for from its own filename: `consentio-loader.min.js` loads
`consentio.min.js`, and `consentio-loader.js` loads `consentio.js`. Rename one, move one, or mix a minified
file with an unminified one, and nothing loads.

**2. Make your settings files.**

`/data/consentio-settings.json` — how the banner behaves. Start with this and change it later:

```json
{
  "consentRequired": false,
  "consents": {
    "statistics_performance": { "defaultState": "denied" }
  }
}
```

`/data/consentio-cookies.json` — the cookies you actually set, listed for visitors who open the settings.
An empty array `[]` is a valid start.

`/data/en.json` — the words, and **optional**. Leave it out and the banner uses its built-in English. To
change the wording or to run in another language, download a language pack from a
[release]({{ site.repository_url }}/releases/latest), put it beside the other two, and point
`data-language-url` at it.

[Settings]({{ '/configuration/' | relative_url }}#configuration) lists every option in all three files.

**3. Paste the tag into `<head>`, above everything else.**

```html
<script src="/js/consentio-loader.min.js"
        data-consentio-loader
        data-settings-url="/data/consentio-settings.json"
        data-cookies-url="/data/consentio-cookies.json"></script>
```

**It has to come first**, and it must not have `async` or `defer` on it. Both of those are explained below,
and both are the reason a banner ends up looking right while stopping nothing.

**4. Load a page.**

The banner appears. Answer it, reload, and it should stay gone. If it does not,
[troubleshooting]({{ '/troubleshooting/' | relative_url }}) has the common causes.

## 📄 The whole thing, in order {#the-markup}

With a tag manager underneath it, in the order it has to go:

```html
<head>
  <meta charset="utf-8">

  <!-- 1. Consentio. Blocking, and first. -->
  <script src="/js/consentio-loader.min.js"
          data-consentio-loader
          data-settings-url="/data/consentio-settings.json"
          data-language-url="/data/el.json"
          data-cookies-url="/data/consentio-cookies.json"></script>

  <!-- 2. The tag manager container snippet, exactly as Google gives it, AFTER Consentio. -->
  <script>(function(w,d,s,l,i){/* ... Google's snippet, unchanged ... */})
    (window,document,'script','dataLayer','GTM-XXXXXXX');</script>
</head>
```

This site is built with Jekyll and does exactly that. Its own layout file is a working example:

{% raw %}
```liquid
<script src="{{ '/js/consentio-loader.min.js' | relative_url }}" data-consentio-loader
        data-debug="false"
        data-settings-url="{{ '/data/consentio-settings.json' | relative_url }}"
        data-language-url="{{ '/data/consentio-language.json' | relative_url }}"
        data-cookies-url="{{ '/data/consentio-cookies.json' | relative_url }}"></script>
```
{% endraw %}

**Serving the files from a CDN instead of your own site is fine**, as long as the URL names an exact
version. Never a floating one — a URL that follows the newest release will change what your site runs
without you touching anything.

## ⏱️ The order matters {#the-order-matters}

A tag manager decides what it is allowed to do **the moment it loads**, and it never asks again on its own.
Anything that arrives afterwards is ignored. Google's own wording is that if consent code is called out of
order, consent defaults do not work.

So `consentio-loader.min.js` does one thing before anything else: it reads the cookie and announces what
the visitor allows. It does that by putting a message on `dataLayer` — the list of messages a tag manager
reads — and Google calls that first message the **consent default**.

It sends that message before it fetches any of your files, before it loads the main file, and before the
banner exists. The message needs no settings at all, which is exactly what lets it be sent with nothing downloaded
yet.

Everything after that — loading the main file, fetching your settings files, drawing the banner — happens
in the background, well after the tag manager has started.

[What it tells Google]({{ '/datalayer/' | relative_url }}#what-reaches-the-datalayer) shows the message
itself.

[How it works]({{ '/how-it-works/' | relative_url }}#how-it-works) has the full sequence.

## 🚫 Never put `async` or `defer` on this tag {#do-not-put-async-or-defer-on-the-loader-tag}

`async` and `defer` both tell the browser *run this whenever you like*. Whenever you like is after the tag
manager has already decided what it may do, which puts you back where you started: **a banner that stops
nothing.**

The script checks for both and writes a warning to the console when it finds one:

```
[Consentio Loader] loaded with async or defer, so the consent default cannot arrive before the tag manager
```

That warning is printed whatever `data-debug` says. A banner that silently stops nothing is worth the noise.

## ⚖️ What it costs {#what-it-costs}

The tag blocks, so **4.6 KB has to download and run before the page appears** — about 2 KB once your server
compresses it. That is the price of the answer arriving in time. There is no version of this that is both
correct and non-blocking, so it is better to know the number now than to find it in a performance audit
later.

The main file, `consentio.min.js`, is 36.3 KB (about 11 KB compressed) and loads in the background. It
blocks nothing.

[How it works]({{ '/how-it-works/' | relative_url }}#what-it-weighs) has both figures in one table.

## ⚙️ Everything you can put on the tag {#the-loader-tags-data-attributes}

These go on the tag itself, because the script needs them before it can fetch anything.

| Attribute | Required | Default | What it does |
|---|---|---|---|
| `data-consentio-loader` | **yes** | — | Marks the tag so the script can find itself. Without it you get `script not found` on the console and nothing happens. Put it on exactly one tag |
| `data-settings-url` | no | none | Where your settings file is. Leave it out and the built-in defaults are used |
| `data-language-url` | no | none | Where your language file is — a published language pack, or one of your own. Leave it out and the banner uses its built-in English |
| `data-cookies-url` | no | none | Where your cookie list is. Leave it out and the tables in the settings panel are empty |
| `data-config-url` | no | none | The older single settings file, carrying `texts` and a `consents` array. Still read, and still works. Use `data-settings-url` and `data-language-url` in new sites |
| `data-cookie-name` | no | `consentio` | Name of the cookie the answer is stored in |
| `data-cookie-lifetime` | no | `90` | Days an answer is kept before the visitor is asked again. See [How long it lasts]({{ '/cookie/' | relative_url }}#how-long-it-lasts) |
| `data-share-across-subdomains` | no | `false` | `"true"` stores one answer for every hostname your site answers on, instead of one each. There is no domain to type — Consentio works out the one they share. See [One answer across subdomains]({{ '/cookie/' | relative_url }}#one-answer-across-subdomains) |
| `data-version` | no | `1` | Which stored answers are still valid. See [Versioning stored consent]({{ '/versioning/' | relative_url }}#versioning-stored-consent) |
| `data-debug` | no | `false` | `"true"` prints what it is doing to the console. Errors and the async/defer warning are always printed |
| `data-wait-for-update` | no | `500` | Milliseconds tags should wait for an answer before giving up. Only sent to a visitor who has not answered yet |

**Four of these can also be set in the settings file, and the tag wins.** If you put `cookieName`,
`version`, `cookieLifetime` or `shareAcrossSubdomains` in both places, the value on the tag is the one used —
everywhere, including inside the banner. You cannot end up with the tag reading one cookie and the banner
writing another. The settings-file versions exist for the Tag Manager route, which has no tag.

**`cookieName` and `version` are decided by the tag even when it does not name them**, because the script
has to read the cookie before any file has been fetched: leave them off the tag and you get `consentio` and
`1`, not what the settings file says. **Putting either in a settings file on this route does nothing at
all**, and Consentio says so on the console rather than leaving you to find it. The other two are not read
that early, so leaving them off the tag is what lets the settings file name them.

## 🔍 What you can check in the console {#what-the-loader-leaves-behind}

Three things end up on `window`. You do not need them to run the banner — they are there for when you are
working out what happened.

| Type this | You get |
|---|---|
| `window.ConsentioDefault` | What the first message to Google was built from: the cookie name, the version, the answers, and `consentGiven` — which is `false` when the visitor has not answered yet |
| `window.ConsentioInstance` | The banner itself. While this exists, the script will not start a second one |
| `window.Consentio` | The code that builds a banner, once the main file has loaded |

[Troubleshooting]({{ '/troubleshooting/' | relative_url }}#how-to-check-what-actually-happened) uses all
three.
