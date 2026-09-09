import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { BASELINE_CONSENTS, clearConsents, readConsents, writeConsents } from '../../../src/lib/consent-store.js';
import Cookies from '../../../src/lib/cookies.js';
import { clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('there is nothing to honour when no cookie is set', () => {
	assert.equal(readConsents('consentio', 1), null);
});

test('a written choice reads back', () => {
	writeConsents('consentio', 1, { statistics_performance: 'granted' });
	assert.deepEqual(readConsents('consentio', 1), { statistics_performance: 'granted' });
});

test('the version is stored but is not part of the consents', () => {
	writeConsents('consentio', 3, { a: 'granted' });
	assert.match(Cookies.get('consentio')!, /"version":3/);
	assert.ok(!('version' in readConsents('consentio', 3)!));
});

test('a choice stored at another version is not honoured', () => {
	writeConsents('consentio', 1, { a: 'granted' });
	assert.equal(readConsents('consentio', 2), null);
});

test('a malformed cookie is not honoured and does not throw', () => {
	Cookies.set('consentio', 'not json');
	assert.equal(readConsents('consentio', 1), null);
});

test('a cookie holding a bare string is not honoured', () => {
	Cookies.set('consentio', '"granted"');
	assert.equal(readConsents('consentio', 1), null);
});

test('clearConsents removes the cookie', () => {
	writeConsents('consentio', 1, { a: 'granted' });
	clearConsents('consentio');
	assert.equal(readConsents('consentio', 1), null);
});

test('the cookie name is honoured, so two banners can coexist', () => {
	writeConsents('one', 1, { a: 'granted' });
	assert.equal(readConsents('two', 1), null);
	assert.deepEqual(readConsents('one', 1), { a: 'granted' });
});

// The date the answer was given, added in this release. Nothing reads it yet - it is here
// because the only way to put one on a cookie that already exists is to throw the cookie
// away, which asks every visitor again. Issue 38.

test('a written answer carries the date it was given', () => {
	writeConsents('consentio', 1, { statistics_performance: 'granted' });

	const stored = JSON.parse(Cookies.get('consentio')!);
	assert.match(stored.date, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
	assert.ok(Math.abs(Date.parse(stored.date) - Date.now()) < 5000, 'the date is not now');
});

test('the date sits beside the answer rather than inside it', () => {
	writeConsents('consentio', 1, { statistics_performance: 'granted' });
	assert.deepEqual(readConsents('consentio', 1), { statistics_performance: 'granted' });
});

test('a value stored before dates existed is still honoured', () => {
	Cookies.set('consentio', JSON.stringify({ version: 1, consents: { statistics_performance: 'granted' } }));
	assert.deepEqual(readConsents('consentio', 1), { statistics_performance: 'granted' });
});

test('a date on a value at the wrong version does not rescue it', () => {
	Cookies.set('consentio', JSON.stringify({
		version: 2,
		consents: { statistics_performance: 'granted' },
		date: new Date().toISOString()
	}));
	assert.equal(readConsents('consentio', 1), null);
});
