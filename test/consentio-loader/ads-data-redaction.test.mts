import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// Defect 3. With ad_storage denied, redaction stops the tag sending ad identifiers at all.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"></script>';

test('issue 3 - ads_data_redaction is set when ad_storage is denied', async () => {
	await import('../../src/consentio-loader.js');
	const redaction = pushes().find((push) => push.action === 'ads_data_redaction');
	assert.ok(redaction, 'no ads_data_redaction was pushed');
	assert.equal(redaction.payload as unknown, true);
});

test('it is pushed with the gtag set command, after the default', () => {
	const entries = pushes();
	assert.equal(entries[0].action, 'default');
	assert.equal(entries[1].command, 'set');
	assert.equal(entries[1].action, 'ads_data_redaction');
});
