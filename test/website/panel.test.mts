import test from 'node:test';
import assert from 'node:assert/strict';

import { mountPanel } from '../../website/scripts/lib/panel.js';
import { PANEL_MARKUP, dialog, panelCode, panelShape, panelTitle } from './panel.mjs';

/** The one panel: title, lead, text or two shapes with a switch, copy, close, focus back. */

test('a page without the panel gets null, and so does a browser without <dialog>', () => {
	assert.equal(mountPanel(document), null);
	document.body.innerHTML = PANEL_MARKUP;
	assert.equal(mountPanel(document), null, 'showModal is missing here');
});

test('one text opens with no switch, and closing gives focus back to the opener', () => {
	document.body.innerHTML = `<button id="from">Open</button>${PANEL_MARKUP}`;
	const panel = dialog();
	const api = mountPanel(document)!;
	const from = document.getElementById('from')!;
	api.open({ title: 'One row', lead: 'A sentence.', text: '{"a":1}', from });
	assert.equal(panel.opened, 1);
	assert.equal(panelTitle(), 'One row');
	assert.equal(document.querySelector('.panel__lead')!.textContent, 'A sentence.');
	assert.equal(panelCode(), '{"a":1}');
	assert.equal((document.querySelector('.panel__switch') as HTMLElement).hidden, true);
	document.querySelector<HTMLElement>('.panel__close')!.click();
	assert.equal(document.activeElement, from);
});

test('two shapes show the switch, open on the one asked for, and flip', () => {
	document.body.innerHTML = `<button id="from">Open</button>${PANEL_MARKUP}`;
	dialog();
	const api = mountPanel(document)!;
	api.open({ title: 'Both', lead: '', text: { file: 'FILE', variable: 'VARIABLE' }, shape: 'variable', from: document.getElementById('from')! });
	assert.equal((document.querySelector('.panel__switch') as HTMLElement).hidden, false);
	assert.equal((document.querySelector('.panel__lead') as HTMLElement).hidden, true);
	assert.equal(panelCode(), 'VARIABLE');
	panelShape('file');
	assert.equal(panelCode(), 'FILE');
	assert.equal(api.text(), 'FILE');
});

test('copy takes what is shown, and without a clipboard the button says what to do', async () => {
	document.body.innerHTML = `<button id="from">Open</button>${PANEL_MARKUP}`;
	dialog();
	const api = mountPanel(document)!;
	api.open({ title: 'Copy', lead: '', text: 'TEXT', from: document.getElementById('from')! });
	const copy = document.querySelector<HTMLElement>('.panel__copy')!;
	copy.click();
	assert.equal(copy.textContent, 'Select the text and copy it');

	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	api.open({ title: 'Copy', lead: '', text: 'TEXT', from: document.getElementById('from')! });
	copy.click();
	await Promise.resolve();
	assert.equal(written, 'TEXT');
	assert.equal(copy.textContent, 'Copied');
	Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});
