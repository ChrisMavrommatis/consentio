// What fails when a translation drifts from i18n/en.yaml.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import english from '../../i18n/en.yaml';
import Consentio from '../../src/consentio.js';

const SCRIPT = new URL('../../scripts/i18n.mjs', import.meta.url).pathname;

const CATEGORY_KEYS = [
	'strictly_necessary',
	'preferences_functionality',
	'statistics_performance',
	'marketing_advertising'
];

test('every language file is complete and carries no blanks', () => {
	// --check names the file and key it is unhappy about, so its output is the diagnosis.
	const output = execFileSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' });
	assert.match(output, /are complete/);
});

test('there is more than English to check', () => {
	const output = execFileSync(process.execPath, [SCRIPT, '--check'], { encoding: 'utf8' });
	const count = Number(/i18n: (\d+) languages/.exec(output)?.[1]);
	assert.ok(count > 1, 'en.yaml on its own proves nothing about the check above');
});

test('the banner takes its wording from en.yaml', () => {
	assert.deepEqual(Consentio._defaultLanguage.texts, english.texts);
});

test('the four fixed categories are the ones the packs carry', () => {
	assert.deepEqual(Object.keys(Consentio._defaultSettings.consents), CATEGORY_KEYS);
	assert.deepEqual(Object.keys(english.consents).sort(), [...CATEGORY_KEYS].sort());
});

test('a category takes its copy from en.yaml and its behaviour from the settings', () => {
	const resolved = Consentio.resolve(Consentio._defaultSettings, Consentio._defaultLanguage);
	const necessary = resolved.consents.find((c) => c.key === 'strictly_necessary')!;
	assert.equal(necessary.title, english.consents.strictly_necessary.title);
	assert.equal(necessary.description, english.consents.strictly_necessary.description);
	// Behaviour, not words, so no pack can reach them.
	assert.equal(necessary.alwaysOn, true);
	assert.equal(necessary.defaultState, 'granted');
});

// --- defect 34 -------------------------------------------------------------
//
// The emitted pack is the parsed yaml with nothing done to it, so the file the loader
// fetches and the file the tag's variable reads are the same file.

test('issue 34 - the emitted pack is the language file itself', () => {
	execFileSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
	for (const name of ['en', 'el']) {
		const source = parse(readFileSync(new URL(`../../i18n/${name}.yaml`, import.meta.url), 'utf8'));
		const emitted = JSON.parse(readFileSync(new URL(`../../build/i18n/${name}.json`, import.meta.url), 'utf8'));
		assert.deepEqual(emitted, source, `build/i18n/${name}.json is not i18n/${name}.yaml`);
	}
});

test('issue 34 - the pack says which language it is, and the banner can read it', () => {
	const emitted = JSON.parse(readFileSync(new URL('../../build/i18n/el.json', import.meta.url), 'utf8'));
	assert.equal(emitted.locale, 'el');
	assert.equal(typeof emitted.name, 'string');
	const resolved = Consentio.resolve(Consentio._defaultSettings, Consentio.mergeLanguage(Consentio._defaultLanguage, emitted));
	assert.equal(resolved.locale, 'el');
	assert.equal(resolved.texts.barTitle, emitted.texts.barTitle);
	assert.equal(resolved.consents[0].title, emitted.consents.strictly_necessary.title);
});

// --- the two script forms ----------------------------------------------------------
//
// The tag route cannot fetch, so the pack also ships as a script assigning one global, and
// as a Custom JavaScript variable to paste. Both are the json and nothing else.

test('the script form assigns the pack, unchanged, to the one global', () => {
	execFileSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
	for (const name of ['en', 'el']) {
		const json = JSON.parse(readFileSync(new URL(`../../build/i18n/${name}.json`, import.meta.url), 'utf8'));
		const script = readFileSync(new URL(`../../build/i18n/${name}.js`, import.meta.url), 'utf8');
		const scope: Record<string, unknown> = {};
		new Function('globalThis', script)(scope);
		assert.deepEqual(Object.keys(scope), ['ConsentioLanguage'], `build/i18n/${name}.js sets more than the one global`);
		assert.deepEqual(scope.ConsentioLanguage, json);
	}
});

test('the paste-in form is a function returning the pack, unchanged', () => {
	for (const name of ['en', 'el']) {
		const json = JSON.parse(readFileSync(new URL(`../../build/i18n/${name}.json`, import.meta.url), 'utf8'));
		const snippet = readFileSync(new URL(`../../build/i18n/${name}.gtm.js`, import.meta.url), 'utf8');
		assert.match(snippet, /^function \(\) \{\n/, 'a Custom JavaScript variable is an anonymous function');
		const variable = new Function(`return (${snippet});`)() as () => unknown;
		assert.deepEqual(variable(), json);
	}
});
