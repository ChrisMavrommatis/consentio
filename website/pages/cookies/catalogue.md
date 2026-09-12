---
title: The cookie catalogue
anchor: cookie-catalogue
permalink: /cookies/catalogue/
description: Rows for the cookies common tools set, already in Consentio's shape. Tick the ones your site sets and take the cookie table as the file, or as a variable for Tag Manager.
scripts: [catalogue]
---

Rows for the cookies common tools set, in the shape [your cookie table]({{ '/cookies/' | relative_url }})
takes. Find the tools you run and **tick the cookies they set**; the strip at the bottom hands the ticked
rows back as `consentio-cookies.json` for the [HTML route]({{ '/install/direct/' | relative_url }}), or
as a Custom JavaScript variable for the [Tag Manager route]({{ '/install/tag-manager/' | relative_url }}).
A row's *JSON* button shows that one row, and *Copy all rows* takes a whole block.

**Check every row against the vendor before you ship it.** Each block names the page it was read from and
the day it was read, and a duration changes when the vendor changes it. The `category` is Consentio's
opinion, not the vendor's — change it if you disagree. No block lists every cookie a tool can set, and a
tool you run that is not here still goes in your table.

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
<thead><tr><th><span class="visually-hidden">Tick</span></th><th>Name</th><th>Purpose</th><th>Category</th><th><span class="visually-hidden">As JSON</span></th></tr></thead>
<tbody>
{%- for row in vendor.rows %}
<tr class="catalogue__row"><td><input type="checkbox" class="catalogue__pick" data-vendor="{{ forloop.parentloop.index0 }}" data-row="{{ forloop.index0 }}" aria-label="Tick {{ row.name | escape }}"></td><td><code>{{ row.name | escape }}</code></td><td class="catalogue__purpose">{{ row.purpose | escape }}</td><td><code>{{ row.category | escape }}</code></td><td><button type="button" class="button button--quiet catalogue__open" data-row="{{ forloop.index0 }}" aria-label="JSON for {{ row.name | escape }}">JSON</button></td></tr>
{%- endfor %}
</tbody>
</table>
</figure>
{% endfor %}
<script type="application/json" id="catalogue-data">{{ site.data['cookie-catalogue'] | jsonify | replace: '</', '<\/' }}</script>

<div class="builder-strip" id="cookie-builder" role="region" aria-label="Your cookie table" hidden markdown="0">
<span class="builder-strip__count">0 cookies selected</span>
<span class="builder-strip__actions">
<button type="button" class="button button--quiet builder-strip__show">Show</button>
<button type="button" class="button builder-strip__file">Copy as file</button>
<button type="button" class="button builder-strip__variable">Copy as Tag Manager variable</button>
<button type="button" class="button button--quiet builder-strip__clear">Clear</button>
</span>
</div>

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
