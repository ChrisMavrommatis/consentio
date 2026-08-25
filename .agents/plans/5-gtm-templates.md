---
description: Fix the tag manager templates - the missing consent default, the ConsentioIntance typo - and lay each one out the way the gallery requires
state: written, not finishable here - 26 Aug 2026
waits-on: nothing to write. Finishing it needs the documentation site published and a container on it
---

# 5 - the tag manager templates

> **Written 26 Aug 2026, and not finishable here.** Read `## Done on` at the bottom first - the brief below
> is what was asked for, and two decisions taken during the work changed it: there are **two** templates now,
> not three, and the strings moved onto the tag. Every box still unticked needs a browser, a container or the
> template editor.

Read [../design/delivery.md](../design/delivery.md) for why this route does not share the loader's
deny-by-default, and [../design/issues.md](../design/issues.md) for defects 25 and 26.

The templates are in `gtm/`. **This plan changes nothing in `src/`.**

**[`../../gtm/README.md`](../../gtm/README.md) has already been corrected** - it no longer claims every
template pins a version, and it lists both open template defects under a Known problems heading. Delete that
heading as part of this plan, not before.

## What

Defects 25 and 26, the gallery layout for all three templates, two spelling mistakes, and one shared
fixture that makes the cookie contract checkable.

## Why

**Defect 26 is the reason this plan exists.** `gtm/consentio-tag/template.tpl` calls `injectScript` and
nothing else. There is no consent default anywhere in it, and `injectScript` is always async, so the tag
manager has read consent long before the banner arrives. **In this route the banner gates nothing** - it is
defect 1 all over again, in the route where it is worst, and the fix is not one this repository's source can
make.

**Defect 25 is five characters.** `template.tpl:236` writes `setInWindow('ConsentioIntance', ...)` - missing
the `ns`. That call exists to cover for defect 9, so today it covers for nothing, the double-initialisation
guard is dead, and a second trigger firing hits defect 8 and throws.

## Direction

**Build the default into `consentio-tag`, before it injects anything:**

1. read the stored choice with the tag manager's cookie API
2. parse it, check the `version` field, fall back to no-stored-answer
3. set the default through the tag manager's consent API, on the **Consent Initialization - All Pages**
   trigger, with `wait_for_update` for a first-time visitor **only**
4. set `ads_data_redaction` while ad storage is denied
5. *then* `injectScript` the banner and call `Consentio.Create(config, cookies)`

**Check every API name against Google's own documentation in this session.** This brief is written from
memory of the sandboxed JavaScript API and the consent APIs. Do not trust it on names, and do not trust a
name that merely looks plausible - a wrong key is dropped silently, which is exactly how defect 2 survived.

Declare every permission that needs and no more. The template today declares `injectScript` scoped to the
jsDelivr path; reading a cookie and setting consent each need their own.

**The tag builds no `cookieName` into its config at all.** That was harmless while it never read the cookie.
Once it does, it needs one, and it has to be the same name the banner will use.

**The part that will bite: the cookie is a contract implemented twice.** `src/lib/consent-store.ts` and the
template's own sandboxed reader must agree on the name, the version field, the JSON shape and what "no
stored answer" means. There is no shared code path.

[../rules/the-cookie-is-a-contract.md](../rules/the-cookie-is-a-contract.md) is the rule; the contract is
written out in full in [../design/delivery.md](../design/delivery.md). **Do not re-derive it from the
source.** The two lines that catch people:

- **"No stored answer" is a single `strictly_necessary` granted key, not four denied categories.** Write
  four denied categories and this route denies `security_storage` while the direct route grants it, and the
  two routes then disagree about the same visitor.
- **A version mismatch discards the whole stored value.** It does not merge and it does not partially apply.

**Direction change B - make that contract checkable.** The rule says no test can span the two
implementations. True for code. But a single `gtm/contract.fixture.json` holding worked cookie values -
a first-time visitor, a returning one, a version mismatch, a malformed value - asserted by the TypeScript
tests **and** pasted into each template's `___TESTS___` block, makes a mismatch visible in one diff. It is
the cheapest insurance available against the one failure mode that never fails loudly. Build it.

