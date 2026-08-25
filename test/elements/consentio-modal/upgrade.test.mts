import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioModalElement from '../../../src/elements/consentio-modal.js';
import ConsentioConsentItemElement from '../../../src/elements/consentio-consent-item.js';

customElements.define('consentio-modal', ConsentioModalElement);
customElements.define('consentio-consent-item', ConsentioConsentItemElement);

// Defect 11 again, on the two constructors that reach furthest into their own subtree.

test('issue 11 - a modal built child-by-child still finds its buttons and its items', () => {
	const modal = document.createElement('consentio-modal') as ConsentioModalElement;
	modal.innerHTML = '<a data-role="cancel">C</a><a data-role="save">S</a><consentio-consent-items></consentio-consent-items>';
	document.body.appendChild(modal);

	assert.ok(modal.cancelBtn, 'the constructor ran before the children existed');
	assert.ok(modal.saveBtn);
});

test('issue 11 - a consent item built child-by-child still finds its switch', () => {
	const item = document.createElement('consentio-consent-item') as ConsentioConsentItemElement;
	item.innerHTML = '<div class="consent-body"></div><consentio-switch><label><input type="checkbox"></label></consentio-switch>';
	document.body.appendChild(item);

	assert.ok(item.switch, 'the constructor ran before the children existed');
	assert.ok(item.input);
});
