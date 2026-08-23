import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

// Defect 14 at the app level. The config the docs site ships sets consentRequired, so
// the demo is the worst case: a full-screen fixed overlay with no keyboard way out.
const app = boot({ consentRequired: true });

test('issue 14 - Escape closes the settings', { todo: true }, () => {
	app.openSettings(new CustomEvent('consentio:open-settings'));
	app.dispatchEvent(new globalThis.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	assert.equal(app.modal!.style.display, 'none', 'nothing listens for a key anywhere in the component');
});

test('issue 14 - the blocking overlay does not trap a keyboard user with no way out', { todo: true }, () => {
	const focusable = app.modal!.querySelectorAll('a[href], button, input, [tabindex]');
	assert.ok(focusable.length > 0, 'with consentRequired the overlay covers the page and nothing inside it can be focused');
});

test('issue 14 - the bar announces itself as a region rather than as anonymous markup', { todo: true }, () => {
	const labelled = app.bar!.getAttribute('role') ?? app.bar!.getAttribute('aria-label');
	assert.ok(labelled, 'the consent bar is unlabelled markup appended to the end of the document');
});
