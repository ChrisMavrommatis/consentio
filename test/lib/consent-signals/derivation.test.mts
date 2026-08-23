import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_SIGNAL_MAP, signalMapFrom, toGoogleSignals } from '../../../src/lib/consent-signals.js';
import Consentio from '../../../src/consentio.js';
import type { ConsentCategory } from '../../../src/types.js';

// Defect 4. The map used to be hardcoded to the four default category keys, so a category
// a site added through mergeConsents could never reach a Google signal.

const category = (key: string, signals?: ConsentCategory['signals']): ConsentCategory =>
	({ key, title: key, description: '', alwaysOn: false, defaultState: 'denied', signals });

test('the built-in categories keep their mapping without restating it', () => {
	assert.deepEqual(signalMapFrom(Consentio._defaultConfig.consents), DEFAULT_SIGNAL_MAP);
});

test('issue 4 - a category a site adds reaches the signal it names', () => {
	const map = signalMapFrom([category('site_analytics', ['analytics_storage'])]);
	assert.equal(toGoogleSignals({ site_analytics: 'granted' }, map).analytics_storage, 'granted');
});

test('issue 4 - a site-added category can drive several signals', () => {
	const map = signalMapFrom([category('house_ads', ['ad_storage', 'ad_user_data'])]);
	const signals = toGoogleSignals({ house_ads: 'granted' }, map);
	assert.equal(signals.ad_storage, 'granted');
	assert.equal(signals.ad_user_data, 'granted');
	assert.equal(signals.ad_personalization, 'denied');
});

test('a category that names no signals and matches no default key routes nowhere', () => {
	assert.deepEqual(signalMapFrom([category('unrouted')]), {});
});

test('a site can re-route a built-in category', () => {
	const map = signalMapFrom([category('statistics_performance', ['security_storage'])]);
	assert.deepEqual(map.statistics_performance, ['security_storage']);
});

test('the whole default config still routes every signal it should', () => {
	const map = signalMapFrom(Consentio._defaultConfig.consents);
	const signals = toGoogleSignals({
		strictly_necessary: 'granted',
		preferences_functionality: 'granted',
		statistics_performance: 'granted',
		marketing_advertising: 'granted'
	}, map);
	assert.ok(Object.values(signals).every((value) => value === 'granted'));
});
