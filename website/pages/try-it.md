---
title: Try it on this page
permalink: /try-it/
# Keeps the blocking <script> whatever _config sets the route to. This is the one page
# that demonstrates the direct install, and the only place the two routes can be seen
# answering for one visitor.
loader: true
description: The banner on this site is the real thing, running the direct install route. Clear the cookie here and it asks again, or reopen the settings from this page's own link.
scripts: [try-it]
---

**The banner on this site is not a screenshot.** This page loads `consentio-loader.min.js` as a
blocking script in `<head>` — [route 1]({{ '/install/direct/' | relative_url }}#route-1-directly-in-the-site),
the same markup the documentation gives you. Every other page on this site gets the banner from a Tag
Manager container instead — route 2 — and [the container page]({{ '/try-it/tag-manager/' | relative_url }})
is where to look at that one.

It also runs with `consentRequired: true`, which is the hardest setting to get right: a full-screen
blocking overlay that a visitor has to answer before they can reach the page. If you have already answered,
clear the cookie below and it comes back.

<div class="fixture" markdown="1">
### 🍪 Your answer, and how to change it {#your-answer-and-how-to-change-it}

<div class="fixture__actions" markdown="0">
<button type="button" class="button" id="consentio-reset">Clear the cookie and reload</button>
<button type="button" class="button button--quiet" id="consentio-open">Open the settings panel</button>
<button type="button" class="button button--quiet" id="consentio-refresh">Refresh the readout</button>
</div>

<p class="fixture__state" id="consentio-readout" role="status">Reading&hellip;</p>
</div>

## 🔍 What to look at {#what-to-look-at}

- **The bar and the settings modal** are rendered inside a closed shadow root, so nothing on this page can
  style them and nothing on this page leaks into them.
- **Tab through it with the mouse untouched.** With `consentRequired: true` the overlay is a dialog:
  Tab stays inside it, and Escape from the settings goes back to the bar.
- **The cookie** is named `consentio` here, because this site does not rename it. The readout above is its
  value, decoded — [the cookie]({{ '/cookie/' | relative_url }}#the-cookie-contract) explains what is in it.
- **`window.ConsentioDefault`** in the console holds what the very first message to Google was built from,
  before anything had been downloaded.
- **Open the settings panel** above is an ordinary page button calling
  `window.ConsentioInstance.openSettings()` — the same
  [link a site adds to its footer]({{ '/events/' | relative_url }}#reopening-the-settings-from-your-own-link).
  It works whether or not you have answered, and pressing it twice leaves one panel with focus where you
  put it.

## 🏷️ The other route, on the same site {#the-other-route-on-the-same-site}

[Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }}) is the one page here that does
**not** have the script tag. It is where the two ways of installing are checked against each other: answer
the banner on this page, then open that one and see whether it agrees about you.

## 📡 Watching what it sends {#watching-the-pushes}

Open the console and read `window.dataLayer` before and after you answer. The first entry is the
`consent default` — what you were allowed before answering. Answering adds a `consent update` with all seven
permissions named again. [What it tells Google]({{ '/datalayer/' | relative_url }}#what-reaches-the-datalayer)
sets out both.

```js
document.addEventListener('consentio:consent-update', (e) => console.log(e.detail));
```
