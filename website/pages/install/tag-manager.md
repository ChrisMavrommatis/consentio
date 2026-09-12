---
title: Use Google Tag Manager
anchor: route-2-google-tag-manager-custom-template
permalink: /install/tag-manager/
description: Add Consentio as a Tag Manager custom template. Four steps, the three pickers, then what this route can and cannot stop.
---

You are adding **one template to your container**, on one trigger. Nothing is pasted into your HTML and
nothing is hosted by you. [Choose a route]({{ '/routes/' | relative_url }}) puts this route beside the
other one.

<div class="callout callout--warn" markdown="1">
**Check one thing before you start.** The container covers what Tag Manager loads. If anything on your site
is pasted straight into a page — a video embed, a chat widget, a tracking pixel in a footer — it will keep
running whatever the visitor answers, and the banner will look like it is working. Move it into the
container, or [mark it]({{ '/hold-scripts/' | relative_url }}) with the category it needs; the banner holds
a marked script back on this route too.
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

**3. Pick your files, if you have any.** The tag has three pickers — **Settings**, **Language**, **Cookie
table** — and every one of them can stay at its default, so you can publish first and come back. Left
alone, that is a banner in English with the default behaviour and no cookie table.

Each picker takes the same file the HTML route fetches. Make a **Constant** variable, paste the whole text
of the file into it, and pick it: your [`consentio-settings.json`]({{ '/configuration/' | relative_url }})
as the **Settings**, your [`consentio-cookies.json`]({{ '/cookies/' | relative_url }}) as the **Cookie
table**. You do not have to write either by hand: [the settings file]({{ '/configuration/' | relative_url }}#build-the-file)
page builds one from switches, and [the catalogue]({{ '/cookies/catalogue/' | relative_url }}) builds a
cookie table from ticked rows — each with a *Tag Manager variable* output to paste into a Custom JavaScript
variable instead of a Constant. For the words, **Language** has three choices: leave it at *Built-in English*, pick *A published
language pack* and choose the language, or pick *From a variable* and point it at a
[language pack you pasted](#words-from-a-variable).
[The Tag Manager tag]({{ '/tag/' | relative_url }}#the-pickers) lists every picker and the three ways a
file can reach it.

**4. Publish, then move everything else into the container, or mark it.** Anything still pasted into a
page and not marked is outside consent. On this route that clean-up is most of the work.

## 🌍 Words from a variable {#words-from-a-variable}

For *From a variable*, paste the pack's JSON text into a **Constant** — or make a **Custom JavaScript**
variable whose whole value is the pack wrapped in a function — and pick it as the tag's **Language pack
variable**:

```js
function () {
	return {
		"locale": "en",
		"name": "English",
		"texts": {
			"barTitle": "Cookies on this site"
		}
	};
}
```

[Tag Manager language packs]({{ '/language/tag-manager/' | relative_url }}) has every published pack in
that shape, complete, with a copy button — and the three things about the variable that Tag Manager does
not tell you.

## 🧩 What the template does {#what-the-template-does}

It reads the cookie and tells Tag Manager what the visitor allows, before anything else in your container
runs; then it loads the banner and hands it your three files. It uses no script tag and fetches nothing
of yours. [The Tag Manager tag]({{ '/tag/' | relative_url }}) lists the pickers, the three language
choices, what it does in order, and the permissions it asks for.

## 🍪 Both ways use the same cookie {#the-cookie-is-the-contract-between-the-two-routes}

Consentio stores the answer in one cookie, and the template reads and writes that same cookie by the same
rules. So a visitor who answers on a page using the HTML route is remembered on a page using this one, and
the other way round.

**One thing has to match for that to hold: the version.** On this route it is `version` in the settings
file; on the other it is `data-version` on the script tag. Set them differently and the same visitor gets
asked twice.

The cookie's name is always `consentio` on this route — a Tag Manager template has to name the cookie it
reads when it is published, so `cookieName` in the settings file is ignored here. If you changed the name
on the other route, change it back before you run both.

**How long it lasts and what it covers are settings too** — `cookieLifetime` and `shareAcrossSubdomains` —
and they behave as they do on the other route.

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
