---
name: the-layout-is-deliberately-flat
description: gtm/ sits at the repository root, there is no packages/ and no src/index.ts - each was considered during the 24 Aug 2026 restructure and rejected
when: proposing a monorepo tool, a packages/ directory, a workspace, or a barrel export
paths: ["package.json", "webpack.config.js", "gtm/**", "src/**"]
---

The 24 Aug 2026 restructure moved `docs/` to `website/`, split the two build outputs and deleted `config/`.
It looked at three further changes and **took none of them**, for reasons that have not changed:

- **`gtm/` stays at the repository root.** A `packages/` directory implies a workspace tool. There is one
  webpack config and no workspaces, so `packages/` holding one real package adds a directory level and buys
  nothing.
- **No monorepo tooling.** A workspace tool would become the largest dependency in the repository, added to
  manage four folders. `../design/delivery.md` rules out a framework, a bundler change or a dependency, and
  a consent banner with no runtime dependencies is a feature.
- **No `src/index.ts` barrel.** This ships as a script, not a package. A barrel exists for import ergonomics
  that do not apply here.

**Also settled there:** `src/lib`, `src/elements`, `src/templates` and `src/scss` are already a clean split -
the TypeScript port paid for it - and nothing under `src/` moved.

**How to apply:** if a session proposes any of these, the answer is no unless what makes it wrong has changed
- a second package, a second build config, or an actual import consumer.
