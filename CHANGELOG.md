# Changelog

All notable changes to Consentio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Consentio follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

**A release reads its notes from this file.** The section for the version being released is published as the
release body, so write these entries for the people using Consentio, not for the people writing it.

**Version headings carry no icon** - the release workflow parses them.

## [Unreleased]

### ✨ Added

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

- **Greek, and a way to ship any other language.** The banner's words now live in one file per language, and
  each is published as a json file you hand straight to `Consentio.Create`. `en.json` and `el.json` are
  attached to this release.

  ```js
  const texts = await fetch('/i18n/el.json').then((r) => r.json());
  Consentio.Create({ ...texts, consentRequired: true }, cookies);
  ```

  On the tag manager route the same file goes into a variable and the tag's *Text source* is set to *From a
  variable*, which is how you switch wording by page language.

- **A translation is a file you own.** Nothing is fetched from us at run time, so a language cannot fail to
  load. To add one, copy `i18n/en.yaml`, translate the values, and run `npm test` — it refuses a file that
  is missing a key, carries one English does not have, or leaves a value blank.

### 🔀 Changed

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

- Your stored answer and the cookie are unchanged. **Nobody is asked again by this release.**

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
