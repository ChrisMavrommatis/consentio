---
description: Restructure and redesign the published documentation site, and make it buildable and deployable in one shot
state: done - 25 Aug 2026, uncommitted
waits-on: 3 and 4, so it documents fixed behaviour rather than being written twice
---

# 6 - the docs site

> **Done, 25 Aug 2026 - landed uncommitted.** Read `## Done on` at the bottom. It records what was chosen
> and why, one deliverable that could not be run here, and three checks handed to plan 8. A second pass the
> same day re-pitched the front pages at someone installing this on their own site - `## The second pass` -
> and a third fixed four presentation faults and took the maintainer's voice out of the reader's pages -
> `## The third pass`.

## What

The Jekyll site under `website/`: a real build command, a real structure, a design pass, and a deploy workflow
that is written and proven but **left switched off** until the maintainer says publish.

## Why

The documentation is good and nobody can read it. Nothing publishes the site. The one-shot
`npm run build:website` it needs already exists, so this plan is only about the deploy.

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

**`url` and `baseurl` are still undecided, as of 25 Aug 2026.** They are set to the GitHub project-pages
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
this, and `package.json:4` has already been fixed.

**The headings already carry icons and explicit anchors.** The page was restyled on 24 Aug 2026 under
[../rules/icon-headings-in-public-docs.md](../rules/icon-headings-in-public-docs.md), which pinned every
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

- [x] The site builds in one command from a clean tree, JavaScript included.
      `npm run build:site` is that one command - `build:website`, then `jekyll build`, no watcher. Run
      from an empty `website/js/` and no `_site/`.
- [x] The dead `remote_theme` line is gone or the theme is actually installed. **Say which you chose and
      why.** `url` and `baseurl` are already set to the GitHub project-pages defaults
      (`https://chrismavrommatis.github.io` + `/consentio`) - **confirm that is where it publishes** before
      the deploy workflow relies on them.
- [x] `home.md` is no longer one long page, and every section survived the split.
      Diff the old page against the new set - nothing dropped silently. Every heading keeps its icon and
      its explicit `{#id}`.
- [ ] The design pass is done: navigation, landing page, code blocks, and a working live banner with a way
      to reset it. The first three are done. **The reset control has not been clicked - there is no browser
      here**, and it is the only new JavaScript this plan wrote. It is now a plan 8 check.
- [x] Nothing in the site points into `.agents/` or names a defect number.
      `grep -rniE "\.agents|defect [0-9]|issue [0-9]" website/pages/` returns nothing.
- [x] No floating CDN URL is documented anywhere.
      `grep -rn "@latest" website/ README.md` returns nothing.
- [ ] The deploy workflow exists, has been run with the publish step disabled, and is not enabled.
      **Written and not enabled; never dispatched** - there is no runner here, no `gh`, and nothing may be
      pushed. Its build steps were run by hand in the same order and pass. It is now a plan 8 check.
- [x] The site copy passes the language rule.
      `grep -rniE "\b(seamless|robust|comprehensive|crucial|vital|leverage|delve|elegant|powerful|journey)\b" website/pages/`
      returns nothing.
- [x] `git status --porcelain dist/` is empty.

---

## Done on 25 Aug 2026

**Landed, uncommitted.** Nine pages where there was one, a stylesheet the repository owns, and a deploy
workflow that has never been dispatched.

### The two decisions the plan asked for

**`remote_theme` is gone, and so is beercss.** The theme was never installed, so removing the line changes
nothing that was working. beercss was 228 KB of vendored CSS and JavaScript for two class names, with no
update path and a Material look that is not a documentation look. `website/_sass/` now holds the site's own
stylesheet - tokens, base, layout, components - at about 10 KB built, with a light and a dark palette taken
from the banner's own blue-grey so the demo does not clash with the page under it.

**`url` and `baseurl` are right.** `package.json` says the repository is `ChrisMavrommatis/consentio`, and
GitHub project pages serve a repository at `https://<user>.github.io/<repo>/`. That is
`https://chrismavrommatis.github.io/consentio/`, which is what the two keys already said. **They are still
the only place the address is written down** - no layout, page or workflow carries it.

### The split, and what it cost

| Was, in `home.md` | Is now |
|---|---|
| intro, release state, choose a route, the catch, the two routes do not mix, release note, licence | `pages/index.md` at `/` |
| Route 1 and its six subsections | `pages/route-direct.md` at `/install/direct/` |
| Route 2 and the cookie-as-contract note | `pages/route-tag-manager.md` at `/install/tag-manager/` |
| what reaches the dataLayer, categories map to signals | `pages/datalayer.md` at `/datalayer/` |
| configuration, top level, texts, consents, the cookies JSON | `pages/configuration.md` at `/configuration/` |
| the cookie contract, the five reading rules, no stored answer | `pages/cookie.md` at `/cookie/` |
| versioning stored consent | `pages/versioning.md` at `/versioning/` |
| events | `pages/events.md` at `/events/` |
| - | `pages/try-it.md` and `pages/try-it-tag-manager.md`, both new |

