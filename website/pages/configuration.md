---
title: The settings file
anchor: configuration
permalink: /configuration/
description: Every key in Consentio's settings file with its type and default, the four categories, the same file on the Tag Manager route, and the older single file that was removed.
scripts: [settings-builder]
panel: true
---

The settings file holds how the banner behaves: the cookie, the version, whether an answer is required,
what each category starts at. It is one of three files, and the only one that is not words. The
[language pack]({{ '/language/' | relative_url }}) holds every word the visitor reads and the
[cookie table]({{ '/cookies/' | relative_url }}) holds the rows shown in the settings panel. On the Tag
Manager route the same file goes [into a variable](#on-the-tag-manager-route).

**You only write what you want to change.** Every key is merged over the defaults on its own, so leaving one
out gives you the default. A blank string is not a missing key: `""` is a value you asked for.

## 📄 A complete example {#a-complete-example}

Every key, with something in it. Nothing here is required.

```json
{
  "cookieName": "consentio",
  "cookieLifetime": 90,
  "shareAcrossSubdomains": false,
  "version": 1,
  "debug": false,
  "consentRequired": false,
  "policyUrl": "/privacy/",
  "hideFloatingButton": false,
  "urlPassthrough": false,
  "consents": {
    "strictly_necessary": { "defaultState": "granted" },
    "preferences_functionality": { "defaultState": "denied" },
    "statistics_performance": { "defaultState": "denied" },
    "marketing_advertising": { "defaultState": "denied" }
  }
}
```

## 🔧 The keys {#top-level}

| Key | Type | Default | What it does |
|---|---|---|---|
| `cookieName` | string | `consentio` | Name of the cookie the answer is stored in. **Not read on the HTML route at all** — set `data-cookie-name` on the tag instead, and Consentio says so on the console if you put it here. **The Tag Manager route always uses `consentio`**: a template has to name the cookie it reads when it is published, so the file's value is ignored there |
| `cookieLifetime` | number | `90` | Days an answer is kept before the visitor is asked again. **Ignored if you also set `data-cookie-lifetime` on the tag.** Anything that is not a positive number falls back to 90. See [How long it lasts]({{ '/cookie/' | relative_url }}#how-long-it-lasts) |
| `shareAcrossSubdomains` | boolean | `false` | One answer for every hostname your site answers on, instead of one each. There is no domain to type: Consentio works out the one your hosts share by asking the browser. **Ignored if you also set `data-share-across-subdomains` on the tag.** See [One answer across subdomains]({{ '/cookie/' | relative_url }}#one-answer-across-subdomains) |
| `debug` | boolean | `false` | Prints the banner's `[Consentio:Event]` and `[Consentio:GTM]` lines to the console. Its warnings are printed either way. The loader's own logging is `data-debug` on the [tag]({{ '/loader/' | relative_url }}#the-attributes) |
| `version` | number | `1` | Raise it to throw away every stored answer and ask everyone again. **Not read on the HTML route at all** — set `data-version` on the tag instead, and Consentio says so on the console if you put it here. **On the Tag Manager route this file is where it lives.** See [Asking everyone again]({{ '/versioning/' | relative_url }}#versioning-stored-consent) |
| `consentRequired` | boolean | `false` | Shows a full-screen blocking overlay behind the bar and modal until the visitor answers |
| `policyUrl` | string | none | Where the banner's privacy policy link points, on the bar and in the panel. It opens in a new tab. Leave it out and no link is shown. A language pack may name [its own address]({{ '/language/' | relative_url }}#the-keys) instead. It must start with `http://`, `https://` or a single `/` for a page on your own site — anything else is dropped with a warning on the console, because the address goes into an `href` and is not escaped the way a text is |
| `hideFloatingButton` | boolean | `false` | Removes the round settings button the banner leaves in the bottom right corner. **Only set it once your own link is on every page** — see [Reopening the settings]({{ '/events/' | relative_url }}#reopening-the-settings-from-your-own-link). With it on and no link, a visitor cannot change their answer, and Consentio says so on the console |
| `urlPassthrough` | boolean | `false` | Tells Google's tags to carry the ad-click id across your own links in the URL while ad storage is denied, so a Google Ads click still counts for a visitor who refused. It puts a click id in every internal link, which is why it is off. **Not read on the HTML route at all** — set `data-url-passthrough` on the tag instead, and Consentio says so on the console if you put it here. **On the Tag Manager route this file is where it lives.** See [What it tells Google]({{ '/datalayer/' | relative_url }}#url-passthrough) |
| `consents` | object | the four categories | Keyed by category. The only thing in it is `defaultState` — see below |

## 📋 The four categories {#consents}

Each category is one row in the settings panel. The settings file says what it does; the
[language pack]({{ '/language/' | relative_url }}#the-four-categories) says what it says.

| Key | Type | What it does |
|---|---|---|
| `defaultState` | string | `"granted"` or `"denied"` — what the switch shows to a visitor with no stored answer. It is not what is sent to Google before the visitor answers; that is always denied |

**The four categories are fixed. You can change every string, not the set.** A key that is not one of the
four is ignored, with a warning on the console, and the banner still runs. You cannot add a category, remove
one, or point one at a different Google permission. The reason is timing: the answer has to reach Google
before any file has been downloaded, so the four have to be known in advance.

The four are `strictly_necessary`, `preferences_functionality`, `statistics_performance` and
`marketing_advertising`. `strictly_necessary` starts granted and is always on — it shows the `alwaysOnLabel`
text instead of a switch, and no file can change that. The other three start denied.

**Changing one category:** name its key, and only the field you are changing.

```json
{
  "consentRequired": true,
  "consents": { "marketing_advertising": { "defaultState": "denied" } }
}
```

## 🧰 Build the file {#build-the-file}

Every key above, as a control. Change what you want and the file says only that — a key left at its
default is left out. *Show* opens it; the two copies take it straight to the clipboard. Take it as `consentio-settings.json` for the [HTML route]({{ '/install/direct/' | relative_url }}),
or as a Custom JavaScript variable to paste into Tag Manager for the
[other one]({{ '/install/tag-manager/' | relative_url }}). `cookieName`, `version` and `urlPassthrough` are here too: on
the HTML route they go on the [loader tag]({{ '/loader/' | relative_url }}) instead, and on the Tag
Manager route the name is ignored.

<form class="builder" id="settings-builder" markdown="0">
<div class="builder__grid">
{%- for setting in site.data.settings %}
<label class="builder__row"><span class="builder__label">{{ setting.label }} <code>{{ setting.key }}</code></span>
{%- if setting.type == "boolean" %}
<input type="checkbox" name="{{ setting.key }}"{% if setting.default %} checked{% endif %}>
{%- elsif setting.type == "number" %}
<input type="number" name="{{ setting.key }}" value="{{ setting.default }}" min="1" step="1">
{%- elsif setting.type == "state" %}
<select name="{{ setting.key }}"><option value="granted"{% if setting.default == "granted" %} selected{% endif %}>granted</option><option value="denied"{% if setting.default == "denied" %} selected{% endif %}>denied</option></select>
{%- else %}
<input type="text" name="{{ setting.key }}" value="{{ setting.default | escape }}">
{%- endif %}
</label>
{%- endfor %}
</div>
<div class="builder__actions"><button type="button" class="button button--quiet" id="settings-show">Show</button> <button type="button" class="button" id="settings-file">Copy as file</button> <button type="button" class="button" id="settings-variable">Copy as Tag Manager variable</button> <button type="reset" class="button button--quiet">Start again</button></div>
</form>
<script type="application/json" id="settings-data">{{ site.data.settings | jsonify | replace: '</', '<\/' }}</script>

## 🚀 On the HTML route {#on-the-html-route}

`data-settings-url` on the [loader tag]({{ '/loader/' | relative_url }}) names the file. Four of the keys
above — `cookieName`, `version`, `cookieLifetime` and `shareAcrossSubdomains` — can also be attributes on
that tag, and [the tag wins]({{ '/loader/' | relative_url }}#the-tag-wins) when both are set. That page
lists every attribute.

## 🏷️ On the Tag Manager route {#on-the-tag-manager-route}

The tag's **Settings** picker takes the same file, three ways:

- **A Constant variable** holding the JSON text above, pasted in whole. The tag parses it. This is the
  usual way.
- **A Custom JavaScript variable** returning the object, `function () { return { ... }; }`.
- **The page itself**, with the picker at *None*: `<script>window.ConsentioSettings = { ... }</script>` in
  `<head>`, above the container snippet. A site that runs both routes keeps one file this way.

Left at *None* on a page with no `ConsentioSettings`, the banner uses the defaults above.

Three keys read differently there. **`cookieName` is ignored** — the template names the cookie it reads
when it is published, so on that route it is always `consentio`. **`version` and `urlPassthrough` are read
from this file**, because there is no loader tag to carry them; a site running both routes keeps them equal
to the tag's `data-version` and `data-url-passthrough`.
[The tag]({{ '/tag/' | relative_url }}#the-pickers) has the detail.

## ⚠️ When the file is missing or wrong {#when-the-file-is-missing-or-wrong}

- **No `data-settings-url`:** the built-in defaults, and no message.
- **The file does not load:** the banner does not start, and the console has `Initialization failed:`
  with the address and the reason. The language pack and the cookie table are forgiven that way; this file is not.
- **A category key that is not one of the four:** ignored with a warning, and the banner runs.
- **`cookieName`, `version` or `urlPassthrough` in the file on the HTML route:** ignored with a warning
  saying which tag attribute to set instead.
- **A `policyUrl` that does not start with `http://`, `https://` or `/`:** dropped with a warning, and no
  link is shown.

## 🗂️ The older single settings file {#the-older-single-file}

Before the language pack existed, `data-config-url` fetched one file carrying the behaviour, a `texts`
object and a `consents` **array**. **That is gone — 0.3.0 was the last release that read it.** The attribute is no longer read and a file
in that shape is not taken apart any more. Split it into [the settings file](#top-level) and
[the language pack]({{ '/language/' | relative_url }}) — the behaviour keys stay here, `texts` and the
words of each category move to the pack, and `consents` becomes an object keyed by category in both — then
put `data-settings-url` and `data-language-url` on the loader tag.
