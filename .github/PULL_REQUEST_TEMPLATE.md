## 📝 What this changes

<!-- One or two sentences. What behaviour is different afterwards. -->

## 🧪 Checked

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run test:plain`
- [ ] `git status --porcelain dist/` is empty

<!-- Anything checked by hand, in a browser or in a container, goes here. A check nobody
     ran is reported as not run, never as passed. -->

## ⚠️ Anything this touches that costs extra

- [ ] The cookie - its name, its version field or its shape. **Both readers change**, and
      `gtm/contract.fixture.json` with them
- [ ] A tag manager template, which means a gallery review cycle
- [ ] The four consent categories
- [ ] The size of the blocking loader
- [ ] A user-visible change, so `CHANGELOG.md` has an `Unreleased` line for it
- [ ] None of the above

## 🚫 Not in this pull request

- [ ] No `dist/` change. It is written by the release and by nothing else
- [ ] No new runtime dependency
- [ ] No version bump in `package.json`
