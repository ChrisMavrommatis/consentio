import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// Defect 3. wait_for_update exists precisely for a banner that loads asynchronously: it
// tells the tag to hold briefly for a `consent update` rather than acting on the default.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"></script>';

test('issue 3 - a first-time visitor gets wait_for_update on the default', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(pushes()[0].payload.wait_for_update, 500);
});

test('the wait sits alongside the signals rather than replacing them', () => {
	const { payload } = pushes()[0];
	assert.equal(payload.security_storage, 'granted');
	assert.equal(payload.ad_storage, 'denied');
});
