---
description: Make the banner usable from a keyboard and a screen reader - roles, names, focus and Escape. Defects 14 and 15
state: ready
waits-on: nothing. Plan 3 has run, which changes two things below
---

# 4 - accessibility

Read [../design/issues.md](../design/issues.md) for the register. **Defects 14 and 15.** It touches the HTML
templates, the two element classes and adds one module.

**The register carries every `file:line`; this plan carries none** - see
[../rules/one-fact-one-place.md](../rules/one-fact-one-place.md).

## What

Roles, accessible names, focus management and keyboard operation. Not a redesign.

## Why

**This is not optional and it is not about any law.** With `consentRequired: true` the overlay is a
full-screen `position: fixed` block with no keyboard way out - a keyboard user cannot answer the banner and
cannot reach the page behind it. For a compliance tool that is the wrong thing to ship.

And `website/data/consentio-config.json` sets `consentRequired: true`, so **the docs site demonstrates the worst
case to everyone who visits it.**

## Direction

**What is missing, checked against the source rather than assumed:**

- No `role="dialog"`, no `aria-modal`, no `aria-labelledby` on `consentio-modal`.
- **No accessible name on any switch.** `consentio-consent-item.html` wraps the checkbox in a `<label>`
  that carries no text, so every category checkbox is unnamed. Associate each one with its `<h5>` title.
- `consentio-modal.html` uses `<a class="button-flat">` with **no `href`** for both footer controls. Neither
  save nor cancel is focusable or keyboard-activatable. They should be `<button type="button">`.
- No focus trap, no focus restore, no Escape.
- **Defect 15** - `consentio-consent-item.ts` binds `click` on the whole host and the switch sits inside it,
  so toggling a category also expands its description. Bind the toggle to the header, give it
  `role="button"`, `tabindex="0"` and `aria-expanded`, and keep switch clicks out of it.

**The closed shadow root will bite you.** `consentio-app.ts` attaches with `{ mode: 'closed' }`, so
`document.activeElement` returns the **host** element, not the focused node. Use the shadow root's own
`activeElement` for anything focus-related, and write a test that would fail if someone switches it back.

**The modal is not the only blocking surface.** With `consentRequired: true` the **bar** blocks the page too,
and focus sits on `<body>` behind an overlay the keyboard cannot reach. Whichever surface is blocking should
hold focus, and Escape from the modal should return to the bar rather than doing nothing.

**Defect 23 overlaps.** `render()` clears the switch label to write the "Always On" text, which is also where
the accessible name has to go. **Defect 23 is fixed**: `render()` now keeps the input and replaces the rest
of the label, so the name has somewhere to go that survives. Do not undo that while adding it.

## Do not

**Do not rewrite or restyle the UI.** This is roles, names, focus and keyboard - not a redesign. Do not
change what the components do, only how they are reached. **Do not touch any other defect.** **Do not bump
the version.** **Do not write `dist/`.** **Do not commit, stage or push.**

## Deliverables

- [ ] The `todo` flags for defects 14 and 15 are gone and those tests pass.
      `npm test` green, with the todo count down by 12 - ten for defect 14 and two for 15.
- [ ] The modal is a dialog with a name.
      `role="dialog"`, `aria-modal="true"` and a working `aria-labelledby`.
- [ ] Every category switch has an accessible name.
      **By eye in the browser's accessibility tree** - no checkbox reads as unnamed, including the
      `alwaysOn` one.
- [ ] Both modal footer controls are reachable from the keyboard.
      They are `<button type="button">`, not `<a>` without `href`.
- [ ] The page can be answered and escaped from the keyboard alone.
      With `consentRequired: true`: Tab cycles inside the blocking surface and never reaches the page behind
      it, and Escape from the modal returns to the bar. **Unplug the mouse and do it.**
- [ ] Toggling a category no longer expands its description.
      Click a switch. The body stays shut. That is defect 15.
- [ ] Focus handling copes with the closed shadow root.
      The code reads the shadow root's own `activeElement`, never `document.activeElement`, and a test
      covers it.
- [ ] Nothing was restyled.
      `git diff src/scss/` is empty, or every line in it is a focus ring.
- [ ] `git status --porcelain dist/` is empty.
