import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { boot } from '../../helpers.mjs';

// The stored choice has to exist before the element is constructed, so it is written
// at module scope rather than in a hook.
Cookies.set('consentio', JSON.stringify({
	version: 1,
	strictly_necessary: 'granted',
	preferences_functionality: 'granted',
	statistics_performance: 'denied',
	marketing_advertising: 'denied'
}));

const app = boot();

test('a returning visitor sees the floating button, not the bar', () => {
	assert.equal(app.floatingButton!.style.display, 'block');
	assert.equal(app.bar!.style.display, 'none');
});

test('the stored choice is reflected in the switches', () => {
	const byKey = new Map(app.consentItems.map((item) => [item.id, item]));
	assert.equal(byKey.get('preferences_functionality')!.input!.checked, true);
	assert.equal(byKey.get('marketing_advertising')!.input!.checked, false);
});
