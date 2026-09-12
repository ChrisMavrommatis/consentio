import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import mount, { changed, type SettingKey } from '../../website/scripts/settings-builder.js';
import { asVariable } from '../../website/scripts/lib/output.js';

/** The settings builder, against the controls the configuration page prints from _data/settings.yml. */

const KEYS = parse(readFileSync(new URL('../../website/_data/settings.yml', import.meta.url), 'utf8')) as SettingKey[];

function control(setting: SettingKey): string {
	if (setting.type === 'boolean') {
		return `<input type="checkbox" name="${setting.key}"${setting.default ? ' checked' : ''}>`;
	}
	if (setting.type === 'state') {
		return `<select name="${setting.key}"><option value="granted">granted</option><option value="denied" selected>denied</option></select>`;
	}
	return `<input type="${setting.type === 'number' ? 'number' : 'text'}" name="${setting.key}" value="${setting.default}">`;
}

const MARKUP = `<form id="settings-builder">${KEYS.map(control).join('')}
<input type="radio" name="output" value="file" checked><input type="radio" name="output" value="variable">
<pre><code id="settings-output"></code></pre><button type="button" id="settings-copy">Copy</button><button type="reset">Start again</button></form>
<script type="application/json" id="settings-data">${JSON.stringify(KEYS)}</script>`;

function field(name: string): HTMLInputElement {
	return document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
}

test('only what differs from the default is written, nested where the key is dotted', () => {
	assert.deepEqual(changed(KEYS, new Map()), {});
	assert.deepEqual(changed(KEYS, new Map([['consentRequired', false]])), {});
	assert.deepEqual(changed(KEYS, new Map<string, boolean | number | string>([
		['consentRequired', true],
		['cookieLifetime', 365],
		['consents.marketing_advertising.defaultState', 'granted']
	])), { consentRequired: true, cookieLifetime: 365, consents: { marketing_advertising: { defaultState: 'granted' } } });
});

test('a page without the builder is left alone', () => {
	assert.equal(mount(document), false);
});

test('the defaults give an empty file, and one switch gives one key', () => {
	document.body.innerHTML = MARKUP;
	assert.equal(mount(document), true);
	const output = document.getElementById('settings-output')!;
	assert.equal(output.textContent, '{}\n');

	field('consentRequired').click();
	assert.equal(output.textContent, '{\n  "consentRequired": true\n}\n');

	field('policyUrl').value = '/privacy/';
	field('policyUrl').dispatchEvent(new Event('input', { bubbles: true }));
	assert.equal(output.textContent, '{\n  "consentRequired": true,\n  "policyUrl": "/privacy/"\n}\n');
});

test('a number that is blank or not positive is left out rather than written', () => {
	document.body.innerHTML = MARKUP;
	mount(document);
	const output = document.getElementById('settings-output')!;
	field('cookieLifetime').value = '';
	field('cookieLifetime').dispatchEvent(new Event('input', { bubbles: true }));
	assert.equal(output.textContent, '{}\n');
	field('cookieLifetime').value = '-3';
	field('cookieLifetime').dispatchEvent(new Event('input', { bubbles: true }));
	assert.equal(output.textContent, '{}\n');
	field('cookieLifetime').value = '365';
	field('cookieLifetime').dispatchEvent(new Event('input', { bubbles: true }));
	assert.equal(output.textContent, '{\n  "cookieLifetime": 365\n}\n');
});

test('the switch gives the same file as a Tag Manager variable, and copy takes what is shown', async () => {
	document.body.innerHTML = MARKUP;
	mount(document);
	field('hideFloatingButton').click();
	const variable = document.querySelector<HTMLInputElement>('[name="output"][value="variable"]')!;
	variable.click();
	variable.dispatchEvent(new Event('change', { bubbles: true }));
	const output = document.getElementById('settings-output')!;
	assert.equal(output.textContent, asVariable({ hideFloatingButton: true }));
	assert.equal(output.textContent, 'function () {\n\treturn {\n\t\t"hideFloatingButton": true\n\t};\n}\n');

	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	document.getElementById('settings-copy')!.click();
	await Promise.resolve();
	assert.equal(written, output.textContent);
	Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

test('start again puts every control back and empties the file', async () => {
	document.body.innerHTML = MARKUP;
	mount(document);
	field('consentRequired').click();
	(document.querySelector('[type="reset"]') as HTMLButtonElement).click();
	await new Promise((resolve) => setTimeout(resolve, 0));
	assert.equal(document.getElementById('settings-output')!.textContent, '{}\n');
});
