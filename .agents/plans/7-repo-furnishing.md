---
description: The files a public repository is expected to have and this one does not - contribution, security, editor and dependency hygiene
state: done 26 Aug 2026, uncommitted
waits-on: nothing. Delete it once its work is committed
---

# 7 - furnish the repository

## What

The community and hygiene files that are missing, and two inconsistencies in what already exists.

## Why

**For a consent banner the missing one that actually costs something is `SECURITY.md`.** It is the file
someone checks before putting a third-party script in their `<head>`. Its absence is a reason to close the
tab, and it costs twenty lines.

The rest is ordinary furniture. None of it is urgent, which is why this plan waits on nothing and can fill
any spare sitting.

## Direction

**Missing at the root:**

- `SECURITY.md` - how to report a vulnerability, and what "supported" means for a project that ships from
  git tags rather than a package registry. Be honest that an old tag is never patched in place: the CDN
  serves those exact bytes forever, and the remedy is always a new tag.
- `CONTRIBUTING.md` - how to build, how to test (**both** commands - see
  [../memory/two-test-commands.md](../memory/two-test-commands.md)), and that `dist/` is written by CI only
  so a pull request must never contain one.
- `.nvmrc` and `.gitattributes`.
- `.github/ISSUE_TEMPLATE/`, `PULL_REQUEST_TEMPLATE.md`, `dependabot.yml`, `CODEOWNERS`.

`CHANGELOG.md` already exists at the root. Not this plan's.

**Every file this plan writes carries icon headings** - see
[../rules/icon-headings-in-public-docs.md](../rules/icon-headings-in-public-docs.md), which holds the set
already in use across `README.md`, `test/README.md`, `gtm/README.md` and the site. Reuse an icon rather than
inventing one.

**`src/` and `website/` have no `README.md`.** The root `README.md` carries a structure table with a row for
each, which is enough for `website/` - it is a Jekyll site and behaves like one. `src/` is the one worth a
page: the split between the loader and the banner, and why they cannot share a build, is not recoverable
from the filenames.

**Two inconsistencies to settle rather than paper over:**

- `package.json` says `"node": ">=22.15"`; `ci.yml` runs Node `24`. **Settled 25 Aug 2026: 24.** The floor
  exists because the test harness needs Node's built-in type stripping - see `test/register.mjs` - so this
  is a real bump. `package.json` already says `>=24` and every workflow already says `24`. **What is left
  here is `.nvmrc`, which does not exist.** Revisit the number only if 24 causes trouble.
- `config/` is already gone. Nothing to do.

**The contribution file is where the `dist/` rule has to be legible to an outsider.** A contributor has
never read `.agents/` and never will. State the rule in its own words:
[../rules/only-ci-builds-dist.md](../rules/only-ci-builds-dist.md) is for us, `CONTRIBUTING.md` is for them.
Do not point at `.agents/` from it.

## Do not

**Do not point at `.agents/` from any file this plan writes** - every one of them is public and written for
someone outside the project. **Do not add a dependency.** **Do not bump the version.** **Do not write
`dist/`.** **Do not commit, stage or push.**

## Deliverables

- [x] `SECURITY.md` exists and says plainly that a published tag is never patched in place.
- [x] `CONTRIBUTING.md` exists, names both test commands, and tells a contributor never to commit `dist/`.
- [x] `.nvmrc`, `.gitattributes`, issue and PR templates, `dependabot.yml` and `CODEOWNERS` exist.
- [x] The Node version agrees across `package.json`, `.nvmrc` and every workflow.
- [x] `src/README.md` exists and explains the loader/banner split.
- [x] Every heading in every file this plan wrote carries one icon.
      `grep -hE "^#{2,4} " <the new files> | grep -vP "^#{2,4} [^\x00-\x7F]"` returns nothing.
      `grep -rn "node-version" .github/` matches `.nvmrc` matches `engines`.
- [x] Nothing written here points into `.agents/`.
      `grep -rn "\.agents" CONTRIBUTING.md SECURITY.md .github/` returns nothing.
- [x] `git status --porcelain dist/` is empty.

---

## Done on 26 Aug 2026

Everything the plan asked for is written and every check above was run. **Nothing is committed** - the
maintainer commits, so this file goes once that has happened.

### What was written

| File | Note |
|---|---|
| `SECURITY.md` | private reporting through GitHub's advisory flow; the newest tag is the only supported one; an old tag is never patched in place; pin an exact version; what the script can reach; what is not a vulnerability |
| `CONTRIBUTING.md` | build, both test commands, why `test:plain` is not a duplicate, `todo` flags, never commit `dist/`, the cookie is implemented twice, house style, a pre-pull-request checklist |
| `src/README.md` | the two entry points, why the blocking one cannot be the banner, the three modules both bundles carry twice, the layout, `__CONSENTIO_VERSION__` |
| `.nvmrc` | `24` |
| `.gitattributes` | `eol=lf` - `dist/` is byte-compared by CI, so a CRLF checkin would fail a release for no reason - plus binary types, `linguist-generated` on `dist/`, and `*.tpl` read as JavaScript |
| `.github/CODEOWNERS` | one line |
| `.github/dependabot.yml` | npm grouped as one pull request, github-actions to keep the pinned SHAs and their version comments together, bundler for `website/` monthly |
| `.github/ISSUE_TEMPLATE/` | `config.yml` with blank issues off and a security contact link, `bug_report.yml`, `change_request.yml`. All three parse |
| `.github/PULL_REQUEST_TEMPLATE.md` | the three commands, the empty `dist/` check, and a list of what costs extra to touch |

`README.md` gained one paragraph pointing at the two new root files. The four YAML files were parsed rather
than eyeballed.

### One thing had to be fixed to make a deliverable pass

`.github/scripts/dist-guard.sh` pointed at a file under `.agents/` from a comment. Nothing outside `.agents/`
may do that and the deliverable's grep covers `.github/`, so the pointer is gone. The sentence it hung off
stands on its own.

**`webpack.config.js` has the same pointer and was left alone** - it is outside this plan's greps and
outside its scope. It is a one-line fix for whoever next opens the file.

### What was decided rather than copied

- **No supported-versions table in `SECURITY.md`.** The usual green-row-red-row table implies old versions
  get patches. Nothing here can patch one: a CDN serves the tree at the tag, so the only remedy is a new tag.
  Saying that plainly is more use than a table that lies.
- **The change-request form asks what the change would touch**, with the cookie, the four categories and a
  published template as tick boxes. It is the cheapest way to put the real cost in front of someone before
  they write the request.
- **`bundler` is in `dependabot.yml`** even though the site is not this plan's. `website/Gemfile.lock` is
  committed and Jekyll's dependency chain is the one nobody would otherwise look at.
