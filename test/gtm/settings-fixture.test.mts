import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * The banner's half of this is test/consentio/settings-fixture.test.mts. Only the tag
 * manager runs the template, so all that can be checked from here is that its own tests
 * carry the fixture's values rather than values that merely happen to agree.
 */

const root = new URL('../../', import.meta.url);
const fixture = JSON.parse(readFileSync(new URL('gtm/settings.fixture.json', root), 'utf8')) as {
	language: { locale: string; policyUrl: string; texts: Record<string, string>; consents: Record<string, { title: string; description: string }> };
	expected: { policyUrl: { value: string; whenPackIsBlank: string } };
};

const code = readFileSync(new URL('gtm/consentio-tag/src/sandbox.js', root), 'utf8');
const tests = readFileSync(new URL('gtm/consentio-tag/src/tests.yaml', root), 'utf8');

// The template's tests keep the Greek escaped so the composed .tpl stays ascii.
const written = tests.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

test('the template reads a language pack under texts and consents, not flat - issue 34', () => {
	assert.match(code, /packTexts\[key\]/, 'the words are under texts');
	assert.match(code, /const words = packConsents\[key\];/, 'the categories are keyed under consents');
});

test("the template's own tests carry the fixture's pack", () => {
	for (const value of [
		fixture.language.texts.barTitle,
		fixture.language.consents.strictly_necessary.title,
		fixture.language.consents.strictly_necessary.description,
		fixture.expected.policyUrl.value
	]) {
		assert.ok(written.includes(value), `gtm/consentio-tag/src/tests.yaml no longer carries "${value}"`);
	}
});

test("the template's own tests cover all three ways a pack can name an address", () => {
	assert.match(tests, /pack\('\/el\/privacy\/'\)/, 'a pack that names its own address');
	assert.match(tests, /pack\(undefined\)/, 'a pack with no address key, which falls back to the field');
	assert.match(tests, /pack\(''\)/, 'a blank address, which means no link in that language');
});