**The gallery layout.** Each published repository needs `template.tpl`, `metadata.yaml`, `LICENSE` and
`README.md` at its **root**. Every `gtm/<name>/` folder currently holds `template.tpl` and nothing else.
**Confirm the current requirements against Google's documentation before laying them out** - this brief
states them from memory and they change. In particular check what `metadata.yaml` must contain and how a
version is recorded in it, because that decides how much of the publish can be automated.

Write a `README.md` for each: what it does, which fields it takes, which variables it expects, and the cookie
contract for anyone reading the template rather than using it. **A template README is public and is not
written for an agent** - see [../rules/who-references-whom.md](../rules/who-references-whom.md). Point at the
docs site, never at `.agents/`.

**The two MACRO templates.** `consentio-tag-texts` and `consentio-tag-cookies` are variables and neither has
a defect against it. They need the gallery files, a README each, and two spelling fixes: `template.tpl:101`
in `consentio-tag-cookies` logs `Contentio Tag: Cookies`, and `consentio-tag-texts/template.tpl:9` describes
itself as being for "the Contentio Tag".

**The cookie shape changed on 25 Aug 2026, and this plan writes the second reader against it.**
The categories nest under a `consents` key rather than sitting beside `version` - `{"version":1,"consents":
{...}}`. [../design/delivery.md](../design/delivery.md) has the spec in full and
[../rules/the-cookie-is-a-contract.md](../rules/the-cookie-is-a-contract.md) says why it costs what it costs.
**The moment this template reads a cookie there are two implementations and no test can span them**, so read
the spec rather than the source, and do not re-derive it.

**The gallery description still sells, and this plan is the only thing that opens the file.**
`consentio-tag/template.tpl:14` - the `description` the gallery shows - says Consentio "integrates
seamlessly with tag manager and provides transparent consent handling". That is the sales register
[../rules/plain-language.md](../rules/plain-language.md) bans. It was found on 24 Aug 2026 and left alone
then, because editing a published template costs a review cycle and this plan is already paying for one.
Rewrite it to say what the tag does.

**Where these get tested, decided 25 Aug 2026: the published documentation site.** Every deliverable below
that says "by eye" or "on a real page" needs a live page with a tag manager container on it, and the site is
that page once it is published. So **this plan can be written before the site is published and cannot be
finished before it.** Write the templates, then verify them against the published site.

Two things follow. The site needs a container of its own, which is the maintainer's to create. And the site
already carries the direct route, so it can serve the check nothing else can: **one visitor, both routes,
the same `security_storage`.**

## Do not

**Do not change anything in `src/` or `dist/`.** If this plan finds a defect there, it adds a number to
[../design/issues.md](../design/issues.md) and stops. **Do not publish to the gallery** in the same sitting
that writes the templates. **Do not create the three repositories** - that is the maintainer's. **Do not
bump the version.** **Do not commit, stage or push.**

## Deliverables

- [ ] The tag pushes a consent default before it injects anything.
      **By eye, in Tag Assistant.** The `consent default` is on the dataLayer before the container loads.
      **Written, never run in a container** - it is check 2 in
      [8-release-readiness.md](8-release-readiness.md).
- [x] Defect 25 is fixed and the double-initialisation guard actually works.
      `ConsentioInstance` is spelled correctly; a second firing is stopped by the window key or by the
      template's own page-lifetime flag, whichever is set. Covered by a template test; **not run on two real
      triggers.**
- [ ] The template's cookie reader matches the contract exactly.
      A visitor who accepts, then reloads, is not asked again - checked by hand on a real page in **both**
      routes, and the two routes report the same `security_storage`. **Check 3 in plan 8.**
- [x] `gtm/contract.fixture.json` exists, the TypeScript tests assert against it, and each template's
      `___TESTS___` block uses the same values.
      `test/lib/consent-store/contract-fixture.test.mts` asserts the banner against it,
      `test/gtm/template-contract.test.mts` fails when the template drifts from it. The MACRO reads no
      cookie, so the fixture does not reach it.
- [ ] Every declared permission is used and nothing used is undeclared.
      The template saves in the editor with no permission warning. **Nothing here can open the editor** -
      it is check 10 in plan 8.
