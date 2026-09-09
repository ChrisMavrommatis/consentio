import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import ConsentioGTM from '../../../src/lib/gtm.js';
import { FULL_CONSENT, GOOGLE_SIGNALS, pushes, resetDataLayer } from '../../basics.mjs';

beforeEach(resetDataLayer);

test('updateConsent pushes a consent update', () => {
	new ConsentioGTM(null).updateConsent(FULL_CONSENT);
	const [push] = pushes();
	assert.equal(push.command, 'consent');
	assert.equal(push.action, 'update');
});

test('issue 1 - the async half never pushes a consent default', () => {
	const gtm = new ConsentioGTM(null) as ConsentioGTM & { defaultConsent?: unknown };
	assert.equal(gtm.defaultConsent, undefined, 'the default belongs to the loader, which pushes it before the tag manager');

	gtm.updateConsent(FULL_CONSENT);
	assert.deepEqual(pushes().filter((push) => push.action === 'default'), []);
});

test('issues 2 and 5 - the update names the seven Google signals and nothing else', () => {
	new ConsentioGTM(null).updateConsent({ strictly_necessary: 'granted' });
	assert.deepEqual(Object.keys(pushes()[0].payload).sort(), [...GOOGLE_SIGNALS].sort());
});

test('issue 5 - revoking a category pushes it as denied rather than omitting it', () => {
	const gtm = new ConsentioGTM(null);
	gtm.updateConsent({ ...FULL_CONSENT, marketing_advertising: 'granted' });
	resetDataLayer();
	gtm.updateConsent({ ...FULL_CONSENT, marketing_advertising: 'denied' });

	const { payload } = pushes()[0];
	for (const signal of ['ad_storage', 'ad_user_data', 'ad_personalization']) {
		assert.equal(payload[signal], 'denied', `${signal} was not explicitly revoked`);
	}
});

test('issue 3 - ads_data_redaction is turned on when ad_storage ends up denied', () => {
	new ConsentioGTM(null).updateConsent(FULL_CONSENT);
	const redaction = pushes().find((push) => push.action === 'ads_data_redaction');
	assert.ok(redaction, 'no ads_data_redaction was pushed');
	assert.equal(redaction.payload as unknown, true);
});

test('issue 3 - ads_data_redaction is turned off again when marketing is granted', () => {
	new ConsentioGTM(null).updateConsent({ ...FULL_CONSENT, marketing_advertising: 'granted' });
	const redaction = pushes().find((push) => push.action === 'ads_data_redaction');
	assert.equal(redaction!.payload as unknown, false);
});

test('issue 28 - a key outside the four routes nowhere and grants nothing', () => {
	new ConsentioGTM(null).updateConsent({ house_analytics: 'granted' });
	const payload = pushes()[0].payload;
	assert.ok(Object.values(payload).every((value) => value === 'denied'), 'an unknown key granted a signal');
});
