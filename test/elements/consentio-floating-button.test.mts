import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioFloatingButtonElement from '../../src/elements/consentio-floating-button.js';
import floatingButtonTemplate from '../../src/templates/consentio-floating-button.html';
import { captureEvents, click, nodeFrom } from '../helpers.mjs';

customElements.define('consentio-floating-button', ConsentioFloatingButtonElement);

const proto = ConsentioFloatingButtonElement.prototype as unknown as Record<string, ((this: unknown) => void) | undefined>;

function mount(): ConsentioFloatingButtonElement {
	const button = nodeFrom<ConsentioFloatingButtonElement>(floatingButtonTemplate);
	document.body.appendChild(button);
	return button;
}

test('clicking the button reopens the settings', () => {
	const button = mount();
	const seen = captureEvents('consentio:open-settings', () => click(button.button!));
	assert.equal(seen.length, 1);
	assert.equal(seen[0].composed, true);
});

test('issue 7 - a disconnected floating button stops emitting', { todo: true }, () => {
	const button = mount();
	proto.disconnectedCallback!.call(button);
	const seen = captureEvents('consentio:open-settings', () => click(button.button!));
	assert.equal(seen.length, 0, 'removeEventListener rebinds, so it never matches what was added');
});
