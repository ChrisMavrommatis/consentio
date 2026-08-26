---
description: Move the published site off the inline loader and onto the published Tag Manager template, and make its cookie table describe the cookies it really sets
state: the mechanism landed 26 Aug 2026, uncommitted. The work itself has not started
waits-on: the gallery review. Everything else it needs exists
---

# 10 - the site runs on its own template

> **The switch exists; nothing has been switched.** On 26 Aug 2026 the site gained a `_config.prod.yml`
> overlay, a `consentio_route` key, the `gtm_head`/`gtm_body` plugin and a cookie table with one true entry
> in it. **Every deliverable below still needs a container, a published template or a browser**, and none of
> those exists yet. Read `## What landed early` at the bottom for exactly what is and is not done.

## What

The published site installs Consentio the way most of its readers will: a Google Tag Manager container
running the published `Consentio Tag` template. The inline `<script>` in `_layouts/base.html` goes, except
on the one page that exists to keep it.

And the cookie table stops being fiction.

## Why

**The site is the fixture, and it only ever exercised one of the two routes.** Every check that has been
deferred to plan 8 with "needs a container" is deferred because the site has no container. The direct route
has been exercised on every page since the site went up; the tag manager route - the one with the second
cookie reader, the one whose defect 26 was live until 26 Aug 2026 - has been exercised on nothing.

**A published template that its own author does not run is a template nobody runs.** The gallery version is
the artefact strangers install. If it drifts from the source in `gtm/`, or if a gallery review changes
something, the only way anyone finds out is a stranger's bug report. Running it here turns that into
something the maintainer trips over first.

**The cookie table was fiction and it was on a consent product's own site.** Until 26 Aug 2026
`website/data/consentio-cookies.json` listed `session_id`, `analytics_id`, `ad_tracker` and `language_pref`.
The site sets none of them. It sets exactly one cookie, `consentio`, and that one was not in the table. A
false cookie disclosure is bad on any site and indefensible on this one. It is fixed - the table now holds
the one real cookie - but **adding a container adds Google's cookies, and the table has to grow with it in
the same sitting, not afterwards.**

## Direction

**The two `/try-it/` pages already encode the shape.** `loader: false` in a page's front matter drops the
script tag. Today that is set on one page. **This plan inverts it**: the loader becomes the exception rather
than the rule, so the flag has to become `loader: true` on the page that still wants it, or the layout has
to read the opposite default. Decide which reads better and say why - the current name will be a lie either
way once it flips.

**Keep one page on the direct route on purpose.** `/try-it/` is the only place the blocking-script install
is demonstrated, and it is what checks 1 and 4 in [8-release-readiness.md](8-release-readiness.md) run
against. Losing it to tidiness would cost more than it saves. Both routes have to stay reachable on one
site, because **the check nothing automated reaches is one visitor meeting both** - accept on one page, load
the other, and see whether the two readers agree about `security_storage`.

**Install the template from the gallery, not by importing the `.tpl`.** Importing the file from `gtm/` tests
the source. The point is to test what Google publishes. If the gallery version misbehaves and the local one
does not, that difference is the finding.

**The container needs the consent tag on `Consent Initialization - All Pages`**, which is the trigger the
template's own description names, and it needs to fire before anything else. Anything else in the container
- a Google tag, a pixel - is what makes the demonstration mean anything, because a consent banner gating
nothing looks identical to one that works.

**`gtm_container_id` in `website/_config.yml` is where the ID goes, and it is the only place.** The snippet
is already wired in `_layouts/base.html` behind an `if`; filling the key in turns it on for every page.
**Do not put the ID anywhere else** - not a layout, not a page, not a workflow.

**Then the cookie table grows.** A container with a Google tag sets `_ga` and `_ga_<measurement id>` at
minimum, and `_gcl_au` if Google Ads is ever added. **Do not write that list from memory or from this file.**
Accept everything on the live site, open the browser's storage inspector, and write down what is there -
name, who set it, how long it lasts. That is the same instruction the site now gives its readers, and this
plan is where the project follows its own advice.

**Note that the table is served two different ways on the two routes.** The direct route reads
`website/data/consentio-cookies.json`. The template route reads a `Consentio Tag - Cookies` variable filled
in by hand in the container. **They have to say the same thing**, and nothing checks that they do. If
keeping them in step by eye looks fragile, say so and record it as a defect rather than solving it here.

## Do not

**Do not import `gtm/consentio-tag/template.tpl` into the container** - install the gallery version, which is
the whole point. **Do not remove the direct route from the site entirely.** **Do not write the cookie table
from memory.** **Do not put the container ID anywhere but `website/_config.yml`.** **Do not write `dist/`.**
**Do not commit, stage or push.**

## Deliverables

- [ ] The site's pages load Consentio through the published Tag Manager template, not the inline script,
      and `gtm_container_id` is the only place the container ID appears.
- [ ] One page still uses the direct route, deliberately, and says on the page that it does.
- [ ] Both routes are reachable on the live site, and **one visitor answering on one of them is not asked
      again on the other**. Record what `security_storage` reads on both - this is check 3 in plan 8.
- [ ] The cookie table lists what the site really sets, read from the browser's storage inspector after
      accepting everything. Nothing in it is written from memory.
- [ ] The container's table and `website/data/consentio-cookies.json` agree, entry for entry.
- [ ] The container has at least one real tag gated by consent, so the banner is demonstrably gating
      something.
- [ ] The gallery template behaves the same as `gtm/consentio-tag/template.tpl`. **Any difference is a
      defect number in [../design/issues.md](../design/issues.md)**, not a local fix.
- [ ] `git status --porcelain dist/` is empty.


---

## What landed early, 26 Aug 2026

Building the switch did not need the review, so it was built. **Switching still does.**

**Done:**

- `website/_config.prod.yml` overlays `url`, `gtm_container_id` and `consentio_route`; `_config.yml` stays
  on localhost with no Google at all. `npm run build:site:prod` and `site.yml` pass both files.
- `website/_layouts/base.html` picks the route from `site.consentio_route`, with `loader: true` / `loader: false`
  overriding per page. Proved by building both ways: **11 pages carry a real loader tag locally, 1 does in
  production** - `/try-it/`, pinned.
- `website/_plugins/gtm_tag.rb` emits Google's snippet and the `<noscript>` iframe, and renders nothing when
  the ID is empty. Proved with a dummy ID: 12 pages, 12 iframes, loader still only on `/try-it/`.
- **The cookie table was fiction and is not any more.** It listed four cookies the site does not set and
  omitted the one it does. It now holds `consentio` alone, which is what the site sets today.

**Not done, and none of it can be:**

- No container exists. `gtm_container_id` is empty in both files.
- The template is submitted, not published, so there is nothing to install from the gallery.
- Nothing has been opened in a browser on the live site, so the two-routes-one-visitor check has not run.
- The cookie table was written from the source, not read from a storage inspector. It is right for today
  because the site loads nothing third-party - checked, no fonts, no CDN, no analytics - but **the moment a
  container is added it is wrong again**, and the deliverable stands.

**One thing to know before switching:** the live site currently serves the direct route on every page. A
publish with `consentio_route: "tag-manager"` and an empty or Consentio-less container leaves the live site
**with no banner at all**. Nothing checks that. The deploy is gated on the `publish` box, so it cannot
happen by itself.
