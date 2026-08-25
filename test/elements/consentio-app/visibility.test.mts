import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot();

const shown = (el: HTMLElement | null) => el!.style.display !== 'none';

test('on a first visit the bar is the only thing showing', () => {
	assert.equal(shown(app.bar), true);
	assert.equal(shown(app.modal), false);
	assert.equal(shown(app.floatingButton), false);
	assert.equal(shown(app.required), false);
});

test('opening the settings swaps the bar for the modal', () => {
	app.openSettings(new CustomEvent('consentio:open-settings'));
	assert.equal(shown(app.modal), true);
	assert.equal(shown(app.bar), false);
	assert.equal(shown(app.floatingButton), false);
});

test('cancelling before a choice is made returns to the bar', () => {
	app.cancelSettings(new CustomEvent('consentio:cancel-settings'));
	assert.equal(shown(app.modal), false);
	assert.equal(shown(app.bar), true);
});

test('the app renders one consent item per configured category', () => {
	assert.equal(app.consentItems.length, app.config.consents.length);
	assert.deepEqual(app.consentItems.map((item) => item.id), app.config.consents.map((c) => c.key));
});

test('the shadow root is closed, so the page cannot reach in through the element', () => {
	assert.equal(app.shadowRoot, null);
});