**All 26 explicit `{#id}`s survive**, checked by diffing the old file's ids against every `id=` the built
site emits: nothing missing. The four in-page links became cross-page links to the same fragments, and a
link check over the built site finds nothing broken.

**Eight icons did not survive, by rule.** The eight `##` headings that became pages are now each file's `#`
title, and [../rules/icon-headings-in-public-docs.md](../rules/icon-headings-in-public-docs.md) says a `#`
title takes no icon. Every heading that is still a `##` or `###` kept its icon and its id. Two new headings
reuse icons already in the set rather than inventing one.

**No per-page contents list.** kramdown's `{:toc}` copies the heading text, so every icon would end up
inside a link and a list item, which the same rule forbids twice over. The sidebar and the previous/next
links are the navigation instead.

### The fixture

`consentRequired: true` stays, so every visitor meets the blocking overlay - the hardest case, and after
plan 4 a good demonstration rather than an embarrassing one.

- **`/try-it/`** carries the live banner, a control that clears the cookie and reloads, and a readout of the
  stored value. It reads the cookie name back off `window.ConsentioDefault` instead of hard-coding it.
- **`/try-it/tag-manager/`** is the same site with **no loader**. `loader: false` in a page's front matter
  drops the script tag; that is the only way one site can show both install routes answering for one
  visitor, which is the check that never fails loudly.
- **`gtm_container_id` in `_config.yml`** emits Google's container snippet after the loader. It is empty:
  the container is the maintainer's. Both branches were built and read - filled in, the snippet appears on
  every page; empty, it appears nowhere.

Neither fixture page is in `_data/nav.yml`'s sidebar by accident - `/try-it/` is, `/try-it/tag-manager/` is
reachable by link and by URL but not advertised, because until a container exists it shows nothing.

### The deploy workflow

`.github/workflows/site.yml`. `workflow_dispatch` only, no push trigger. `publish` defaults to false, so a
dispatch builds, uploads the Pages artifact and stops; the deploy job is gated on it. All five actions are
pinned to a commit SHA, and every SHA was resolved against the action's own repository rather than written
from memory.

**What running it by hand proved:** `npm ci`, `npm run build:website`, `bundle exec jekyll build` under
`JEKYLL_ENV=production`, in that order, from a tree with no `website/js/` and no `_site/`. 500 KB, ten HTML
pages and the bundles. **What it cannot prove here:** that the YAML parses on GitHub's side, that
`upload-pages-artifact` and `deploy-pages` behave as read, that the `if: ${{ inputs.publish }}` gate holds,
and that Pages is set to the GitHub Actions source at all - it is not, and nothing in a repository can set
it.

### Three things done that the brief did not name

**`npm run serve` now builds the JavaScript first.** `website/js/` is gitignored, so on a fresh clone the
old `serve` started a site whose loader was a 404.

**`_config.yml` lost more dead config than the plan named.** The `sitemaps` collection had no directory and
produced nothing, and its front-matter defaults pointed at it; the `pages/**` default named a layout that no
longer exists. The description was sales copy and is now what the site is.

**A tab-indented inline tag inside a `markdown="1"` block becomes a code block.** `parse_block_html: true`
is set site-wide, so kramdown reads an indented `<a>` or `<button>` as an indented code sample. Both button
rows carry `markdown="0"` for that reason. It is the trap to know before adding HTML to a page here.

### Defect 21's documentation half is done; its two `todo` flags are not

`/versioning/` carries it: bumping `config.version` discards every stored answer, and a site cannot trip
over it by adding a category because it cannot add one. That is what this plan was asked to carry across,
and it did.

**The two flagged tests in `test/lib/state/versioning.test.mts` still stand**, and they now describe a
scenario the code refuses: one adds a fifth category, which `mergeConsents` warns on and drops since defect
28 was fixed. Retiring them is a change to the suite, which is not this plan's, and nobody has scoped it.
Recorded at defect 21 in the register rather than done in passing.

## The second pass, 25 Aug 2026

**The maintainer read the split and said the front pages still read like a specification.** The brief: pitch
the surface at someone setting this up on their own site, drop the jargon, do not overwhelm, and put the
technical weight deeper instead of cutting it.

**What changed at the surface.** The landing page, both install pages and the sidebar. The install pages now
open with **four numbered steps** and put the explanation under them; the route comparison on the landing
page is written in terms of what the reader has (*can you edit your `<head>`?*) rather than what the code
does (*what pushes the consent default*). Titles went plain too: "Route 1 - directly in the site" is **Put
it in your HTML**, "Configuration" is **Settings**. The `anchor:` on each page is unchanged, so every id
still resolves.

**Nothing was cut - it moved down.** Two new pages carry what the surface stopped saying:

- **`/how-it-works/`** - the numbered sequence on both routes, the closed shadow root and what it does to
  `document.activeElement`, the weights, and **the original technical route-comparison table verbatim**.
  That table is the one the landing page used to open with.
