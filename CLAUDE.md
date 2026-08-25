# CLAUDE.md

All guidance lives in `.agents/`, fetched on demand. This file is the door and stays minimal on purpose.

## Four rules that always apply

- **Never commit, stage or push.** Leave changes in the working tree. The maintainer commits.
- **Never hand-edit `dist/`, and do not rebuild it either.** It is build output *and* it is the shipped
  artifact - a CDN serves those exact files. Only the release owns it. `npm run build` writes straight into
  it today, so run it only to inspect the output and put `dist/` back afterwards.
- **This repository is public.** Nothing in it - code, docs, `.agents/`, a commit message - may carry pricing,
  revenue, a competitor, a visitor number, or which other project pays for this one. Nothing outside
  `.agents/` may point a reader into it. This file is the only exception.
- **Plain, short language everywhere** - chat, docs, comments. Cut any word that does not change the meaning.

## Fetch the rest when it applies

`.agents/rules/README.md` is a trigger table: match what you are about to do, open that one file. Read it
once at the start of any task that writes anything.

Two you will hit early: public markdown carries an icon on every section heading
(`.agents/rules/icon-headings-in-public-docs.md`), and `.agents/` itself never does.

## Where to look

- `.agents/README.md` - the map: what each layer is for.
- `.agents/rules/README.md` - every rule, one line each, indexed by trigger.
- `.agents/design/` - why Consentio is built and shipped the way it is, and the defect register.
- `.agents/relaunch.md` - the board: which plan is next and why.
- `.agents/plans/` - what is not done yet.

Open the file before you work. Do not answer from a vague memory of it.
