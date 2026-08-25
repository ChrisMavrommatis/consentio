import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * The consent cookie is read twice - by src/lib/consent-store.ts and by the sandboxed
 * reader inside gtm/consentio-tag/template.tpl - and the two share no code. Both are
 * pointed at gtm/contract.fixture.json instead, and this is what fails when one of them
 * stops pointing there.
 */

const root = new URL('../../', import.meta.url);
const fixture = JSON.parse(readFileSync(new URL('gtm/contract.fixture.json', root), 'utf8')) as {
	cookieName: string;
	baseline: Record<string, string>;
	signalMap: Record<string, string[]>;
	cases: { name: string; cookie: string | null; waitForUpdate: number | null }[];
};

const template = readFileSync(new URL('gtm/consentio-tag/template.tpl', root), 'utf8');
const code = template.split('___SANDBOXED_JS_FOR_WEB_TEMPLATE___')[1].split('___WEB_PERMISSIONS___')[0];
const tests = template.split('___TESTS___')[1].split('___NOTES___')[0];

test('the template reads the cookie the fixture names', () => {
	const name = /const COOKIE_NAME = '([^']+)'/.exec(code)?.[1];
	assert.equal(name, fixture.cookieName);
});

test('the template falls back to the baseline the fixture states', () => {
	const baseline = /const BASELINE_CONSENTS = \{([^}]*)\}/.exec(code)?.[1] ?? '';
	const keys = [...baseline.matchAll(/(\w+):\s*'(\w+)'/g)].map(([, key, value]) => [key, value]);
	assert.deepEqual(Object.fromEntries(keys), fixture.baseline);
});

test('the template maps categories to signals the way the fixture does', () => {
	const map = /const SIGNAL_MAP = \{([\s\S]*?)\n\};/.exec(code)?.[1] ?? '';
	const found: Record<string, string[]> = {};
	for (const [, key, list] of map.matchAll(/(\w+):\s*\[([^\]]*)\]/g)) {
		found[key] = [...list.matchAll(/'([^']+)'/g)].map(([, signal]) => signal);
	}
	assert.deepEqual(found, fixture.signalMap);
});

test('the template waits as long as the fixture says for a first-time visitor', () => {
	const wait = /const WAIT_FOR_UPDATE = (\d+);/.exec(code)?.[1];
	const expected = fixture.cases.find((c) => c.waitForUpdate !== null)?.waitForUpdate;
	assert.equal(Number(wait), expected);
});

for (const scenario of fixture.cases) {
	if (scenario.cookie === null) {
		continue;
	}
	test(`the template's own tests carry the fixture value for ${scenario.name}`, () => {
		assert.ok(
			tests.includes(scenario.cookie!),
			`gtm/consentio-tag/template.tpl no longer tests the value the fixture calls "${scenario.name}"`
		);
	});
}
