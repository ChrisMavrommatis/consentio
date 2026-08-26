---
description: A comment carries the one thing that is not obvious from the code. Short. The reasoning goes in design/, never in both
when: writing or editing a code comment
paths: ["src/**", "test/**", "webpack.config.js", "scripts/**", ".github/**", "gtm/**", "website/_plugins/**"]
---

# Comments are for humans, and they are thin

**A comment carries the one thing that is not obvious from the code.** That the tag must not be `async`.
That the empty branch is deliberate. That Google drops an unknown key silently. **Short. One line where one
line does it.**

**The test is the line below it.** If a person reading that line would already know it, cut the comment. If
they would not, that is the comment - and only that. "Why" is the wrong word for the test, because why
invites the reasoning, and the reasoning is not the comment.

Good:

```ts
// `injectScript` is always async, so a default pushed after it is already too late.
```

Delete on sight:

```ts
// Loop over the consents
for (const consent of config.consents) {
```

**The reasoning goes in [../design/](../design/).** Background, the options that were rejected, "keep this in
step with X", anything that reads like a briefing - that layer exists for it.

**Never both.** A fact written in a comment and in a design record will disagree within a release. If the
comment and the record would say the same thing, the comment is the copy that goes.

**Write them thin.** Cut the connective grammar first: "This is required because it throws due to X and Y"
is "without this it throws". Cut the restatement of the line below. Cut the essay.

A table, a byte layout, a measured number, the seven Google signal names - those stay. A reader cannot
recover them.

## Two carve-outs

- **The file-level block at the top of `src/consentio-loader.ts`** explaining why the tag blocks. It is not
  obvious from any line and a reader who misses it will "helpfully" add `async`. One block, at the top of one
  file.
- **A bare defect number** in a `// @ts-expect-error` or a test title. The number is the breadcrumb that lets
  a later session find it - see [who-references-whom](who-references-whom.md), which holds the carve-out in
  full.

**Why:** the source is read by people deciding whether to put this on their site. Comments that restate the
code make it look like there is more going on than there is, and a comment that argues its own importance
reads as a warning sign.

## Stripping comments is a judgement, not a sweep

**A comment written by an agent is not damage by virtue of who typed it.** When a pass goes through
removing them, the test is the one above and nothing else. Several here were kept deliberately because they
were better than the line they sat on: the bound-once note on the bar's click handler, the empty-array
guard in the template's cookie reader, the reason `document.activeElement` is used exactly once inside a
closed shadow root.

**Cutting a comment that carried the only copy of a fact is a regression**, and a silent one - nothing
fails. Move it to [../design/](../design/) first, then cut.

## Where this rule does not reach

**Layouts and includes take no comments at all** - see
[no-comments-in-liquid](no-comments-in-liquid.md). That is a stricter rule, not this one applied to
templates.

**Config files keep theirs.** `_config.yml`, `_config.prod.yml`, `dependabot.yml`, `nav.yml` are read by a
person deciding what to set, and the line beside a key is what tells them. Same for `CHANGELOG.md`'s header.

See [plain-language](plain-language.md) for the register to avoid. It bites comments hardest, because a
comment has no room to recover from a bad first sentence.
