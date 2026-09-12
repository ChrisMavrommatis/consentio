---
title: Hold a script until consent
anchor: hold-a-script-until-consent
permalink: /hold-scripts/
description: Mark a script or an iframe with the category it needs and Consentio runs or loads it only once the visitor grants that category. What it covers, and what it cannot.
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

## 🖼️ An embed, before and after {#an-embed-before-and-after}

A video, a map, a social post is an `<iframe>`, and it sets its cookies as soon as it loads. Hold it the
same way, with the address moved off `src`:

```html
<iframe data-consentio="marketing_advertising"
        data-src="https://www.youtube.com/embed/VIDEO_ID"
        title="The video's title"></iframe>
```

No `src`, so the browser loads nothing. When the category is granted, Consentio moves `data-src` to `src`
and the embed loads in place. Everything else on the tag — size, `title`, `allow` — stays as you wrote it.

Until then the box is empty. If you want something in it — a still, a sentence, a link to the video —
put it there yourself, around or behind the iframe; Consentio draws nothing. An iframe that already has a
`src` is left alone, whatever else is on it.

## ⏱️ When it runs {#when-it-runs}

- **Someone answering now:** the moment they accept all, or save with that category on.
- **Someone who answered on a previous visit:** as the banner is set up, without seeing it.
- **Nobody, until there is an answer.** A category's default state is not consent, so on a page the visitor
  has not answered yet nothing marked runs — `strictly_necessary` included. A script that needs no consent
  should not be marked.

**Revoking does not un-run a script or unload an embed.** What has run has run; taking the category away
later stops it on the next page load, not on this one.

Each marked tag runs or loads once per page load, however many times the visitor saves.

## 🚧 What it does not cover {#what-it-does-not-cover}

**A tag you did not mark.** Consentio looks only at scripts carrying `type="text/plain"` and
`data-consentio`, and iframes carrying `data-consentio` and `data-src`. Everything else on the page runs
as it did before, consent or not — a vendor snippet pasted in without the attributes is outside consent,
and nothing will tell you so.

**What a released script or embed goes on to load.** Once it runs it is the vendor's, and it fetches what
it fetches.

**A tag inside a Google Tag Manager container.** The container holds those back on its own; see
[the tag manager route]({{ '/install/tag-manager/' | relative_url }}#what-the-template-does).

Marking works on both routes. The banner does the releasing, and the Tag Manager template loads the same
banner.

If a script needs more than a tag can say — a call with the visitor's answer in it, say — the
[events]({{ '/events/' | relative_url }}#the-two-events) carry the same moment as JavaScript.
