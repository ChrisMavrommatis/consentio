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

The one that matters is **Text source**. Leave it at *Built-in English* and the banner uses its own wording;
the other three choices are where a translation or your own wording comes from, and
[one of them](#words-from-a-variable) is below.
[The Tag Manager tag]({{ '/tag/' | relative_url }}#the-fields) lists every field.

For the cookie table, download `consentio-tag-cookies.tpl` from the same release and import it the same way -
under **Variable Templates** rather than Tag Templates. Make a variable from it, fill in your rows, and pick
it as the **Cookies Variable**. [The cookie table]({{ '/cookies/' | relative_url }}) is what goes in a row.

**4. Publish, then move everything else into the container.** Anything still pasted into a page is not
covered by the banner. On this route that clean-up is most of the work.

## 🌍 Words from a variable {#words-from-a-variable}

For *From a variable*, make a **Custom JavaScript** variable whose whole value is a language pack wrapped
in a function, and pick it as the tag's **Language pack variable**:

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
runs; then it loads the banner and hands it your fields. It uses no script tag and fetches no settings
file. [The Tag Manager tag]({{ '/tag/' | relative_url }}) lists every field, the four text sources, what
it does in order, and the permissions it asks for.

## 🍪 Both ways use the same cookie {#the-cookie-is-the-contract-between-the-two-routes}

Consentio stores the answer in one cookie, and the template reads and writes that same cookie by the same
rules. So a visitor who answers on a page using the HTML route is remembered on a page using this one, and
the other way round.

**One thing has to match for that to hold: the version.** It is a field on the template and an attribute on
the script tag in the other route. Set them differently and the same visitor gets asked twice.

The cookie's name is always `consentio` on this route — a Tag Manager template has to name the cookie it
reads when it is published, so it cannot be a field. If you changed the name on the other route, change it
back before you run both.

**How long it lasts and what it covers are fields too** — **Cookie Lifetime (days)** and **Share the answer
across subdomains** — and they behave as they do on the other route.

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
