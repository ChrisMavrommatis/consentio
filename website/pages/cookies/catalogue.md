---
title: The cookie catalogue
anchor: cookie-catalogue
permalink: /cookies/catalogue/
description: Rows for the cookies common tools set, already in Consentio's shape, to copy into your own cookie table and check against the vendor.
---

Rows for the cookies common tools set, in the shape [your cookie table]({{ '/cookies/' | relative_url }})
takes. Find the tool you run, read its rows, and copy them — one at a time as JSON, or the whole block as
the array the file holds. **Check every row against the vendor before you ship it.** Each block names the
page it was read from and the day it was read, and a duration changes when the vendor changes it. The
`category` is Consentio's opinion, not the vendor's — change it if you disagree. No block lists every
cookie a tool can set, and a tool you run that is not here still goes in your table.

The first block is the one cookie Consentio sets itself. Its duration follows your `cookieLifetime`
setting — 90 days unless you changed it.
{% for vendor in site.data['cookie-catalogue'] %}
## 🍪 {{ vendor.vendor }} {#{{ vendor.vendor | slugify }}}

{% if forloop.first -%}
[The cookie]({{ '/cookie/' | relative_url }}) is its own page; these rows were read from it on {{ vendor.checked | date: "%-d %b %Y" }}.
{%- else -%}
Read from [the vendor's own page]({{ vendor.documentation }}) on {{ vendor.checked | date: "%-d %b %Y" }}.
{%- endif %}

<figure class="snippet catalogue" markdown="0" data-vendor="{{ forloop.index0 }}">
<figcaption class="snippet__bar"><span>{{ vendor.rows | size }} {% if vendor.rows.size == 1 %}row{% else %}rows{% endif %}</span><button type="button" class="button button--quiet snippet__copy catalogue__copy-all" aria-label="Copy all rows of {{ vendor.vendor | escape }}">Copy all rows</button></figcaption>
<table>
<thead><tr><th>Name</th><th>Purpose</th><th>Category</th><th><span class="visually-hidden">As JSON</span></th></tr></thead>
<tbody>
{%- for row in vendor.rows %}
<tr class="catalogue__row"><td><code>{{ row.name | escape }}</code></td><td class="catalogue__purpose">{{ row.purpose | escape }}</td><td><code>{{ row.category | escape }}</code></td><td><button type="button" class="button button--quiet catalogue__open" data-row="{{ forloop.index0 }}" aria-label="JSON for {{ row.name | escape }}">JSON</button></td></tr>
{%- endfor %}
</tbody>
</table>
</figure>
{% endfor %}
<script type="application/json" id="catalogue-data">{{ site.data['cookie-catalogue'] | jsonify | replace: '</', '<\/' }}</script>

<dialog class="catalogue-panel" id="catalogue-panel" aria-labelledby="catalogue-panel-title" tabindex="-1" markdown="0">
<div class="catalogue-panel__inner">
<div class="catalogue-panel__bar">
<p class="catalogue-panel__title" id="catalogue-panel-title"></p>
<button type="button" class="button button--quiet catalogue-panel__close">Close</button>
</div>
<p class="catalogue-panel__lead">In the shape <a href="{{ '/cookies/' | relative_url }}">the cookie table</a> takes. Check it against the vendor before you ship it.</p>
<pre><code class="catalogue-panel__code"></code></pre>
<div class="catalogue-panel__actions"><button type="button" class="button catalogue-panel__copy">Copy</button></div>
</div>
</dialog>

{% raw %}
<script>
	(function () {
		var panel = document.getElementById('catalogue-panel');
		var data = document.getElementById('catalogue-data');
		if (!panel || !data || typeof panel.showModal !== 'function') return;

		var vendors = JSON.parse(data.textContent);
		var title = panel.querySelector('.catalogue-panel__title');
		var code = panel.querySelector('.catalogue-panel__code');
		var copy = panel.querySelector('.catalogue-panel__copy');
		var close = panel.querySelector('.catalogue-panel__close');
		var opener = null;

		function flash(button, text, restore) {
			button.textContent = text;
			setTimeout(function () { button.textContent = restore; }, 1500);
		}

		function copyText(text, button, fallback) {
			if (!navigator.clipboard) {
				fallback();
				return;
			}
			navigator.clipboard.writeText(text).then(function () {
				flash(button, 'Copied', button.getAttribute('data-label') || 'Copy');
			});
		}

		function open(heading, json, from) {
			opener = from;
			title.textContent = heading;
			code.textContent = json;
			copy.textContent = 'Copy';
			panel.showModal();
			panel.focus();
		}

		panel.addEventListener('close', function () {
			if (opener) opener.focus();
			opener = null;
		});

		// A click on the backdrop lands on the dialog itself; the inner box fills it, so
		// anything inside reports the inner element as its target.
		panel.addEventListener('click', function (event) {
			if (event.target === panel) panel.close();
		});

		close.addEventListener('click', function () { panel.close(); });

		copy.addEventListener('click', function () {
			copyText(code.textContent, copy, function () {
				copy.textContent = 'Select the text and copy it';
			});
		});

		var blocks = document.querySelectorAll('.catalogue');
		for (var i = 0; i < blocks.length; i++) {
			(function (block) {
				var vendor = vendors[Number(block.getAttribute('data-vendor'))];
				if (!vendor) return;

				var all = block.querySelector('.catalogue__copy-all');
				all.setAttribute('data-label', all.textContent);
				all.addEventListener('click', function () {
					var json = JSON.stringify(vendor.rows, null, 2);
					copyText(json, all, function () {
						open(vendor.vendor + ' - all rows', json, all);
					});
				});

				var buttons = block.querySelectorAll('.catalogue__open');
				for (var j = 0; j < buttons.length; j++) {
					buttons[j].addEventListener('click', function (event) {
						var button = event.currentTarget;
						var row = vendor.rows[Number(button.getAttribute('data-row'))];
						open(row.name, JSON.stringify(row, null, 2), button);
					});
				}

				// The whole row opens the panel too, through its button, so the keyboard
				// and the mouse reach the same control. A drag to select text does not.
				var rows = block.querySelectorAll('.catalogue__row');
				for (var k = 0; k < rows.length; k++) {
					rows[k].addEventListener('click', function (event) {
						if (event.target.closest('button, a')) return;
						var selection = window.getSelection();
						if (selection && selection.toString()) return;
						event.currentTarget.querySelector('.catalogue__open').click();
					});
				}
			})(blocks[i]);
		}
	})();
</script>
{% endraw %}
