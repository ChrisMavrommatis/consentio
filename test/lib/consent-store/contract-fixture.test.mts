import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BASELINE_CONSENTS, readConsents } from '../../../src/lib/consent-store.js';
import { needsAdsDataRedaction, toGoogleSignals } from '../../../src/lib/consent-signals.js';
import type { ConsentRecord, ConsentState } from '../../../src/types.js';
import Cookies from '../../../src/lib/cookies.js';
import { clearCookies } from '../../basics.mjs';

/**
 * The cookie is read by two implementations - this one, and the sandboxed reader in
 * gtm/consentio-tag/template.tpl. No test can span them, so both are pointed at the
 * same worked values instead: these assertions, and the same numbers pasted into each
 * template's own tests. A disagreement then shows up as a diff in one file.
 */

interface Case {
	name: string;
	cookie: string | null;
	consents: ConsentRecord | null;
	signals: Record<string, ConsentState>;
	waitForUpdate: number | null;
	adsDataRedaction: boolean;
}

interface Fixture {
	cookieName: string;
	version: number;
	baseline: ConsentRecord;
	signalMap: Record<string, string[]>;
	cases: Case[];
}

const fixture = JSON.parse(
	readFileSync(new URL('../../../gtm/contract.fixture.json', import.meta.url), 'utf8')
) as Fixture;

beforeEach(clearCookies);

test('the fixture states the baseline this implementation falls back to', () => {
	assert.deepEqual(fixture.baseline, BASELINE_CONSENTS);
});

test('the fixture states the signal map this implementation uses', () => {
	const signals = toGoogleSignals({});
	for (const [category, names] of Object.entries(fixture.signalMap)) {
		const granted = toGoogleSignals({ [category]: 'granted' });
		const raised = Object.keys(granted).filter((s) => granted[s as keyof typeof granted] !== signals[s as keyof typeof signals]);
		assert.deepEqual(raised.sort(), [...names].sort(), `${category} drives the wrong signals`);
	}
});

for (const scenario of fixture.cases) {
	test(`${scenario.name}: the stored value reads as the fixture says`, () => {
		if (scenario.cookie !== null) {
			Cookies.set(fixture.cookieName, scenario.cookie);
		}
		assert.deepEqual(readConsents(fixture.cookieName, fixture.version), scenario.consents);
	});

	test(`${scenario.name}: the consent default matches the fixture`, () => {
		if (scenario.cookie !== null) {
			Cookies.set(fixture.cookieName, scenario.cookie);
		}
		const stored = readConsents(fixture.cookieName, fixture.version);
		const signals = toGoogleSignals(stored ?? BASELINE_CONSENTS);
		assert.deepEqual(signals, scenario.signals);
		assert.equal(needsAdsDataRedaction(signals), scenario.adsDataRedaction);
		// wait_for_update helps a first-time visitor only, so it tracks "no stored answer".
		assert.equal(scenario.waitForUpdate === null, stored !== null);
	});
}
