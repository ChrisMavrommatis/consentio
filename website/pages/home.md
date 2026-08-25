---
title: Consentio
permalink: /
breadcrumbs: false
---

Consentio is a small, frontend-only consent banner for static sites. It renders a bar and a settings
modal inside a closed shadow root, stores the visitor's answer in one cookie, and pushes Google Consent
Mode signals to `dataLayer`.

It is **delivered as a script**. It is not published to npm and it is not imported as a package — you copy
two files into your site, or serve them from a CDN mirror of a tagged release. There are no runtime
dependencies. Apache-2.0.

> **This page documents version 0.1.0, which has not been released yet.** The behaviour below — the loader
> pushing the consent default synchronously, and the tag manager template setting its own — is what the
> source does now. The published `0.0.4` bundle and the published template do not do it yet.

## 🧭 Choose a route first {#choose-a-route-first}

There are two ways to install Consentio, and **they are not equivalent**. Pick one deliberately — the
choice decides what your banner actually gates.

| | **Directly in the site** | **Google Tag Manager custom template** |
|---|---|---|
| What you add | `consentio-loader.min.js` as a plain **blocking** `<script>` in `<head>`, above the tag manager snippet | the published template, on the **Consent Initialization - All Pages** trigger |
| What pushes the consent default | the loader, on its first pass, before it fetches or injects anything | the template's own sandboxed code, before it calls `injectScript` |
| Where settings come from | two JSON files, fetched by URL | the template's own fields |
| Uses the loader | yes | **no — never** |
| The cost | it blocks. 4.3 KB has to download before the page paints | **it only covers tags in that container** |

### ⚠️ The tag manager route's catch, in the open {#the-tag-manager-routes-catch-in-the-open}

A Google Tag Manager template can only gate what the tag manager loads. **Take this route and every tag
and every cookie-setting script on your site has to be managed from the tag manager.** A script pasted
straight into the page — an embedded video, a chat widget, a pixel someone added to a footer include —
sits outside consent control entirely and will fire whatever the visitor answered.

That is worse than having no banner, because it looks compliant. If you cannot move everything into the
container, take the direct route.

### 🚫 The two routes do not mix {#the-two-routes-do-not-mix}

The template does **not** load `consentio-loader.min.js`. It injects `consentio.min.js` itself and calls
`Consentio.Create(config, cookies)` with settings from its own fields. Install both and the visitor gets
the banner twice, from two instances that do not know about each other.

---

## 🚀 Route 1 — directly in the site {#route-1-directly-in-the-site}

Two files have to be reachable at the same URL prefix: `consentio-loader.min.js` and `consentio.min.js`.
The loader works out where to find the main bundle from its own `src` — same directory, and `.min.js` in
the loader's filename is what makes it load `consentio.min.js` rather than `consentio.js`. Move one
without the other and nothing loads.

### 📄 The markup {#the-markup}

```html
<head>
  <meta charset="utf-8">

  <!-- 1. Consentio. Blocking, and first. -->
  <script src="/js/consentio-loader.min.js"
          data-consentio-loader
          data-config-url="/data/consentio-config.json"
          data-cookies-url="/data/consentio-cookies.json"></script>

  <!-- 2. The tag manager container snippet, exactly as Google gives it, AFTER the loader. -->
  <script>(function(w,d,s,l,i){/* ... Google's snippet, unchanged ... */})
    (window,document,'script','dataLayer','GTM-XXXXXXX');</script>
</head>
```

This site's own `_layouts/page.html` is the working example:

{% raw %}
```liquid
<script src="{{ '/js/consentio-loader.min.js' | relative_url }}" data-consentio-loader
        data-debug="false"
        data-config-url="{{ '/data/consentio-config.json' | relative_url }}"
        data-cookies-url="{{ '/data/consentio-cookies.json' | relative_url }}"></script>
```
{% endraw %}

### ⏱️ The order matters {#the-order-matters}

A tag manager reads consent **the moment it loads**. Anything that arrives afterwards is ignored — Google's
own wording is that if consent code is called out of order, consent defaults do not work.

So the loader pushes `consent default` synchronously, on its first pass, from the cookie. Before it
fetches the config. Before it injects `consentio.min.js`. Before the banner exists. That push needs no
config file at all, which is exactly what lets it happen with nothing fetched.

Everything else the loader does — injecting the bundle, fetching the two JSON files, constructing the
banner — is asynchronous and happens well after the tag manager has started.

### 🚫 Do not put `async` or `defer` on the loader tag {#do-not-put-async-or-defer-on-the-loader-tag}

`async` and `defer` tell the browser it may run the script later. Later is after the tag manager has read
consent, which puts you back exactly where you started: **a banner that gates nothing.**

