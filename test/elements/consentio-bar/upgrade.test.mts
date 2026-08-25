import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioBarElement from '../../../src/elements/consentio-bar.js';

customElements.define('consentio-bar', ConsentioBarElement);

// The constructor calls querySelector for its buttons. That works in production only
// because renderNode builds the bar inside an inert <template>, so the upgrade is
// deferred until the finished node is inserted and the children already exist.

test('issue 11 - an element built child-by-child still finds its buttons', () => {
	const bar = document.createElement('consentio-bar') as ConsentioBarElement;
	bar.innerHTML = '<button data-role="settings">S</button><button data-role="acceptAll">A</button>';
	document.body.appendChild(bar);

	assert.ok(bar.settingsBtn, 'the constructor ran before the children existed, so the reference is null forever');
	assert.ok(bar.acceptAllBtn);
});

test('issue 11 - connecting an element whose children arrive later does not throw', () => {
	const bar = document.createElement('consentio-bar') as ConsentioBarElement;
	document.body.appendChild(bar);
	bar.innerHTML = '<button data-role="settings">S</button><button data-role="acceptAll">A</button>';
	assert.ok(bar.settingsBtn);
});
