---
title: Language packs to paste
anchor: tag-manager-language-packs
permalink: /language/tag-manager/
description: Every published language pack as a Custom JavaScript variable to paste into Google Tag Manager, and the three things it does not tell you about it.
---

On the Tag Manager route the words can come from a variable: the tag's **Text source** set to *From a
variable*, and a **Language pack variable** holding a [language pack]({{ '/language/' | relative_url }}).
The packs below are the published ones, each wrapped the way a Tag Manager variable expects. Paste one in,
change the words you want, and pick the variable on the tag.

## 🏷️ Three things Tag Manager does not say {#three-things-tag-manager-does-not-say}

- It is a **Custom JavaScript** variable — **Variables → User-Defined → New → Custom JavaScript** — not a
  Constant or a Data Layer variable.
- It is a function that **returns** the pack. The `function () { return ...; }` around the words is what
  Tag Manager expects, so keep it.
- **The words are edited in place.** Change any string between the quotes and save the variable. A key you
  leave out falls back to [the built-in English]({{ '/language/' | relative_url }}#texts).

## 🌍 The packs {#the-packs}

Paste one as the variable's whole value.

{% consentio_pack_snippets %}

## ⚙️ Pick it on the tag {#pick-it-on-the-tag}

Set **Text source** to *From a variable* and choose the variable as the **Language pack variable**. To
switch wording by page, make a **Lookup Table** keyed on the page's language with one of these variables
per row, and pick the table instead.

## 🚀 If you do not need to change a word {#if-you-do-not-need-to-change-a-word}

Set **Text source** to *A published language pack* and pick the language. The tag loads that pack from the
CDN at the same version as the banner, so there is nothing to paste and the words move with each release.
If the pack does not load, the banner keeps its built-in English and says so on the console. It is the
third step of [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}#four-steps).

{% raw %}
<script>
	(function () {
		var buttons = document.querySelectorAll('.snippet__copy');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].addEventListener('click', function (event) {
				var button = event.currentTarget;
				var code = button.closest('.snippet').querySelector('pre').textContent;
				if (!navigator.clipboard) {
					button.textContent = 'Select the text and copy it';
					return;
				}
				navigator.clipboard.writeText(code).then(function () {
					button.textContent = 'Copied';
					setTimeout(function () { button.textContent = 'Copy'; }, 1500);
				});
			});
		}
	})();
</script>
{% endraw %}
