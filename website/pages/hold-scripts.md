---
title: Hold a script until consent
anchor: hold-a-script-until-consent
permalink: /hold-scripts/
description: Mark a script tag with the category it needs and Consentio runs it only once the visitor grants that category. What it covers, and what it cannot.
---

Consentio tells [Google's tags]({{ '/datalayer/' | relative_url }}#what-reaches-the-datalayer) what they may
do. **A script you pasted into the page yourself does not read that** — a chat widget, an embedded map, a
pixel from a vendor's instructions — and it runs the moment the browser reaches it, whatever the visitor
said. This page is how to hold one back until they say yes.

## 📄 One tag, before and after {#one-tag-before-and-after}

Before — runs on every page load:

```html
<script src="https://vendor.example/analytics.js"></script>
```

After — runs once `statistics_performance` is granted, and not before:

```html
<script type="text/plain" data-consentio="statistics_performance"
        src="https://vendor.example/analytics.js"></script>
```

Two changes. `type="text/plain"` makes the browser skip the tag, because it is not a type it runs. `data-consentio`
names the category the script needs, one of
[the four]({{ '/configuration/' | relative_url }}#consents). An inline script is marked the same way.

When the visitor grants that category, Consentio swaps the tag for a live copy of itself — same attributes,
same content, no `text/plain` — and the browser runs it then.

## ⏱️ When it runs {#when-it-runs}

- **Someone answering now:** the moment they accept all, or save with that category on.
- **Someone who answered on a previous visit:** as the banner is set up, without seeing it.
- **Nobody, until there is an answer.** A category's default state is not consent, so on a page the visitor
  has not answered yet nothing marked runs — `strictly_necessary` included. A script that needs no consent
  should not be marked.

**Revoking does not un-run a script.** A script that has run has run; taking the category away later stops
it on the next page load, not on this one.

Each marked script runs once per page load, however many times the visitor saves.

## 🚧 What it does not cover {#what-it-does-not-cover}

**A script you did not mark.** Consentio looks only at tags carrying `type="text/plain"` and
`data-consentio`. Everything else on the page runs as it did before, consent or not — a vendor
snippet pasted in without the two attributes is outside consent, and nothing will tell you so.

**A tag inside a Google Tag Manager container.** The container holds those back on its own; see
[the tag manager route]({{ '/install/tag-manager/' | relative_url }}#what-the-template-does).

If a script needs more than a tag can say — a call with the visitor's answer in it, say — the
[events]({{ '/events/' | relative_url }}#the-two-events) carry the same moment as JavaScript.
