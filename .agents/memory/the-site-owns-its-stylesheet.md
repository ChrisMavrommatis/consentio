---
name: the-site-owns-its-stylesheet
description: The docs site's theme config was dead and its 228 KB of vendored beercss bought two class names, so both were removed on 25 Aug 2026 rather than replaced
when: touching the docs site's styling, or wondering why it has no theme
paths: ["website/**"]
---

`website/_sass/` is the site's own stylesheet - tokens, base, layout, components, about 10 KB built, with a
light and a dark palette taken from the banner's own blue-grey so the demo does not clash with the page under
it. There is no theme gem and no CSS framework.

**Why:** `remote_theme: just-the-docs/just-the-docs` was in `_config.yml` and had never loaded - neither the
theme nor `jekyll-remote-theme` was in the `Gemfile`, and Jekyll ignores the key silently. All the visual
weight was coming from 228 KB of vendored beercss carrying two class names, with no update path and a
Material look that is not a documentation look. Neither was working, so there was nothing to migrate.

**How to apply:** style in `_sass/`. Do not reach for a theme gem or a CDN framework to avoid writing a
selector - the whole stylesheet is smaller than the thing that would replace it. A new element type needs
adding there deliberately: `dl`, `dt` and `dd` were missing until a page's main structure rendered as browser
defaults.
