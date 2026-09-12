---
title: Language packs to paste
anchor: tag-manager-language-packs
permalink: /language/tag-manager/
description: Every published language pack as a variable to paste into Google Tag Manager, and the three things it does not tell you about it.
scripts: [packs]
panel: true
---

On the Tag Manager route the words can come from a variable: the tag's **Language** set to *From a
variable*, and a **Language pack variable** holding a [language pack]({{ '/language/' | relative_url }}).
The packs below are the published ones, each wrapped the way a Custom JavaScript variable expects. Paste
one in, change the words you want, and pick the variable on the tag. The plain JSON of a pack, from the
[latest release](https://github.com/ChrisMavrommatis/consentio/releases/latest), pasted into a **Constant**
works the same way.

## 🏷️ Three things Tag Manager does not say {#three-things-tag-manager-does-not-say}

- It is a **Custom JavaScript** variable — **Variables → User-Defined → New → Custom JavaScript** — not a
  Constant or a Data Layer variable.
- It is a function that **returns** the pack. The `function () { return ...; }` around the words is what
  Tag Manager expects, so keep it.
- **The words are edited in place.** Change any string between the quotes and save the variable. A key you
  leave out falls back to [the built-in English]({{ '/language/' | relative_url }}#texts).

## 🌍 The packs {#the-packs}

Open one, copy it, and paste it as the variable's whole value. The panel opens on the variable; switch it
to the file for the plain JSON a Constant takes. With scripts off, the link in each row is the file on the
latest release.

{% consentio_packs variable %}

## ⚙️ Pick it on the tag {#pick-it-on-the-tag}

Set **Language** to *From a variable* and choose the variable as the **Language pack variable**. To
switch wording by page, make a **Lookup Table** keyed on the page's language with one of these variables
per row, and pick the table instead.

## 🚀 If you do not need to change a word {#if-you-do-not-need-to-change-a-word}

Set **Language** to *A published language pack* and pick the language. The tag loads that pack from the
CDN at the same version as the banner, so there is nothing to paste and the words move with each release.
If the pack does not load, the banner keeps its built-in English and says so on the console. It is the
third step of [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}#four-steps).
