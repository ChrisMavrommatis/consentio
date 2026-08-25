import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioState from '../../../src/lib/state.js';
import type { ConsentCategory } from '../../../src/types.js';
import { CATEGORIES, clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('with no stored cookie, consent has not been given', () => {
	assert.equal(new ConsentioState('consentio', 1, CATEGORIES).consentGiven, false);
});

test('with no stored cookie, every category falls back to its default state', () => {
	assert.deepEqual(new ConsentioState('consentio', 1, CATEGORIES).consents, {
		strictly_necessary: 'granted',
		statistics_performance: 'denied',
		marketing_advertising: 'denied'
	});
});

test('an alwaysOn category is granted even if its defaultState says otherwise', () => {
	const categories: ConsentCategory[] = [
		{ key: 'k', title: '', description: '', alwaysOn: true, defaultState: 'denied' }
	];
	assert.equal(new ConsentioState('consentio', 1, categories).consents.k, 'granted');
});

test('an empty category list yields an empty consent record', () => {
	assert.deepEqual(new ConsentioState('consentio', 1, []).consents, {});
});
