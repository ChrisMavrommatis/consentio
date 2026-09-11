// What fails when a part stops composing: bad JSON, or a $text naming a string that is
// not in i18n/en.yaml. The .tpl is built, so there is no committed file to compare against.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

const SCRIPT = new URL('../../scripts/gtm.mjs', import.meta.url).pathname;
const ROOT = new URL('../../', import.meta.url);
const VERSION = JSON.parse(readFileSync(new URL('package.json', ROOT), 'utf8')).version as string;

test('every template composes from its parts', () => {
	const output = execFileSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' });
	assert.match(output, /templates compose/);
});

// --- the tag route's language pack ----------------------------------------------------
//
// The composed tag names the pack beside the bundle at one version, and lists every
// language file as a choice, so neither is typed anywhere.

function composedTag(): string {
	execFileSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
	return readFileSync(new URL('build/consentio-tag.tpl', ROOT), 'utf8');
}

test('the composed tag carries no placeholder and pins the pack to the release it ships in', () => {
	const tpl = composedTag();
	assert.doesNotMatch(tpl, /__VERSION__/);
	assert.ok(tpl.includes(`consentio@${VERSION}/dist/consentio.min.js`), 'the bundle is not pinned to package.json');
	assert.ok(tpl.includes(`consentio@${VERSION}/dist/i18n/`), 'the pack is not pinned to package.json');
	assert.equal(new Set(tpl.match(/consentio@[0-9.]+/g)).size, 1, 'the bundle and the pack pin different versions');
});

test('the locale picker lists every language file and nothing else', () => {
	const tpl = composedTag();
	const locales = readdirSync(new URL('i18n/', ROOT)).filter((f) => f.endsWith('.yaml'))
		.map((f) => parse(readFileSync(new URL(`i18n/${f}`, ROOT), 'utf8')).locale as string).sort();
	const picker = /"name": "textsPack",[\s\S]*?"selectItems": (\[[\s\S]*?\])/.exec(tpl)?.[1];
	assert.ok(picker, 'the tag has no textsPack picker');
	const listed = (JSON.parse(picker) as { value: string }[]).map((item) => item.value).sort();
	assert.deepEqual(listed, locales);
});

test('the pack picker is only shown for the pack source, and builtin stays the default', () => {
	const tpl = composedTag();
	assert.match(tpl, /"name": "textSource",[\s\S]*?"defaultValue": "builtin"/);
	assert.match(tpl, /"name": "textsPack",[\s\S]*?"paramName": "textSource",\s*"paramValue": "pack"/);
});

test('issue 49 - the tag reads ConsentioDefault and declares it, read-only', () => {
	const code = readFileSync(new URL('gtm/consentio-tag/src/sandbox.js', ROOT), 'utf8');
	const permissions = readFileSync(new URL('gtm/consentio-tag/src/permissions.json', ROOT), 'utf8');
	const tests = readFileSync(new URL('gtm/consentio-tag/src/tests.yaml', ROOT), 'utf8');
	assert.match(code, /copyFromWindow\('ConsentioDefault'\)/);
	assert.ok(permissions.includes('"ConsentioDefault"'), 'permissions.json does not name ConsentioDefault');
	assert.ok(permissions.includes('"ConsentioLanguage"'), 'permissions.json does not name ConsentioLanguage');
	assert.match(tests, /ConsentioDefault[\s\S]*?assertApi\('injectScript'\)\.wasNotCalled\(\)/);
});
