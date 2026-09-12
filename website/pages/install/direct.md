---
title: Put it in your HTML
anchor: route-1-directly-in-the-site
permalink: /install/direct/
description: Add Consentio to your site with one script tag. Four steps, then the detail.
---

You are adding **one `<script>` tag** to the top of every page, and the small settings files it reads. The
answer reaches your tag manager before it starts, and a script you mark waits for consent.
[Choose a route]({{ '/routes/' | relative_url }}) puts this route beside the Tag Manager one.

## 🚀 Four steps {#four-steps}

**1. Put two files where your site can serve them.**

`consentio-loader.min.js` and `consentio.min.js`, both in the same folder — say `/js/`. Get them from a
release on the [source repository]({{ site.repository_url }}/releases). A release attaches those two, the
unminified `consentio-loader.js` and `consentio.js`, the two `.LICENSE.txt` files the minified ones refer
to, `consentio-tag.tpl` for the other route, and each language pack as `en.json`, `en.js` and `en.gtm.js`.

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
An empty array `[]` is a valid start; [the cookie table]({{ '/cookies/' | relative_url }}) is what goes
in a row.

`/data/en.json` — the words, and **optional**. Leave it out and the banner uses its built-in English. To
change the wording or run in another language, put a [language pack]({{ '/language/' | relative_url }})
beside the other two and point `data-language-url` at it.

[Settings]({{ '/configuration/' | relative_url }}) lists every key in the settings file, and
[builds one]({{ '/configuration/' | relative_url }}#build-the-file) from switches;
[the catalogue]({{ '/cookies/catalogue/' | relative_url }}) builds a cookie table from ticked rows.

**3. Paste the tag into `<head>`, above everything else.**

```html
<script src="/js/consentio-loader.min.js"
        data-consentio-loader
        data-settings-url="/data/consentio-settings.json"
        data-cookies-url="/data/consentio-cookies.json"></script>
```

**It has to come first**, and it must not have `async` or `defer` on it. Both of those are explained below,
and both are the reason a banner ends up looking right after your tags have already decided.

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

This site is built with Jekyll and does exactly that. Its layout prints the tag through a plugin, and on
[the try-it page]({{ '/try-it/' | relative_url }}) it comes out as:

```html
<script src="/consentio/js/consentio-loader.min.js" data-consentio-loader data-debug="false"
        data-settings-url="/consentio/data/consentio-settings.json"
        data-language-url="/consentio/data/i18n/en.json"
        data-cookies-url="/consentio/data/consentio-cookies.json"
        data-cookie-name="consentio" data-version="3"></script>
```

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
manager has already decided what it may do, which puts you back where you started: **a banner your tags
never heard from.**

The script checks for both and writes a warning to the console when it finds one:

```
[Consentio Loader] loaded with async or defer, so the consent default cannot arrive before the tag manager
```

That warning is printed whatever `data-debug` says. A banner that silently arrives late is worth the noise.

## ⚖️ What it costs {#what-it-costs}

The tag blocks, so **5.4 KB has to download and run before the page appears** — 2.4 KB once your server
compresses it, measured on the 0.3.0 release. That is the price of the answer arriving in time. There is no version of this that is
both correct and non-blocking, so it is better to know the number now than to find it in a performance
audit later.

The main file, `consentio.min.js`, is 42.5 KB (13.1 KB compressed) and loads in the background. It blocks
nothing.

[How it works]({{ '/how-it-works/' | relative_url }}#what-it-weighs) has both figures in one table.

## ⚠️ What it can stop {#what-it-can-stop}

The answer reaches Google's tags before they start, and they act on it. **A script you pasted into the page
yourself does not read that answer** — a chat widget, an embedded map, a pixel from a vendor's
instructions — and it runs the moment the browser reaches it. Mark it with `type="text/plain"` and the
category it needs, and it runs once that category is granted and not before. A script you do not mark runs
as it always did. [Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) shows the tag before
and after, and what it cannot reach.

## ⚙️ Everything you can put on the tag {#the-loader-tags-data-attributes}

The tag in step 3 names two files. It can also name the language pack, the cookie's name and lifetime, the
version, and whether to print what it is doing. [The loader tag]({{ '/loader/' | relative_url }}) lists
every attribute, which of them win over the settings file, and the three things it leaves on `window` for
when you are working out what happened.
