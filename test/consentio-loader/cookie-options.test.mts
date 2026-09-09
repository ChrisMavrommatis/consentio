import test from 'node:test';
import assert from 'node:assert/strict';

// How long the answer is kept and whether it is shared can be set on the tag, the way the
// cookie name and the version are. The loader does not write the cookie itself - it
// publishes what the tag said so the banner writes the same thing. Issues 38 and 39.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-cookie-lifetime="365" data-share-across-subdomains="true"></script>';

test('the loader publishes the lifetime and the subdomain setting off its own tag', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(window.ConsentioDefault!.cookieLifetime, 365);
	assert.equal(window.ConsentioDefault!.shareAcrossSubdomains, true);
});

test('each is the type the settings expect, not the string the attribute holds', () => {
	assert.equal(typeof window.ConsentioDefault!.cookieLifetime, 'number');
	assert.equal(typeof window.ConsentioDefault!.shareAcrossSubdomains, 'boolean');
});
