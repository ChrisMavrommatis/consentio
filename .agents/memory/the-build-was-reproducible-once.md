---
name: the-build-was-reproducible-once
description: On 24 Aug 2026 the TypeScript port produced byte-identical minified bundles - measured evidence that a dist freshness check can be honest
when: wiring or debugging a check that dist/ matches what the source builds
paths: ["dist/**", "webpack.config.js", ".github/workflows/**"]
---

The TypeScript port was verified by building the ported tree and the pre-port tree and diffing the output.
`consentio.min.js` and `consentio-loader.min.js` came out **byte-identical**. Terser produced the same bytes
from both trees.

**Why it matters now:** the CDN serves the committed `dist/`, so a check that the build does not change
`dist/` is the thing that stops a stale bundle shipping - and that check is only possible because the build
is deterministic. This is the measurement that says it is.

**How to apply:** it is evidence, not a guarantee. It was true of one commit with one toolchain. Re-measure
before relying on it - two clean builds of the same commit, diffed - and if it has stopped being true, find
what made it non-deterministic rather than loosening the check.

The pre-port baseline had to be rebuilt from the tag rather than taken from `dist/`, because the committed
`dist/` was stale. That is defect 24, and it is what the check exists to prevent.
