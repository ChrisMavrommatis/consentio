---
title: Choose a route
anchor: choose-a-route
permalink: /routes/
description: The two ways to install Consentio side by side - what each can stop, what each costs, and the one thing that decides between them.
---

There are two ways to install Consentio and they do not do the same things. This page is the comparison;
each route has its own page with the steps.

**If anything on your site sets a cookie from outside the container, the Tag Manager route does not
cover it.** That is the one thing that decides between the two.

## 🧭 Side by side {#side-by-side}

| | **Put it in your HTML** | **Use Google Tag Manager** |
|---|---|---|
| What you add | one `<script>` tag in `<head>`, and two small files you host | one template in your container, on one trigger |
| What tells Google what the visitor allows | the script tag, blocking, before anything is fetched | the template, on the Consent Initialization trigger, before it loads anything |
| What it costs the first paint | one blocking file, around 5.4 KB, before the page paints — [what it weighs]({{ '/how-it-works/' | relative_url }}#what-it-weighs) | nothing in the page; the container's own cost |
| What it can stop | every script you mark with `type="text/plain" data-consentio`, held until its category is granted — and nothing you do not mark. [Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) | only tags in that container. A script pasted into the page is outside consent |
| Where the words come from | the built-in English; a language file at any URL — one of your own, or a published pack; or `data-language="el"` for the published pack at the CDN | the built-in English; the same file in a variable; or a published pack the tag loads from the CDN |
| Where the cookie table comes from | a file at any URL | the same file in a Constant, or on the page, or nothing |
| Where the settings come from | a JSON file the script tag fetches | the same file in a Constant, or on the page, or nothing |
| What you edit to change a word | a file on your site | the pack in a variable, then publish the container |
| What can rename the cookie | `data-cookie-name` on the tag | nothing — it is `consentio` |
| Where the version is set | `data-version` on the tag | `version` in the settings file |
| What happens when the CDN is down | nothing, unless you serve the files from one. A pack chosen with `data-language` comes from the CDN, and if it does not load the banner is in English | the template still tells Google what the visitor allows; the banner does not load |
| Who is told a new version exists | nobody — your site runs the files you put there | nobody — a container runs whatever `.tpl` was last imported, with the banner version it pins |

## 🚀 Put it in your HTML {#put-it-in-your-html}

For a site whose `<head>` you can edit. The answer is on the page before any tag manager reads it, and a
script you mark waits for consent. [Four steps]({{ '/install/direct/' | relative_url }}#four-steps).

## 🏷️ Use Google Tag Manager {#use-google-tag-manager}

For a site where everything already runs through one container. Nothing is pasted into the HTML and
nothing is hosted by you; what the container does not load, the banner does not reach.
[Four steps]({{ '/install/tag-manager/' | relative_url }}#four-steps).

## 🚫 Pick one {#pick-one}

Install both and the tag stands down on any page where the script tag ran, and says so on the console. A
page with the template and no script tag runs the template. Both read and write the same cookie, so a
visitor who answered on one is remembered on the other — as long as the version matches on both.

A site that does run both keeps one copy of each file by printing the three on every page as
`window.ConsentioSettings`, `window.ConsentioLanguage` and `window.ConsentioCookies`, in `<head>` above the
container snippet: the script tag fetches the files, and the tag with its three pickers at *None*
[reads the page]({{ '/tag/' | relative_url }}#three-ways-in). This site does exactly that.
