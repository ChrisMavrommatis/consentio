import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioBarElement from '../../../src/elements/consentio-bar.js';
import barTemplate from '../../../src/templates/consentio-bar.html';
import { captureEvents, click, nodeFrom } from '../../helpers.mjs';

customElements.define('consentio-bar', ConsentioBarElement);

const proto = ConsentioBarElement.prototype as unknown as Record<string, ((this: unknown) => void) | undefined>;

function mount(): ConsentioBarElement {
	const bar = nodeFrom<ConsentioBarElement>(barTemplate, {
		barTitle: 'T', barDescription: 'D', buttonSettings: 'S', buttonAcceptAll: 'A'
	});
	document.body.appendChild(bar);
	return bar;
}

test('issue 6 - the bar exposes disconnectedCallback, spelled the way the DOM calls it', () => {
	assert.equal(typeof proto.disconnectedCallback, 'function', 'only the misspelled disconectedCallback exists, so it never fires');
});

test('issue 7 - a disconnected bar stops emitting', () => {
	const bar = mount();
	const teardown = proto.disconnectedCallback ?? proto.disconectedCallback;
	assert.ok(teardown, 'no teardown callback of either spelling');
	teardown.call(bar);

	const seen = captureEvents('consentio:open-settings', () => click(bar.settingsBtn!));
	assert.equal(seen.length, 0, 'removeEventListener rebinds, so it never matches what was added');
});

test('issues 6 and 7 - removing the bar from the document leaves no listener behind', () => {
	const bar = mount();
	bar.remove();
	const seen = captureEvents('consentio:open-settings', () => click(bar.settingsBtn!));
	assert.equal(seen.length, 0, 'defects 6 and 7 together: the callback never fires, and would not remove anything if it did');
});
