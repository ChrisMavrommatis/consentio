import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// url_passthrough carries the ad-click id across the site's own links while ad storage is
// denied. It is a `set` and has to be there before the tag manager reads dataLayer.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-url-passthrough="true"></script>';

test('data-url-passthrough="true" pushes the set after the default', async () => {
	await import('../../src/consentio-loader.js');
	const entries = pushes();
	assert.equal(entries[0].action, 'default');
	const set = entries.find((push) => push.action === 'url_passthrough');
	assert.ok(set, 'no url_passthrough was pushed');
	assert.equal(set.command, 'set');
	assert.equal(set.payload as unknown, true);
	assert.equal(window.ConsentioDefault!.urlPassthrough, true);
});
