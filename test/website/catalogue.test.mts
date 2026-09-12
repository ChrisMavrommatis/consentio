import test from 'node:test';
import assert from 'node:assert/strict';

import mount, { selected, count } from '../../website/scripts/catalogue.js';
import { asFile, asVariable } from '../../website/scripts/lib/output.js';

/**
 * The catalogue's side panel and copy controls, against the markup the page prints.
 * jsdom has no showModal, so the dialog gets the two methods the script calls.
 */

const ROWS = [
	{ name: '_ga', purpose: 'Tells visitors apart', provenance: 'Google Analytics', duration: '2 years', category: 'statistics_performance' },
	{ name: '_gid', purpose: 'Tells visitors apart for a day', provenance: 'Google Analytics', duration: '24 hours', category: 'statistics_performance' }
];

const MARKUP = `
<figure class="catalogue" data-vendor="0">
<figcaption><button class="catalogue__copy-all">Copy all rows</button></figcaption>
<table><tbody>
<tr class="catalogue__row"><td><input type="checkbox" class="catalogue__pick" data-vendor="0" data-row="0"></td><td>_ga</td><td><button class="catalogue__open" data-row="0">JSON</button></td></tr>
<tr class="catalogue__row"><td><input type="checkbox" class="catalogue__pick" data-vendor="0" data-row="1"></td><td>_gid</td><td><button class="catalogue__open" data-row="1">JSON</button></td></tr>
</tbody></table>
</figure>
<div id="cookie-builder" hidden><span class="builder-strip__count"></span>
<button class="builder-strip__show">Show</button><button class="builder-strip__file">Copy as file</button>
<button class="builder-strip__variable">Copy as Tag Manager variable</button><button class="builder-strip__clear">Clear</button></div>
<script type="application/json" id="catalogue-data">${JSON.stringify([{ vendor: 'Google Analytics', rows: ROWS }])}</script>
<dialog id="catalogue-panel" tabindex="-1">
<p class="catalogue-panel__title"></p>
<button class="catalogue-panel__close">Close</button>
<pre><code class="catalogue-panel__code"></code></pre>
<button class="catalogue-panel__copy">Copy</button>
</dialog>`;

function dialog(): HTMLDialogElement & { opened: number } {
	const panel = document.getElementById('catalogue-panel') as HTMLDialogElement & { opened: number };
	panel.opened = 0;
	panel.showModal = () => { panel.opened += 1; panel.setAttribute('open', ''); };
	panel.close = () => { panel.removeAttribute('open'); panel.dispatchEvent(new Event('close')); };
	return panel;
}

test('the ticked rows come back in catalogue order, and the strip counts them', () => {
	const vendors = [{ vendor: 'A', rows: [ROWS[0]!] }, { vendor: 'B', rows: [ROWS[1]!] }];
	assert.deepEqual(selected(vendors, (v) => v === 1), [ROWS[1]]);
	assert.deepEqual(selected(vendors, () => true), ROWS);
	assert.equal(count(0), '0 cookies selected');
	assert.equal(count(1), '1 cookie selected');
	assert.equal(count(2), '2 cookies selected');
});

test('a page without the panel is left alone, and so is a browser without <dialog>', () => {
	assert.equal(mount(document), false);
	document.body.innerHTML = MARKUP;
	assert.equal(mount(document), false, 'showModal is missing here, so the page keeps its tables and no panel');
});

test('the JSON button opens the panel on that row, and closing it gives focus back', () => {
	document.body.innerHTML = MARKUP;
	const panel = dialog();
	assert.equal(mount(document), true);

	const button = document.querySelector<HTMLElement>('.catalogue__open[data-row="1"]')!;
	button.click();
	assert.equal(panel.opened, 1);
	assert.equal(panel.querySelector('.catalogue-panel__title')!.textContent, '_gid');
	assert.equal(panel.querySelector('.catalogue-panel__code')!.textContent, JSON.stringify(ROWS[1], null, 2));

	panel.querySelector<HTMLElement>('.catalogue-panel__close')!.click();
	assert.equal(document.activeElement, button);
});

test('a click on the row reaches the same button, and a click on the tick box does not', () => {
	document.body.innerHTML = MARKUP;
	const panel = dialog();
	mount(document);
	document.querySelector<HTMLElement>('.catalogue__row td:nth-child(2)')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panel.querySelector('.catalogue-panel__title')!.textContent, '_ga');
	document.querySelector<HTMLElement>('.catalogue__pick')!.click();
	assert.equal(panel.opened, 1);
});

test('the strip appears with the first tick, and hands the ticked rows back as the file or the variable', async () => {
	document.body.innerHTML = MARKUP;
	dialog();
	mount(document);
	const strip = document.getElementById('cookie-builder')!;
	const boxes = document.querySelectorAll<HTMLInputElement>('.catalogue__pick');
	assert.equal(strip.hidden, true);

	boxes[1]!.click();
	boxes[0]!.click();
	assert.equal(strip.hidden, false);
	assert.equal(strip.querySelector('.builder-strip__count')!.textContent, '2 cookies selected');

	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	strip.querySelector<HTMLElement>('.builder-strip__file')!.click();
	await Promise.resolve();
	assert.equal(written, `${JSON.stringify(ROWS, null, 2)}\n`, 'the file, in catalogue order however they were ticked');

	strip.querySelector<HTMLElement>('.builder-strip__variable')!.click();
	await Promise.resolve();
	assert.equal(written, asVariable(ROWS));
	assert.ok(written.startsWith('function () {\n\treturn [\n\t\t{'), written);
	Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });

	strip.querySelector<HTMLElement>('.builder-strip__clear')!.click();
	assert.equal(strip.hidden, true);
	assert.equal(boxes[0]!.checked, false);
});

test('without a clipboard the strip opens the panel on the output instead', () => {
	document.body.innerHTML = MARKUP;
	const panel = dialog();
	mount(document);
	document.querySelector<HTMLInputElement>('.catalogue__pick')!.click();
	document.querySelector<HTMLElement>('.builder-strip__variable')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panel.querySelector('.catalogue-panel__title')!.textContent, 'Your cookie table, as a Tag Manager variable - 1 cookie selected');
	assert.equal(panel.querySelector('.catalogue-panel__code')!.textContent, asVariable([ROWS[0]]));
});

test('copy all rows without a clipboard opens the panel on the whole file instead', () => {
	document.body.innerHTML = MARKUP;
	const panel = dialog();
	mount(document);
	document.querySelector<HTMLElement>('.catalogue__copy-all')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panel.querySelector('.catalogue-panel__title')!.textContent, 'Google Analytics - all rows');
	assert.equal(panel.querySelector('.catalogue-panel__code')!.textContent, asFile(ROWS));
});

test('copy all rows with a clipboard writes the file and says so', async () => {
	document.body.innerHTML = MARKUP;
	dialog();
	mount(document);
	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	const all = document.querySelector<HTMLElement>('.catalogue__copy-all')!;
	all.click();
	await Promise.resolve();
	assert.equal(written, asFile(ROWS));
	assert.equal(all.textContent, 'Copied');
	Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
});
