---
name: ts-loader-not-esbuild
description: ts-loader was chosen over esbuild-loader because it typechecks during the build, so CI gets the check without a second dependency
when: touching the webpack loader chain, or tempted to swap the TypeScript loader for a faster one
paths: ["webpack.config.js", "package.json", "tsconfig.json"]
---

`ts-loader` typechecks **during** the build. `esbuild-loader` is faster but strips types without checking
them, so it needs a separate `tsc --noEmit` alongside it - two dependencies to do one job.

For a project whose whole build is four webpack entries and no runtime dependencies, the extra seconds are
not worth a second moving part.

**How to apply:** `npm run typecheck` exists as its own script and CI runs it, so the check is not *only*
in the build. If the loader is ever swapped for a stripping one, that script stops being belt-and-braces and
becomes the only typecheck there is - keep it in CI either way.
