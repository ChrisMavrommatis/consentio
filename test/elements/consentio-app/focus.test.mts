import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

// Defect 14 at the app level. consentRequired covers the page with a fixed overlay, so
// whichever surface is showing has to hold the keyboard and Escape has to lead somewhere.
const app = boot({ consentRequired: true });

const key = (name: string, shiftKey = false) =>
	new globalThis.window.KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true, cancelable: true });

test('the blocking bar takes focus, and the closed shadow root keeps it off the document', () => {
	assert.ok(app.bar!.contains(app._focus.activeElement), 'the bar is the only surface a keyboard can reach');
	assert.equal(document.activeElement, app, 'document.activeElement is the host, so it cannot be what the trap reads');
});

test('Tab off the end of the bar wraps rather than reaching the page behind the overlay', () => {
	const controls = app._focus.focusable(app.bar!);
	controls[controls.length - 1]!.focus();

	const event = key('Tab');
	document.dispatchEvent(event);

	assert.equal(app._focus.activeElement, controls[0]);
	assert.equal(event.defaultPrevented, true);
});

test('shift+Tab wraps the other way', () => {
	const controls = app._focus.focusable(app.bar!);
	controls[0]!.focus();

	document.dispatchEvent(key('Tab', true));
	assert.equal(app._focus.activeElement, controls[controls.length - 1]);
});

test('opening the settings hands focus to the modal', () => {
	app.openSettings(new CustomEvent('consentio:open-settings'));
	assert.ok(app.modal!.contains(app._focus.activeElement));
});

test('an alwaysOn switch is not a stop on the way round the modal', () => {
	const alwaysOn = app.consentItems.find((item) => item.alwaysOn !== null)!;
	assert.equal(alwaysOn.input!.disabled, true);
	assert.equal(app._focus.focusable(app.modal!).includes(alwaysOn.input!), false);
});

test('Escape closes the settings and puts focus back on the bar', () => {
	app.dispatchEvent(key('Escape'));

	assert.equal(app.modal!.style.display, 'none');
	assert.equal(app.bar!.style.display, 'block');
	assert.ok(app.bar!.contains(app._focus.activeElement));
});

test('answering swaps the trap for the floating button', () => {
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));

	assert.equal(app._focus.container, null, 'nothing blocks the page once the answer is stored');
	assert.ok(app.floatingButton!.contains(app._focus.activeElement));
});
