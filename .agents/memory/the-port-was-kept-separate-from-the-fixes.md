---
name: the-port-was-kept-separate-from-the-fixes
description: The TypeScript port deliberately preserved every defect, which is the only reason the bundle diff could prove it changed nothing
when: planning a large mechanical change across many files, or wondering why the port did not fix anything on the way through
paths: ["src/**"]
---

The port to TypeScript touched every source file. The bug fixes touch nearly the same set. **Merged, you
cannot tell a bug fix from a syntax change, nor a bug introduced by the port from either.**

So the port fixed nothing. It preserved every defect deliberately, which bought one strong check: build the
ported tree and the pre-port tree and diff the output. It came out byte-identical - see
[the-build-was-reproducible-once](the-build-was-reproducible-once.md).

**Why it is worth remembering:** that check only exists if the mechanical change changes nothing else. The
temptation on a big rename or a big move is to fix the obvious thing while you are in there. Doing so costs
the only cheap proof that the move was safe.

**A second thing that pass settled:** TypeScript would not have caught these bugs anyway.
`disconectedCallback` is a valid method name, `essential_storage` is a valid object key, and re-binding
inside `removeEventListener` is type-correct. They are semantic, not type errors. Where types **do** pay is
defect 5 - typing `toGoogleSignals` as `Record<GoogleSignal, ConsentState>` turns a silent production bug
into a compile error, and that was checked by deleting a line and watching the build fail.
