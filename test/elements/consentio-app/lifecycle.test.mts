import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot();
const proto = Object.getPrototypeOf(app) as Record<string, ((this: unknown) => void) | undefined>;

test('issue 6 - the app exposes disconnectedCallback, spelled the way the DOM calls it', { todo: true }, () => {
	assert.equal(typeof proto.disconnectedCallback, 'function', 'only the misspelled disconectedCallback exists, so it never fires');
});

test('issue 7 - a disconnected app stops responding to its own events', { todo: true }, () => {
	const teardown = proto.disconnectedCallback ?? proto.disconectedCallback;
	assert.ok(teardown, 'no teardown callback of either spelling');
	teardown.call(app);

	app.dispatchEvent(new CustomEvent('consentio:open-settings'));
	assert.equal(app.modal!.style.display, 'none', 'removeEventListener rebinds, so the listener was never removed');
});
