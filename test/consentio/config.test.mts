import test from 'node:test';
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';

import Consentio from '../../src/consentio.js';
import type { CategorySettings, ConsentioLanguage, ConsentioSettings } from '../../src/types.js';

const SETTINGS = Consentio._defaultSettings;
const LANGUAGE = Consentio._defaultLanguage;

const settingsOf = (supplied: Parameters<typeof Consentio.mergeSettings>[1], logger?: Console): ConsentioSettings =>
	Consentio.mergeSettings(SETTINGS, supplied, logger ?? null);
const languageOf = (supplied: Parameters<typeof Consentio.mergeLanguage>[1], logger?: Console): ConsentioLanguage =>
	Consentio.mergeLanguage(LANGUAGE, supplied, logger ?? null);

test('a language changes only the words it names', () => {
	const merged = languageOf({ consents: { marketing_advertising: { title: 'Ads' } } });
	assert.equal(merged.consents.marketing_advertising.title, 'Ads');
	assert.equal(merged.consents.marketing_advertising.description, LANGUAGE.consents.marketing_advertising.description);
});

test('a settings file changes only the behaviour it names', () => {
	const merged = settingsOf({ consents: { marketing_advertising: { defaultState: 'granted' } } });
	assert.equal(merged.consents.marketing_advertising.defaultState, 'granted');
	assert.equal(merged.consents.statistics_performance.defaultState, 'denied');
	assert.equal(merged.cookieName, SETTINGS.cookieName);
});

test('categories the site says nothing about are untouched', () => {
	const merged = languageOf({ consents: { marketing_advertising: { title: 'Ads' } } });
	assert.deepEqual(merged.consents.strictly_necessary, LANGUAGE.consents.strictly_necessary);
});

// --- defect 28 -------------------------------------------------------------

test('issue 28 - a category the defaults do not have is refused by a language pack', () => {
	const merged = languageOf({ consents: { site_specific: { title: 'Ours' } } });
	assert.deepEqual(Object.keys(merged.consents), Object.keys(LANGUAGE.consents), 'a fifth category can never reach a Google signal');
});

test('issue 28 - a category the defaults do not have is refused by a settings file', () => {
	const merged = settingsOf({ consents: { site_specific: { defaultState: 'granted' } } });
	assert.deepEqual(Object.keys(merged.consents), Object.keys(SETTINGS.consents));
});

test('issue 28 - refusing a category says so rather than failing silently', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	languageOf({ consents: { site_specific: { title: 'Ours' } } }, logger);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /site_specific/);
});

test('issue 28 - the rest of a language carrying an unknown key still applies', () => {
	const merged = languageOf({
		consents: {
			site_specific: { title: 'Ours' },
			marketing_advertising: { title: 'Ads' }
		}
	});
	assert.equal(merged.consents.marketing_advertising.title, 'Ads');
});

test('issue 28 - a banner is still built from a config carrying an unknown key', () => {
	assert.doesNotThrow(() => new Consentio({ consents: { site_specific: { defaultState: 'granted' } } } as never, { consents: { site_specific: { title: 'Ours' } } } as never, [], null));
});

test('issue 28 - a category cannot re-point a Google signal', () => {
	// `signals` is gone from every shape, so this is what a site could still write by hand.
	// It has to be dropped rather than routed.
	const merged = settingsOf({
		consents: { statistics_performance: { signals: ['security_storage'] } as unknown as Partial<CategorySettings> }
	});
	const statistics = merged.consents.statistics_performance as unknown as Record<string, unknown>;
	assert.equal(statistics.signals, undefined, 'a site that re-points a category has made its name lie');
	assert.equal(merged.consents.statistics_performance.defaultState, 'denied');
});

// --- defect 34 -------------------------------------------------------------

test('issue 34 - a resolved category takes its words from one file and its behaviour from the other', () => {
	const settings = settingsOf({ consents: { statistics_performance: { defaultState: 'granted' } } });
	const language = languageOf({ consents: { statistics_performance: { title: 'Στατιστικά' } } });
	const statistics = Consentio.resolve(settings, language).consents.find((c) => c.key === 'statistics_performance')!;
	assert.equal(statistics.title, 'Στατιστικά');
	assert.equal(statistics.defaultState, 'granted');
	assert.equal(statistics.alwaysOn, false);
});

