# Changelog

All notable changes to Consentio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Consentio follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

**A release reads its notes from this file.** The section for the version being released is published as the
release body, so write these entries for the people using Consentio, not for the people writing it.

**Version headings carry no icon** - the release workflow parses them.

## [Unreleased]

## [1.0.0]

### ✨ Added

- **An embed waits for the visitor's answer too.** An `<iframe>` with `data-consentio` naming its category
  and its address on `data-src` instead of `src` loads nothing until that category is granted; then the
  address moves to `src` and it loads in place. The same rule as a held script: nothing marked loads before
  there is an answer, and revoking does not unload it. The **Hold a script until consent** page has the
  tag before and after.
- **`url_passthrough`, if you ask for it.** Google's third flag beside `wait_for_update` and
  `ads_data_redaction`: with ad storage denied it carries the ad-click id across your own links in the URL,
  so a Google Ads click still counts for a visitor who refused. Off unless you turn it on —
  `data-url-passthrough="true"` on the loader tag, or `"urlPassthrough": true` in the settings file on the
  Tag Manager route — because it puts a click id in every internal link. The settings builder has the
  switch, and the template asks for one more write permission, `url_passthrough`.
- **The documentation site builds your files.** [The settings file](https://chrismavrommatis.github.io/consentio/configuration/#build-the-file)
  page has a control per key and hands back `consentio-settings.json` with only what you changed; the
  [cookie catalogue](https://chrismavrommatis.github.io/consentio/cookies/catalogue/) has a tick box per
  row and hands back `consentio-cookies.json` from the ones you ticked. Each also copies as a Custom
  JavaScript variable for the Tag Manager route, in the same shape as the language packs to paste.
- **Anything you copy from the site opens in one panel.** The published language packs are a list on
  [the language pack](https://chrismavrommatis.github.io/consentio/language/) page and on the
  [packs to paste](https://chrismavrommatis.github.io/consentio/language/tag-manager/) page — open one and
  the panel shows it as the file or as the Tag Manager variable, with a copy control. The two builders and
  the catalogue's rows use the same panel. Code blocks on the site are now only for reference.

### 🗑️ Removed

- **The older single settings file.** `data-config-url` is no longer read, and a file carrying `texts` or a
  `consents` array is no longer taken apart. Split it into a settings file and a language pack — the
  configuration page says how — and put `data-settings-url` and `data-language-url` on the loader tag.
- **The `Consentio Tag - Cookies` variable template.** `consentio-tag-cookies.tpl` is not attached to
  releases any more. A container still holding one keeps working, but the **Cookie table** picker below is
  the way now.
- **Every settings field on the tag** — Version, Debug, Consent Required, the three Default States, Privacy
  Policy URL, Hide Floating Button, Cookie Lifetime, Share the answer across subdomains — and the ***Custom -
  fill in the fields below*** text source with its twenty-three text boxes. The tag takes the settings file
  and the language pack whole instead, below. A container holding an older template keeps working as it did
  until the newer file is imported; then paste the two files into Constants and pick them.
- **The two-argument `Consentio.Create(config, cookies)` call.** `Create` takes three objects — settings,
  language, cookie table — and nothing else.

### 🔀 Changed

- **The tag is three pickers — Settings, Language, Cookie table — and each takes the same JSON file the
  HTML route fetches.** Paste the file's text into a Constant, or return it from any variable, and pick it.
  Left at *None*, the banner uses its defaults, its built-in English, or shows no table; the tag reads
  nothing off the page. A new banner setting now ships with the banner; the template does not change for
  it.
- **On the tag, `version` comes from the settings file** and `cookieName` in it is ignored — the template
  can only read the cookie it named when it was published, `consentio`, and says so on the console when the
  file names another. A site running both routes keeps the file's `version` equal to the loader tag's
  `data-version`.
- **The tag calls the banner with three objects**, the same ones the loader sends, instead of composing the
  older merged config. A released template loads the release it shipped in, so it speaks that release's
  shape.

### 🛠️ Fixed

- **The round reopen button has a name.** It was an icon and nothing else, so a screen reader announced
  "button". It now carries the same word as the bar's settings button, in whichever language the pack
  gives it.
- **A cookie table that does not load no longer stops the banner.** On the HTML route a 404 on
  `data-cookies-url` used to leave the visitor with no banner at all. The banner now starts with empty
  tables and the console names the address, the same as the Tag Manager route already did. A settings
  file that does not load still stops it.
- **A release starts from an empty `dist/`.** A file a release stopped producing used to stay in the tree
  and be served at every later tag; `consentio-tag-cookies.tpl` is the one that was.
- **The Tag Manager route no longer throws with debug on.** The tag called the banner with the older
  two-argument shape, and the banner took its own empty cookie list for the console. The first debug line
  after saving was `this.logger?.info is not a function`. The HTML route was never affected. Gone by
  construction now that the two-argument shape is.

## [0.3.0] - 2026-09-11

### ✨ Added

- **A script you mark waits for the visitor's answer.** A script pasted into the page — a chat widget, an
  embed, a pixel from a vendor's instructions — used to run on every page load whatever the visitor said,
  because it never reads what Consentio tells Google. Give it `type="text/plain"` and the category it
  needs, and it runs once that category is granted and not before:

  ```html
  <script type="text/plain" data-consentio="statistics_performance"
          src="https://vendor.example/analytics.js"></script>
  ```

  It runs the moment the visitor accepts or saves with that category on, and on a later visit as the banner
  is set up. Nothing marked runs before there is an answer — a default state is not consent — so a script
  that needs no consent is not marked. **Revoking does not un-run a script**: one that has run has run,
  and taking the category away stops it on the next page load. A script you do not mark runs as it always
  did; Consentio looks only at tags carrying both attributes. The **Hold a script until consent** page of
  the documentation has what it reaches and what it cannot.

- **The Tag Manager tag can load a published language pack for you.** *Text source* has a fourth value,
  *A published language pack*: pick a language and the tag loads that pack from the CDN at the same version
  as the banner, before the banner, so the words move with each release and nothing is pasted. If the pack
  does not load, the tag says so on the console and the banner keeps its built-in English. *Built-in
  English*, *Custom* and *From a variable* are unchanged, and *Built-in English* is still the default.

- **`data-language="el"` on the script tag.** A shorthand for `data-language-url` pointing at the published
  pack on the CDN, at the same version as the script, so a site running a pack unedited hosts no language
  file. `data-language-url` wins when both are set, and the console says so.

  ```html
  <script src="/js/consentio-loader.min.js" data-consentio-loader data-language="el"></script>
  ```

- **A language pack to paste into Tag Manager.** For *Text source* set to *From a variable*, the
  **Use Google Tag Manager** page of the documentation shows each published pack as a Custom JavaScript
  variable with a copy control — the `function () { return ...; }` Tag Manager expects, ready to paste and
  edit in place. The same files, `en.gtm.js` and `el.gtm.js`, are attached to the release beside `en.json`
  and `el.json`, and so are `en.js` and `el.js`, the form the tag loads.

- **A cookie catalogue to copy from.** The cookie table was the one thing every site had to write from
  the vendors' documentation. The **Cookie catalogue** page of the documentation has rows for the tools a
  site commonly runs — Google Analytics, Google Ads, Meta Pixel, Hotjar, YouTube and Vimeo embeds,
  LinkedIn, TikTok, HubSpot, Cloudflare, and Consentio's own cookie — each block already in the shape of
  `consentio-cookies.json` and the Cookies variable, with a copy control, the vendor page it was read from
  and the day it was read. **Check every row against the vendor before you ship it**; the category is
  Consentio's opinion, and no block lists every cookie a tool can set.

- **A page that puts the two install routes side by side.** **Choose a route** in the documentation has one
  table — what each route can stop, what it costs, where the words and settings come from — and the one
  thing that decides between them: if anything on your site sets a cookie from outside the container, the
  Tag Manager route does not cover it.

- **The two `.LICENSE.txt` files are attached to the release.** Each minified bundle points at one, so a
  bundle downloaded on its own used to name a file that was not there.

### 🔀 Changed

- **A language file that does not load no longer stops the banner.** On the HTML route any file that
  failed to fetch — settings, language or cookies — used to end with `Initialization failed` on the console
  and no banner. A language file that fails now costs only the language: the banner appears in its built-in
  English and one warning names the file. A settings or cookies file that fails still stops the banner.

- **The Tag Manager tag stands down when Consentio's script tag is on the page.** A page carrying both
  routes used to get two banners that did not know about each other. The tag now checks for the script
  tag's mark on the page before it does anything, prints one line on the console, and does nothing else.
  A template imported from an earlier release does not; re-import it from this one.

### ⚠️ Deprecated

- **`data-config-url` goes in 1.0.0.** The single settings file from `0.1.0` — behaviour, `texts` and a
  `consents` array in one — is still read and still taken apart for you, and the console now says once that
  the attribute is deprecated. Move to `data-settings-url` and `data-language-url` before `1.0.0`; the
  **Settings** page shows the three files.

### 🛠️ Fixed

- **The Tag Manager template loads the release it ships with.** The `consentio-tag.tpl` attached to `0.2.0`
  pins `0.1.0`'s banner, so on that route every feature the `0.2.0` notes announce is missing, and the
  template hands its new fields to a bundle that does not know them. The pin is now filled in at build time
  from the version being released, so the two cannot drift again. **If you imported the template from
  `0.2.0`, re-import it from this release.**

## [0.2.0] - 2026-09-10

### ✨ Added

- **The stored answer now carries the date it was given.** A new `date` key sits beside `version` and
  `consents` in the cookie, in UTC, and is rewritten each time the visitor answers.

  **Nobody is asked to answer again by this release.** A cookie written before today has no date, and it is
  still a valid answer — Consentio reads `version` and `consents` and ignores everything else, on both
  routes. **Do not raise your `version` because of this entry**: that would throw away every stored answer
  and ask every visitor again, for nothing.

  Nothing reads the date yet. It is stored now because the only way to put one on a cookie that already
  exists is to throw the cookie away.

- **How long an answer lasts is yours to set.** It was 90 days, chosen by nobody and changeable by no one.
  It is still 90 days if you say nothing, and `cookieLifetime` is a number of days:

  ```json
  { "cookieLifetime": 365 }
  ```

  On the tag it is `data-cookie-lifetime`; on the Tag Manager route it is the **Cookie Lifetime (days)**
  field.

- **One answer can cover your subdomains.** A visitor who answered on `www.example.com` used to be asked
  again on `shop.example.com`, and the two answers could disagree. Turn on `shareAcrossSubdomains` and there
  is one answer for all of them:

  ```json
  { "shareAcrossSubdomains": true }
  ```

  `data-share-across-subdomains="true"` on the tag, **Share the answer across subdomains** on the Tag Manager
  route.

  **There is no domain to type.** Consentio works out the one your hostnames share by asking the browser
  which it will accept, so `www.example.co.uk` gets `example.co.uk` and not the `co.uk` that taking the first
  label off would give — a domain the browser refuses is dropped **silently**, and that would leave nothing
  stored and the banner returning on every page load. On `localhost` or an IP address there is no shared
  domain to have, and the setting changes nothing.

  **Turning it off again removes the shared cookie.** Every write clears the answer at both scopes first, so
  two cookies of one name cannot pile up and be sent together.

  **Nobody is asked to answer again by this.** What is stored does not change — only where it is kept.

- **A Reject All button, beside Accept All on the first screen.** Refusing used to mean opening the
  settings, leaving three switches alone and pressing Save — three actions against one. It is now one, and
  it is the same size and the same style as accepting.

  Rejecting **stores an answer**: everything except the strictly necessary category is denied, the choice
  goes in the cookie, and the visitor is not asked again on the next page.

  **The bar's buttons are narrower than they were**, so three of them take the room two used to: on a wide
  screen they still sit beside the text rather than dropping below it. Under 600px all three stack at full
  width, the same size as each other.

- **Somewhere to link your privacy policy.** Set `policyUrl` and the address appears as a link on the bar
  and in the settings panel; leave it out and no link is shown. `texts.policyLinkLabel` is its wording, so
  it translates with the rest.

  ```json
  { "policyUrl": "/privacy/", "texts": { "policyLinkLabel": "Privacy Policy" } }
  ```

  On the tag manager route it is the **Privacy Policy URL** field, which sits outside *Text source* because
  a site using the built-in English still has a policy page. The address must start with `http://`,
  `https://` or a single `/` — anything else is dropped with a warning on the console rather than put into
  a link.

- **A way back into the settings from your own link.** `window.ConsentioInstance.openSettings()` opens the
  panel from anywhere on the page — a footer link, a line in your cookie policy. Guard on
  `window.ConsentioInstance`, because the banner is fetched in the background and a very early click can
  land before it exists.

  ```js
  if (window.ConsentioInstance) window.ConsentioInstance.openSettings();
  ```

  With that link in place you can drop the round button in the bottom right corner: set
  `"hideFloatingButton": true`, or tick **Hide Floating Button** on the tag. Consentio warns on the console
  when you do, because it cannot see whether your link is really there — and with the button hidden and no
  link of your own, a visitor has no way to change their answer.

- **Greek, and a way to ship any other language.** The banner's words now live in one file per language, and
  each is published as a json file you hand straight to `Consentio.Create`. `en.json` and `el.json` are
  attached to this release.

  ```js
  const language = await fetch('/data/el.json').then((r) => r.json());
  Consentio.Create({ consentRequired: true }, language, cookies);
  ```

  On the direct route you can point `data-language-url` at that file instead and fetch nothing yourself. On
  the tag manager route the same file goes into a variable and the tag's *Text source* is set to *From a
  variable*, which is how you switch wording by page language.

- **A translation is a file you own.** Nothing is fetched from us at run time, so a language cannot fail to
  load. To add one, copy `i18n/en.yaml`, translate the values, and run `npm test` — it refuses a file that
  is missing a key, carries one English does not have, or leaves a value blank.

- **Settings, words and cookies are three files, and each has its own attribute on the tag.**
  `data-settings-url` is how the banner behaves, `data-language-url` is every word the visitor reads, and
  `data-cookies-url` is the cookie table it already was. `Consentio.Create(settings, language, cookies)`
  takes the same three.

  ```html
  <script src="/js/consentio-loader.min.js"
          data-consentio-loader
          data-settings-url="/data/consentio-settings.json"
          data-language-url="/data/el.json"
          data-cookies-url="/data/consentio-cookies.json"></script>
  ```

  **Words and behaviour change on different days, usually by different people.** Splitting them means a
  translator can be handed one file that contains nothing else, and it means a published language pack is
  the language file — no editing, no reshaping. The **Settings** page of the documentation has every key in
  all three.

### 🔀 Changed

- **A published language pack works as a Tag Manager variable, unedited.** It never did: the pack put the
  words under `texts` and the categories under `consents`, and the tag looked for the strings flat with the
  categories beside them, found nothing, and quietly showed English. A site that supplied a complete Greek
  translation got an English banner and nothing on the console. **Set *Text source* to *From a variable*,
  point it at a pack, and re-publish.** The field is now called **Language pack variable**, which is what it
  always took.

- **The settings file has no `texts` and no `consents` array; the language file has the words.** Your old
  single file is still read — `data-config-url` still works, and a file carrying `texts` or a `consents`
  array is taken apart for you — so **nothing has to change today**. New sites should write the three files
  instead.

  **`alwaysOn` is gone from the settings surface.** Only `strictly_necessary` was ever always on and only
  it ever can be, so it is decided by the category key rather than by a field you could set. If you were
  setting `alwaysOn` on some other category it was already being ignored everywhere it mattered; it is now
  ignored on the way in.

- **A language can name its own privacy policy address.** `policyUrl` in a language file wins over the one
  in the settings, because a Greek site links a Greek policy page. A blank one means this language has no
  link; leaving the key out is what falls back to the settings.

- **The tag manager templates are downloaded and imported by hand.** Both are attached to this release as
  `consentio-tag.tpl` and `consentio-tag-cookies.tpl`. In Tag Manager go to **Templates → New**, open the
  **⋮** menu, choose **Import**, pick the file and save.

  **Neither is listed anywhere, and nothing tells you when a newer one exists.** What you import is what
  your container runs until you import a newer file — including the Consentio version its CDN URL pins. If
  you already run one of these templates, re-import it to pick up this release.

- **The banner's built-in English says something different, and a site keeping the defaults will see it.**
  The bar used to read "We are assuming that you are okay with that", which was the opposite of what the
  code does — with no stored answer everything but the strictly necessary category is denied. The settings
  panel used to end by telling the reader to follow a link that was never rendered. Both are rewritten, and
  the Greek moved with them.

  **Nothing needs doing.** If you supply your own `texts`, or filled in the tag's custom fields, your
  wording is untouched. If you kept the defaults, the new words appear when you update — and on the tag
  manager route, the pre-filled fields carry them the next time you import the template.

- **The banner's English has one source**, and the tag's pre-filled text fields are built from it. The words
  in those fields are now exactly the words the banner falls back to, so the two cannot drift apart.

- Your stored answer and the cookie are unchanged. **Nobody is asked again by this release.** The settings
  files were reorganised, not the value in the cookie: it is still
  `{"version":1,"consents":{...}}`, read by exactly the same rules on both routes. There is no reason to
  raise `version`, and raising it would ask every visitor again for nothing.

### 🛠️ Fixed

- **A settings file that names `cookieName` or `version` now says so on the console instead of being
  ignored in silence.** On the HTML route the script tag decides both, because it reads the cookie in
  `<head>` before your settings file has been fetched — and it always has. The documentation said they were
  ignored only when the matching attribute was also on the tag, which was wrong. Put either in a settings
  file and Consentio names the attribute to set instead. A file that names neither, or that names the same
  value the tag already resolved, is left alone.

- **A quote in your own wording can no longer break out of the markup it is placed in.** Text substituted
  into the banner's templates escaped `&`, `<` and `>` but not `"` or `'`. Nothing shipped could reach a
  spot where it mattered — every one of them is a category key, and those are fixed — but a title or a
  button label with an apostrophe in it was one template edit away from being a hole. Both quotes are
  escaped now.

## [0.1.0] - 2026-08-25

### 🔀 Changed

- The consent default is now pushed by the loader, before the tag manager starts, instead of by the banner
  after two fetches and a DOM insert. A tag manager reads consent when it loads, so the old order meant the
  banner gated nothing.
- The loader reads `data-debug`, `data-config-url` and `data-cookies-url` from its own script tag. The
  bundle published at `0.0.4` read three different names and so ignored every one of them.
- The source is TypeScript and has a test suite. The published files are unchanged in shape: the same UMD
  bundle, the same loader, at the same paths under `dist/`.
- **Tag Manager route:** the template now sets the consent default itself, read from the cookie, before it
  loads the banner. It used to set none at all, so on that route the container had already read consent by
  the time the banner arrived. **Install the new version of the template alongside this release.**
- **Tag Manager route:** the banner's wording is now chosen with one *Text source* field - built-in English,
  your own text in fields that arrive already filled in, or any Tag Manager variable. The separate
  *Consentio Tag - Texts* variable template is gone; its strings are on the tag.
- Your stored answer is now kept as `{"version":1,"consents":{...}}` rather than with the categories beside
  the version. **Everyone who has already answered is asked once more**, because a value in the old shape
  reads as no answer.

### 🛠️ Fixed

- `Consentio.version` is taken from `package.json` at build time. It was written by hand in a second place
  and could disagree with the release it shipped in.

## [0.0.4] - 2025-11-04

No changelog was kept before this file existed. `0.0.1` to `0.0.4` are on the repository as tags, and
`0.0.4` is what the tag manager template pinned at the time.

**The files published at `0.0.4` are not what its source builds.** The loader in that tag ignores its own
configuration. Use the next release instead.
