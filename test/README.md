# test

`npm test` — runs on `node:test`, which is built into Node. jsdom is the only test dependency, and it is a
devDependency: the shipped bundle still has none.

## 📂 Layout

Test files mirror `src/`. A module with more than a handful of tests gets a folder named after it, and the
files inside are named for the category of behaviour they cover:

```text
src/lib/cookies.ts        ->  test/lib/cookies/{read-write,attributes,secure-flag}.test.mts
src/lib/logger.ts         ->  test/lib/logger.test.mts          (few enough to stay one file)
src/elements/…            ->  test/elements/…
```

`mount.mts` files next to a folder's tests are shared fixtures, not test files.

`test/scripts/` is the exception: it covers the release machinery — `scripts/changelog.mjs` and
`.github/scripts/dist-guard.sh` — by running each against a throwaway file or repository. Both would
otherwise only ever be exercised by a real release.

## 🧩 Why the files are so small

**node:test gives each test FILE its own process**, and the suite leans on that hard. `defineCustomElements`
registers six tag names with no `customElements.get` guard, so a second `new Consentio()` in one process
throws. One scenario per file means each gets a pristine document, cookie jar and custom element registry,
and every failure means what it says instead of inheriting the last test's wreckage.

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

`cookies/secure-flag.test.mts` is the one cookie test that stays on jsdom: it swaps the page origin, which
the stand-in cannot do.

## ⚙️ `resolve.mjs` and `register.mjs`

`resolve.mjs` is loaded by both bootstraps, before anything else. It does two jobs webpack does for the
bundle:

- **resolves a `./x.js` specifier to `x.ts`** (and `.mjs`/`.cjs` likewise), the way `resolve.extensionAlias`
  does in `webpack.config.js`, so the tests run the real sources rather than a build artifact — no build
  step, and stack traces point at `.ts` files
- **turns `.html` into its own text and `.scss` into an empty string**, which is what `html-loader` and
  `asset/source` hand the bundle. No test asserts on styling

`register.mjs` then installs a jsdom window on `globalThis`. That has to happen before any element module is
evaluated, because the classes extend `HTMLElement` at module scope.

Test files are `.mts`, not `.ts`, so Node reads them as ES modules without guessing. `package.json` has no
`"type": "module"` and must not gain one — `webpack.config.js` is CommonJS.

## ✅ Tests marked `todo`

**The code under test is deliberately still broken.** It was ported to TypeScript preserving every known
defect, so the tests describe what the code *should* do and carry `{ todo: true }` where it does not yet. A
failing `todo` does not fail the run, and node:test reports one that unexpectedly passes.

**Every `todo` names a numbered issue in its title.** Fixing one means deleting its `todo` flag in the same
diff, which is the proof the fix landed.

`npm test` exiting 0 with todos listed is the correct state.

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
  container loads. `website/_layouts/page.html` is wired for the first part; the rest has not been done.
- **The Google Tag Manager template route, entirely.** A custom template cannot inject a blocking script, so
  it has to set the default itself in the tag manager's sandbox and never runs `consentio-loader.js`. That
  code does not exist yet, and when it does it will live in its own repository — see
  [`gtm/README.md`](../gtm/README.md). The two routes must agree on the cookie name, version and shape or a
  returning visitor is asked twice.
- **`isHidden`** is `display === 'none' || offsetParent === null`, and jsdom does no layout, so
  `offsetParent` is null for every element. Only the inline-display half is observable; assertions set
  `display` explicitly.
