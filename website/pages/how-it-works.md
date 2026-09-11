---
title: How it works
anchor: how-it-works
permalink: /how-it-works/
description: What runs when, on both install routes, and why the first script cannot be allowed to wait.
---

You do not need this page to install Consentio. You need it when something is not behaving and you want to
know what should have happened.

## ⏱️ The sequence, in your HTML {#the-sequence-in-your-html}

`consentio-loader.min.js` is small and blocking, and it does its most important work before it downloads
anything at all.

1. **It finds its own tag** by the `data-consentio-loader` attribute. No tag, no run — it prints
   `script not found` and stops.
2. **It reads the consent cookie** and works out the seven Google signals from it. If there is no cookie, it
   uses the built-in fallback rather than "everything denied" — the difference matters, and
   [the cookie page]({{ '/cookie/' | relative_url }}#no-stored-answer-is-not-everything-denied) explains why.
3. **It pushes `consent default` onto the `dataLayer`, synchronously.** This is why the tag
   blocks. Nothing has been fetched yet; it does not need anything to have been.
4. **It publishes `window.ConsentioDefault`** — what that push was built from.
5. Everything after this point is asynchronous and the page carries on: it injects `consentio.min.js`,
   fetches your settings, language and cookie files, builds the banner, and inserts it. A language file
   that does not load is replaced by the built-in English, with one warning on the console; a settings or
   cookies file that does not load stops the banner, with an error.
6. **Once there is a stored answer** — one just given, or one from an earlier visit — the banner releases
   every script marked `type="text/plain" data-consentio` whose category is granted.
   [Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) has what that reaches and what it
   does not.

Steps 1 to 4 are why `async` and `defer` break it. Both let the browser run the tag after your tag manager
has already read consent, and there is no way to correct that afterwards — a tag manager reads consent once,
at load.

## 🏷️ The sequence, in Tag Manager {#the-sequence-in-tag-manager}

1. The **Consent Initialization - All Pages** trigger fires. Tag Manager guarantees this runs before every
   other trigger in the container.
2. **If `window.ConsentioDefault` is already set, the template stands down** — the script tag from the
   other route ran on this page — and prints one line saying so.
3. The template reads the same cookie, by the same rules, in sandboxed template code, and **sets the consent
   default through Tag Manager's own consent API.**
4. With *Text source* on *A published language pack*, it calls `injectScript` for `dist/i18n/<locale>.js`
   at the same pinned version and reads the pack off `window.ConsentioLanguage`. A pack that does not load
   is logged and the banner keeps its built-in English.
5. It calls `injectScript` for `consentio.min.js` at a pinned version, then `Consentio.Create` from its
   own fields and the pack, if there was one.

`injectScript` is always asynchronous, which is why step 3 cannot be handed to the file it loads — by the
time that file runs, Tag Manager has already decided what it may do.

The template's entry point into the bundle:

```js
// Three objects, one per concern - the same three the JSON files hold on the other route.
Consentio.Create(settings, language, cookies);
```

The template sends the settings and the wording as one object, which `Create` takes apart itself. That is
deliberate: the template pins an exact version of the bundle, so it has to call the bundle it pins in a way
an older one also understands.

`Create` puts the instance on `window.ConsentioInstance` itself, so there is nothing to assign afterwards.
That is what the template's run-once guard reads, and what your own page calls to
[reopen the settings]({{ '/events/' | relative_url }}#reopening-the-settings-from-your-own-link).

**The cookie is a contract, not an implementation detail.** The template reads it a second time, in a
different language, in Tag Manager's sandbox. Its name, its `version` field, its shape and what "no stored
answer" means all have to agree exactly, or the two routes disagree about the same visitor — silently.
Anyone writing a reader implements against
[the cookie page]({{ '/cookie/' | relative_url }}#the-cookie-contract), not against a guess, and
[the fallback rule]({{ '/cookie/' | relative_url }}#no-stored-answer-is-not-everything-denied) is the part
that is easiest to get wrong.

## 🧩 The two routes, in technical terms {#the-two-routes-in-technical-terms}

| | **Directly in the site** | **Google Tag Manager custom template** |
|---|---|---|
| What you add | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | the Consentio tag, on the **Consent Initialization - All Pages** trigger |
| What pushes the consent default | the loader, on its first pass, before it fetches or injects anything | the template's own sandboxed code, before it calls `injectScript` |
| Where settings come from | three JSON files, fetched by URL | the template's own fields |
| Where a published language pack comes from | your own copy at `data-language-url`, or the CDN at the loader's version with `data-language` | the CDN at the template's version, when *Text source* asks for it |
| Uses the loader | yes | **no — never** |
| What it holds back | scripts marked `type="text/plain" data-consentio`, released when their category is granted | tags in the container, through its own consent settings |
| The cost | it blocks. 5.3 KB has to download before the page paints | **it only covers tags in that container** |

[Choose a route]({{ '/routes/' | relative_url }}) has the same comparison in the terms a site owner
decides by.

## 🔒 The banner is inside a closed shadow root {#the-banner-is-inside-a-closed-shadow-root}

The bar, the settings panel and the overlay are all rendered inside a shadow root attached with
`{ mode: 'closed' }`. Two consequences worth knowing:

- **Your CSS cannot reach it, and its CSS cannot reach your page.** There is nothing to override and nothing
  to accidentally break. Restyling means changing the source, not writing a selector.
- **`document.activeElement` returns the host element**, not whatever is focused inside. A closed root
  retargets it. If you are writing anything that inspects focus around the banner, that is the trap.

## ⚖️ What it weighs {#what-it-weighs}

Measured on the files this site is serving right now.

| File | Minified | Compressed | When it loads |
|---|---|---|---|
| `consentio-loader.min.js` | 5.3 KB | about 2.3 KB | blocking, in `<head>`, before the page paints |
| `consentio.min.js` | 42.5 KB | about 13.1 KB | in the background, after the default is already pushed |

The compressed column is gzip, which is what almost any server will do for you. **Only the first file is on
the critical path**, and only because the answer has to reach your tag manager before it decides anything.
On the Tag Manager route neither file blocks — and neither does the banner cover anything outside the
container.

## 🔍 What ends up on `window` {#what-ends-up-on-window}

Three globals, listed on [the loader tag]({{ '/loader/' | relative_url }}#what-it-leaves-on-window).
`window.ConsentioDefault` is the useful one when you are checking behaviour: it is set by the loader and by
nothing else, so its absence tells you a page is running the Tag Manager route.
