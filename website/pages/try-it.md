---
title: Try it on this page
permalink: /try-it/
# Keeps the blocking <script> whatever _config sets the route to. This is the one page
# that demonstrates the direct install, and the only place the two routes can be seen
# answering for one visitor.
loader: true
description: The banner on this site is the real thing, running the direct install route. Clear the cookie here and it asks again.
---

**The banner on this site is not a screenshot.** Every page here loads `consentio-loader.min.js` as a
blocking script in `<head>` — [route 1]({{ '/install/direct/' | relative_url }}#route-1-directly-in-the-site),
the same markup the documentation gives you.

It also runs with `consentRequired: true`, which is the hardest setting to get right: a full-screen
blocking overlay that a visitor has to answer before they can reach the page. If you have already answered,
clear the cookie below and it comes back.

<div class="fixture" markdown="1">
### 🍪 Clear your answer and start again {#clear-your-answer-and-start-again}

<div class="fixture__actions" markdown="0">
<button type="button" class="button" id="consentio-reset">Clear the cookie and reload</button>
<button type="button" class="button button--quiet" id="consentio-refresh">Refresh the readout</button>
</div>

<p class="fixture__state" id="consentio-readout" role="status">Reading&hellip;</p>
</div>

## 🔍 What to look at {#what-to-look-at}

- **The bar and the settings modal** are rendered inside a closed shadow root, so nothing on this page can
  style them and nothing on this page leaks into them.
- **Tab through it with the mouse untouched.** With `consentRequired: true` the overlay is a dialog:
  Tab stays inside it, and Escape from the settings goes back to the bar.
- **The cookie** is named `consentio` here, because this site does not rename it. The readout above is its
  value, decoded — [the cookie]({{ '/cookie/' | relative_url }}#the-cookie-contract) explains what is in it.
- **`window.ConsentioDefault`** in the console holds what the very first message to Google was built from,
  before anything had been downloaded.

## 🏷️ The other route, on the same site {#the-other-route-on-the-same-site}

[Try it through a tag manager]({{ '/try-it/tag-manager/' | relative_url }}) is the one page here that does
**not** have the script tag. It is where the two ways of installing are checked against each other: answer
the banner on this page, then open that one and see whether it agrees about you.

## 📡 Watching what it sends {#watching-the-pushes}

Open the console and read `window.dataLayer` before and after you answer. The first entry is the
`consent default` — what you were allowed before answering. Answering adds a `consent update` with all seven
permissions named again. [What it tells Google]({{ '/datalayer/' | relative_url }}#what-reaches-the-datalayer)
sets out both.

```js
document.addEventListener('consentio:consent-update', (e) => console.log(e.detail));
```

{% raw %}
<script>
	(function () {
		var readout = document.getElementById('consentio-readout');
		var reset = document.getElementById('consentio-reset');
		var refresh = document.getElementById('consentio-refresh');
		if (!readout || !reset || !refresh) return;

		// The banner publishes the name it actually used. Reading it back beats hard-coding
		// the default here and quietly drifting from the page that documents it.
		function cookieName() {
			var d = window.ConsentioDefault;
			return (d && d.cookieName) || 'consentio';
		}

		function readCookie(name) {
			var parts = document.cookie ? document.cookie.split('; ') : [];
			for (var i = 0; i < parts.length; i++) {
				var eq = parts[i].indexOf('=');
				if (eq > -1 && parts[i].slice(0, eq) === name) {
					return decodeURIComponent(parts[i].slice(eq + 1));
				}
			}
			return null;
		}

		function show() {
			var name = cookieName();
			var raw = readCookie(name);
			if (raw === null) {
				readout.textContent = 'No "' + name + '" cookie. You have not answered yet, '
					+ 'so the banner should be showing.';
				return;
			}
			try {
				readout.textContent = name + ' = ' + JSON.stringify(JSON.parse(raw), null, 2);
			} catch (err) {
				readout.textContent = name + ' = ' + raw + '  (does not parse as JSON, '
					+ 'which reads as no stored answer)';
			}
		}

		reset.addEventListener('click', function () {
			// Same path the banner writes on, so this clears the one it set rather than
			// adding a second cookie the banner never sees.
			document.cookie = cookieName() + '=; path=/; max-age=0; SameSite=Lax';
			window.location.reload();
		});

		refresh.addEventListener('click', show);
		document.addEventListener('consentio:consent-update', show);
		show();
	})();
</script>
{% endraw %}
