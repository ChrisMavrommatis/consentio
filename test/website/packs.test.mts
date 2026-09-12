import test from 'node:test';
import assert from 'node:assert/strict';

import mount from '../../website/scripts/packs.js';

/** The copy button beside each pack on the packs page. */

const MARKUP = '<figure class="snippet"><figcaption><button class="snippet__copy">Copy</button></figcaption>'
	+ '<pre>function () { return {}; }</pre></figure>';

test('a page without a pack is left alone', () => {
	assert.equal(mount(document), false);
});

test('without a clipboard the button says what to do instead', () => {
	document.body.innerHTML = MARKUP;
	assert.equal(mount(document), true);
	const button = document.querySelector<HTMLElement>('.snippet__copy')!;
	button.click();
	assert.equal(button.textContent, 'Select the text and copy it');
});

test('with a clipboard the pack beside the button is what gets copied', async () => {
	document.body.innerHTML = MARKUP;
	mount(document);
	let written = '';
	Object.defineProperty(navigator, 'clipboard', { value: { writeText: (text: string) => { written = text; return Promise.resolve(); } }, configurable: true });
	const button = document.querySelector<HTMLElement>('.snippet__copy')!;
	button.click();
	await Promise.resolve();
	assert.equal(written, 'function () { return {}; }');
	assert.equal(button.textContent, 'Copied');
});