- [x] Each folder holds what the gallery requires, checked against Google's documentation **in this
      sitting**, and what it requires is written into [../design/delivery.md](../design/delivery.md).
- [x] Each template has a public README that points at the docs site.
      `grep -rn "\.agents" gtm/` returns nothing.
- [x] No `Contentio` anywhere.
      `grep -rni "contentio" gtm/` returns nothing.
- [x] The gallery description says what the tag does and does not sell.
      `grep -rn "seamless" gtm/` returns nothing.
- [x] `src/` is untouched and the version was not bumped.
      `git diff --stat src/ package.json` is empty.

---

## Done on 26 Aug 2026

**Written, and it cannot be finished here.** Every remaining box needs a browser, a container or the
template editor. The board says the same, and plan 8 holds the checks.

### Three templates became two, then the strings changed shape

The maintainer read the setup cost and made two calls that the brief did not anticipate. Both are recorded
in [../design/delivery.md](../design/delivery.md); the short version:

**`consentio-tag-texts` is gone.** Its twenty-one strings are fields on the tag. A published template costs
a repository, a `metadata.yaml` SHA list and a gallery review cycle, and the strings bought none of it back -
they are set once per container. The cookie table stays a variable because it is data.

**One `textSource` field replaced "blank means default".** `builtin` sends no strings and lets the banner
keep its own; `custom` shows the twenty-one fields **already filled in with the English text**; `variable`
takes the whole set from any Tag Manager variable. `enablingConditions` hides the fields unless they are
asked for, which is the only reason they can be pre-filled at all - a filled field submits a real value, so
it would beat anything else that tried to supply one.

**Runtime language packs were proposed and refused.** They work: a web template cannot fetch, but
`injectScript` plus `copyFromWindow` is the same thing and the declared permission already covers the CDN
path. The maintainer refused to make a translation a service. Translations are downloaded and pasted
instead, into the fields or into a variable, and nothing can then fail at run time.

### What was checked against Google rather than remembered

Every API name, every permission id and the gallery's file list were read from Google's documentation in
this sitting, and the permission JSON shapes were taken from templates published in the gallery rather than
written from memory:

| Checked | Result |
|---|---|
| `getCookieValues(name[, decode])` | returns an **array**, decodes by default |
| `setDefaultConsentState` | needs `access_consent` with **write** on all seven types |
| `gtagSet(object)` | needs `write_data_layer`, whose param is `keyPatterns` |
| `JSON.parse` in the sandbox | returns `undefined` on malformed input rather than throwing, so no `try` is needed |
| `enablingConditions` | `[{paramName, paramValue, type: "EQUALS"}]`, from a gallery template |
| the gallery's files | `template.tpl` with `categories`, `metadata.yaml`, `LICENSE`, `README.md`, main branch, one template per repository |
| a template version | **a commit SHA in the published repository**, so the `versions` entry can only be written after the commit it names exists |
| a web template fetching | **there is none.** No XHR; `sendPixel` and `injectHiddenIframe` cannot read a response |

**There is no consent category in the gallery's list**, so both templates use `UTILITY` and `TAG_MANAGEMENT`.

### Two defects found while writing it

Both are in the register, at 30 and 31, and both were fixed the same day. The Version field reached the
config as a **string**, which nothing noticed until a second reader compared it against the cookie; and the
Texts variable read `strictlyNecessarydescription`, so one category's description in four was silently
dropped.

### The cookie name is fixed at `consentio` on this route

`get_cookies` can only name a cookie known at publish time, so a configurable name would mean declaring
"reads any cookie". The direct route keeps `data-cookie-name`. This is the one place the two routes differ
in what they offer, and it is a constraint rather than a choice.

### What is not done, and is not this plan's

**The templates cannot be published yet.** The tag's CDN URL still pins `@0.0.4`, which is the stale bundle -
a template must never ship ahead of the tag it points at. Tag `0.1.0`, then move the URL, then submit.

**`LICENSE` is a copy of the repository's** in each folder, so each folder is a complete copy of its
published repository. `metadata.yaml`'s `versions` list is empty in both and cannot be filled from here.