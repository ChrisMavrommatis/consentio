---
description: Rename docs/ to website/, split the two build outputs, and delete config/. Mechanical, wide, and had to land before the docs redesign
state: done - landed 24 Aug 2026, uncommitted
waits-on: nothing. It ran first, ahead of 1-guidance-truth-up
---

# 9 - the repository restructure

**Mechanical, wide, and worth its own sitting.** No behaviour changes. Nothing under `src/` moves.

> **Done, 24 Aug 2026 - landed uncommitted.** The maintainer took all three changes and moved this ahead of
> plan 1. Read `## Done on` at the bottom before this brief.

## What

Three changes, in descending order of how obviously right they are - read them as three separate yes/no
questions, not one.

**3. `config/` is deleted outright.** Both files - `config/README.md` is two lines, `config/tmux.sh` is a
personal tmux launcher. Neither is a repository concern. **This one is also in
[7-repo-furnishing](7-repo-furnishing.md); whichever runs first does it.**

**2. The two build outputs stop sharing a folder.** Jekyll writes to `website/_site/`, its own convention.
`build/` is left to the local library build that [2-release-pipeline](2-release-pipeline.md) introduces.

**1. `docs/` becomes `website/`.** The wide one. Everything below about cost is about this change.

## Why

**`website/` means the wrong thing.** Everywhere else in open source, `website/` holds documentation for people
working on the project. Here it is a deployed Jekyll site with its own `Gemfile`, its own `.ruby-version` and
its own build. That mismatch already costs a paragraph in [../README.md](../README.md) explaining that
`.agents/` has no `website/` layer because the name is taken - and that paragraph gets shorter the moment this
lands.

**`build/docs` and `build/lib` are unrelated things in one ignored folder.** One is a Jekyll site, one is a
webpack bundle. Sharing a parent buys nothing and means a single `rm -rf build` throws away both.

**It has to happen before the docs redesign.** [6-docs-site](6-docs-site.md) rewrites the site's structure
and styling. Do that first and every path in it is rewritten twice.

## Direction

**Use plain `mv`, never `git mv`.** `git mv` stages, and [../rules/never-commit.md](../rules/never-commit.md)
has no carve-out for it. The consequence to expect: `git status` will show the move as a pile of deletions
plus untracked files rather than as renames. **That is correct and must be left alone** - do not run
`git add -A` to make the diff read better.

**Run this before [2-release-pipeline](2-release-pipeline.md) if the order still allows it.** That plan adds
`npm run build:website` writing to `website/js/`. Land the rename first and it writes `website/js` once instead of
being written and then changed. If plan 2 has already landed, this session amends that table and its
`package.json` script instead - one word each.

**`website/_layouts/page.html` needs no edit.** Every URL in it goes through `relative_url` against the site
root, so the loader tag and the JSON paths survive the move untouched. Do not "fix" them.

**The one leak in `website/_config.yml` is not this session's.** Line 13 carries a commented-out URL for an
unrelated project; [1-guidance-truth-up](1-guidance-truth-up.md) removes it. If plan 1 has already run, the
line is gone and there is nothing to do.

## What does not move, and why

- **`src/lib`, `src/elements`, `src/templates`, `src/scss`** - already a clean split, and the port paid for
  it. Untouched.
- **`gtm/` stays at the repository root.** A `packages/` directory implies a workspace tool. There is one
  webpack config and no workspaces, so `packages/` with one real package adds a directory level and buys
  nothing.
- **No monorepo tooling.** [../design/delivery.md](../design/delivery.md) rules out a framework, a bundler
  change or a dependency, and it is right - a consent banner with no runtime dependencies is a feature. A
  workspace tool would become the largest dependency in the repository, added to manage four folders.
- **No `src/index.ts` barrel.** This ships as a script, not a package. A barrel exists for import ergonomics
  that do not apply.

## Do not

**Do not touch `dist/`.** Nothing in this session builds it - see
[../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md). If a `dist/` diff appears, something went
wrong. **Do not change any behaviour**, any Liquid, or any styling - that is plan 6. **Do not bump the
version. Do not commit, stage or push.**

## Deliverables

- [ ] `website/` is `website/`, moved with plain `mv`.
      `ls website/_config.yml` and `git status` shows the move unstaged.
- [ ] `config/` is gone, both files.
      `ls config` fails.
- [ ] Jekyll writes inside the site folder.
      `website/_config.yml` has `destination: ./_site`; `build/docs` is not recreated.
- [ ] The webpack docs target points at the new folder.
      `webpack.config.js:8` reads `website/js`, and the `--env build=` value is renamed to match.
- [ ] `.gitignore` covers the new paths.
      `/website/js/consentio*` and `/website/_site` are in it; the old `/docs/...` entries are gone.
- [ ] `package.json` scripts work from the new folder.
      `watch` uses the renamed env value, `serve` does `cd ./website`.
- [ ] **Every reference is updated.** The survey, done 24 Aug 2026:
      `README.md:11,58,77` - `test/README.md:80` - `webpack.config.js:8` - `package.json:10,11` -
      `.gitignore:3` - `.agents/README.md:15,23,26` - `.agents/memory/README.md:5` -
      `.agents/rules/{the-public-bar:28,one-fact-one-place:17,23,who-references-whom:15}` -
      `.agents/design/issues.md:22,106,133` - `.agents/plans/{1:41,89,99, 2:45, 4:22}` -
      `.agents/relaunch.md` - `.agents/relaunch-brief.md`.
      `grep -rn "website/" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist .` returns only
      hits that genuinely mean something else.
- [ ] The `.agents/README.md` paragraph about the `website/` name collision is shortened, not just repointed.
      It exists only because the name was taken. It is not any more.
- [ ] Nothing was rebuilt into `dist/`.
      `git diff --stat dist/` is empty.

## Done when

Everything above is ticked and all four of these are green from a clean tree:

```
npm run typecheck
npm test && npm run test:plain
npm run build:website                      # -> website/js
cd website && bundle exec jekyll build  # -> website/_site
```

The site renders at `npm run serve` with the banner on it, which is the one check that proves the webpack
output and the Jekyll output found each other after the move.

## Done on 24 Aug 2026

**Landed, uncommitted.** All three changes taken. Ran first, not after plan 1.

`docs/` is `website/`, moved with plain `mv`. `config/` deleted, both files. Jekyll writes to
`website/_site`; `build/docs` removed and `build/` is now empty, left to the local library build.

**Deviations:**

- **It ran before plan 1, not after.** So the commented-out foreign URL in `website/_config.yml:13` is still
  there - plan 1 owns it and now finds it at the new path.
- **The webpack env value is `website`, not `docs`**, and the script plan 2 will add is `build:website`.
  Renamed across plan 2, plan 6 and the dist rule so nothing names the old value.
- **`npm run build:website` does not exist yet** - plan 2 adds it. `npx webpack --env build=website` is what
  was used to verify, and `npm run watch` already uses the new value.

**Verified after the move:** `npm run typecheck` clean, `npm test` 200/160 pass/0 fail/40 todo, the webpack
website target writes `website/js`, `bundle exec jekyll build` writes `website/_site`, the built
`index.html` still loads `/js/consentio-loader.min.js`, and both new paths are gitignored. `dist/` was not
touched.

**One thing this did not fix, since fixed.** `package.json:4` described Consentio as offering "seamless tag
manager integration" - the register [../rules/plain-language.md](../rules/plain-language.md) bans. It was
flagged here and rewritten during plan 1.
