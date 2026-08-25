import test from 'node:test';
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';

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

// --- defect 28 -------------------------------------------------------------
//
// The four categories are fixed. Until 25 Aug 2026 an unrecognised key was appended, so
// a site could invent a fifth category that no Google signal was ever routed to.

test('issue 28 - a category the defaults do not have is refused, not appended', () => {
	const extra: ConsentCategoryOverride = { key: 'site_specific', title: 'Ours', description: '', alwaysOn: false, defaultState: 'denied' };
	const merged = Consentio.mergeConsents(DEFAULTS, [extra]);
	assert.deepEqual(keys(merged), keys(DEFAULTS), 'a fifth category can never reach a Google signal');
});

test('issue 28 - refusing a category says so rather than failing silently', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	Consentio.mergeConsents(DEFAULTS, [{ key: 'site_specific', title: 'Ours' }], logger);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /site_specific/);
});

test('issue 28 - the rest of a config carrying an unknown key still applies', () => {
	const merged = Consentio.mergeConsents(DEFAULTS, [
		{ key: 'site_specific', title: 'Ours' },
		{ key: 'marketing_advertising', title: 'Ads' }
	]);
	assert.equal(merged.find((category) => category.key === 'marketing_advertising')!.title, 'Ads');
});

test('issue 28 - a banner is still built from a config carrying an unknown key', () => {
	assert.doesNotThrow(() => new Consentio({ consents: [{ key: 'site_specific', title: 'Ours' }] }, [], null));
});

test('issue 28 - a category cannot re-point a Google signal', () => {
	// `signals` is gone from the type, so this is the config a site would still be able to
	// write by hand. It has to be ignored rather than routed.
	const merged = Consentio.mergeConsents(DEFAULTS, [
		{ key: 'statistics_performance', signals: ['security_storage'] } as ConsentCategoryOverride
	]);
	const statistics = merged.find((category) => category.key === 'statistics_performance')! as unknown as Record<string, unknown>;
	assert.equal(statistics.signals, undefined, 'a site that re-points a category has made its name lie');
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

test('issue 20 - the version comes from package.json and nowhere else', () => {
	const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { version: string };
	assert.equal(Consentio.version, pkg.version);

	// The substitution only helps while nothing writes a literal back in. A version-shaped
	// literal anywhere in src/ means there is a second source again.
	const sources = globSync('src/**/*.ts');
	const offenders = sources.filter((file) => /['"`]\d+\.\d+\.\d+/.test(readFileSync(file, 'utf8')));
	assert.deepEqual(offenders, [], 'the version belongs in package.json only');
});
