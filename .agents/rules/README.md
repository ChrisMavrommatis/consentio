# Rules

Every standing rule, one file per rule. **This page is the whole set.** Match what you are about to do
against the trigger, open that one file, skip the rest.

A rule is a standing instruction that does not change per task. Why something is the way it is belongs in
`../design/`; what is not done yet belongs in `../plans/`.

## Always

`CLAUDE.md` states these in one line each; the files hold the carve-outs.

| Rule | In one line |
|---|---|
| [never-commit](never-commit.md) | Never commit, stage or push. Leave changes in the working tree. |
| [only-ci-builds-dist](only-ci-builds-dist.md) | `dist/` is the shipped product. **Only CI writes it.** Nothing enforces that yet, so it is by hand. |
| [the-public-bar](the-public-bar.md) | This repository is public. What may never appear in it, and what may never point into `.agents/`. |
| [plain-language](plain-language.md) | Plain, short language in chat, docs and comments. Say when the maintainer is wrong. |

## When the trigger fires

| About to... | Read |
|---|---|
| write or edit a **code comment** | [comments-are-for-humans](comments-are-for-humans.md) |
| edit a **layout, include or Liquid block** under `website/` | [no-comments-in-liquid](no-comments-in-liquid.md) |
| write a **heading in a public markdown file** - `README.md`, `website/`, `gtm/` | [icon-headings-in-public-docs](icon-headings-in-public-docs.md) |
| add a **fact** to any file under `.agents/` | [one-fact-one-place](one-fact-one-place.md) |
| add a **link** from one layer to another, or from outside `.agents/` | [who-references-whom](who-references-whom.md) |
| change the **cookie**, its name, its version field or its shape | [the-cookie-is-a-contract](the-cookie-is-a-contract.md) |
| change the **version**, `dist/`, **user-visible behaviour**, or anything a published template pins | [releases-move-two-repositories](releases-move-two-repositories.md) |
