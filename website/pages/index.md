---
title: Consentio
layout: home
permalink: /
---

<div class="hero" markdown="1">

# Consentio

<p class="hero__lead">A cookie banner you add to your own site. It asks visitors what they allow, remembers
the answer, and tells your tracking tags what to do about it.</p>

<div class="hero__actions" markdown="0">
<a class="button" href="{{ '/install/direct/' | relative_url }}">Set it up</a>
<a class="button button--quiet" href="{{ '/try-it/' | relative_url }}">See it working</a>
<a class="button button--quiet" href="{{ site.repository_url }}">Source</a>
</div>

</div>

You host it yourself. It is one script file and the settings files it reads — no account, no server, nothing running
anywhere but the visitor's browser. It suits a static site, or any site whose HTML you can edit.

**There is no npm package and nothing to import.** You copy two files into your site, or serve them from a
CDN at a version you pin. Apache-2.0, no dependencies.

<ul class="cards">
	<li class="card">
		<h3>Put it in your HTML</h3>
		<p>One <code>&lt;script&gt;</code> tag at the top of your pages. Pick this if you can edit your own
		HTML.</p>
		<a href="{{ '/install/direct/' | relative_url }}">Set it up this way</a>
	</li>
	<li class="card">
		<h3>Use Google Tag Manager</h3>
		<p>One template, on one trigger. Pick this if everything on your site already runs through a
		container.</p>
		<a href="{{ '/install/tag-manager/' | relative_url }}">Set it up this way</a>
	</li>
	<li class="card">
		<h3>Something is wrong</h3>
		<p>The banner will not show, it comes back every time, or your tags fire before anyone answers.</p>
		<a href="{{ '/troubleshooting/' | relative_url }}">Fixes for the common ones</a>
	</li>
</ul>

## 🧭 Choose a route first {#choose-a-route-first}

There are two ways to install it, and **they are not the same**. One is a script tag in every page's
`<head>`; the other is a template in your container. **The container covers only what it loads**; a script
pasted into a page is held back by marking it, on either route.

[Choose a route]({{ '/routes/' | relative_url }}) puts the two side by side — what each can stop, what
each costs, where the words and the settings come from.

### 🚫 Pick one {#the-two-routes-do-not-mix}

Install both and, on a page where the script tag ran, the Tag Manager template stands down and says so on
the console. An older template does not, and you get two banners that do not know about each other.

## 📂 The rest of the documentation {#the-rest-of-the-documentation}

Start at the top. The reference is split by route: read your route's pages, then the ones both share.

**Start here, and set it up**

| Page | What is in it |
|---|---|
| [How it works]({{ '/how-it-works/' | relative_url }}) | load order, what runs when, and why the script cannot wait |
| [Try it on this page]({{ '/try-it/' | relative_url }}) | the live banner, and a button that clears your answer so it shows again |
| [Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }}) | the page that never has the script tag, for checking that both ways agree about the same visitor |
| [Choose a route]({{ '/routes/' | relative_url }}) | the two ways to install, side by side |
| [Put it in your HTML]({{ '/install/direct/' | relative_url }}) | four steps, then the detail |
| [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}) | four steps, then the detail |
| [Hold a script until consent]({{ '/hold-scripts/' | relative_url }}) | one attribute on a script tag, and it waits for the visitor's answer |
| [Troubleshooting]({{ '/troubleshooting/' | relative_url }}) | symptom, cause, fix |

**Reference: HTML route**

| Page | What is in it |
|---|---|
| [The loader tag]({{ '/loader/' | relative_url }}) | every attribute on the tag, which ones win, what it leaves on `window` |
| [The settings file]({{ '/configuration/' | relative_url }}) | every key, the four categories, the older single file that was removed |

**Reference: Tag Manager**

| Page | What is in it |
|---|---|
| [The tag]({{ '/tag/' | relative_url }}) | the three pickers on the template, the three ways a file reaches each, the language choices, the permissions |
| [Language packs to paste]({{ '/language/tag-manager/' | relative_url }}) | the published packs as variables to paste into a container |

**Reference: both routes**

| Page | What is in it |
|---|---|
| [The language pack]({{ '/language/' | relative_url }}) | every word the banner shows, and how to load a published pack or your own |
| [The cookie table]({{ '/cookies/' | relative_url }}) | the file that lists the cookies your site sets, one row each |
| [The cookie catalogue]({{ '/cookies/catalogue/' | relative_url }}) | rows for the cookies common tools set, to copy into your own table |
| [The cookie]({{ '/cookie/' | relative_url }}) | what it stores, how long it lasts, and what to put in your cookie policy |
| [What it tells Google]({{ '/datalayer/' | relative_url }}) | exactly what Consentio sends, and how to check it arrived |
| [Events]({{ '/events/' | relative_url }}) | how to run your own code when someone answers |
| [Asking everyone again]({{ '/versioning/' | relative_url }}) | how to throw away every stored answer, and when that is the right thing |

## 🏁 Versions {#release-note}

**This site describes {{ site.docs_version }}, and it is the newest published version.**

**If you are upgrading from `0.0.4`:** remove `async` or `defer` from the script tag. In `0.0.4` marking it
`async` stopped the banner working with no warning at all; the script has to block, and now it says so.
Nothing else changes for you.

**If you use the Tag Manager template**, download the new `.tpl` from the release and import it over the one
in your container. Nothing tells you a new one exists; the template you imported keeps loading the banner
version it was built against.

Pin an exact version wherever you load the files from. A URL that follows the newest release will change what
your site runs without you touching anything.

## 📄 Licence {#licence}

Apache-2.0. No runtime dependencies.
