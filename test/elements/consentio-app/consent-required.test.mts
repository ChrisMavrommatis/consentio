import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot({ consentRequired: true });

test('consentRequired shows the blocking overlay alongside the bar', () => {
	assert.equal(app.required!.style.display, 'block');
	assert.equal(app.bar!.style.display, 'block');
});

test('the overlay stays up while the settings are open', () => {
	app.openSettings(new CustomEvent('consentio:open-settings'));
	assert.equal(app.required!.style.display, 'block');
});
