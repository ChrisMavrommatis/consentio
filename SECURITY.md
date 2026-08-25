# Security

Consentio is a script other people put in the `<head>` of their site. This page says how to report a
problem with it, and what "supported" can honestly mean for something that ships from git tags.

## 🔒 Reporting a vulnerability

**Use GitHub's private vulnerability reporting** — the *Report a vulnerability* button under the
repository's **Security** tab. That opens a private advisory only the maintainer can read.

**Do not open a public issue for a vulnerability.** A public issue is a working exploit note for every
site that has the script installed, including the ones that will not update this week.

Include the version or tag you are on, the route you installed by — the direct `<script>` or the tag
manager template — and the smallest page that shows the problem.

One maintainer works on this, so there is no response-time promise. You will get an acknowledgement, and
if the report holds, a fix in a new tag and credit in the advisory unless you ask otherwise.

## 🔢 What is supported

**The newest tag, and nothing else.** Consentio is not published to a package registry; it ships as built
files in a git tag, and a CDN serves those exact bytes.

**An old tag is never patched in place.** It cannot be. The tag is a commit, jsDelivr and every other CDN
mirror serve the tree at that commit, and rewriting it would change files under sites that pinned it
deliberately. **The remedy for any fault, security or not, is a new tag** — and then you move your pin to
it.

So there is no supported-versions table with a green row and a red row. There is the newest tag, which is
where fixes go, and every older tag, which stays exactly as it was published.

## ⚠️ Pin an exact version

**Pin a version, never a branch and never a floating major.** A floating URL means the CDN can hand your
visitors different bytes tomorrow than it handed them today, with no change on your side and no way to
review what moved.

```html
<!-- an exact tag -->
<script src="https://cdn.jsdelivr.net/gh/ChrisMavrommatis/consentio@0.1.0/dist/consentio-loader.min.js"></script>
```

The same applies to the tag manager template: it pins the banner version in its own CDN URL, so the
template moves with the tag rather than drifting behind it.

## 🧩 What the script can reach

Worth knowing before you decide whether this belongs in your `<head>`:

- **Nothing to install.** There are no runtime dependencies, so nothing is pulled in when you use it. One
  file is adapted third-party code and travels inside the bundle: the cookie reader is derived from
  [js-cookie](https://github.com/js-cookie/js-cookie) v3.0.1, rewritten in TypeScript. The bundle carries
  that attribution in its banner.
- **It writes one cookie**, `consentio` by default, holding the visitor's own answer. Nothing else is
  stored.
- **It pushes to `dataLayer`** — Google Consent Mode signals, and nothing that identifies anybody.
- **Its only network requests are the ones you configure**: the direct route fetches the two JSON files
  whose URLs you give it, and the tag manager template fetches the banner bundle from the CDN URL pinned
  in the template. There is no telemetry, no analytics and no call home.

## 🚫 Not a vulnerability

These are known and documented, and a report about them will be closed as such:

- **The loader blocks.** It has to. A consent default pushed after the tag manager has read consent gates
  nothing, so the script tag carries no `async` and no `defer`.
- **The tag manager route only covers that container.** A template can gate what the container loads and
  nothing else. Anything pasted straight into the page fires regardless of the answer.
- **A known bug in an already-published tag.** It stays there. See *What is supported* above.

## 📄 Licence

[Apache-2.0](LICENSE), which includes its disclaimer of warranty.
