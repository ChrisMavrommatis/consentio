---
title: Troubleshooting
permalink: /troubleshooting/
description: The things that go wrong when you install Consentio yourself - what you see, why it happens, and what to change.
---

Symptom first. If you are not sure which one you have, start with
[how to check what actually happened](#how-to-check-what-actually-happened) at the bottom.

## 🚫 The banner never appears {#the-banner-never-appears}

**Check the console first.** Three messages account for nearly all of it.

`[Consentio Loader] script not found`
: The tag is missing `data-consentio-loader`. The script finds itself by that attribute and cannot start
without it. Put it on exactly one tag.

**A 404 on `consentio.min.js`**
: The two files are not in the same folder. The small one works out where the big one is by looking next to
itself, so moving one without the other breaks it. Put them back together.

**A 404 on your config or cookies file**
: Check `data-config-url` and `data-cookies-url` are paths your site actually serves. Both are optional — if
you remove them the banner still runs on built-in defaults, which is a quick way to prove the rest works.

**Nothing on the console at all**
: The tag is probably not running. View source on the built page and confirm the tag is really in the
`<head>` — a template or build step may be stripping or reordering it.

**You have already answered.** That is the most common one of all, and it is not a fault. Clear the
`consentio` cookie and reload. [The try-it page]({{ '/try-it/' | relative_url }}) has a button that does it.

## 🍪 The banner comes back every time {#the-banner-comes-back-every-time}

The answer is not being stored, or not being read back.

**You are on plain `http` and expected otherwise.** Over `https` the cookie is written with `Secure`; over
plain `http` it is written without it, on purpose, so that local development behaves like the deployed site.
If a choice does not stick on `http://localhost`, that is a fault, not the design.

**You changed `version` or `data-version`.** Raising it deliberately throws away every stored answer. That
is what it is for. See [Versioning stored consent]({{ '/versioning/' | relative_url }}#versioning-stored-consent).

**The two halves are reading different cookie names.** On the HTML route, `data-cookie-name` on the tag wins
over `cookieName` in the settings file. The Tag Manager route always uses `consentio` and cannot be changed.
If you are running the same site through both — do not — and you renamed the cookie, they will disagree.

**Something else is clearing cookies.** A consent tool, a privacy extension, or a `Clear-Site-Data` header
will take this cookie with the rest.

## ⏱️ Tags fire before anyone answers {#tags-fire-before-anyone-answers}

This is the failure that matters, and it is almost always ordering.

**`async` or `defer` is on the tag.** Take it off. Both let the browser run the script after your tag
manager has already decided what it may do, and a tag manager reads consent once, at load — it never asks
again. The script prints a warning when it sees either, whatever `data-debug` says.

**The tag manager snippet is above the Consentio tag.** Consentio has to be first, in `<head>`, above
everything.

**On the Tag Manager route, the tag is on the wrong trigger.** It has to be **Consent Initialization - All
Pages**, not *All Pages*. Only that trigger is guaranteed to run before everything else in the container.

**On the Tag Manager route, a tag is not in the container.** Anything pasted straight into a page — a video
embed, a chat widget, a pixel in a footer include — is outside the banner's reach entirely. Nothing
Consentio can do reaches it. That is [the catch]({{ '/' | relative_url }}#the-tag-manager-routes-catch-in-the-open),
and the fix is to move it into the container or switch routes.

## 🧩 Two banners at once {#two-banners-at-once}

You installed both routes. Pick one and remove the other. The template does not use
`consentio-loader.min.js`; it loads the main file itself. Run both and you get two copies that do not know
about each other, each writing over the other's answer.

## 📋 The settings panel tables are empty {#the-settings-panel-tables-are-empty}

The cookie list is a separate file and it is optional, so an empty table is what "not configured yet" looks
like.

- `data-cookies-url` is missing, or points at a 404.
- The file loads, but every entry's `category` matches none of the four category keys. An entry whose
  `category` matches nothing is never shown. The keys are `strictly_necessary`,
  `preferences_functionality`, `statistics_performance` and `marketing_advertising` — spelled exactly.

## 🔀 A category is denied when it should be granted {#a-category-is-denied-when-it-should-be-granted}

**Deny wins.** A Google signal is granted only when *every* category routed to it is granted, and a signal
nothing is routed to stays denied. `preferences_functionality` and `marketing_advertising` each cover more
than one signal — [the mapping]({{ '/datalayer/' | relative_url }}#categories-map-to-signals) shows which.

**You tried to add a fifth category.** The four are fixed. An entry whose `key` is not one of them is
ignored, with a warning on the console, and the banner runs on the four. You cannot add one, remove one, or
point one at a different Google signal.

**You are comparing a `consent default` with a `consent update`.** The default is what the visitor gets
before answering; the update is their answer. Both name all seven signals. Look at which one you are
reading.

## 🔍 How to check what actually happened {#how-to-check-what-actually-happened}

In order, cheapest first:

**1. Turn on logging.** Put `data-debug="true"` on the tag. It prints what the script is doing at each step.
Errors and the async/defer warning are printed either way.

**2. Read the cookie.** In the console:

```js
decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('consentio=')).slice(10))
```

You should get `{"version":1,"consents":{...}}` with all four categories. Anything else — no cookie, broken
JSON, a different `version`, no `consents` key — reads as *no stored answer* and the banner shows again.
[The cookie page]({{ '/cookie/' | relative_url }}#reading-it-four-rules-in-order) has the rules in order.

**3. Read what the first message to Google was built from.**

```js
window.ConsentioDefault
```

If it is `undefined` on a page that should be running the HTML route, the script did not run. If it is
`undefined` on the Tag Manager route, that is correct — only the script tag sets it.

**4. Read the dataLayer.**

```js
window.dataLayer.filter(e => e[0] === 'consent')
```

The first entry should be `consent default`, and it should be there before your tag manager's own entries.
[What reaches the dataLayer]({{ '/datalayer/' | relative_url }}#how-to-check-it) goes through it properly,
including with Tag Assistant.

**5. Watch for the answer.**

```js
document.addEventListener('consentio:consent-update', (e) => console.log(e.detail));
```

Fires every time someone saves settings or accepts all. See [Events]({{ '/events/' | relative_url }}#events).
