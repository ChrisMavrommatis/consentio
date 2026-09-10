# Changelog

All notable changes to Consentio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Consentio follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

**A release reads its notes from this file.** The section for the version being released is published as the
release body, so write these entries for the people using Consentio, not for the people writing it.

**Version headings carry no icon** - the release workflow parses them.

## [Unreleased]

## [0.2.0]

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
