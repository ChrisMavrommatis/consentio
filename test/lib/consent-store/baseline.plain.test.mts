import test from 'node:test';
import assert from 'node:assert/strict';

import { BASELINE_CONSENTS } from '../../../src/lib/consent-store.js';
import { toGoogleSignals } from '../../../src/lib/consent-signals.js';

// The baseline is what the core pushes when there is no stored choice. It is the reason
// the core needs no config file, and therefore the reason it can stay synchronous.

test('the baseline grants nothing but the strictly necessary category', () => {
	assert.deepEqual(BASELINE_CONSENTS, { strictly_necessary: 'granted' });
});

test('the baseline denies every signal except security_storage', () => {
	const signals = toGoogleSignals(BASELINE_CONSENTS);
	assert.equal(signals.security_storage, 'granted');
	for (const [signal, value] of Object.entries(signals)) {
		if (signal !== 'security_storage') {
			assert.equal(value, 'denied', `${signal} was not denied by default`);
		}
	}
});
