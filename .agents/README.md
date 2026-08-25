# .agents - guidance for agents working in this repository

Everything an agent needs that is not code lives here, versioned with the project so it is shared and
reviewable. Read this first to know where things are.

## Layout

| Path | What it is | When to use it |
|---|---|---|
| `rules/` | **Every standing rule, one file per rule.** | Read `rules/README.md` at the start of any task that writes something. Match the trigger, open that one file. |
| `design/` | **Why Consentio is built and shipped the way it is**, plus the numbered defect register. Permanent; it can change as the reasoning does. | Before any change to how the banner loads, what it stores, or how it ships. |
| `relaunch.md` | **The board.** The order the plans are worked in, what gates what, and where it stands. | Start here. It says which plan is next and why. |
| `next-directions.md` | What the next sitting should do, and the decisions waiting on the maintainer. Does not repeat the board. | After the board, when picking up cold. |
| `plans/` | Work not yet done. Each declares its `state:`. | Pick the next one off the board. Delete it once its work has landed. |
| `memory/` | Durable "why" with no home in a design record or a plan - gotchas and conventions. One fact per file. | Scan the filenames at session start. |

There is **no documentation layer here.** `website/` at the repository root is the published site a user
reads. Agent-facing reference is `design/`.

## How the layers differ

- **design = why + evidence.** Why the loader blocks, why there are two install routes that cannot share
  code, what the cookie contract is, and every defect found by reading the source. It holds reasoning and
  history; `README.md` and `website/` hold what a user needs.
- **plans = what is not done yet.** When a plan's work has landed, delete it. A plan and a shipped feature
  should never describe the same thing.
- **memory = the leftover why.** Not behaviour (that is `website/`), not future work (that is `plans/`).

## The bar this repository is under

**It is public.** Nothing here may carry pricing, revenue, a competitor, a visitor number, or which other
project pays for this one. If a file needs one of those to make sense, stop and ask the maintainer - do not
write it and do not write around it. `rules/the-public-bar.md` is the whole of it.

## Front matter

Every file under `.agents/` carries at least a one-line `description:`, so what it is can be decided without
opening it. Rules add `when:`. Plans add `state:` and `waits-on:`.

There is no generated index. There are few enough files that the READMEs are the index; if that stops being
true, generate one then.
