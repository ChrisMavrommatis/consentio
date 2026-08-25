---
title: What it tells Google
anchor: what-reaches-the-datalayer
permalink: /datalayer/
description: Exactly what Consentio sends to Google's tags, in plain terms and in full, and how to check it arrived.
---

Consentio does not block Google's tags. It **tells them what they are allowed to do**, and they behave
accordingly. This page is exactly what it says, and how to confirm it arrived.

## 💬 Four words you will see {#four-words-you-will-see}

| Word | What it means |
|---|---|
| **dataLayer** | A plain list on the page that a tag manager reads messages from. Consentio adds messages to it |
| **Signal** | One permission, in Google's vocabulary. There are seven, and each is either `granted` or `denied` |
| **Consent default** | The first message: what a visitor is allowed *before* they answer. It has to arrive before any tag reads it |
| **Consent update** | The second message: what they allowed once they did answer |

Your four categories are the choice a visitor sees. Google's seven signals are what the tags understand.
Consentio translates one into the other, and [the table below](#categories-map-to-signals) is the whole
translation.

## 📡 The two messages, in full {#the-two-messages-in-full}

**Before the visitor answers** — sent by the script tag, or by the Tag Manager template:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500          // present only when there is no stored answer
});
gtag('set', 'ads_data_redaction', true);   // true whenever ad_storage is denied
```

**When the visitor accepts all, or saves their choices:**

```js
gtag('consent', 'update', { /* all seven signals, again */ });
gtag('set', 'ads_data_redaction', false);
```

Two rules behind that, both worth knowing if something looks wrong:

- **All seven are named every single time.** Leave one out of an update and Google keeps its old value — which
  is exactly how a permission someone just withdrew stays granted. So nothing is ever omitted.
- **`wait_for_update` is only sent to someone who has not answered yet.** It tells tags to hold on briefly for
  an answer. Sending it to a returning visitor would delay tags waiting for a banner that is never going to
  appear.

## 🔀 Categories map to signals {#categories-map-to-signals}

| Consent category | Google signals |
|---|---|
| `strictly_necessary` | `security_storage` |
| `preferences_functionality` | `functionality_storage`, `personalization_storage` |
| `statistics_performance` | `analytics_storage` |
| `marketing_advertising` | `ad_storage`, `ad_user_data`, `ad_personalization` |

**This mapping is fixed and you cannot change it.** That is deliberate: it is what lets the correct first
message be sent before any of your settings have been downloaded.

**Denied wins.** A signal is granted only when *every* category feeding it is granted, and a signal nothing
feeds stays denied. So if a visitor allows one of the two categories behind
`personalization_storage`, it stays denied.

## 🔍 How to check it {#how-to-check-it}

**In the console**, on any page running the banner:

```js
window.dataLayer.filter(e => e[0] === 'consent')
```

Two things to look for. The **first** `consent` entry should be `default`, and it should come before
anything your tag manager pushed — scroll up in `window.dataLayer` and check what is above it. Then answer
the banner and run it again: a second entry appears, `consent update`, naming all seven signals.

**In Tag Assistant**, which is the only way to see the ordering properly on the Tag Manager route:

1. Preview the container and load your page.
2. Open the very first event in the left-hand list — `Consent Initialization` or `Container Loaded`.
3. Look at the **Consent** tab. `On-page Default` should be filled in, with `security_storage` granted and
   the rest denied for a visitor who has not answered.
4. Click through to the tags that fired on that event. **None of them should be a tag you meant to hold
   back.**

If the default is missing or arrives late, the cause is ordering, not configuration —
[troubleshooting]({{ '/troubleshooting/' | relative_url }}#tags-fire-before-anyone-answers) lists the four
ways that happens.

## ⚠️ This does not stop other scripts running {#consent-mode-does-not-stop-a-script-from-running}

Worth being blunt about, because it catches people out. These messages tell **Google's own tags** what they
may store and send. Any other script you loaded will do whatever it was always going to do — it has never
heard of Consentio.

**In Tag Manager**, that is what the container's own consent settings are for: a tag can be told to wait for
a particular signal before it fires.

**In your HTML**, a script you pasted into the page is yours to hold back. Do not load it up front — wait
until the visitor allows it:

```js
document.addEventListener('consentio:consent-update', (event) => {
  if (event.detail.statistics_performance === 'granted') {
    // now load the thing
  }
});
```

[Events]({{ '/events/' | relative_url }}#events) has the full pattern, including how to catch a visitor who
answered on a previous visit.
