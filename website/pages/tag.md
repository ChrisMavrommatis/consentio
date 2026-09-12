---
title: The Tag Manager tag
anchor: tag
permalink: /tag/
description: The three pickers on the Consentio tag template - settings, language, cookie table - the three ways each input reaches it, what the tag does in order, the permissions it asks for, and what goes wrong.
---

The Tag Manager route has no script tag and nothing to host. One template comes with each release,
**Consentio Tag**, and it takes the same three inputs the HTML route does — the
[settings file]({{ '/configuration/' | relative_url }}), the [language pack]({{ '/language/' | relative_url }})
and the [cookie table]({{ '/cookies/' | relative_url }}) — each from a variable instead of a URL. The HTML
route's equivalent is [the loader tag]({{ '/loader/' | relative_url }}).

## 📄 The smallest working tag {#the-smallest-working-tag}

Import `consentio-tag.tpl`, add a tag from it, leave every picker at its default, and fire it on **Consent
Initialization - All Pages**. That is a banner in English, asking once, keeping the answer for 90 days, with
no cookie table. [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}) walks the four
steps.

## ⚙️ The pickers {#the-pickers}

| Picker | Default | What it takes | On the HTML route |
|---|---|---|---|
| **Settings** | *None* | A variable holding the [settings file]({{ '/configuration/' | relative_url }}) — its JSON text in a Constant, or the object from any variable. Left at *None*, the tag reads `window.ConsentioSettings` from the page; without that, the banner uses its defaults. [Three ways in](#three-ways-in) | `data-settings-url` |
| **Language** | *Built-in English* | Where the words come from. Three choices, [below](#the-three-language-choices) | `data-language-url` or `data-language` |
| **Language pack variable** | *None* | Shown for *From a variable*. A variable holding a whole [language pack]({{ '/language/tag-manager/' | relative_url }}) — its JSON text, or the object | — |
| **Language pack** | English | Shown for *A published language pack*. Which pack the tag loads from the CDN, at the same version as the banner | `data-language` |
| **Cookie table** | *None* | A variable holding the [cookie table]({{ '/cookies/' | relative_url }}#on-the-tag-manager-route) — its JSON text, or the rows. Left at *None*, the tag reads `window.ConsentioCookies` from the page; without that, the settings panel shows no table. [Three ways in](#three-ways-in) | `data-cookies-url` |

**Two keys of the settings file behave differently on this route.** `cookieName` is ignored: a template has
to name the cookie it reads when it is published, so here it is always `consentio`, and the console says so
when the file names another. `version` is read from the file — there is no tag attribute to put it on — and
it is read before the cookie, so a site at version 2 must say so in the file or every stored answer is
discarded. On a site running both routes, keep the file's `version` equal to the loader tag's `data-version`.

## 🔀 Three ways in {#three-ways-in}

Each input is one file, however it arrives. The same three ways work for the **Settings** picker, the
**Language pack variable** and the **Cookie table**.

| Fill it with | What to do |
|---|---|
| **A Constant** | Make a *Constant* variable, paste the whole text of the file into it, pick it here. The tag parses the JSON. This is the usual way, and what the [catalogue]({{ '/cookies/catalogue/' | relative_url }}) and the [packs page]({{ '/language/tag-manager/' | relative_url }}) give you |
| **A Custom JavaScript variable** | `function () { return { ... }; }` returning the object — or the rows, for the cookie table. A Lookup Table returning one of these per page works the same |
| **Nothing** | Leave it at *None*. If the page carries the matching global in `<head>` above the container snippet — `window.ConsentioSettings`, `window.ConsentioLanguage` or `window.ConsentioCookies` — the tag reads that. A site running both routes keeps one copy this way. Otherwise the banner uses its defaults, its English, or no table |

A value that is not what the input expects is treated as nothing. An array where an object should be, or
an object where the rows should be, is said on the console in Tag Manager's preview mode:
`the Settings is not a JSON object, so it is ignored`, `the Language pack is not a JSON object, so it is
ignored`, `the Cookie table is not a JSON array, so the settings panel shows no table`. Text that does not
parse as JSON is treated as nothing too, and nothing is said — the `settings =`, `language =` and
`cookies =` lines show what the tag ended up with.

## 💬 The three language choices {#the-three-language-choices}

| Choice | What the banner says |
|---|---|
| **Built-in English** | Its own words. Nothing is sent, so the wording picks up each release's fixes on its own. A page that inlines a published `<locale>.js` sets `window.ConsentioLanguage`, and the tag reads that here without a picker |
| **From a variable** | Whatever the **Language pack variable** holds — a [pack you pasted]({{ '/language/tag-manager/' | relative_url }}) into a Constant or a Custom JavaScript variable, or a Lookup Table keyed on the page's language |
| **A published language pack** | The pack named in **Language pack**, loaded from the CDN before the banner, at the banner's own version. If it does not load, the banner keeps its English and the console says so |

## 🗑️ What the tag no longer has {#what-was-removed}

**Up to 0.3.0 every setting was its own field on the tag, the words could be typed into twenty-three text
boxes under a *Custom* text source, and a second template, `consentio-tag-cookies.tpl`, held the cookie
table one row at a time.** All of that is gone. A container holding an older template keeps working as it
did, but nothing new reaches it: re-import the template, then paste your settings file, your language pack
and your cookie table into three Constants and pick them. The old second template's variable still returns
rows the new **Cookie table** picker accepts, so it can be picked until you have replaced it; then delete
it.

## 🧩 What the tag does, in order {#what-the-tag-does-in-order}

1. **If the HTML route's script tag is on the page, it stands down** — one console line, nothing else. This
   is what stops a page carrying both routes from showing two banners.
2. **It reads the cookie and pushes the consent default** — before anything else in the container runs.
   That is why it has to be on the Consent Initialization trigger and nowhere else.
3. **It loads the language pack**, if **Language** asks for one, from
   `https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@<version>/dist/i18n/<locale>.js`.
4. **It loads the banner** from `https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@<version>/dist/consentio.min.js`,
   at the version the template was released with, and hands it the three inputs.

[How it works]({{ '/how-it-works/' | relative_url }}#the-sequence-in-tag-manager) has the sequence step by
step and why step 2 cannot wait for step 4.

## 🔒 What the template asks permission for {#permissions}

Tag Manager shows these when you import it. Each is the least the tag can work with.

| Permission | What for |
|---|---|
| Inject scripts from `cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio*` | The banner and the language pack, pinned to one released version |
| Read the `consentio` cookie | The stored answer |
| Set consent state | The consent default, for the seven Google signals. The update comes from the banner, on `dataLayer`, and needs no permission |
| Write `ads_data_redaction` to the data layer | Sent alongside the default |
| Call `Consentio.Create`; read and write `ConsentioInstance`; read `ConsentioDefault`, `ConsentioSettings`, `ConsentioLanguage` and `ConsentioCookies` on `window` | Start the banner and record that it did; see the HTML route or a second run; read the loaded pack and what the page carries |
| Template storage | Remember that it ran, so a second trigger on the same page does nothing |
| Log to the console in preview mode | What the tag read and decided, while you are in Tag Assistant |

## ⚠️ When it goes wrong {#when-it-goes-wrong}

- **The tag is not on Consent Initialization:** the consent default arrives after your other tags have
  started. Nothing warns you; [Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }})
  is how to see it.
- **The banner script does not load:** the tag fails, and in preview mode the console says
  `the banner script did not load`. The consent default was still pushed.
- **The language pack does not load:** the banner starts in English, and the console names the pack.
- **A published pack and an older template:** the pack is loaded at the version the template pins, so a
  template imported from an older release loads that release's pack. Re-import to move both.
- **Both routes on one page:** the tag stands down and says so. With a template older than this release it
  does not, and you get two banners.
- **The settings file's `version` and the HTML route's `data-version` disagree** on a site running both: one
  route's answer is invalid on the other, and the visitor is asked twice. Keep them equal — the loader
  warns on the console when they differ.
- **A settings file that is not picked up:** the picker is at *None* and the page carries no
  `window.ConsentioSettings`, or the Constant holds something that is not the file. In preview mode
  `settings =` shows what the tag read — `{}` when it read nothing.
- **The tag fires twice on one page:** the second run stops and says `already initialized`.
