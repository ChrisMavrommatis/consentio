import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import mount, { changed, type SettingKey } from '../../website/scripts/settings-builder.js';
import { asVariable } from '../../website/scripts/lib/output.js';
import { PANEL_MARKUP, dialog, panelCode, panelShape } from './panel.mjs';

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
<button type="button" id="settings-show">Show</button><button type="button" id="settings-file">Copy as file</button>
<button type="button" id="settings-variable">Copy as Tag Manager variable</button><button type="reset">Start again</button></form>
<script type="application/json" id="settings-data">${JSON.stringify(KEYS)}</script>
${PANEL_MARKUP}`;

function field(name: string): HTMLInputElement {
	return document.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
}

/** What Show puts in the panel right now. */
function shown(): string {
	document.getElementById('settings-show')!.click();
	return panelCode();
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
	dialog();
	assert.equal(mount(document), true);
	assert.equal(shown(), '{}\n');

	field('consentRequired').click();
	assert.equal(shown(), '{\n  "consentRequired": true\n}\n');

	field('policyUrl').value = '/privacy/';
	assert.equal(shown(), '{\n  "consentRequired": true,\n  "policyUrl": "/privacy/"\n}\n');
});

test('a number that is blank or not positive is left out rather than written', () => {
	document.body.innerHTML = MARKUP;
	dialog();
	mount(document);
	field('cookieLifetime').value = '';
	assert.equal(shown(), '{}\n');
	field('cookieLifetime').value = '-3';
	assert.equal(shown(), '{}\n');
	field('cookieLifetime').value = '365';
	assert.equal(shown(), '{\n  "cookieLifetime": 365\n}\n');
});

test('the panel switches to the same file as a Tag Manager variable, and copy takes each shape', async () => {
	document.body.innerHTML = MARKUP;
	dialog();
	mount(document);
	field('hideFloatingButton').click();
	shown();
	panelShape('variable');
	assert.equal(panelCode(), asVariable({ hideFloatingButton: true }));
	assert.equal(panelCode(), 'function () {\n\treturn {\n\t\t"hideFloatingButton": true\n\t};\n}\n');

	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	document.getElementById('settings-variable')!.click();
	await Promise.resolve();
	assert.equal(written, asVariable({ hideFloatingButton: true }));
	document.getElementById('settings-file')!.click();
	await Promise.resolve();
	assert.equal(written, '{\n  "hideFloatingButton": true\n}\n');
	Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});

test('without a clipboard a copy opens the panel on that shape instead', () => {
	document.body.innerHTML = MARKUP;
	const panel = dialog();
	mount(document);
	field('debug').click();
	document.getElementById('settings-variable')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panelCode(), asVariable({ debug: true }));
});

test('start again puts every control back and empties the file', () => {
	document.body.innerHTML = MARKUP;
	dialog();
	mount(document);
	field('consentRequired').click();
	(document.querySelector('[type="reset"]') as HTMLButtonElement).click();
	assert.equal(shown(), '{}\n');
});
