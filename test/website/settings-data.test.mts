import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import Consentio from '../../src/consentio.js';
import type { SettingKey } from '../../website/scripts/settings-builder.js';

/**
 * _data/settings.yml is what the settings builder offers and what it calls the default.
 * The banner's own defaults are the truth, and the configuration page's key table has to
 * name the same keys, so neither can drift from the file the builder reads.
 */

const root = new URL('../../', import.meta.url);
const keys = parse(readFileSync(new URL('website/_data/settings.yml', root), 'utf8')) as SettingKey[];
const page = readFileSync(new URL('website/pages/configuration.md', root), 'utf8');

function at(path: string): unknown {
	return path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], Consentio._defaultSettings);
}

test("every key the builder offers is a banner setting, at the banner's own default", () => {
	for (const setting of keys) {
		assert.equal(at(setting.key), setting.default, `${setting.key}: the builder says ${JSON.stringify(setting.default)}`);
	}
});

test('every banner setting is offered, except the always-on category', () => {
	const offered = new Set(keys.map((setting) => setting.key));
	for (const [key, value] of Object.entries(Consentio._defaultSettings)) {
		if (key !== 'consents') {
			assert.ok(offered.has(key), `${key} is not in _data/settings.yml`);
			continue;
		}
		for (const category of Object.keys(value as object)) {
			const path = `consents.${category}.defaultState`;
			assert.equal(offered.has(path), category !== 'strictly_necessary', path);
		}
	}
});

test("the configuration page's key table names every top-level key with the builder's type", () => {
	for (const setting of keys) {
		if (setting.key.includes('.')) {
			continue;
		}
		assert.match(page, new RegExp(`^\\| \`${setting.key}\` \\| ${setting.type} \\|`, 'm'), `${setting.key} has no row, or a different type`);
	}
});
