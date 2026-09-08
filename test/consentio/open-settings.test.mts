// The page's supported way back into the panel: one method on the instance, so a footer
// link never has to know the element's name or its events. Issue 40.
import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

const instance = new Consentio({}, [], null);
const app = instance.el!;

const shown = (el: HTMLElement | null) => el!.style.display !== 'none';

test('issue 40 - the instance opens the panel for a visitor who has not answered', () => {
	instance.openSettings();
	assert.equal(shown(app.modal), true);
	assert.equal(shown(app.bar), false);
});

test('issue 40 - a second call leaves one panel and does not drag focus back to the top', () => {
	const controls = app._focus.focusable(app.modal!);
	const last = controls[controls.length - 1]!;
	last.focus();

	instance.openSettings();

	assert.equal(shown(app.modal), true);
	assert.equal(app._focus.activeElement, last, 'the trap was not re-entered');
	assert.equal(app._focus.container, app.modal, 'and it still holds Tab');
});

test('issue 40 - it works for a visitor who answered on an earlier visit', () => {
	app.cancelSettings(new CustomEvent('consentio:cancel-settings'));
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));
	assert.equal(shown(app.floatingButton), true, 'precondition: the banner is out of the way');

	instance.openSettings();

	assert.equal(shown(app.modal), true);
	assert.equal(shown(app.floatingButton), false);
});