The loader checks for both attributes and writes a warning to the console when it finds one:

```
[Consentio Loader] loaded with async or defer, so the consent default cannot arrive before the tag manager
```

That warning is printed regardless of `data-debug`. A banner that silently gates nothing is worth the noise.

### ⚖️ What it costs {#what-it-costs}

The loader is a blocking script in `<head>`. **4.3 KB (minified, before compression) has to download and
run before the page paints.** That is the price of the default arriving in time, and there is no version
of this that is both correct and non-blocking. Know it now rather than in a performance audit.

The main bundle, `consentio.min.js` (about 32 KB), is injected dynamically and does not block.

### ⚙️ The loader tag's `data-` attributes {#the-loader-tags-data-attributes}

These live on the tag because the loader needs them before it can fetch anything.

| Attribute | Required | Default | What it does |
|---|---|---|---|
| `data-consentio-loader` | **yes** | — | Marks the tag so the loader can find itself. Without it the loader logs `script not found` and stops. Use it on exactly one tag |
| `data-config-url` | no | none | URL of the config JSON. Omit it and the built-in defaults are used |
| `data-cookies-url` | no | none | URL of the cookies JSON. Omit it and the per-category cookie tables are empty |
| `data-cookie-name` | no | `consentio` | Name of the consent cookie the loader reads |
| `data-version` | no | `1` | Consent version the loader accepts. See [Versioning stored consent](#versioning-stored-consent) |
| `data-debug` | no | `false` | `"true"` turns on the loader's informational logging. Errors and the async/defer warning are always logged |
| `data-wait-for-update` | no | `500` | Milliseconds passed as `wait_for_update` in the `consent default` push. Only sent to a visitor with no stored answer |

**The tag wins over the config JSON for these two.** The loader resolves `data-cookie-name` and
`data-version`, publishes them on `window.ConsentioDefault`, and the banner takes them back — so
`cookieName` and `version` in the config JSON are the fallback for the tag manager route, which never runs
the loader. Setting them differently in the two places is no longer a way to make the loader and the banner
read different cookies.

### 🔍 What the loader leaves behind {#what-the-loader-leaves-behind}

| Global | What it is |
|---|---|
| `window.ConsentioDefault` | `{ cookieName, version, consents, consentGiven }` — what the default push was built from. `consentGiven` is `false` when there was no stored answer |
| `window.ConsentioInstance` | The constructed banner. The loader refuses to run twice while this is set |
| `window.Consentio` | The constructor, once `consentio.min.js` has loaded |

---

## 🏷️ Route 2 — Google Tag Manager custom template {#route-2-google-tag-manager-custom-template}

Read [the catch](#the-tag-manager-routes-catch-in-the-open) again before taking this route.

1. Add the Consentio custom template to the container from the community gallery.
2. Create a tag from it and put it on the built-in **Consent Initialization - All Pages** trigger. Not
   *All Pages* — *Consent Initialization*. The tag manager guarantees that trigger runs before every other
   trigger in the container, which is the only reason the default is early enough.
3. Fill in the template's fields: cookie name, version, category copy, cookie table rows.
4. Publish, and move any remaining hand-pasted tags on the site into the container.

**The template does not use the loader and does not fetch the JSON files.** It does two things, in order:

1. Sets the consent default itself, in sandboxed template code, through the tag manager's own consent API —
   reading the same cookie, by the same rules, implemented a second time by hand.
2. Calls `injectScript` for `consentio.min.js`, pinned to a release tag, then calls
   `Consentio.Create(config, cookies)` with the values from its fields.

`injectScript` is **always** asynchronous, which is why step 1 cannot be delegated to the injected bundle —
by the time that bundle runs, the tag manager has already read consent.

```js
// The template's entry point into the bundle. `config` is a ConsentioOptions object and
// `cookies` an array of cookie descriptors — the same shapes the two JSON files hold.
Consentio.Create(config, cookies);
```

`Create` does not record the instance on `window` itself, so a template must set
`window.ConsentioInstance` after calling it if it wants the double-initialisation guard to work.

### 🍪 The cookie is the contract between the two routes {#the-cookie-is-the-contract-between-the-two-routes}

The template implements the cookie reader a second time, in a different language, in a different
repository. **Its name, its `version` field, its JSON shape and what "no stored answer" means are a
contract.** Disagree on any of it and a returning visitor is asked again, or is treated as having consented
when they have not. The [cookie contract](#the-cookie-contract) below is the specification; implement
against that, not against a guess.

---

## 📡 What reaches the dataLayer {#what-reaches-the-datalayer}

Consentio pushes in the `gtag` shape — an `arguments` object, not an array.

**On first pass (the loader, or the template's sandboxed code):**

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500          // present only when there is no stored answer
});
gtag('set', 'ads_data_redaction', true);   // true whenever ad_storage is denied
```

**When the visitor saves settings or accepts all:**

```js
gtag('consent', 'update', { /* all seven signals, again */ });
gtag('set', 'ads_data_redaction', false);
```

Two rules that are not optional:

- **All seven signals are named on every push.** A signal left out of an update keeps its previous value,
  which is how a category that was granted and then revoked stays granted.
- **`wait_for_update` is only sent to a first-time visitor.** A returning visitor already has a real answer;
  making tags wait for a banner that will not appear only delays them.

### 🔀 Categories map to signals {#categories-map-to-signals}

| Consent category | Google signals |
|---|---|
| `strictly_necessary` | `security_storage` |
| `preferences_functionality` | `functionality_storage`, `personalization_storage` |
| `statistics_performance` | `analytics_storage` |
| `marketing_advertising` | `ad_storage`, `ad_user_data`, `ad_personalization` |

**This mapping is fixed and a site cannot change it.** It is what lets the loader push a correct
`consent default` before it has read any config at all.

**Deny wins.** A signal is granted only when *every* category routed to it is granted. A signal nothing is
routed to stays denied.

---

## ⚙️ Configuration {#configuration}

The config JSON at `data-config-url` is a partial — supply only what you want to change. `texts` merges key
by key over the defaults, and `consents` merges entry by entry, matched on `key`.

### 🔧 Top level {#top-level}

| Key | Type | Default | What it does |
|---|---|---|---|
| `cookieName` | string | `consentio` | Name of the consent cookie. **Ignored when the loader ran** — `data-cookie-name` wins. This is the value the tag manager route uses |
| `debug` | boolean | `false` | Turns on the banner's informational logging |
| `version` | number | `1` | Consent version. **Ignored when the loader ran** — `data-version` wins. See [Versioning stored consent](#versioning-stored-consent) |
| `consentRequired` | boolean | `false` | Shows a full-screen blocking overlay behind the bar and modal until the visitor answers |
| `texts` | object | see below | Every string in the UI |
| `consents` | array | the four categories | Copy changes to the four. The set is fixed |

### 💬 `texts` {#texts}

| Key | Default |
|---|---|
| `barTitle` | `Cookie Policy` |
| `barDescription` | `This site uses cookies to enhance your experience…` |
| `buttonSettings` | `Settings` |
| `buttonSave` | `Save` |
| `buttonCancel` | `Cancel` |
| `buttonAcceptAll` | `Accept All` |
| `modalTitle` | `Cookie Settings` |
| `modalDescription` | A paragraph on GDPR and the ePrivacy directive |
| `alwaysOnLabel` | `Always On` |
| `cookieTableHeaderName` | `Cookie Name` |
| `cookieTableHeaderPurpose` | `Cookie Purpose` |
| `cookieTableHeaderProvenance` | `Provenance` |
| `cookieTableHeaderDuration` | `Duration` |

### 📋 `consents` {#consents}

Each entry describes one category and one row in the settings modal.

| Key | Type | What it does |
|---|---|---|
| `key` | string | Which of the four categories the entry changes. It is also the cookie's JSON key and the value the cookies JSON matches on. **Required in every entry** |
| `title` | string | Heading in the modal |
| `description` | string | Body text under the heading |
| `alwaysOn` | boolean | `true` replaces the switch with the `alwaysOnLabel` text and forces the category granted |
| `defaultState` | `"granted"` \| `"denied"` | What the switch shows to a visitor with no stored answer |

**The four categories are fixed. You can change every string, not the set.** An entry whose `key` is not one
of the four is ignored, with a warning on the console, and the banner still runs. You cannot add a category,
remove one, or re-point one at a different Google signal — the loader has to push the consent default before
it can read any config, so the set has to be one it already knows.

The four categories are `strictly_necessary` (`alwaysOn: true`, `defaultState: "granted"`),
`preferences_functionality`, `statistics_performance` and `marketing_advertising` (all `alwaysOn: false`,
`defaultState: "denied"`).

**Overriding a built-in category:** give its `key` and only the fields you are changing.

```json
{
  "consentRequired": true,
  "texts": { "barTitle": "Cookies on this site" },
  "consents": [
    { "key": "marketing_advertising", "title": "Advertising" }
  ]
}
```

### 🍪 The cookies JSON {#the-cookies-json}

The file at `data-cookies-url` is a flat array. Each entry is one row of the table shown inside a category,
matched by `category` against a consent `key`. An entry whose `category` matches nothing is never shown.

```json
[
  {
    "name": "session_id",
    "purpose": "Maintains user session",
    "provenance": "First-party",
    "duration": "Session",
    "category": "strictly_necessary"
  },
  {
    "name": "analytics_id",
    "purpose": "Collects anonymous site usage data",
    "provenance": "Third-party",
    "duration": "1 Year",
    "category": "statistics_performance"
  }
]
```

All five fields are strings and all five are shown verbatim. `duration` and `provenance` are free text —
nothing parses them.

---

## 🍪 The cookie contract {#the-cookie-contract}

Two pieces of code in two repositories and two languages read this cookie: Consentio itself, and the tag
manager template's sandboxed reader. Anything here that changes is a breaking change for the template.

**Name.** `consentio` by default. Override it with `data-cookie-name` on the loader tag and `cookieName` in
the config; the template has its own field.

**Value.** One JSON object, URI-encoded on the way in and out. Two keys: `version`, and `consents` holding
one key per category.

```json
{"version":1,"consents":{"strictly_necessary":"granted","preferences_functionality":"denied","statistics_performance":"denied","marketing_advertising":"denied"}}
```

Every consent value is the string `granted` or `denied` — never a boolean, never absent.

**The categories are nested rather than sitting beside `version`** so that no category key can collide with
it. A reader that expects them flat will find no `consents` and must treat that as no stored answer.

**Attributes.** `path=/`, `expires` 90 days from the write, `SameSite=Lax`, and `Secure` **over `https`
only**.

Over plain `http` the cookie is written without `Secure`, so a choice persists on `http://localhost` and
local development behaves like the deployed site.

### 📖 Reading it — five rules, in order {#reading-it-four-rules-in-order}

1. **No cookie at all** → no stored answer.
2. **The value does not parse as JSON** → no stored answer.
3. **`version` does not equal the configured version** → no stored answer. Not "partially valid", not
   "merge what is there". **The whole stored value is discarded** and the banner shows again.
4. **There is no `consents` object** → no stored answer. This is also what an older, flat value reads as.
5. **Otherwise**, `consents` is the answer.

### ❗ "No stored answer" is not "everything denied" {#no-stored-answer-is-not-everything-denied}

This is the single easiest thing to get wrong, and getting it wrong makes the two routes disagree.

When there is no stored answer, the fallback is **one key**:

```json
{"strictly_necessary":"granted"}
```

Nothing else. Fed through the category-to-signal mapping — where a signal is granted only when every
category routed to it is granted, and a signal nothing is routed to stays denied — that yields
`security_storage` granted and the other six denied.

**A reader that instead falls back to four categories all denied produces the same six denials but denies
`security_storage`.** Same-looking code, different answer, and the direct route and the tag manager route
now disagree about the visitor.

---

## 🔢 Versioning stored consent {#versioning-stored-consent}

`config.version` (and `data-version` on the loader tag) is the version stamped into the cookie and checked
on every read. **Bumping it discards every visitor's stored answer** — rule 3 above — and shows them the
banner again from scratch. There is no migration and no merge.

**You will not hit this by adding a category, because you cannot add one.** The four are fixed. Only
Consentio itself can change the set, and doing so is a breaking change that comes with a version bump.

What you will hit it with is your own `config.version`. Raise it when a change to the categories' meaning
makes an old answer no longer the answer to the question you are now asking. Leave it alone otherwise —
every bump costs every returning visitor their choice.

---

## 📣 Events {#events}

Consentio dispatches two `CustomEvent`s. Both bubble and cross the shadow boundary, so listen on `document`.
Both carry the full consent record as `detail`.

| Event | When | `detail` |
|---|---|---|
| `consentio:initialized` | Once, when the banner is inserted into the page | The consent state it started with — stored answer, or the per-category `defaultState` |
| `consentio:consent-update` | Every time the visitor accepts all or saves settings | The new consent state |

```js
document.addEventListener('consentio:consent-update', (event) => {
  // { strictly_necessary: 'granted', statistics_performance: 'denied', ... }
  console.log(event.detail);
});
```

`consentio:initialized` fires during insertion, so register for it before the banner is built — a listener
added afterwards will not see it. `consentio:consent-update` is the one to act on.

There are no callback options and no other public events. The Google Consent Mode pushes described above
happen on their own; you do not need to listen for these events to make consent work.

---

## 🏁 Release note {#release-note}

Moving the consent default into the loader is a **breaking change** — the loader tag has to stop being
`async` — and the version needs to go to **0.1.0**. It is a two-repository release, because the tag manager
template pins the version in its CDN URL and reimplements the cookie contract by hand. Both have to move
together.

## 📄 Licence {#licence}

Apache-2.0. No runtime dependencies.
