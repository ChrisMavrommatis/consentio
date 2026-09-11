---
title: Use Google Tag Manager
anchor: route-2-google-tag-manager-custom-template
permalink: /install/tag-manager/
description: Add Consentio as a Tag Manager custom template. Four steps, then what this route can and cannot stop.
---

You are adding **one template to your container**, on one trigger. Nothing is pasted into your HTML and
nothing is hosted by you. There is a second, optional template for your cookie table.
[Choose a route]({{ '/routes/' | relative_url }}) puts this route beside the other one.

<div class="callout callout--warn" markdown="1">
**Check one thing before you start.** This route covers what Tag Manager loads. If anything on your site is
pasted straight into a page — a video embed, a chat widget, a tracking pixel in a footer — it will keep
running whatever the visitor answers, and the banner will look like it is working. The
[HTML route]({{ '/install/direct/' | relative_url }}) can hold a script like that back; this one cannot.
</div>

## 🚀 Four steps {#four-steps}

**1. Import the Consentio template into your container.**

Download `consentio-tag.tpl` from the [latest release](https://github.com/ChrisMavrommatis/consentio/releases/latest).
In Tag Manager go to **Templates → Tag Templates → New**, open the **⋮** menu at the top right, choose
**Import**, pick the file and **Save**.

There is nothing to search for and nothing that tells you when a newer one exists. It is provided as it is:
what you import is what your container runs until you import a newer file.

**2. Make a tag from it, on the Consent Initialization trigger.**

Use the built-in **Consent Initialization - All Pages**. Not *All Pages* — *Consent Initialization*. Tag
Manager guarantees that trigger runs before every other trigger in the container, and that guarantee is the
only reason the answer arrives in time.

**3. Fill in the fields.** Everything has a working default, so you can publish first and come back.

The one that matters is **Text source**. Leave it at *Built-in English* and the banner uses its own wording.
Set it to *Custom* and every string appears in a box, already filled in with that English — change what you
want, or paste a translation over it. Set it to *A published language pack* and pick a language: the tag
loads that pack from the CDN at the same version as the banner, so the words move with each release. If the
pack does not load, the banner keeps its built-in English and says so on the console. Set it to *From a
variable* and the wording comes from a **Language pack variable** — any Tag Manager variable holding a
language pack, which is how you edit the words yourself or switch them by page. [A language pack to
paste](#a-language-pack-to-paste) below is one ready to go.

For the cookie table, download `consentio-tag-cookies.tpl` from the same release and import it the same way -
under **Variable Templates** rather than Tag Templates. Make a variable from it, fill in your rows, and pick
it here. [Settings]({{ '/configuration/' | relative_url }}#configuration) lists every option.

**4. Publish, then move everything else into the container.** Anything still pasted into a page is not
covered by the banner. On this route that clean-up is most of the work.

## 🌍 A language pack to paste {#a-language-pack-to-paste}

For *From a variable*, make a **Custom JavaScript** variable in Tag Manager — **Variables → User-Defined →
New → Custom JavaScript** — and paste one of these in as its whole value. Three things about it that Tag
Manager does not say:

- it is a **Custom JavaScript** variable, not a Constant or a Data Layer variable
- it is a function that **returns** the pack — the `function () { return ...; }` around the words is what
  Tag Manager expects, so keep it
- **the words are edited in place.** Change any string between the quotes and save the variable. Leave a key
  out and the banner uses its built-in English for that one

Then pick the variable as the tag's **Language pack variable**. A Lookup Table keyed on the page's language,
with one of these variables per row, is how you switch wording by language.

{% consentio_pack_snippets %}

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

## 🧩 What the template does {#what-the-template-does}

Two things, in this order, every time a page loads:

1. **It reads the cookie and tells Tag Manager what the visitor allows** — before anything else in your
   container runs.
2. **It loads the banner** and hands it whatever wording you chose.

**It does not use `consentio-loader.min.js` and it does not fetch settings files.** There are none on this
route; the fields are your settings. The one thing it loads besides the banner is a published language
pack, when *Text source* asks for one.

**If the script tag from the other route is on the page, the tag stands down** and prints one line on the
console saying so. That is what stops a page carrying both routes from showing two banners — with the
template from this release, not an older one.

The order is the whole point, and it is not something you can change from the Tag Manager screen — it is why
the tag has to be on the Consent Initialization trigger. [How it works]({{ '/how-it-works/' | relative_url }}#the-sequence-in-tag-manager)
has the sequence step by step, and the reason step 1 cannot be left to step 2.

## 🍪 Both ways use the same cookie {#the-cookie-is-the-contract-between-the-two-routes}

Consentio stores the answer in one cookie, and the template reads and writes that same cookie by the same
rules. So a visitor who answers on a page using the HTML route is remembered on a page using this one, and
the other way round.

**One thing has to match for that to hold: the version.** It is a field on the template and an attribute on
the script tag in the other route. Set them differently and the same visitor gets asked twice.

The cookie's name is always `consentio` on this route — a Tag Manager template has to name the cookie it
reads when it is published, so it cannot be a field. If you changed the name on the other route, change it
back before you run both.

**How long it lasts and what it covers are fields**: **Cookie Lifetime (days)**, 90 unless you change it, and
**Share the answer across subdomains**, off unless your site answers on more than one hostname. The banner
writes the cookie on this route too, so they behave exactly as they do on the other one.

[The cookie]({{ '/cookie/' | relative_url }}#the-cookie-contract) is the full description — what is in it,
how long it lasts, and what it looks like when nobody has answered yet.

## 🔍 Checking it worked {#checking-it-worked}

Use Tag Assistant. Preview your container, load a page, and open the very first event in the list. The
message about consent has to be there, and it has to be **first** — before any other tag in the container
fires. Present but late is the same as absent.

[What it tells Google]({{ '/datalayer/' | relative_url }}#how-to-check-it) walks through the screens.

There is also [a page on this site with no script tag]({{ '/try-it/tag-manager/' | relative_url }}). It is
for checking that both ways of installing agree about the same visitor — a mismatch there is silent, so it
is worth looking for on purpose.
