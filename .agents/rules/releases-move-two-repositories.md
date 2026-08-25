---
description: One published template pins the version in its CDN URL, so a version bump moves two repositories - and a template update goes through review
when: changing the version, dist/, user-visible behaviour, or anything a published template pins
paths: ["package.json", "dist/**", "gtm/**", "CHANGELOG.md"]
---

# A release moves two repositories

The banner ships from a tagged CDN URL. **One template pins that version in its own source** -
`gtm/consentio-tag/template.tpl:144`. The two MACRO templates supply strings and the cookie table and pin
nothing, so a version bump does not touch them.

Each published template lives in its own repository because the gallery requires it. So a Consentio release
is:

1. a tag here, which is what the CDN serves
2. a change to `consentio-tag`, in its own repository
3. a review by the gallery's owner, which is not instant and is not yours

What follows:

- **Never document or publish a floating CDN URL.** Not `@latest`, not a range. A mutable URL means a bad
  build reaches every site at once, and it breaks subresource integrity.
- **A tag is permanent.** The CDN caches it and sites pin it. There is no fixing one after the fact - the
  only remedy is another tag, and another round of template updates and reviews.
- **So do not tag to try something.** Everything that can be checked before a tag must be checked before it.
- **Batch breaking changes.** Two releases a week apart cost two review cycles and leave sites split across
  versions for as long as the second one takes.

**A change to the cookie contract will move `consentio-tag` too**, whatever the version does, once that
template sets the consent default itself - defect 26. It reads no cookie today, so today it does not - see
[the-cookie-is-a-contract](the-cookie-is-a-contract.md).

The version is the maintainer's decision. **Say a bump is needed and leave it alone** - see
[never-commit](never-commit.md).

## The changelog is the release body

`CHANGELOG.md`'s section for the version being released is published as the release notes, verbatim. So:

- **A user-visible change adds a line to `## [Unreleased]` in the same sitting.** Written for the people
  using Consentio, not the people writing it. A change nobody outside can see adds nothing.
- **Version headings carry no icon** - `.github/workflows/release.yml` parses them. The `###` headings inside
  a section do, as [icon-headings-in-public-docs](icon-headings-in-public-docs.md) says.
- **The release is one dispatch of `release.yml` with a version.** Before it: rename `## [Unreleased]` to the
  version, open a fresh empty one above it, bump `package.json`. All three are the maintainer's.
- `node scripts/changelog.mjs check <version>` is what the release gate runs, and it costs nothing to run
  first.
