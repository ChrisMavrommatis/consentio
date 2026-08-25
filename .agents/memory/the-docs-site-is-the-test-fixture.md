---
name: the-docs-site-is-the-test-fixture
description: /try-it/ and /try-it/tag-manager/ exist to be checked by hand, not to demonstrate - one carries the banner and a reset control, the other deliberately has no script tag
when: editing the docs site's try-it pages, or looking for where a by-hand check runs
paths: ["website/pages/try-it.md", "website/pages/try-it-tag-manager.md", "website/_config.yml"]
---

`consentRequired: true` in `website/data/consentio-config.json` is deliberate: every visitor meets the
blocking overlay, which is the hardest case to get right. `/try-it/` carries the live banner, a control that
clears the cookie and reloads, and a readout of the stored value, read back off `window.ConsentioDefault`
rather than hard-coded. `/try-it/tag-manager/` sets `loader: false` in its front matter, which drops the
script tag, and `gtm_container_id` in `_config.yml` emits Google's container snippet after the loader on
every page when it is filled in. It is empty: the container is the maintainer's.

**Why:** the checks that matter most cannot be automated - the consent default arriving before the container
loads, and the two install routes agreeing about one visitor. Both need a real page in a real browser with a
real container. One site carrying both routes is the only place the second can be seen at all, and it fails
silently everywhere else.

**How to apply:** treat those two pages as test equipment. Do not make `/try-it/tag-manager/` look finished
while `gtm_container_id` is empty - it shows nothing until a container exists, and the page says so.
