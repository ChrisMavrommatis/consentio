---
title: Events
anchor: events
permalink: /events/
description: How to run your own code when a visitor answers the banner, and how to reopen the settings from a link of your own.
---

**You do not need this page to make consent work.** Consentio already tells
[Google's tags]({{ '/datalayer/' | relative_url }}#what-reaches-the-datalayer) what they may do, on its own.

This is for the other case: **you have a script of your own that should only load if the visitor allows it.**
An embedded map, a chat widget, a heatmap tool. Consentio cannot hold those back for you, but it will tell
you when to.

## 📣 The two events {#the-two-events}

Both are fired on `document`, and both carry the visitor's answers.

| Event | When it fires |
|---|---|
| `consentio:consent-update` | Every time someone accepts all, rejects all, or saves their choices |
| `consentio:initialized` | Once, when the banner first appears — carrying whatever was already stored |

## 📄 Loading something only when it is allowed {#loading-something-only-when-it-is-allowed}

You need to handle two people: the one answering right now, and the one who answered on a previous visit and
will never see the banner again.

```js
function onAllowed(consents) {
  if (consents.statistics_performance !== 'granted') return;
  // load your script here
}

// Someone answering now.
document.addEventListener('consentio:consent-update', (e) => onAllowed(e.detail));

// Someone who answered on a previous visit.
document.addEventListener('consentio:initialized', (e) => onAllowed(e.detail));
```

`detail` is the answers, one per category:

```js
{
  strictly_necessary: 'granted',
  preferences_functionality: 'denied',
  statistics_performance: 'granted',
  marketing_advertising: 'denied'
}
```

<div class="callout callout--warn" markdown="1">
**Register the `consentio:initialized` listener early** — in the `<head>`, or at the top of your own script.
It fires while the banner is being built, and a listener added after that will never see it. The
`consentio:consent-update` one can be added whenever you like.
</div>

## 🚫 Make sure it can only run once {#make-sure-it-can-only-run-once}

`consentio:consent-update` fires **every** time someone saves, so a visitor who opens the settings twice will
trigger your code twice. Guard it:

```js
let loaded = false;
function onAllowed(consents) {
  if (loaded || consents.statistics_performance !== 'granted') return;
  loaded = true;
  // load your script here
}
```

There are no other events and no callback options in the settings. These two are all of it.

## ⚙️ Reopening the settings from your own link {#reopening-the-settings-from-your-own-link}

A visitor who has answered gets a round button in the bottom right corner, and that is the only way back in
until you add one. **`window.ConsentioInstance.openSettings()` opens the panel from anywhere on the page** —
a footer link, a line in your cookie policy.

**Guard on `window.ConsentioInstance`.** The banner is fetched in the background, so a link clicked in the
first moment of a page load can run before it exists. Without the guard that click is a console error and no
panel.

```html
<a href="#" id="cookie-settings">Cookie settings</a>

<script>
  document.getElementById('cookie-settings').addEventListener('click', (e) => {
    e.preventDefault();
    if (window.ConsentioInstance) window.ConsentioInstance.openSettings();
  });
</script>
```

Calling it while the panel is already open does nothing, so a second click cannot disturb where the visitor
has tabbed to.

<div class="callout callout--warn" markdown="1">
**If you turn the round button off, this link is the only way back in.** Set
[`hideFloatingButton`]({{ '/configuration/' | relative_url }}#top-level) — or tick **Hide Floating Button**
on the tag — only once your own link is on every page. Consentio warns on the console when the option is
set, because it cannot see whether you added one.
</div>
