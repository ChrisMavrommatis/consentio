import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioState from '../../../src/lib/state.js';
import Cookies from '../../../src/lib/cookies.js';
import type { ConsentCategory } from '../../../src/types.js';
import { CATEGORIES, clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('a cookie written at another version is discarded', () => {
	new ConsentioState('consentio', 1, CATEGORIES).acceptAll();

	const bumped = new ConsentioState('consentio', 2, CATEGORIES);
	assert.equal(bumped.consentGiven, false);
	assert.equal(bumped.consents.marketing_advertising, 'denied');
});

test('a malformed cookie is discarded rather than thrown on', () => {
	Cookies.set('consentio', 'not json');
	assert.equal(new ConsentioState('consentio', 1, CATEGORIES).consentGiven, false);
});

test('a stale cookie is cleared, not left to shadow the next write', () => {
	Cookies.set('consentio', JSON.stringify({ version: 99, marketing_advertising: 'granted' }));
	assert.equal(new ConsentioState('consentio', 1, CATEGORIES).consentGiven, false);
	assert.equal(Cookies.get('consentio'), undefined);
});

test('issue 18 - a category keyed "version" does not clobber the stored version', () => {
	const categories: ConsentCategory[] = [
		...CATEGORIES,
		{ key: 'version', title: 'V', description: '', alwaysOn: false, defaultState: 'denied' }
	];
	const state = new ConsentioState('consentio', 1, categories);
	state.updateState({ ...state.consents, version: 'granted' });

	const reloaded = new ConsentioState('consentio', 1, categories);
	assert.equal(reloaded.consentGiven, true, 'the stored version was overwritten by the category');
	assert.equal(reloaded.consents.version, 'granted');
});

// Only Consentio can reach this: a site's config cannot name a fifth category, so the
// category set only ever changes here, and changing it is a version bump. Issue 21.
test('issue 21 - a category added at a bumped version reads as its default, not as missing', () => {
	new ConsentioState('consentio', 1, CATEGORIES).acceptAll();

	const withNewCategory: ConsentCategory[] = [
		...CATEGORIES,
		{ key: 'preferences_functionality', title: 'P', description: '', alwaysOn: false, defaultState: 'granted' }
	];
	const state = new ConsentioState('consentio', 2, withNewCategory);

	assert.equal(state.consentGiven, false, 'the answer was given against the old set of categories');
	assert.equal(
		state.consents.preferences_functionality,
		'granted',
		'the new category takes its default rather than reading as missing'
	);
	assert.equal(
		state.consents.marketing_advertising,
		'denied',
		'the accepted answer did not survive the bump it was not stored at'
	);
});
