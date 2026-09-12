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

	const instance = new Consentio({ cookieName: 'from-config', version: 7 }, {}, [], null);
	assert.equal(instance.config.cookieName, 'from-config');
	assert.equal(instance.config.version, 7);
});

test('what the loader resolved wins over the config JSON', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({ cookieName: 'from-config', version: 7 }, {}, [], null);
	assert.equal(instance.config.cookieName, 'from-tag');
	assert.equal(instance.config.version, 3);
});

test('inheriting the cookie identity changes nothing else in the config', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({ cookieName: 'from-config', consentRequired: true }, { texts: { barTitle: 'Ours' } }, [], null);
	assert.equal(instance.config.consentRequired, true);
	assert.equal(instance.config.texts.barTitle, 'Ours');
});

// The lifetime and the subdomain setting travel the same way, with one difference: the
// loader only publishes each when its attribute is on the tag, so a settings file still
// names them on a page whose tag does not. Issues 38 and 39.

test('what the settings file says about the cookie reaches the state that writes it', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({ cookieLifetime: 365, shareAcrossSubdomains: true }, {}, [], null);
	assert.equal(instance.config.cookieLifetime, 365);
	assert.equal(instance.config.shareAcrossSubdomains, true);
	assert.deepEqual(instance.state!.cookie, { lifetime: 365, shared: true });
});

test('a lifetime and a subdomain setting on the tag win over the settings file', () => {
	window.ConsentioDefault = {
		cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false,
		cookieLifetime: 30, shareAcrossSubdomains: false
	};

	const instance = new Consentio({ cookieLifetime: 365, shareAcrossSubdomains: true }, {}, [], null);
	assert.equal(instance.config.cookieLifetime, 30);
	assert.equal(instance.config.shareAcrossSubdomains, false);
});

test('a site that names neither gets 90 days on this host only', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };

	const instance = new Consentio({}, {}, [], null);
	assert.equal(instance.config.cookieLifetime, 90);
	assert.equal(instance.config.shareAcrossSubdomains, false);
});

// The loader reads the cookie in <head>, before any settings file has been fetched, so it
// has to resolve the name and the version itself and a file naming either is ignored. That
// was true and silent; it is said out loud now. Issue 43.

test('a settings file naming the cookie or the version is told the tag decides', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };
	const warnings: string[] = [];
	const logger = { warn: (message: string) => warnings.push(message) } as unknown as Console;

	new Consentio({ cookieName: 'from-config', version: 7 }, {}, [], logger);

	assert.equal(warnings.length, 2);
	assert.match(warnings[0], /data-cookie-name/);
	assert.match(warnings[1], /data-version/);
});

test('a settings file naming what the tag already resolved is not warned at', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };
	const warnings: string[] = [];
	const logger = { warn: (message: string) => warnings.push(message) } as unknown as Console;

	new Consentio({ cookieName: 'from-tag', version: 3 }, {}, [], logger);

	assert.deepEqual(warnings, []);
});

test('a settings file naming neither is not warned at', () => {
	window.ConsentioDefault = { cookieName: 'from-tag', version: 3, consents: {}, consentGiven: false };
	const warnings: string[] = [];
	const logger = { warn: (message: string) => warnings.push(message) } as unknown as Console;

	new Consentio({ consentRequired: true }, {}, [], logger);

	assert.deepEqual(warnings, []);
});
