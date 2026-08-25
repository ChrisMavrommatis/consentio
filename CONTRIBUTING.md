# Contributing

Thanks for looking. This page is everything you need to build Consentio, test it, and open a change that
can be merged without a round trip.

## 🛠️ Build it

**Node 24 or newer.** `.nvmrc` pins it and every workflow runs it. The floor is real, not a preference:
the test harness runs TypeScript through Node's built-in type stripping, which older versions do not have.

```bash
nvm use          # or install Node 24 however you like
npm install
npm run typecheck     # tsc --noEmit
npm run build         # the four bundles, into build/lib/
```

`npm run build` is the one you want. The other build scripts write somewhere specific:

| Command | Writes to | For |
|---|---|---|
| `npm run build` | `build/lib/` | ordinary local work. Gitignored |
| `npm run build:website` | `website/js/` | the documentation site's own copy. Gitignored |
| `npm run build:dist` | `dist/` | **the release workflow only.** See below |

To read the documentation site while you work on it:

```bash
npm run serve         # builds the JavaScript first, then serves on 127.0.0.1:4001
```

It needs Ruby and Jekyll — `bundle install` inside `website/`. It builds the JavaScript first on purpose:
`website/js/` is gitignored, so a fresh clone has none and Jekyll will happily serve a site whose loader
is a 404.

## 🧪 Test it

**Two commands, and a change has to pass both.**

```bash
npm test              # everything, on jsdom
npm run test:plain    # the cookie, saved-state and Google-signal tests again, with no jsdom at all
```

The second one is not a duplicate. Those tests need no page, and the second run is what keeps it that
way — they once acquired a DOM by accident through a shared helper and died without one for no reason. A
test that needs no page imports from `test/basics.mts`, never from `test/helpers.mts`, and gets added to
the `test:plain` glob in `package.json`.

**Some tests are marked `todo`, and the run still exits 0.** That is correct. They describe behaviour the
code does not have yet, and deleting the flag is how a fix proves itself. Do not delete a `todo` flag
without making its test pass. [`test/README.md`](test/README.md) explains the layout and why the files are
so small.

## 🚫 Never commit dist/

**`dist/` is the shipped product, not build output that happens to be checked in.** A CDN serves those
exact bytes out of the git tag, so whatever is in there is what every site running Consentio gets.

**Only the release workflow writes it.** A pull request must never contain a `dist/` change, and CI fails
one that does — it rebuilds `dist/` from your source and fails on any difference, and it separately fails
a commit that touched `dist/` and was not the release. `npm run build` cannot reach it; it writes to
`build/lib/`.

If you find a `dist/` diff in your working tree, that is a finding, not tidying. Leave it and say so in
the pull request.

## 🍪 Changing the cookie moves two things

The consent cookie is a contract with **two independent implementations**: `src/lib/consent-store.ts`, and
the sandboxed reader inside `gtm/consentio-tag/template.tpl`, which cannot import anything. Change the
cookie's name, its version field or its JSON shape in one and you have to change the other by hand.

Nothing fails loudly when they disagree — a returning visitor is simply asked again, or the two install
routes report different signals for the same person. [`gtm/contract.fixture.json`](gtm/contract.fixture.json)
holds worked values that both sides answer to, and a test fails when the template drifts from it. If you
touch the cookie, update the fixture in the same change.

## 📖 House style

- **Plain, short language** in code, comments and documentation. Cut any word that does not change the
  meaning. No sales register.
- **A comment carries the one thing that is not obvious from the line below it.** If a reader of that line
  would already know it, cut the comment.
- **Every section heading in a public markdown file opens with one emoji** — this page, `README.md`, the
  site, the template READMEs. Reuse an icon that already means that thing rather than inventing one.
- **Tabs, and a final newline.** `.editorconfig` has the rest.

## ✅ Before you open a pull request

- `npm run typecheck`, `npm test` and `npm run test:plain` all pass.
- `git status --porcelain dist/` is empty.
- No new runtime dependency. The shipped bundle has none and that is a feature.
- The version in `package.json` is untouched. Releases bump it, contributors do not.
- Add a line to the `Unreleased` section of [`CHANGELOG.md`](CHANGELOG.md) if the change is user-visible.
- Say what you checked by hand, if anything. A check nobody ran is reported as not run, never as passed.

**Open an issue first for anything large.** A change to the cookie, to the consent categories or to a
published template costs more than it looks like from here — the templates go through Google's gallery
review, which is neither instant nor ours.

## 📄 Licence

By contributing you agree your work is licensed under [Apache-2.0](LICENSE), the same as the rest.