test('issue 34 - alwaysOn is derived, and no file can turn it off', () => {
	const resolved = Consentio.resolve(settingsOf({}), languageOf({}));
	assert.deepEqual(
		resolved.consents.filter((category) => category.alwaysOn).map((category) => category.key),
		['strictly_necessary']
	);
});

test('issue 34 - a blank string is a supplied value, and a missing key is not', () => {
	const merged = languageOf({ texts: { barTitle: '', buttonSave: undefined } });
	assert.equal(merged.texts.barTitle, '', 'blank is what a site asked for');
	assert.equal(merged.texts.buttonSave, LANGUAGE.texts.buttonSave, 'absent is what falls back');
});

// --- defect 37 -------------------------------------------------------------

test('issue 37 - a site address survives the check', () => {
	assert.equal(Consentio.policyUrl('/privacy/'), '/privacy/');
	assert.equal(Consentio.policyUrl('https://example.com/privacy'), 'https://example.com/privacy');
});

test('issue 37 - a scheme that is not an address is dropped', () => {
	assert.equal(Consentio.policyUrl('javascript:alert(1)'), '');
});

test('issue 37 - dropping one says so rather than failing silently', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	Consentio.policyUrl('javascript:alert(1)', logger);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /policy URL/);
});

test('issue 37 - no policy URL is not a mistake, so nothing is logged', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	Consentio.policyUrl('', logger);
	assert.deepEqual(warnings, []);
});

test('issue 37 - the config carries the checked address, not the one supplied', () => {
	const instance = new Consentio({ policyUrl: 'javascript:alert(1)' }, {}, [], null);
	assert.equal(instance.config.policyUrl, '');
});

test('a language that names a policy page wins over the settings', () => {
	const resolved = Consentio.resolve(settingsOf({ policyUrl: '/privacy/' }), languageOf({ policyUrl: '/el/privacy/' }));
	assert.equal(resolved.policyUrl, '/el/privacy/');
});

test('a blank address in a language means no link in that language', () => {
	const resolved = Consentio.resolve(settingsOf({ policyUrl: '/privacy/' }), languageOf({ policyUrl: '' }));
	assert.equal(resolved.policyUrl, '');
});

test('a language that says nothing about it falls back to the settings', () => {
	const resolved = Consentio.resolve(settingsOf({ policyUrl: '/privacy/' }), languageOf({}));
	assert.equal(resolved.policyUrl, '/privacy/');
});

// --- defect 40 -------------------------------------------------------------

test('issue 40 - hiding the floating button says what the site now owes', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	new Consentio({ hideFloatingButton: true }, {}, [], logger);
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /openSettings/);
});

test('issue 40 - leaving it alone is the default and warns about nothing', () => {
	const warnings: string[] = [];
	const logger = { warn: (message: string) => { warnings.push(message); } } as unknown as Console;
	const instance = new Consentio({}, {}, [], logger);
	assert.equal(instance.config.hideFloatingButton, false);
	assert.deepEqual(warnings, []);
});

test('the default order is preserved', () => {
	const resolved = Consentio.resolve(settingsOf({}), languageOf({ consents: { strictly_necessary: { title: 'First' } } }));
	assert.deepEqual(resolved.consents.map((category) => category.key), Object.keys(SETTINGS.consents));
});

test('merging nothing returns the defaults unchanged', () => {
	assert.deepEqual(settingsOf({}), SETTINGS);
	assert.deepEqual(languageOf({}), LANGUAGE);
});

test('the defaults are not mutated by a merge', () => {
	const before = JSON.stringify([SETTINGS, LANGUAGE]);
	settingsOf({ consents: { marketing_advertising: { defaultState: 'granted' } } });
	languageOf({ texts: { barTitle: 'Ours' }, consents: { marketing_advertising: { title: 'Ads' } } });
	assert.equal(JSON.stringify([SETTINGS, LANGUAGE]), before);
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
