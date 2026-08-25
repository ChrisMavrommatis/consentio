---
name: two-test-commands
description: npm run test:plain exists to stop the page-free tests from quietly acquiring a DOM, and runs the same files a second time
when: adding a test, or moving a helper between test files
paths: ["test/**", "package.json"]
---

`npm test` runs everything on jsdom. `npm run test:plain` runs the cookie, saved-state and Google-signal
tests again against a forty-line stand-in with no jsdom at all. CI runs both.

**Why:** those tests need no page, but they were importing `helpers.mts`, which loads the element classes,
which extend `HTMLElement` at module load - so they died without jsdom for no reason. `basics.mts` holds the
page-free helpers now, and the second command is what stops the coupling coming back.

**How to apply:** a test that needs no DOM imports from `basics.mts`, never from `helpers.mts`, and gets
added to the `test:plain` glob. If `test:plain` starts failing, something pulled a DOM into a test that does
not need one - fix the import, do not add jsdom to the stand-in.
