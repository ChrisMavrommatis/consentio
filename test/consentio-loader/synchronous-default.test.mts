import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes, resetDataLayer } from '../basics.mjs';

// See ./README.md - this is a proxy for a page-level check that does not exist yet.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-config-url="/c.json"></script>';

test('issue 1 - the loader pushes consent default while it is still evaluating', async () => {
	resetDataLayer();
	const before = pushes().length;

	// A module body runs to completion before its import promise settles, so a push that
	// is visible here happened synchronously - no fetch, no timer, no microtask.
	await import('../../src/consentio-loader.js');

	const after = pushes();
	assert.ok(after.length > before, 'the loader pushed nothing while it loaded');

	const [first] = after;
	assert.equal(first.command, 'consent');
	assert.equal(first.action, 'default');
});

test('the default is the very first thing on the dataLayer', () => {
	assert.equal(pushes()[0].action, 'default', 'anything ahead of the default has already read past it');
});

test('the loader leaves its state on the page', () => {
	assert.equal(window.ConsentioDefault!.cookieName, 'consentio');
	assert.equal(window.ConsentioDefault!.version, 1);
	assert.equal(window.ConsentioDefault!.consentGiven, false);
});
