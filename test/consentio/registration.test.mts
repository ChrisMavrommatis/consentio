import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

// One scenario per file: defineCustomElements registers six tag names unguarded, so the
// second construction is the whole point of this file and would poison any other test
// sharing the process.

test('the first Consentio registers every tag it renders', () => {
	new Consentio({}, [], null);
	for (const tag of ['consentio-app', 'consentio-bar', 'consentio-required', 'consentio-floating-button', 'consentio-consent-item', 'consentio-modal']) {
		assert.ok(customElements.get(tag), `${tag} was not registered`);
	}
});

test('issue 8 - a second Consentio does not throw on customElements.define', { todo: true }, () => {
	assert.doesNotThrow(() => new Consentio({}, [], null), 'define is called unconditionally, with no customElements.get guard');
});
