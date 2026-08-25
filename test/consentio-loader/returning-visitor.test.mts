import test from 'node:test';
import assert from 'node:assert/strict';

import { writeConsents } from '../../src/lib/consent-store.js';
import { pushes } from '../basics.mjs';

// The stored choice has to exist before the loader evaluates, so it is written at module
// scope rather than in a hook.
document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"></script>';

writeConsents('consentio', 1, {
	strictly_necessary: 'granted',
	preferences_functionality: 'granted',
	statistics_performance: 'denied',
	marketing_advertising: 'denied'
});

test('a stored choice is honoured in the default itself', async () => {
	await import('../../src/consentio-loader.js');
	const { payload } = pushes()[0];
	assert.equal(payload.functionality_storage, 'granted');
	assert.equal(payload.personalization_storage, 'granted');
	assert.equal(payload.analytics_storage, 'denied');
});

test('issue 3 - a returning visitor is not made to wait for a banner that will not appear', () => {
	assert.ok(!('wait_for_update' in pushes()[0].payload), 'they already have their real answer');
});

test('the loader reports that consent was already given', () => {
	assert.equal(window.ConsentioDefault!.consentGiven, true);
});
