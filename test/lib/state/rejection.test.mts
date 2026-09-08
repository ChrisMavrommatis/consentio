// What rejectAll has to do that updateState cannot: keep the alwaysOn categories granted.
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioState from '../../../src/lib/state.js';
import { CATEGORIES, clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('rejectAll denies every category the site can turn off', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.rejectAll();
	assert.equal(state.consents.statistics_performance, 'denied');
	assert.equal(state.consents.marketing_advertising, 'denied');
});

test('rejectAll leaves every alwaysOn category granted', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.rejectAll();
	assert.equal(state.consents.strictly_necessary, 'granted');
});

test('rejecting is an answer, so it is stored and not asked again', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.rejectAll();
	assert.equal(state.consentGiven, true);

	const reloaded = new ConsentioState('consentio', 1, CATEGORIES);
	assert.equal(reloaded.consentGiven, true, 'a reject that stores nothing asks the same person again');
	assert.deepEqual(reloaded.consents, {
		strictly_necessary: 'granted',
		statistics_performance: 'denied',
		marketing_advertising: 'denied'
	});
});

test('rejectAll after acceptAll takes the granted ones back', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.acceptAll();
	state.rejectAll();
	assert.equal(state.consents.marketing_advertising, 'denied');
	assert.equal(state.consents.strictly_necessary, 'granted');
});
