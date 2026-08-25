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
