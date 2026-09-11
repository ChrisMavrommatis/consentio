---
title: The Tag Manager tag
anchor: tag
permalink: /tag/
description: Every field on the Consentio tag template, the Cookies variable template, what the tag does in order, the permissions it asks for, and what goes wrong.
---

The Tag Manager route has no script tag and no files. Two templates come with each release:
**Consentio Tag**, the tag itself, and **Consentio Tag - Cookies**, a variable that holds the cookie table.
Every option is a field on the tag. The HTML route's equivalent is [the loader
tag]({{ '/loader/' | relative_url }}).

## 📄 The smallest working tag {#the-smallest-working-tag}

Import `consentio-tag.tpl`, add a tag from it, leave every field at its default, and fire it on **Consent
Initialization - All Pages**. That is a banner in English, asking once, keeping the answer for 90 days, with
no cookie table. [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}) walks the four
steps.

## ⚙️ The fields {#the-fields}

| Field | Default | What it does | On the HTML route |
|---|---|---|---|
| **Version** | `1` | Which stored answers are still valid. Raise it and every visitor is asked again — [Asking everyone again]({{ '/versioning/' | relative_url }}) | `data-version` |
| **Debug** | off | Logs what the tag decided to the browser console. Turn it off before publishing | `data-debug` |
| **Consent Required** | off | Shows the banner as a full-screen overlay the visitor has to answer before using the page. Off, the banner sits at the bottom and the page stays usable | `consentRequired` in the settings file |
| **Consents** — a Default State per category | `Denied` | What each category starts at in the settings panel. It is not what is sent to Google before the visitor answers — that is always denied. `strictly_necessary` has no field, because it is always on | `consents.<key>.defaultState` |
| **Text source** | *Built-in English* | Where the banner's words come from. Four choices, below | `data-language-url` or `data-language` |
| **Language pack variable** | *None* | Shown for *From a variable*. Any variable returning a whole [language pack]({{ '/language/tag-manager/' | relative_url }}) | — |
| **Language pack** | English | Shown for *A published language pack*. Which pack the tag loads from the CDN, at the same version as the banner | `data-language` |
| **Cookies Variable** | *None* | A variable returning the [cookie table]({{ '/cookies/' | relative_url }}#on-the-tag-manager-route). Left at *None*, the settings panel shows no table | `data-cookies-url` |
| **Privacy Policy URL** | empty | Where the banner's privacy policy link points. Empty means no link. Must start with `http://`, `https://` or a single `/` | `policyUrl` |
| **Hide Floating Button** | off | Removes the round settings button in the bottom right corner. Turn it on only if your site has its own link calling `window.ConsentioInstance.openSettings()` | `hideFloatingButton` |
| **Cookie Lifetime (days)** | `90` | How long an answer is kept before the visitor is asked again | `data-cookie-lifetime` |
| **Share the answer across subdomains** | off | One answer for every hostname your site answers on, stored on the domain they share | `data-share-across-subdomains` |

**The cookie's name is not a field.** A template has to name the cookie it reads when it is published, so on
this route it is always `consentio`.

## 💬 The four text sources {#the-four-text-sources}

| Choice | What the banner says |
|---|---|
| **Built-in English** | Its own words. Nothing is sent, so the wording picks up each release's fixes on its own |
| **Custom - fill in the fields below** | The fields that appear, one per text, already filled in with the English. Change the ones you want |
| **From a variable** | Whatever the **Language pack variable** returns — a [pack you pasted]({{ '/language/tag-manager/' | relative_url }}) into a Custom JavaScript variable, or a Lookup Table keyed on the page's language |
| **A published language pack** | The pack named in **Language pack**, loaded from the CDN before the banner, at the banner's own version. If it does not load, the banner keeps its English and the console says so |

The fields under *Custom* are every key of the [language pack]({{ '/language/' | relative_url }}), with the
same names.

## 🍪 The Cookies variable template {#the-cookies-variable-template}

`consentio-tag-cookies.tpl` is a variable template with one table: **Name**, **Purpose**, **Provenance**,
**Duration** and **Category**, one row per cookie, the category picked from the four. Import it under
*Variable Templates*, add a variable from it, fill the rows, and choose that variable in the tag's
**Cookies Variable** field. Any other variable returning the same rows works too — [the cookie
table]({{ '/cookies/' | relative_url }}#on-the-tag-manager-route) shows the paste-in shape, and the [cookie
catalogue]({{ '/cookies/catalogue/' | relative_url }}) has rows to start from.

## 🧩 What the tag does, in order {#what-the-tag-does-in-order}

1. **If the HTML route's script tag is on the page, it stands down** — one console line, nothing else. This
   is what stops a page carrying both routes from showing two banners.
2. **It reads the cookie and pushes the consent default** — before anything else in the container runs.
   That is why it has to be on the Consent Initialization trigger and nowhere else.
3. **It loads the language pack**, if *Text source* asks for one.
4. **It loads the banner** from the CDN, at the version the template was released with, and hands it your
   fields.

[How it works]({{ '/how-it-works/' | relative_url }}#the-sequence-in-tag-manager) has the sequence step by
step and why step 2 cannot wait for step 4.

## 🔐 What the template asks permission for {#permissions}

Tag Manager shows these when you import it. Each is the least the tag can work with.

| Permission | What for |
|---|---|
| Inject scripts from `cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio*` | The banner and the language pack, pinned to one released version |
| Read the `consentio` cookie | The stored answer |
| Set consent state | The consent default and the update, for the Google signals it drives |
| Write `ads_data_redaction` to the data layer | Sent alongside the default |
| Read and call `Consentio.Create`, read `ConsentioInstance`, `ConsentioDefault` and `ConsentioLanguage` on `window` | Start the banner; see the HTML route or a second run; read the loaded pack |
| Template storage | Remember that it ran, so a second trigger on the same page does nothing |
| Log to the console in debug | **Debug** |

## ⚠️ When it goes wrong {#when-it-goes-wrong}

- **The tag is not on Consent Initialization:** the consent default arrives after your other tags have
  started. Nothing warns you; [Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }})
  is how to see it.
- **The banner script does not load:** the tag fails, and with **Debug** on the console says
  `the banner script did not load`. The consent default was still pushed.
- **The language pack does not load:** the banner starts in English, and the console names the pack.
- **A published pack and an older template:** the pack is loaded at the version the template pins, so a
  template imported from an older release loads that release's pack. Re-import to move both.
- **Both routes on one page:** the tag stands down and says so. With a template older than this release it
  does not, and you get two banners.
- **The `version` field and the HTML route's `data-version` disagree** on a site running both: one route's
  answer is invalid on the other, and the visitor is asked twice. Keep them equal.
