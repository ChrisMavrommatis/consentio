import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioGTM from '../../../src/lib/gtm.js';
import { FULL_CONSENT, pushes, resetDataLayer } from '../../basics.mjs';

const layer = () => (globalThis.window as { dataLayer?: unknown[] }).dataLayer;

beforeEach(resetDataLayer);

test('the dataLayer is created if the page has none', () => {
	delete (globalThis.window as { dataLayer?: unknown[] }).dataLayer;
	const gtm = new ConsentioGTM(null);
	assert.ok(Array.isArray(gtm.dataLayer));
	assert.equal(gtm.dataLayer, layer());
});

test('an existing dataLayer is reused, not replaced', () => {
	const existing: unknown[] = [{ event: 'earlier' }];
	(globalThis.window as { dataLayer?: unknown[] }).dataLayer = existing;
	assert.equal(new ConsentioGTM(null).dataLayer, existing);
});

test('the pushed entry is an arguments object, which is the gtag convention', () => {
	new ConsentioGTM(null).updateConsent(FULL_CONSENT);
	const entry = layer()![0] as Record<string, unknown>;
	assert.ok(!Array.isArray(entry), 'dataLayer.push(arguments) must not be flattened to an array');
	assert.equal(entry['0'], 'consent');
});

test('pushes are appended, not overwritten', () => {
	const gtm = new ConsentioGTM(null);
	gtm.updateConsent(FULL_CONSENT);
	gtm.updateConsent(FULL_CONSENT);
	assert.equal(pushes().filter((push) => push.action === 'update').length, 2);
});
