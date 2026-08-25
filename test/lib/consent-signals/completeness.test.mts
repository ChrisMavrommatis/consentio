import test from 'node:test';
import assert from 'node:assert/strict';

import { toGoogleSignals } from '../../../src/lib/consent-signals.js';
import { GOOGLE_SIGNALS } from '../../basics.mjs';

// Defect 5. A signal left out of a `consent update` keeps whatever value the previous
// push gave it, so a category that was granted and then revoked stays granted. The
// return type of toGoogleSignals is Record<GoogleSignal, ConsentState>, which makes
// omitting one a compile error rather than a silent production bug.

test('issue 5 - every signal carries a value, even for a one-key consent record', () => {
	const signals = toGoogleSignals({ strictly_necessary: 'granted' });
	const missing = GOOGLE_SIGNALS.filter((signal) => signals[signal] === undefined);
	assert.deepEqual(missing, []);
});

test('issue 5 - every signal carries a value for an empty consent record', () => {
	const signals = toGoogleSignals({});
	assert.deepEqual(GOOGLE_SIGNALS.filter((signal) => signals[signal] === undefined), []);
});

test('issue 5 - a signal nothing is routed to is denied, not absent', () => {
	const signals = toGoogleSignals({ only: 'granted' }, { only: ['analytics_storage'] });
	assert.equal(signals.ad_storage, 'denied');
	assert.equal(Object.keys(signals).length, GOOGLE_SIGNALS.length);
});

test('issue 5 - revoking a category flips its signals back to denied', () => {
	const granted = toGoogleSignals({ marketing_advertising: 'granted' });
	const revoked = toGoogleSignals({ marketing_advertising: 'denied' });
	assert.equal(granted.ad_storage, 'granted');
	assert.equal(revoked.ad_storage, 'denied');
	assert.equal(revoked.ad_user_data, 'denied');
	assert.equal(revoked.ad_personalization, 'denied');
});
