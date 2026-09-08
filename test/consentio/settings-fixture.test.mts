import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import Consentio from '../../src/consentio.js';
import type { ConsentState, LanguageInput, SettingsInput } from '../../src/types.js';

/**
 * The settings a site supplies are read twice - here, and by the sandboxed tag in
 * gtm/consentio-tag/src/sandbox.js - and the two share no code. Both are pointed at
 * gtm/settings.fixture.json instead, and this is what fails when one of them drifts.
 */

const fixture = JSON.parse(readFileSync(new URL('../../gtm/settings.fixture.json', import.meta.url), 'utf8')) as {
	settings: SettingsInput;
	language: LanguageInput & { note?: string };
	expected: {
		locale: string;
		barTitle: string;
		strictlyNecessaryTitle: string;
		strictlyNecessaryDescription: string;
		buttonSave: { banner: string; tag: null };
		policyUrl: { value: string; whenPackIsBlank: string; whenPackHasNoKey: string };
		consents: { key: string; alwaysOn: boolean; defaultState: ConsentState }[];
	};
};

const resolve = (language: LanguageInput) => Consentio.resolve(
	Consentio.mergeSettings(Consentio._defaultSettings, fixture.settings),
	Consentio.mergeLanguage(Consentio._defaultLanguage, language)
);

const resolved = resolve(fixture.language);

test('the pack the fixture carries is the shape scripts/i18n.mjs emits', () => {
	assert.equal(typeof fixture.language.locale, 'string');
	assert.ok(fixture.language.texts, 'words live under texts');
	assert.ok(fixture.language.consents!.strictly_necessary, 'categories are keyed, not an array');
});

test('the words come from the pack', () => {
	assert.equal(resolved.locale, fixture.expected.locale);
	assert.equal(resolved.texts.barTitle, fixture.expected.barTitle);
	assert.equal(resolved.consents[0].title, fixture.expected.strictlyNecessaryTitle);
	assert.equal(resolved.consents[0].description, fixture.expected.strictlyNecessaryDescription);
});

test('what the pack leaves out falls back to the built-in English', () => {
	assert.equal(resolved.texts.buttonSave, fixture.expected.buttonSave.banner);
});

test('the behaviour comes from the settings, and alwaysOn from neither', () => {
	assert.deepEqual(
		resolved.consents.map((category) => ({
			key: category.key,
			alwaysOn: category.alwaysOn,
			defaultState: category.defaultState
		})),
		fixture.expected.consents
	);
});

test("the pack's policy address wins, blank included, and no key falls back", () => {
	assert.equal(resolved.policyUrl, fixture.expected.policyUrl.value);
	assert.equal(resolve({ ...fixture.language, policyUrl: '' }).policyUrl, fixture.expected.policyUrl.whenPackIsBlank);
	const { policyUrl, ...noAddress } = fixture.language;
	assert.equal(resolve(noAddress).policyUrl, fixture.expected.policyUrl.whenPackHasNoKey);
});
