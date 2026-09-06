// What fails when a translation drifts from i18n/en.yaml.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

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
	assert.deepEqual(Consentio._defaultConfig.texts, english.texts);
});

test('the four fixed categories are the ones the packs carry', () => {
	assert.deepEqual(Consentio._defaultConfig.consents.map((category) => category.key), CATEGORY_KEYS);
	assert.deepEqual(Object.keys(english.consents).sort(), [...CATEGORY_KEYS].sort());
});

test('a category takes its copy from en.yaml and its behaviour from the source', () => {
	const necessary = Consentio._defaultConfig.consents.find((c) => c.key === 'strictly_necessary')!;
	assert.equal(necessary.title, english.consents.strictly_necessary.title);
	assert.equal(necessary.description, english.consents.strictly_necessary.description);
	// Behaviour, not words, so no pack can reach them.
	assert.equal(necessary.alwaysOn, true);
	assert.equal(necessary.defaultState, 'granted');
});
