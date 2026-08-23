import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { boot, pushes, resetDataLayer } from '../../helpers.mjs';

const app = boot();

test('accepting all grants every category and stores the choice', () => {
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));

	assert.equal(app.state.consentGiven, true);
	assert.ok(Object.values(app.state.consents).every((value) => value === 'granted'));
	assert.match(Cookies.get('consentio')!, /"marketing_advertising":"granted"/);
});

test('accepting all swaps the bar for the floating button', () => {
	assert.equal(app.bar!.style.display, 'none');
	assert.equal(app.floatingButton!.style.display, 'block');
});

test('accepting all ticks every switch', () => {
	assert.ok(app.consentItems.every((item) => item.input!.checked));
});

test('accepting all pushes a consent update', () => {
	const update = pushes().filter((push) => push.action === 'update');
	assert.equal(update.length, 1);
	assert.equal(update[0].payload.ad_storage, 'granted');
});

test('saving a partial choice stores exactly that choice', () => {
	resetDataLayer();
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: {
			strictly_necessary: 'granted',
			preferences_functionality: 'granted',
			statistics_performance: 'denied',
			marketing_advertising: 'denied'
		}
	}));

	assert.equal(app.state.consents.preferences_functionality, 'granted');
	assert.equal(app.state.consents.marketing_advertising, 'denied');
	assert.match(Cookies.get('consentio')!, /"marketing_advertising":"denied"/);
});

test('saving pushes a consent update carrying the new state', () => {
	const [update] = pushes().filter((push) => push.action === 'update');
	assert.equal(update.payload.functionality_storage, 'granted');
	assert.equal(update.payload.ad_storage, 'denied');
});

test('saving closes the modal and leaves the floating button', () => {
	assert.equal(app.modal!.style.display, 'none');
	assert.equal(app.floatingButton!.style.display, 'block');
});
