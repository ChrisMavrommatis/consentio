---
title: Try it through a tag manager
permalink: /try-it/tag-manager/
loader: false
description: The same site, the same cookie, no loader - the page that shows whether the two install routes agree about one visitor.
---

**This page has no Consentio script tag.** Every other page here has one. This one is left to a Google Tag
Manager container instead — [the other way of installing]({{ '/install/tag-manager/' | relative_url }}#route-2-google-tag-manager-custom-template).

It exists because there is one failure that never fails loudly — **the two routes disagreeing about the same
visitor**. Answer the banner on any other page here, then come back to this one. Both routes read the same
cookie by the same rules, so the answer has to survive the trip. If it does not, one of the two readers is
wrong, and the [cookie contract]({{ '/cookie/' | relative_url }}#the-cookie-contract) says which.

<div class="callout callout--warn" markdown="1">
**There is no container configured**, so this page currently shows nothing at all. Once one is set and it
carries the Consentio template, the banner appears here through the tag manager instead of through a
script tag.
</div>

## 🔍 What to compare {#what-to-compare}

| | Every other page | This page |
|---|---|---|
| What runs first | the Consentio script tag, in `<head>` | the template, on the Consent Initialization trigger |
| Who tells Google what is allowed | the script tag | the Tag Manager template |
| Where settings come from | the two settings files | fields in Tag Manager |
| The cookie | `consentio` | `consentio` — the same one |

`window.ConsentioDefault` is set by the script tag and by nothing else, so it is missing here. That is the
quickest way to tell which of the two a page is using.

<p class="fixture__state" id="consentio-readout" role="status">Reading&hellip;</p>

{% raw %}
<script>
	(function () {
		var readout = document.getElementById('consentio-readout');
		if (!readout) return;
		var name = (window.ConsentioDefault && window.ConsentioDefault.cookieName) || 'consentio';
		var parts = document.cookie ? document.cookie.split('; ') : [];
		var raw = null;
		for (var i = 0; i < parts.length; i++) {
			var eq = parts[i].indexOf('=');
			if (eq > -1 && parts[i].slice(0, eq) === name) {
				raw = decodeURIComponent(parts[i].slice(eq + 1));
			}
		}
		var route = window.ConsentioDefault ? 'script tag ran on this page' : 'no script tag on this page';
		readout.textContent = route + '\n' + name + ' = ' + (raw === null ? '(not set)' : raw);
	})();
</script>
{% endraw %}
