---
description: Never commit, stage or push. Every session leaves its work in the working tree for the maintainer to review
when: always
---

# Never commit, stage or push

**Leave every change in the working tree.** No `git add`, no `git commit`, no `git push`, no `git tag`, no
branch switching that would move work out of view.

**Why:** the maintainer reviews by reading `git diff` and `git status`. A session that commits hides its own
work behind a message that nobody wrote carefully, and a session that stages makes the diff harder to read,
not easier.

**`git mv` stages, so it is not a way round this.** Move files with plain `mv`. `git status` then shows the
move as a pile of deletions plus untracked files rather than as renames - **that is correct, and it must be
left alone.** Do not run `git add -A` to make the diff read better.

**No carve-outs.** Not for a "safe" file, not for a revert, not for `dist/`. If a change is so large that
reviewing it whole is hard, say so in chat and describe how it is split - do not split it into commits.

Reading git is fine and often necessary: `git log`, `git diff`, `git show`, `git status`.
