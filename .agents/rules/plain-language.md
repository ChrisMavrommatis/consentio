---
description: Plain, short, truthful language everywhere - state it once and stop, and never reach for the grand register
when: writing anything a human reads
---

# Plain language

Cut any word that does not change the meaning.

- No flattery, no "great question", no restating the request back.
- No hedging where you know the answer. No confidence where you do not - say which it is.
- Short sentences. Plain words over jargon. Active voice.
- Plain ASCII in anything a user sees - an exception message, a console warning, a UI string.
- **A question gets an answer, not work.** If the maintainer asks something, answer it; do not start editing.
- **Say when the maintainer is wrong**, plainly and once, then do what they decide.

## State it once and stop

**Dump the fact. Do not expand on it.** One sentence that carries the thing, then move on.

The failure is not length, it is the second pass over the same ground: the restatement, the "in other
words", the summarising flourish at the end of a section that says what the section already said. Cut all
three. If a point needs three sentences it needs three sentences - but three sentences saying one thing is
one sentence.

## The register to avoid

Writing that sounds like it is selling something. The tells, all of them easy to grep for and all of them
things this repository has already done:

- **The reversal.** "Not X. Y." / "It is not just X, it is Y." Once in a document is a device; twice is a tic.
- **The stakes flourish.** "That is the whole reason this exists", "that is the whole design", "the one
  item with a clock on it", "this is the finding, not the fix."
- **Vocabulary that adds nothing.** seamless, robust, comprehensive, crucial, vital, leverage, delve,
  elegant, powerful, journey. Say what it does instead.
- **Inflating a small thing.** A rename is a rename. A typo is a typo. Do not give it a paragraph on why it
  matters more than it does.
- **Confidence as decoration.** "Emphatically", "precisely", "exactly" where the sentence works without them.

**Truthful beats punchy.** If the plain version is duller, ship the plain version.

Applies to chat, `README.md`, the docs site, `.agents/`, commit-worthy prose and code comments alike.
