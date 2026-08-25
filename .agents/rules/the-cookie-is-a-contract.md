---
description: The consent cookie will be read by two independent implementations in two languages. Changing it breaks the template route silently
when: changing the cookie name, its version field, its shape, or what "no stored answer" means
paths: ["src/lib/consent-store.ts", "src/lib/cookies.ts", "gtm/**"]
---

# The cookie is a contract

`src/lib/consent-store.ts` is the only reader today. **`gtm/consentio-tag/template.tpl` reads no cookie at
all** - it injects `consentio.min.js` and calls `Consentio.Create`, so the bundle does the reading for it.

**That is defect 26, and fixing it creates the second implementation.** The template cannot wait for
`injectScript` to push a consent default, so it has to read the cookie itself, in the tag manager's sandbox,
in a different language, in its own repository. There is then no shared code path and no test that can span
them.

Disagree on the name, the `version` field, the JSON shape, or what "no stored answer" means, and a returning
visitor is asked again - or worse, is treated as having consented when they have not. Nothing fails loudly.

**[../design/delivery.md](../design/delivery.md) states the contract in full** - name, value, a worked
example, the attributes, the four reading rules and the two traps. Do not re-derive it from the source.

**Before you change any of it:**

1. Say plainly that it is a breaking change for the template route, whatever it does to the version number.
2. Check [releases-move-two-repositories](releases-move-two-repositories.md) for what that costs.
3. Update `../design/delivery.md`, the docs page, and - once it exists - the template's reader, in the same
   session.

Two things that are easy to skim past and are the usual cause of a mismatch:

- **"No stored answer" is not "everything denied".** It is the single key
  `{"strictly_necessary":"granted"}`, which grants `security_storage`. A reader that falls back to four
  denied categories denies `security_storage` too, and the two routes then disagree about the same visitor.
- **A version mismatch discards the whole stored value.** It does not merge and it does not partially apply.
