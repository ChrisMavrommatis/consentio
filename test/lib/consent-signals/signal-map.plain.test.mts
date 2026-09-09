import test from 'node:test';
import assert from 'node:assert/strict';

import { toGoogleSignals } from '../../../src/lib/consent-signals.js';
import type { SignalMap } from '../../../src/lib/consent-signals.js';
import { FULL_CONSENT, GOOGLE_SIGNALS } from '../../basics.mjs';

test('all seven Google signals are present', () => {
	const signals = toGoogleSignals(FULL_CONSENT);
	for (const signal of GOOGLE_SIGNALS) {
		assert.ok(signal in signals, `${signal} is missing`);
	}
});

test('issue 2 - no key outside the seven Google signals is emitted', () => {
	const unknown = Object.keys(toGoogleSignals(FULL_CONSENT)).filter((key) => !GOOGLE_SIGNALS.includes(key as never));
	assert.deepEqual(unknown, [], 'Google drops unknown keys silently, which is why a wrong one looks like it works');
});

test('a granted marketing category reaches all three advertising signals', () => {
	const signals = toGoogleSignals({ ...FULL_CONSENT, marketing_advertising: 'granted' });
	assert.equal(signals.ad_storage, 'granted');
	assert.equal(signals.ad_user_data, 'granted');
	assert.equal(signals.ad_personalization, 'granted');
});

test('the strictly necessary category drives security_storage', () => {
	assert.equal(toGoogleSignals(FULL_CONSENT).security_storage, 'granted');
});

test('preferences drive both functionality and personalization storage', () => {
	const signals = toGoogleSignals({ ...FULL_CONSENT, preferences_functionality: 'granted' });
	assert.equal(signals.functionality_storage, 'granted');
	assert.equal(signals.personalization_storage, 'granted');
});

test('a denied category leaves its signals denied', () => {
	const signals = toGoogleSignals(FULL_CONSENT);
	assert.equal(signals.analytics_storage, 'denied');
	assert.equal(signals.ad_storage, 'denied');
});

test('deny wins when two categories are routed to the same signal', () => {
	const map: SignalMap = { one: ['analytics_storage'], two: ['analytics_storage'] };
	assert.equal(toGoogleSignals({ one: 'granted', two: 'denied' }, map).analytics_storage, 'denied');
	assert.equal(toGoogleSignals({ one: 'granted', two: 'granted' }, map).analytics_storage, 'granted');
});
