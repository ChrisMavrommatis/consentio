---
title: Consentio
layout: home
permalink: /
description: A cookie banner you can add to your own site. It asks visitors what they allow, remembers the answer, and tells your tracking tags what to do about it.
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

You host it yourself. It is one script file and a settings file — no account, no server, nothing running
anywhere but the visitor's browser. It suits a static site, or any site whose HTML you can edit.

**There is no npm package and nothing to import.** You copy two files into your site, or serve them from a
CDN at a version you pin. Apache-2.0, no dependencies.

<div class="callout callout--warn" markdown="1">
**This site documents version {{ site.docs_version }}, which is released.** If you install by putting the
script in your HTML, everything here describes what you get. **The Tag Manager template in Google's gallery
is still the older one** — it loads the previous banner until its update clears review, so that route lags
this page for now.
</div>

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

There are two ways to install it, and **they are not the same**. The choice decides what your banner can
actually stop.

| | **Put it in your HTML** | **Use Google Tag Manager** |
|---|---|---|
| Pick this if | you can edit the `<head>` of your pages | everything on your site already runs through one container |
| What you add | one `<script>` tag, plus two files you host | one template, on one trigger |
| Where your settings live | two small files you edit by hand | fields you fill in inside Tag Manager |
| What it can stop | anything on the page | only what Tag Manager loads |
| What it costs | the page waits for one small file — 4.6 KB, about 2 KB compressed | nothing extra on the page, but read the warning below |

If you are not sure, **put it in your HTML**. It is the one that covers everything.

[How it works]({{ '/how-it-works/' | relative_url }}) has the same comparison in technical terms, if you
would rather read it that way.

### ⚠️ What Tag Manager cannot cover {#the-tag-manager-routes-catch-in-the-open}

The Tag Manager route can only stop things **Tag Manager loads**. Anything pasted straight into a page — an
embedded video, a chat widget, a tracking pixel someone added to a footer — runs whatever the visitor
answered, because the banner never sees it.

So this route works if, and only if, everything on your site already goes through the container. **If
anything is pasted into a page, put it in your HTML instead.** That way the banner covers the whole page.

If you are not certain which is true of your site, that is itself the answer: choose the HTML route.

### 🚫 The two routes do not mix {#the-two-routes-do-not-mix}

**Pick one.** Install both and your visitors get two banners that do not know about each other, from two
copies of Consentio running side by side.

## 📂 The rest of the documentation {#the-rest-of-the-documentation}

Start at the top. The last six are reference — read them when you need them, not before.

| Page | What is in it |
|---|---|
| [Put it in your HTML]({{ '/install/direct/' | relative_url }}) | four steps, then the detail |
| [Use Google Tag Manager]({{ '/install/tag-manager/' | relative_url }}) | four steps, then the detail |
| [Try it on this page]({{ '/try-it/' | relative_url }}) | the live banner, and a button that clears your answer so it shows again |
| [Troubleshooting]({{ '/troubleshooting/' | relative_url }}) | symptom, cause, fix |
| [Settings]({{ '/configuration/' | relative_url }}) | every option, with defaults and a full example |
| [How it works]({{ '/how-it-works/' | relative_url }}) | load order, what runs when, and why the script cannot wait |
| [The cookie]({{ '/cookie/' | relative_url }}) | what it stores, how long it lasts, and what to put in your cookie policy |
| [What it tells Google]({{ '/datalayer/' | relative_url }}) | exactly what Consentio sends, and how to check it arrived |
| [Asking everyone again]({{ '/versioning/' | relative_url }}) | how to throw away every stored answer, and when that is the right thing |
| [Events]({{ '/events/' | relative_url }}) | how to run your own code when someone answers |
| [Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }}) | the one page here with no script tag, for checking that both ways agree about the same visitor |

## 🏁 Versions {#release-note}

**This site describes {{ site.docs_version }}, and it is the newest published version.**

**If you are upgrading from `0.0.4`:** remove `async` or `defer` from the script tag. In `0.0.4` marking it
`async` stopped the banner working with no warning at all; the script has to block, and now it says so.
Nothing else changes for you.

**If you use the Tag Manager template**, update it in your container when its new version appears in the
gallery. The published template still loads the older banner until then.

Pin an exact version wherever you load the files from. A URL that follows the newest release will change what
your site runs without you touching anything.

## 📄 Licence {#licence}

Apache-2.0. No runtime dependencies.
