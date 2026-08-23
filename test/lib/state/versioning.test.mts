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

test('issue 18 - a category keyed "version" does not clobber the stored version', { todo: true }, () => {
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

test('issue 21 - a category added without a version bump reads as its default, not as missing', { todo: true }, () => {
	new ConsentioState('consentio', 1, CATEGORIES).acceptAll();

	const withNewCategory: ConsentCategory[] = [
		...CATEGORIES,
		{ key: 'preferences_functionality', title: 'P', description: '', alwaysOn: false, defaultState: 'granted' }
	];
	assert.equal(
		new ConsentioState('consentio', 1, withNewCategory).consents.preferences_functionality,
		'granted',
		'the new category is absent from the stored cookie, so it silently reads as denied'
	);
});

test('issue 21 - an alwaysOn category added without a version bump is still granted', { todo: true }, () => {
	const state = new ConsentioState('consentio', 1, CATEGORIES);
	state.updateState({ ...state.consents });

	const withNewCategory: ConsentCategory[] = [
		...CATEGORIES,
		{ key: 'essential_extra', title: 'E', description: '', alwaysOn: true, defaultState: 'granted' }
	];
	assert.equal(new ConsentioState('consentio', 1, withNewCategory).consents.essential_extra, 'granted');
});
