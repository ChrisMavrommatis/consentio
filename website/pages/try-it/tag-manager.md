---
title: Try it through a tag manager
permalink: /try-it/tag-manager/
loader: false
description: The same site, the same cookie, no loader - the page that shows whether the two install routes agree about one visitor.
scripts: [try-it]
---

**This page has no Consentio script tag.** Every other page here has one. This one is left to a Google Tag
Manager container instead — [the other way of installing]({{ '/install/tag-manager/' | relative_url }}#route-2-google-tag-manager-custom-template).

It exists because there is one failure that never fails loudly — **the two routes disagreeing about the same
visitor**. Answer the banner on any other page here, then come back to this one. Both routes read the same
cookie by the same rules, so the answer has to survive the trip. If it does not, one of the two readers is
wrong, and the [cookie contract]({{ '/cookie/' | relative_url }}#the-cookie-contract) says which.

{% assign container = site.gtm_container_id | default: "" %}
{% if container == "" %}
<div class="callout callout--warn" markdown="1">
**This build has no container configured**, so this page shows nothing at all. A build with one set, and the
Consentio template imported into it, shows the banner here through the tag manager instead of through a
script tag.
</div>
{% else %}
<div class="callout" markdown="1">
**The container is `{{ container }}`.** No banner here means the Consentio template is not imported into it.
A banner that forgets an answer given on another page means the template's `version` field and this site's
disagree, and a mismatch discards the whole stored value.
</div>
{% endif %}

## 🔍 What to compare {#what-to-compare}

| | Every other page | This page |
|---|---|---|
| What runs first | the Consentio script tag, in `<head>` | the template, on the Consent Initialization trigger |
| Who tells Google what is allowed | the script tag | the Tag Manager template |
| Where settings come from | the three files, fetched by the script tag | the same three files, printed on every page as `window.ConsentioSettings`, `window.ConsentioLanguage` and `window.ConsentioCookies`, read by the template with its pickers at *None* |
| The cookie | `consentio` | `consentio` — the same one |

`window.ConsentioDefault` is set by the script tag and by nothing else, so it is missing here. That is the
quickest way to tell which of the two a page is using.

<p class="fixture__state" id="consentio-readout" role="status">Reading&hellip;</p>
