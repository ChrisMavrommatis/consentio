import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioState from '../../../src/lib/state.js';
import Cookies from '../../../src/lib/cookies.js';
import { CATEGORIES, clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('updateState persists the choice and marks consent as given', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.updateState({ ...state.consents, statistics_performance: 'granted' });
	assert.equal(state.consentGiven, true);

	const reloaded = new ConsentioState('consentio', 1, CATEGORIES);
	assert.equal(reloaded.consentGiven, true);
	assert.equal(reloaded.consents.statistics_performance, 'granted');
});

test('acceptAll grants every category and persists', () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.acceptAll();
	assert.deepEqual(state.consents, {
		strictly_necessary: 'granted',
		statistics_performance: 'granted',
		marketing_advertising: 'granted'
	});
	assert.equal(new ConsentioState('consentio', 1, CATEGORIES).consents.marketing_advertising, 'granted');
});

test('the version is written into the cookie but kept out of the consents', () => {
	new ConsentioState('consentio', 1, CATEGORIES).acceptAll();
	assert.match(Cookies.get('consentio')!, /"version":1/);
	assert.ok(!('version' in new ConsentioState('consentio', 1, CATEGORIES).consents));
});

test('the cookie name is honoured, so two banners can coexist', () => {
	new ConsentioState('other-name', 1, CATEGORIES).acceptAll();
	assert.ok(Cookies.get('other-name'));
	assert.equal(Cookies.get('consentio'), undefined);
});
