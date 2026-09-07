# Changelog

All notable changes to Consentio are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and Consentio follows
[semantic versioning](https://semver.org/spec/v2.0.0.html).

**A release reads its notes from this file.** The section for the version being released is published as the
release body, so write these entries for the people using Consentio, not for the people writing it.

**Version headings carry no icon** - the release workflow parses them.

## [Unreleased]

### ✨ Added

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

- **The banner's English has one source**, and the tag's pre-filled text fields are built from it. The words
  in those fields are now exactly the words the banner falls back to, so the two cannot drift apart.

- Your stored answer, the cookie, and what the banner does are unchanged. **Nobody is asked again by this
  release.**

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
