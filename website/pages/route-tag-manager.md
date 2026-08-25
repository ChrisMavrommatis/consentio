---
title: Use Google Tag Manager
anchor: route-2-google-tag-manager-custom-template
permalink: /install/tag-manager/
description: Add Consentio as a Tag Manager custom template. Four steps, then what this route can and cannot stop.
---

You are adding **one template to your container**, on one trigger. Nothing is pasted into your HTML and
nothing is hosted by you. There is a second, optional template for your cookie table.

<div class="callout callout--warn" markdown="1">
**Check one thing before you start.** This route can only stop things Tag Manager loads. If anything on your
site is pasted straight into a page — a video embed, a chat widget, a tracking pixel in a footer — it will
keep running whatever the visitor answers, and the banner will look like it is working.
[What Tag Manager cannot cover]({{ '/' | relative_url }}#the-tag-manager-routes-catch-in-the-open) has the
detail. If in doubt, [put it in your HTML]({{ '/install/direct/' | relative_url }}) instead.
</div>

## 🚀 Four steps {#four-steps}

**1. Add the Consentio template to your container** from the community gallery.

**2. Make a tag from it, on the Consent Initialization trigger.**

Use the built-in **Consent Initialization - All Pages**. Not *All Pages* — *Consent Initialization*. Tag
Manager guarantees that trigger runs before every other trigger in the container, and that guarantee is the
only reason the answer arrives in time.

**3. Fill in the fields.** Everything has a working default, so you can publish first and come back.

The one that matters is **Text source**. Leave it at *Built-in English* and the banner uses its own wording.
Set it to *Custom* and every string appears in a box, already filled in with that English — change what you
want, or paste a translation over it. Set it to *From a variable* and the whole set comes from a Tag Manager
variable, which is how you switch wording by language.

For the cookie table, add the **Consentio Tag - Cookies** template as well, make a variable from it, and
pick it here. [Settings]({{ '/configuration/' | relative_url }}#configuration) lists every option.

**4. Publish, then move everything else into the container.** Anything still pasted into a page is not
covered by the banner. On this route that clean-up is most of the work.

## 🧩 What the template does {#what-the-template-does}

Two things, in this order, every time a page loads:

1. **It reads the cookie and tells Tag Manager what the visitor allows** — before anything else in your
   container runs.
2. **It loads the banner** and hands it whatever wording you chose.

**It does not use `consentio-loader.min.js` and it does not fetch settings files.** There are none on this
route; the fields are your settings.

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
