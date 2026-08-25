import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioBarElement from '../../../src/elements/consentio-bar.js';
import barTemplate from '../../../src/templates/consentio-bar.html';
import { captureEvents, click, nodeFrom } from '../../helpers.mjs';

customElements.define('consentio-bar', ConsentioBarElement);

function mount(): ConsentioBarElement {
	const bar = nodeFrom<ConsentioBarElement>(barTemplate, {
		barTitle: 'Cookie Policy',
		barDescription: 'We use cookies.',
		buttonSettings: 'Settings',
		buttonAcceptAll: 'Accept All'
	});
	document.body.appendChild(bar);
	return bar;
}

test('the configured copy reaches the rendered bar', () => {
	const bar = mount();
	assert.equal(bar.querySelector('h2')!.textContent, 'Cookie Policy');
	assert.equal(bar.settingsBtn!.textContent, 'Settings');
	assert.equal(bar.acceptAllBtn!.textContent, 'Accept All');
});

test('the settings button emits consentio:open-settings', () => {
	const bar = mount();
	const seen = captureEvents('consentio:open-settings', () => click(bar.settingsBtn!));
	assert.equal(seen.length, 1);
});

test('the accept all button emits consentio:accept-all-consents', () => {
	const bar = mount();
	const seen = captureEvents('consentio:accept-all-consents', () => click(bar.acceptAllBtn!));
	assert.equal(seen.length, 1);
});

test('the event crosses a shadow boundary, so it must bubble and be composed', () => {
	const bar = mount();
	const [event] = captureEvents('consentio:open-settings', () => click(bar.settingsBtn!));
	assert.equal(event.bubbles, true);
	assert.equal(event.composed, true);
});
