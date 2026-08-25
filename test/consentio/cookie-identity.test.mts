import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

// The loader resolves the cookie name and the version off its own tag and publishes them
// on window.ConsentioDefault. The banner takes those back rather than reading a second,
// possibly different, pair out of the config JSON - two sources for one fact is how the
// loader and the banner end up reading different cookies.
//
// Order matters here: the first test has to run before ConsentioDefault exists.

test('the config JSON supplies the cookie identity when no loader ran', () => {
	assert.equal(window.ConsentioDefault, undefined, 'precondition: nothing published a default');

	const instance = new Consentio({ cookieName: 'from-config', version: 7 }, [], null);
	assert.equal(instance.config.cookieName, 'from-config');
	assert.equal(instance.config.version, 7);
});

test('what the loader resolved wins over the config JSON', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({ cookieName: 'from-config', version: 7 }, [], null);
	assert.equal(instance.config.cookieName, 'from-tag');
	assert.equal(instance.config.version, 3);
});

test('inheriting the cookie identity changes nothing else in the config', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({ cookieName: 'from-config', consentRequired: true, texts: { barTitle: 'Ours' } }, [], null);
	assert.equal(instance.config.consentRequired, true);
	assert.equal(instance.config.texts.barTitle, 'Ours');
});
