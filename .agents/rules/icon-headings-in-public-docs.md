---
description: Every section heading in a public markdown file opens with one emoji. Not in .agents/, not in code comments
when: writing or editing a heading in a public markdown file
paths: ["README.md", "**/README.md", "website/**", "gtm/**", "CHANGELOG.md", "SECURITY.md"]
---

# Public headings carry an icon

Every section heading in a public markdown file opens with one emoji, then a space, then the title:

```markdown
## 🚀 Quick start
### 🍪 The cookie
```

**This is the house style and it is not decoration.** A reader lands on a long page - `README.md` and
`website/pages/home.md` are both long - scrolls, and the icons are what let them find the section they came
for without reading every heading. Dropping them makes a page harder to scan, not more serious.

## How to apply it

- **One icon per heading, on `##` and `###`.** The `#` title of a file takes none.
- **Reuse the icon that already means that thing.** Grep the existing files before inventing one. The same
  section wearing two different icons across two files is the failure this rule exists to prevent.
- **One icon, never two.** Never inside a sentence, a list item, a table cell or a link.
- **No generated contents list.** kramdown's `{:toc}` copies the heading text, so every icon would land
  inside a link and a list item - forbidden twice over by the line above. The docs site has none for that
  reason; its sidebar and previous/next links are the navigation.
- **A heading must still work with the icon stripped.** Terminals, `grep` output and some readers drop it.
  The words carry the meaning; the icon only speeds up finding them.

## The set in use

Grep these before inventing one. Every icon below is already carrying a heading in `README.md`,
`test/README.md`, `gtm/README.md` or `website/pages/home.md`.

| Icon | Means |
|---|---|
| 📝 | overview, what this is |
| 🧭 | choose between routes, orientation |
| 🚀 | quick start, install, the direct route |
| 🏷️ | tag manager, templates, the template route |
| 🧩 | how the pieces fit |
| ⚙️ | configuration, options, machinery |
| 🔧 💬 📋 | the config sections: top level, texts, consents |
| 🍪 | the cookie, storage |
| 📡 🔀 | what reaches the dataLayer, and how categories map to signals |
| ⏱️ | ordering, timing |
| ⚖️ | cost, trade-off |
| 🔍 | what is left behind, what to inspect |
| 📄 | a code sample, a licence |
| 📂 | layout, repository structure |
| 🧪 ✅ | tests, and test state |
| 🛠️ | building, development, editing |
| 📖 ❗ 🔢 | reading rules, the trap in them, versioning |
| 📣 | events |
| ♿ | accessibility |
| 🔒 | security, permissions |
| ⚠️ 🚫 🚧 | a catch, a hard don't, a known gap |
| 🏁 | release note |

## Where it does not apply

- **Anything under `.agents/`.** Read by us, kept plain, no icons.
- **Code comments.** See [comments-are-for-humans](comments-are-for-humans.md).
- **Strings a program emits** - console warnings, UI strings, template field labels. Those stay plain ASCII;
  [plain-language](plain-language.md) binds there and the two never overlap, because that rule covers text
  inside source and this one covers markdown a person reads.
- **A `template.tpl`.** It is source the gallery parses, not a page.
- **Version headings in `CHANGELOG.md`** - `## [Unreleased]`, `## [0.1.0] - 2026-08-25`. The release
  workflow parses them to find the release body. The `###` headings inside a section carry icons as normal.
