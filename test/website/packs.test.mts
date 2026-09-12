import test from 'node:test';
import assert from 'node:assert/strict';

import mount from '../../website/scripts/packs.js';
import { PANEL_MARKUP, dialog, panelCode, panelShape, panelTitle } from './panel.mjs';

/** The packs table on both language pages, against the markup the plugin prints. */

const PACKS = [
	{ locale: 'el', name: 'Ελληνικά', file: '{"locale":"el"}\n', variable: 'function () {\n\treturn {"locale":"el"};\n}\n' },
	{ locale: 'en', name: 'English', file: '{"locale":"en"}\n', variable: 'function () {\n\treturn {"locale":"en"};\n}\n' }
];

function markup(shape: string): string {
	return `<table class="packs" data-shape="${shape}"><tbody>
<tr class="packs__row"><td>Ελληνικά</td><td><code>el</code></td><td><a href="/release">el.json</a></td><td><button class="packs__open" data-pack="0">Open</button></td></tr>
<tr class="packs__row"><td>English</td><td><code>en</code></td><td><a href="/release">en.json</a></td><td><button class="packs__open" data-pack="1">Open</button></td></tr>
</tbody></table>
<script type="application/json" id="packs-data">${JSON.stringify(PACKS)}</script>
${PANEL_MARKUP}`;
}

test('a page without the table is left alone', () => {
	assert.equal(mount(document), false);
});

test('the Tag Manager page opens on the variable, and the switch shows the file', () => {
	document.body.innerHTML = markup('variable');
	const panel = dialog();
	assert.equal(mount(document), true);
	document.querySelector<HTMLElement>('.packs__open[data-pack="1"]')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panelTitle(), 'English - en');
	assert.equal(panelCode(), PACKS[1]!.variable);
	panelShape('file');
	assert.equal(panelCode(), PACKS[1]!.file);
});

test('the HTML page opens on the file, and a click on the row reaches the same button', () => {
	document.body.innerHTML = markup('file');
	const panel = dialog();
	mount(document);
	document.querySelector<HTMLElement>('.packs__row td:first-child')!.click();
	assert.equal(panel.opened, 1);
	assert.equal(panelTitle(), 'Ελληνικά - el');
	assert.equal(panelCode(), PACKS[0]!.file);
});
