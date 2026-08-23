import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// The cookie name and version have to reach the loader without a config file, because the
// config file is fetched and the default cannot wait for it. They come off the loader tag
// itself, which is the only thing on the page at that moment.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"'
	+ ' data-cookie-name="house-consent" data-version="7" data-wait-for-update="250"></script>';

test('the loader reads its consent options off its own tag', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(window.ConsentioDefault!.cookieName, 'house-consent');
	assert.equal(window.ConsentioDefault!.version, 7);
});

test('numeric options are coerced out of their string attributes', () => {
	assert.equal(pushes()[0].payload.wait_for_update, 250);
	assert.equal(typeof window.ConsentioDefault!.version, 'number');
});
