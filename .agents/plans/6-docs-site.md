---
description: Restructure and redesign the published documentation site, and make it buildable and deployable in one shot
state: ready
waits-on: 3 and 4, so it documents fixed behaviour rather than being written twice
---

# 6 - the docs site

## What

The Jekyll site under `website/`: a real build command, a real structure, a design pass, and a deploy workflow
that is written and proven but **left switched off** until the maintainer says publish.

## Why

The documentation is good and nobody can read it. Nothing publishes the site, and it cannot even be built in
one shot - `npm run watch` is watch-mode only, so producing the site's JavaScript means starting a watcher
and killing it. That blocks any deploy, which is why the one-shot `build:website` belongs to plan 2 and lands
before this one.

The content is also one long page. It is thorough - both routes, the full config reference, the cookie
contract, the events - and one page is still one page, icons or not.

## Direction

**Know what you are starting from, because it is less than it looks.**

- `website/_sass/_core.scss` is **three lines**. `website/css/main.scss` does nothing but import it.
- `remote_theme: just-the-docs/just-the-docs` in `_config.yml:15` is **dead config**. Neither `just-the-docs`
  nor `jekyll-remote-theme` is in the `Gemfile` or the lock, so the theme has never loaded. Jekyll ignores
  the key silently, which is why the site builds green and looks unstyled.
- All the visual weight comes from 228 KB of vendored beercss in `website/css/beercss/`.
- `website/_layouts/default.html` is eight lines.

**So there is nothing to preserve and no migration to do.** Decide whether beercss stays or goes on its
merits, not on inertia.

**Restructure before you design.** Split `website/pages/home.md` into pages that match how someone arrives:
choose a route, install route 1, install route 2, configuration reference, the cookie contract, events,
versioning. The route choice is a real decision and the current page already forces it well - keep that
framing, it is the best thing in there.

**The site demonstrates the product, so it has to demonstrate it correctly.**
`website/data/consentio-config.json` sets `consentRequired: true`, which is the hardest case: a full-screen
blocking overlay. After plan 4 that is a *good* demonstration rather than an embarrassing one. Keep it, and
put a live banner on the page deliberately rather than incidentally - with a control to clear the cookie and
show it again, or nobody sees it twice.

**`url` and `baseurl` are still undecided, as of 25 Aug 2026.** Plan 1 set them to the GitHub project-pages
defaults - `https://chrismavrommatis.github.io` with `baseurl: "/consentio"` - to stop the missing `url`
breaking absolute links and any sitemap. A custom domain is likely but not chosen. **So do not hard-code the
address anywhere except `_config.yml`**: no absolute URL in a layout, a page, or the deploy workflow. Then
the change is one file when the domain is settled, and this plan does not have to be run twice.

**This site is also the test ground for plans 5 and 8.** Their by-hand checks need a live page carrying both
install routes and a tag manager container - the six in plan 8, and the two-routes-one-visitor check that
nothing automated reaches. That raises the bar on this plan: the live banner is not a demo, it is the
fixture. Both routes have to be reachable on it, and the cookie has to be clearable from the page.

**The deploy workflow.** Write it, prove it builds and uploads an artifact, and **leave the publish step
disabled.** Say plainly in chat what that leaves unproven. Note that GitHub Pages building `website/` itself
would not work - `jekyll-tidy` is not on the Pages plugin allowlist and `_config.yml` sends output to a
sibling directory - so the workflow builds it and publishes the artifact.

**Plan 3 already deleted the category-customisation documentation** - the `signals` field, the "adding your
own category" section and its example, and the `version`-as-a-key warning. The four categories are fixed as
of 25 Aug 2026. **Do not carry any of it back across the split**, and do not reinstate it from an older
draft of the page.

**Documentation that plan 3 owes this one.** Defect 21 - adding a category without bumping `config.version`
silently denies it for every returning visitor - is fixed by documentation, not code. The existing page
covers it well under "Versioning stored consent"; carry that through the restructure rather than losing it.

**The README and `website/pages/home.md` are currently uncommitted work.** They were rewritten and never
committed. Read `git diff` on both before starting so you do not undo something deliberate.

**The copy is rewritten under [../rules/plain-language.md](../rules/plain-language.md), not just moved.**
It bans the sales register and says to state a thing once and stop. The existing page is mostly good on
this and `package.json:4` was fixed during plan 1.

**The headings already carry icons and explicit anchors.** Plan 1 restyled the page under
[../rules/icon-headings-in-public-docs.md](../rules/icon-headings-in-public-docs.md) and pinned every
heading's `{#id}`, because kramdown would otherwise rewrite the anchors the page links to. **Splitting the
page must carry both across** - an icon per heading, and the same ids, so the three in-page links and any
external one still resolve.

## Do not

**Do not point at `.agents/` from anywhere in the site** - see
[../rules/who-references-whom.md](../rules/who-references-whom.md). No defect numbers either: "defect 12"
means nothing to a reader, so write the behaviour. **Do not document a floating CDN URL** - not `@latest`,
not a range; see the release rule. **Do not enable the deploy.** **Do not write `dist/`.** **Do not commit,
stage or push.**

## Deliverables

- [ ] The site builds in one command from a clean tree, JavaScript included.
      `npm run build:website && cd website && bundle exec jekyll build` with no watcher.
- [ ] The dead `remote_theme` line is gone or the theme is actually installed. **Say which you chose and
      why.** `url` and `baseurl` were set during plan 1 to the GitHub project-pages defaults
      (`https://chrismavrommatis.github.io` + `/consentio`) - **confirm that is where it publishes** before
      the deploy workflow relies on them.
- [ ] `home.md` is no longer one long page, and every section survived the split.
      Diff the old page against the new set - nothing dropped silently. Every heading keeps its icon and
      its explicit `{#id}`.
- [ ] The design pass is done: navigation, landing page, code blocks, and a working live banner with a way
      to reset it.
- [ ] Nothing in the site points into `.agents/` or names a defect number.
      `grep -rniE "\.agents|defect [0-9]|issue [0-9]" website/pages/` returns nothing.
- [ ] No floating CDN URL is documented anywhere.
      `grep -rn "@latest" website/ README.md` returns nothing.
- [ ] The deploy workflow exists, has been run with the publish step disabled, and is not enabled.
- [ ] The site copy passes the language rule.
      `grep -rniE "\b(seamless|robust|comprehensive|crucial|vital|leverage|delve|elegant|powerful|journey)\b" website/pages/`
      returns nothing.
- [ ] `git status --porcelain dist/` is empty.