- **`/troubleshooting/`** - symptom, cause, fix. Seven symptoms, then five things to run in the console in
  cost order. This is the page a self-installer actually needs and the old documentation had nothing like
  it.

Three reference pages got deeper rather than plainer: a complete worked example in Settings, a "how to check
it" section on the dataLayer page covering both the console and Tag Assistant, and the cookie's host-only
scope, rolling expiry and size.

### Two published figures were wrong, and are now measured

Both came through from the original page and neither had been re-measured since the port.

| | Was documented | Measured 25 Aug 2026, clean build |
|---|---|---|
| `consentio-loader.min.js` | 4.3 KB | **4.6 KB**, 2.0 KB gzipped |
| `consentio.min.js` | about 32 KB | **36.3 KB**, 11.3 KB gzipped |

The blocking one is the one that matters, and understating it is the kind of thing that gets found in
someone else's performance audit. Corrected in the site, `README.md` and
[../design/delivery.md](../design/delivery.md); delivery.md's historical 4.3 KB measurement is left as it
was, with the re-measurement noted beside it. The cookie is **about 220 bytes**, not 190 - 161 bytes of JSON
plus URI-encoding, because `"` and `,` survive as `%22` and `%2C`.

### Two facts the rewrite dropped, and got back

Caught by diffing the old page's vocabulary against the new set, which is worth doing after a rewrite and
not only after a move:

- **The `.min.js` naming rule.** The loader picks which bundle to ask for from its own filename, so
  `consentio-loader.js` loads `consentio.js`. Mixing a minified file with an unminified one loads nothing.
- **There is no npm package.** Someone will try `npm install` first; the landing page says so plainly.

### The state now

**Twelve pages, 568 KB built, zero broken links** - every internal link and fragment checked against the
built output. All 26 original `{#id}`s still resolve. No source was touched, so the suites are unmoved.

## The third pass, 25 Aug 2026

**The maintainer reported four faults and asked for an adversarial read of the content**: plain language for
everyone, no jargon, presentable.

### The four faults, all real

| Reported | Was | Now |
|---|---|---|
| pages missing from the sidebar | `/try-it/tag-manager/` was in no nav group - reachable by link only, which reads as an oversight rather than the deliberate choice it was | every page is in `_data/nav.yml`, checked against the permalinks |
| a black row in a table | the landing page's index table had an empty row used as a visual separator, and it rendered as an empty banded row | gone; the sentence above the table says which entries are reference |
| "the catch, in the open" is for me, not for readers | the heading and the section argued the project's own honesty policy at someone who only wanted to know which route to pick | **What Tag Manager cannot cover** - what it cannot stop, and which route to choose instead. Same id |
| - | definition lists on `/troubleshooting/` had **no styling at all** - `dl`, `dt` and `dd` were never in the stylesheet, so the page's main structure rendered as a browser-default wall | styled. Found by the class cross-check, not by the report |

### What the adversarial read found

**The maintainer's voice was in five reader-facing pages, not one.** The same fault as the reported one:

- **The release note on the landing page** talked about breaking changes moving two repositories and the
  template pinning a CDN URL. A visitor cannot act on any of that. It is now **Versions**: which version the
  site describes, and the one line an upgrader needs - remove `async`.
- **`/install/tag-manager/`** explained `injectScript`, `Consentio.Create(config, cookies)`,
  `ConsentioOptions`, "cookie descriptors" and the run-once guard, to someone whose whole job is adding a
  published template to a container. All of it moved to `/how-it-works/`; the page now says what the
  template does in two sentences.
- **The cookie page opened with "two pieces of code in two repositories and two languages"** - true, and
  addressed to whoever writes the second reader. A site owner wants to know what the cookie is and what to
  put in their cookie policy. It opens with that now, in a box they can copy from, and the implementer's
  half is kept below and labelled as such.
- **The dataLayer page's first line was about the `gtag` shape being an arguments object.** It now opens by
  saying Consentio does not block anything - it tells Google's tags what they may do - followed by **a
  four-word glossary**: dataLayer, signal, consent default, consent update. Every other page has to use
  those words eventually, so one page has to introduce them.
- **`/versioning/` was three paragraphs of what the code does.** It is now **Asking everyone again**: how,
  what it costs your visitors, three cases where it is right and four where it is not.

**Two pages had no reason to exist for the reader, and now do.** `/events/` described two `CustomEvent`s that
bubble and cross the shadow boundary. Its actual audience is someone with a chat widget or an embedded map
that needs holding back - so it opens by saying you do not need the page unless that is you, then gives the
working pattern, including the visitor who answered last week and will never see the banner again.
`/datalayer/` got the same treatment for the non-Google case.

**Jargon swept from every page except `/how-it-works/`**, which is where the technical weight was deliberately
put. "the loader" became "the script tag", "push" became "the message", "globals" became "things on
`window`", "gate" became "hold back", "before the page paints" became "before the page appears".

### Still true after all three passes

Twelve pages, all 26 original `{#id}`s resolving, zero broken links, every page in the sidebar, no source
touched. `npm test` unmoved at 230/228/0 fail/2 todo.
