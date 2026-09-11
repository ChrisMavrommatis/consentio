---
title: Cookie catalogue
anchor: cookie-catalogue
permalink: /cookies/catalogue/
description: Rows for the cookies common tools set, already in Consentio's shape, to copy into your own cookie table and check against the vendor.
---

Rows for the cookies common tools set, in the shape your cookie table takes. Find the tool you run, copy
its block, and paste it into `consentio-cookies.json` on the HTML route or into the Cookies variable on the
Tag Manager route. **Check every row against the vendor before you ship it.** Each block names the page
it was read from and the day it was read, and a duration changes when the vendor changes it. The
`category` is Consentio's opinion, not the vendor's — change it if you disagree. No block lists every
cookie a tool can set, and a tool you run that is not here still goes in your table.

The first block is the one cookie Consentio sets itself. Its duration follows your `cookieLifetime`
setting — 90 days unless you changed it.

[The cookies JSON]({{ '/configuration/' | relative_url }}#the-cookies-json) says what each field is and
where the file goes.
{% for vendor in site.data['cookie-catalogue'] %}
## 🍪 {{ vendor.vendor }} {#{{ vendor.vendor | slugify }}}

{% if forloop.first -%}
[The cookie]({{ '/cookie/' | relative_url }}) is its own page; these rows were read from it on {{ vendor.checked | date: "%-d %b %Y" }}.
{%- else -%}
Read from [the vendor's own page]({{ vendor.documentation }}) on {{ vendor.checked | date: "%-d %b %Y" }}.
{%- endif %}

<figure class="snippet" markdown="0">
<figcaption class="snippet__bar"><span>{{ vendor.rows | size }} {% if vendor.rows.size == 1 %}row{% else %}rows{% endif %}</span><button type="button" class="button button--quiet snippet__copy">Copy</button></figcaption>
<pre><code>[
{%- for row in vendor.rows %}
  {
    "name": {{ row.name | jsonify | replace: '&', '&amp;' | replace: '<', '&lt;' | replace: '>', '&gt;' }},
    "purpose": {{ row.purpose | jsonify | replace: '&', '&amp;' | replace: '<', '&lt;' | replace: '>', '&gt;' }},
    "provenance": {{ row.provenance | jsonify | replace: '&', '&amp;' | replace: '<', '&lt;' | replace: '>', '&gt;' }},
    "duration": {{ row.duration | jsonify | replace: '&', '&amp;' | replace: '<', '&lt;' | replace: '>', '&gt;' }},
    "category": {{ row.category | jsonify | replace: '&', '&amp;' | replace: '<', '&lt;' | replace: '>', '&gt;' }}
  }{% unless forloop.last %},{% endunless %}
{%- endfor %}
]</code></pre>
</figure>
{% endfor %}
{% raw %}
<script>
	(function () {
		var buttons = document.querySelectorAll('.snippet__copy');
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].addEventListener('click', function (event) {
				var button = event.currentTarget;
				var code = button.closest('.snippet').querySelector('pre').textContent;
				if (!navigator.clipboard) {
					button.textContent = 'Select the text and copy it';
					return;
				}
				navigator.clipboard.writeText(code).then(function () {
					button.textContent = 'Copied';
					setTimeout(function () { button.textContent = 'Copy'; }, 1500);
				});
			});
		}
	})();
</script>
{% endraw %}
