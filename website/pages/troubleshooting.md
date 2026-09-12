---
title: Troubleshooting
permalink: /troubleshooting/
description: The things that go wrong when you install Consentio yourself - what you see, why it happens, and what to change.
---

Symptom first. If you are not sure which one you have, start with
[how to check what actually happened](#how-to-check-what-actually-happened) at the bottom.

## 🚫 The banner never appears {#the-banner-never-appears}

**Check the console first.** A few messages account for nearly all of it.

`[Consentio Loader] script not found`
: The tag is missing `data-consentio-loader`. The script finds itself by that attribute and cannot start
without it. Put it on exactly one tag.

**A 404 on `consentio.min.js`**
: The two files are not in the same folder. The small one works out where the big one is by looking next to
itself, so moving one without the other breaks it. Put them back together.

**`[Consentio Loader] Initialization failed: Error: /data/consentio-settings.json did not load: HTTP 404`**
: Your settings file did not load. Check `data-settings-url` is the path in the message and that your site
serves it. The file is optional — remove the attribute and
the banner still runs on built-in defaults, which is a quick way to prove the rest works. A language file or a
cookie table that does not load is not this: the banner still appears, in English or with
[empty tables](#the-settings-panel-tables-are-empty), and says so on the console.

`[Consentio Loader] the loader tag has no src, so the banner cannot be located`
: The tag was pasted inline. The small file finds the big one next to its own `src`, so it has to be
linked, not pasted.

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

**The two halves are reading different cookie names.** On the HTML route, `data-cookie-name` on the tag is
the only place the name is read from — `cookieName` in a settings file does nothing there, and Consentio says
so on the console. The Tag Manager route always uses `consentio` and cannot be changed. If you are running
the same site through both — do not — and you renamed the cookie, they will disagree.

**Something else is refusing the cookie.** Consentio reads the cookie back after writing it and prints
`the answer did not read back` when it is not there, whatever `data-debug` says. Nothing Consentio asks the
browser for should be refused, so this points at something else on the page: another consent tool, an
extension, or a browser set to block cookies for the site.

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
embed, a chat widget, a pixel in a footer include — is outside the container's reach. The fix is to move it
into the container, or to [mark the script]({{ '/hold-scripts/' | relative_url }}) — marking works on
either route. [Choose a route]({{ '/routes/' | relative_url }}) has the two side by side.

**A script you pasted into the page is not marked.** Consentio holds back only a tag
carrying `type="text/plain"` and `data-consentio`; everything else runs as it always did.
[Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) is the one change to make.

## 🚧 A held script never runs {#a-held-script-never-runs}

You marked a script with `type="text/plain" data-consentio="..."` and it does not run after the visitor
accepts.

- **The category is misspelled.** `data-consentio` has to be one of `strictly_necessary`,
  `preferences_functionality`, `statistics_performance` or `marketing_advertising`, exactly. Anything
  else matches nothing and the tag is left alone.
- **Nobody has answered yet.** A category's default state is not an answer, so on a page the visitor has
  not answered nothing marked runs — `strictly_necessary` included. A script that needs no consent does
  not get marked.
- **The category was not granted.** Read the cookie, below, and check which categories say `granted`.
- **It ran, and then the visitor revoked.** A script that has run has run; revoking stops it on the next
  page load, not this one.

## 🌍 The banner is in English, not the language you chose {#the-banner-is-in-english}

The language file did not load, and the banner fell back to its built-in English rather than not showing.
The console says which file:

`[Consentio Loader] the language file did not load, so the banner keeps its built-in English: <url>`
: On the HTML route. Check `data-language-url` is a path your site serves, or that the code in
`data-language` is one a published pack exists for — `el`, not `gr`.

`Consentio Tag: the language pack did not load, so the banner keeps its built-in English`
: On the Tag Manager route, with **Language** set to *A published language pack*. The tag loads the pack
from the CDN at the same version as the banner, so something between the visitor and the CDN stopped it.

## 🧩 Two banners at once {#two-banners-at-once}

You installed both routes. Pick one and remove the other. The template does not use
`consentio-loader.min.js`; it loads the main file itself. The template from this release stands down on a
page where the script tag ran, and says so on the console; an older one does not, and you get two copies
that do not know about each other, each writing over the other's answer.

## 📋 The settings panel tables are empty {#the-settings-panel-tables-are-empty}

The cookie list is a separate file and it is optional, so an empty table is what "not configured yet" looks
like.

- `data-cookies-url` is missing, or points at a 404 — the console then says `the cookie table did not
  load, so the settings panel shows no table`, with the address.
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

**1. Turn on logging.** Put `data-debug="true"` on the tag. It prints each address the script fetches, what
came back, and the consent default it pushed. Every other line is printed either way.
[Every console message](#every-console-message) is at the bottom.

**2. Read the cookie.** In the console:

```js
decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('consentio=')).slice(10))
```

You should get `{"version":1,"consents":{...},"date":"..."}` with all four categories. Anything else — no
cookie, broken JSON, a different `version`, no `consents` key — reads as *no stored answer* and the banner
shows again. A cookie with no `date` is not one of those: it was written before dates existed and is still a
good answer.
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

## 🖨️ Every console message {#every-console-message}

Everything Consentio prints, and when. The loader's lines are always printed unless the table says
`data-debug`; the banner's warnings are always printed, and its `[Consentio:Event]` and `[Consentio:GTM]`
lines only with `debug` on in the settings file.

| Message | When |
|---|---|
| `[Consentio Loader] script not found` | no tag carries `data-consentio-loader` |
| `[Consentio Loader] loaded with async or defer, so the consent default cannot arrive before the tag manager` | the tag has `async` or `defer` |
| `[Consentio Loader] Consent default pushed:` | the first message to Google went out. `data-debug` |
| `[Consentio Loader] data-version "<value>" is not a whole number, so version 1 is used` | the attribute holds something other than a whole number |
| `[Consentio Loader] Consentio is already initialized` | a second loader tag, or the banner already running. `data-debug` |
| `[Consentio Loader] the loader tag has no src, so the banner cannot be located` | the tag was pasted inline |
| `[Consentio Loader] Failed to load script:` | `consentio.min.js` did not load from the address shown |
| `[Consentio Loader] Constructor not found after script load` | the file at that address loaded but is not the banner |
| `[Consentio Loader] settings URL:`, `language URL:`, `cookies URL:` | the address about to be fetched. `data-debug` |
| `[Consentio Loader] both data-language and data-language-url are set - data-language-url wins` | both attributes are on the tag |
| `[Consentio Loader] the language file did not load, so the banner keeps its built-in English:` | the address that failed, and the reason |
| `[Consentio Loader] the cookie table did not load, so the settings panel shows no table:` | the address that failed, and the reason |
| `[Consentio Loader] settings loaded:`, `language loaded:`, `cookies loaded:` | what each file held. `data-debug` |
| `[Consentio Loader] Initialized successfully` | the banner is built |
| `[Consentio Loader] Initialization failed:` | the settings file did not load — `<url> did not load: HTTP 404` — or the banner threw while being built |
| `[Consentio] unknown consent category "<key>" ignored - the four categories are fixed` | a settings file or language pack names a fifth category |
| `[Consentio] "cookieName" in the settings file is ignored - the loader tag reads the cookie before the file arrives. Set data-cookie-name on the tag instead.` | the settings file names a cookie the tag does not. The same line for `"version"` and `data-version` |
| `[Consentio] policy URL "<value>" ignored - it must start with http://, https:// or /` | a `policyUrl` in either file that is not one of those |
| `[Consentio] hideFloatingButton is set - the site now owes the visitor a link of its own calling window.ConsentioInstance.openSettings()` | the setting is on |
| `[Consentio] the answer did not read back - the browser did not keep the "<name>" cookie. Nothing Consentio asks for should be refused, so look for something else on the page clearing cookies.` | the cookie was written and was not there afterwards |
| `[Consentio] openSettings ignored - the banner is not on the page yet` | `openSettings()` was called too early. `debug` |
| `[Consentio:Event] open-settings`, `accept-all-consents`, `reject-all-consents`, `cancel-settings`, `save-settings` | a button was pressed. `debug` |
| `[Consentio:GTM] Pushed event: consent`, `Pushed event: set`, `Consent updated` | the update went out. `debug` |

The Tag Manager template prints only in preview mode, and every line starts with `Consentio Tag`:

| Message | When |
|---|---|
| `Consentio Tag =` | what the pickers held, on every run |
| `Consentio Tag: the direct install route is on this page, so the tag stands down` | `window.ConsentioDefault` was already set by the script tag |
| `Consentio Tag: already initialized` | the tag fired twice on one page |
| `Consentio Tag: the Settings is not a JSON object, so it is ignored` | the Settings picker gave something that is not an object. The same line for `Language pack` |
| `Consentio Tag: cookieName is fixed to consentio on this route, so <name> is ignored` | the settings file names another cookie |
| `Consentio Tag: the Cookie table is not a JSON array, so the settings panel shows no table` | the Cookie table picker gave something that is not an array |
| `consent default =` | the signals it set, before loading anything |
| `settings =`, `language =`, `cookies =` | the three inputs as handed to the banner |
| `Consentio Tag: the language pack did not load, so the banner keeps its built-in English` | the pack's address follows; the banner still loads |
| `Consentio Tag: the banner script did not load` | the tag fails; the consent default was already set |
