import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import Consentio from '../../src/consentio.js';
import type { ConsentCategory, ConsentCategoryOverride } from '../../src/types.js';

const DEFAULTS = Consentio._defaultConfig.consents;

const keys = (categories: ConsentCategory[]) => categories.map((category) => category.key);

test('an override changes only the fields it names', () => {
	const merged = Consentio.mergeConsents(DEFAULTS, [{ key: 'marketing_advertising', title: 'Ads' }]);
	const marketing = merged.find((category) => category.key === 'marketing_advertising')!;
	assert.equal(marketing.title, 'Ads');
	assert.equal(marketing.defaultState, 'denied');
	assert.equal(marketing.alwaysOn, false);
	assert.equal(marketing.description, DEFAULTS[3].description);
});

test('categories the site says nothing about are untouched', () => {
	const merged = Consentio.mergeConsents(DEFAULTS, [{ key: 'marketing_advertising', title: 'Ads' }]);
	assert.deepEqual(merged.find((c) => c.key === 'strictly_necessary'), DEFAULTS[0]);
});

test('a category the defaults do not have is appended', () => {
	const extra: ConsentCategoryOverride = { key: 'site_specific', title: 'Ours', description: '', alwaysOn: false, defaultState: 'denied' };
	const merged = Consentio.mergeConsents(DEFAULTS, [extra]);
	assert.deepEqual(keys(merged), [...keys(DEFAULTS), 'site_specific']);
});

test('the default order is preserved', () => {
	const merged = Consentio.mergeConsents(DEFAULTS, [{ key: 'strictly_necessary', title: 'First' }]);
	assert.deepEqual(keys(merged), keys(DEFAULTS));
});

test('merging nothing returns the defaults unchanged', () => {
	assert.deepEqual(Consentio.mergeConsents(DEFAULTS, []), DEFAULTS);
});

test('the defaults are not mutated by a merge', () => {
	const before = JSON.stringify(DEFAULTS);
	Consentio.mergeConsents(DEFAULTS, [{ key: 'marketing_advertising', title: 'Ads' }]);
	assert.equal(JSON.stringify(DEFAULTS), before);
});

// --- defect 20 -------------------------------------------------------------

test('issue 20 - the hand-written version matches package.json', () => {
	const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
	assert.equal(
		Consentio.version,
		pkg.version,
		'the version is written by hand in two places; this is the only thing keeping them in step'
	);
});
