---
name: writing-the-docs-late-cost-a-session
description: Sequencing work by dependency was right; sequencing the written-down understanding last was not, and it cost a whole session
when: ordering a piece of work, or deciding when the documentation gets written
---

The refactor was sequenced by dependency, and that held. The risk that actually bit was different: **the
docs were scheduled last, and their absence cost a whole session.**

Nothing written down said how Consentio is actually installed. So a session designed and built a second
blocking artifact - a separate `consentio-core.min.js` - which was correct code solving a problem that did
not exist, and was deleted the same day.

**How to apply:** write down how the thing is *delivered* before writing code that depends on it, even if
the user-facing documentation itself comes later. That understanding now lives in
[../design/delivery.md](../design/delivery.md), which is the record that would have prevented it.
