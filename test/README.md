# test

`npm test` — runs on `node:test`, which is built into Node. jsdom is the only test dependency, and it is a
devDependency: the shipped bundle still has none.

## 📂 Layout

Test files mirror `src/`. A module with more than a handful of tests gets a folder named after it, and the
files inside are named for the category of behaviour they cover:

```text
src/lib/cookies.ts        ->  test/lib/cookies/{read-write,attributes}.plain.test.mts, secure-flag.test.mts
src/lib/logger.ts         ->  test/lib/logger.plain.test.mts    (few enough to stay one file)
src/elements/…            ->  test/elements/…
```

`mount.mts` files next to a folder's tests are shared fixtures, not test files.

Four folders do not mirror `src/`, because what they cover is not in `src/`:

- `test/scripts/` covers the release machinery — `scripts/changelog.mjs` and `.github/scripts/dist-guard.sh`
  — by running each against a throwaway file or repository. Both would otherwise only ever be exercised by a
  real release
- `test/gtm/` covers the tag manager template: that the sandboxed cookie reader still answers to
  `gtm/contract.fixture.json`, and that the template still composes from its parts
- `test/i18n/` covers the language files: that every translation carries exactly English's keys and no blanks
- `test/website/` covers the docs site's page scripts under `website/scripts/` - the readout, the catalogue
  panel, the copy buttons - against the markup the pages print, and the rule that a markdown page carries no
  JavaScript of its own

## 🧩 Why the files are so small

**node:test gives each test FILE its own process**, and the suite leans on that hard. The element classes
extend `HTMLElement` the moment their module loads, and a tag name is registered once per process -
`defineCustomElements` skips a name already taken, so a second `new Consentio()` keeps the first one's
classes. One scenario per file means each gets a pristine document, cookie jar and custom element
registry, and every failure means what it says instead of inheriting the last test's wreckage.

## 🧪 Two bootstraps

| Command | Runs on | Why |
|---|---|---|
| `npm test` | jsdom | everything |
| `npm run test:plain` | a forty-line stand-in — a cookie jar and a `dataLayer`, nothing else | the cookie, saved-state and Google-signal tests, again, with no browser at all |

Those tests do not need a page, and the second run is there to keep it that way. They used to need one by
accident: they imported `helpers.mts`, which loads `Consentio`, which loads the element classes, and those
extend `HTMLElement` the moment they load — so a test reading a cookie string died with
`HTMLElement is not defined`. **That is why `basics.mts` exists.** It holds the helpers that need no page and
imports nothing from `src/consentio.js` or `src/elements/`; `helpers.mts` holds the rest and re-exports it.

`test:plain` is not a second suite — every file in it also runs under `npm test`. It is a guard. A test that
reaches for a real page fails there instead of passing under jsdom and hiding the coupling.

**A test says which it is in its own name.** `*.plain.test.mts` runs under both commands; anything else runs
under `npm test` alone. There is no list in `package.json` to keep in step, so a page-free test cannot be
added and left out of the guard by forgetting one.

Two cookie tests stay on jsdom, and neither carries `.plain.`. `lib/cookies/secure-flag.test.mts` swaps the
page origin, which the stand-in cannot do, and `lib/consent-store/cookie-domain.test.mts` needs a jar that
refuses a domain the way a browser does — the shared cookie domain is found by offering candidates until one
is accepted, and a jar that keeps whatever it is given accepts the first one every time. It puts the page on
a different hostname per test, which the stand-in cannot do either.

## ⚙️ `resolve.mjs` and `register.mjs`

`resolve.mjs` is loaded by both bootstraps, before anything else. It does two jobs webpack does for the
bundle:

- **resolves a `./x.js` specifier to `x.ts`** (and `.mjs`/`.cjs` likewise), the way `resolve.extensionAlias`
  does in `webpack.config.js`, so the tests run the real sources rather than a build artifact — no build
  step, and stack traces point at `.ts` files
- **turns `.html` into its own text and `.scss` into an empty string**, which is what `html-loader` and
  `asset/source` hand the bundle. No test asserts on styling
- **parses `.yaml` into an object**, which is what the `json`-type rule hands the bundle. This is how
  `i18n/en.yaml` reaches `src/consentio.ts`
- **sets `__CONSENTIO_VERSION__`** from `package.json`, which is what `DefinePlugin` does for the bundle

`register.mjs` then installs a jsdom window on `globalThis`. That has to happen before any element module is
evaluated, because the classes extend `HTMLElement` at module scope.

Test files are `.mts`, not `.ts`, so Node reads them as ES modules without guessing. `package.json` has no
`"type": "module"` and must not gain one — `webpack.config.js` is CommonJS.

## ✅ Tests marked `todo`

**There are none left, since 10 Sep 2026.** The mechanism stays because it is how the next known-broken
behaviour gets recorded, and this section says what it is for.

The code was ported to TypeScript preserving every known defect, so a test describes what the code *should*
do and carries `{ todo: true }` where it does not yet. A failing `todo` does not fail the run, and node:test
reports one that unexpectedly passes.

**Every `todo` names a numbered issue in its title.** Fixing one means deleting its flag in the same diff,
which is the proof the fix landed. Never add one without a number - that is a defect nobody has written down.

`npm test` exits 0 either way. With the list empty, a `todo` turning up in a run is something new rather than
something owed.

## 🚧 Where the suite cannot reach

- **The cookie on plain http.** jsdom's cookie jar accepts a `secure` cookie over http instead of dropping
  it, so only the serialised attributes can be asserted. Check the real symptom by hand on
  `http://localhost`.
- **The ordering of the consent default.** It is about ordering relative to a third-party script, and Google
  reads consent at tag load. No unit test can observe that. `consentio-loader/` checks the properties that
  make the correct ordering *possible* — the push happens during module evaluation, before any fetch and
  before the bundle is injected — and the async bundle never pushes a default at all. **That is a proxy, and
  a weak one.** What would settle it: a real page with the loader as a blocking `<script>` above the tag
  manager snippet, a real container, and Tag Assistant showing the `consent default` arriving before the
  container loads. `website/_layouts/base.html` is wired for the first part; the rest has not been done.
- **The Google Tag Manager template route, entirely.** A custom template cannot inject a blocking script, so
  it has to set the default itself in the tag manager's sandbox and never runs `consentio-loader.js`. That
  code is `gtm/consentio-tag/src/sandbox.js` and only the tag manager can run it — `test/gtm/` checks it by
  reading, against [`gtm/contract.fixture.json`](../gtm/contract.fixture.json). The two routes must agree on
  the cookie name, version and shape or a returning visitor is asked twice.
- **`isHidden`** is `display === 'none' || offsetParent === null`, and jsdom does no layout, so
  `offsetParent` is null for every element. Only the inline-display half is observable; assertions set
  `display` explicitly.
