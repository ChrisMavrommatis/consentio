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
	settings: Record<string, unknown>;
	language: { locale: string; policyUrl: string; texts: Record<string, string>; consents: Record<string, { title: string; description: string }> };
	expected: {
		policyUrl: { value: string; whenPackIsBlank: string };
		cookie: { lifetime: number; shared: boolean };
	};
};

const code = readFileSync(new URL('gtm/consentio-tag/src/sandbox.js', root), 'utf8');
const tests = readFileSync(new URL('gtm/consentio-tag/src/tests.yaml', root), 'utf8');

// The template's tests keep the Greek escaped so the composed .tpl stays ascii.
const written = tests.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, 16)));

test('the template reads all three inputs through one reader and calls Create with three objects - issue 34', () => {
	assert.match(code, /readObject\(data\.settings, SETTINGS_GLOBAL/, 'the settings picker goes through the reader');
	assert.match(code, /readObject\(fromVariable \? data\.languageVariable : 'none', PACK_GLOBAL/, 'the language variable goes through the reader, and None reads the page');
	assert.match(code, /readInput\(data\.cookies, COOKIES_GLOBAL\)/, 'the cookie table goes through the reader');
	assert.match(code, /callInWindow\('Consentio\.Create', settings, language, cookies\)/, 'three objects, one per concern');
	assert.doesNotMatch(code, /buildSettings|buildLanguage|removeEmptyValues/, 'nothing is composed from fields');
});

test('the template fixes the cookie name and reads the version before the cookie', () => {
	assert.match(code, /settings\.cookieName = COOKIE_NAME;/, 'a settings file cannot rename the cookie the permission names');
	const versionAt = code.indexOf('const version = settings.version === undefined ? 1 : makeNumber(settings.version);');
	const cookieAt = code.indexOf('const storedConsents = readStoredConsents(version);');
	assert.ok(versionAt !== -1 && cookieAt !== -1 && versionAt < cookieAt, 'the version has to be known before the stored answer is judged');
});

test("the template's own tests cover every way each input can arrive", () => {
	assert.match(tests, /the settings as JSON text are parsed/, 'a Constant holding the settings file');
	assert.match(tests, /the settings as an object are sent as they are/, 'a variable returning the settings');
	assert.match(tests, /the settings left at None read the page's own file/, 'window.ConsentioSettings with the picker at None');
	assert.match(tests, /the cookie name is fixed on this route/);
	assert.match(tests, /the version is read from the settings before the cookie/);
	assert.match(tests, /a language pack as JSON text is parsed/, 'a Constant holding a downloaded pack');
	assert.match(tests, /built-in English reads the page's own pack/, 'window.ConsentioLanguage with the picker at Built-in English');
	assert.match(tests, /as JSON text is parsed/, 'a Constant holding the cookie file');
	assert.match(tests, /as an array is sent as it is/, 'a variable returning the rows');
	assert.match(tests, /reads the page's own table/, 'window.ConsentioCookies with the field at None');
	assert.match(tests, /not a JSON array is no table/, 'anything else is no table, and the tag still succeeds');
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

test("the template's own tests carry the fixture's settings object, as the text a Constant holds", () => {
	assert.ok(tests.includes(JSON.stringify(fixture.settings)), 'gtm/consentio-tag/src/tests.yaml no longer carries the settings object byte for byte');
	assert.match(tests, new RegExp(`cookieLifetime\\)\\.isEqualTo\\(${fixture.expected.cookie.lifetime}\\)`));
	assert.ok(tests.includes(`shareAcrossSubdomains).isEqualTo(${fixture.expected.cookie.shared})`));
});
