import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_LIFETIME_DAYS, clearConsents, writeConsents } from '../../../src/lib/consent-store.js';
import Cookies from '../../../src/lib/cookies.js';
import type { CookieAttributes } from '../../../src/types.js';
import { clearCookies } from '../../basics.mjs';

// `document.cookie` hands back names and values and no attributes, so the expiry and the
// domain are caught on the way into Cookies.set instead.

let writes: CookieAttributes[] = [];
let attributes: CookieAttributes | undefined;
const set = Cookies.set;

beforeEach(() => {
	clearCookies();
	writes = [];
	attributes = undefined;
	Cookies.set = (key, value, given) => {
		writes.push(given!);
		attributes = given;
		return set.call(Cookies, key, value, given);
	};
});

test.after(() => { Cookies.set = set; });

test('an answer lasts 90 days when the site names no lifetime', () => {
	assert.equal(DEFAULT_LIFETIME_DAYS, 90);
	writeConsents('consentio', 1, { strictly_necessary: 'granted' });
	assert.equal(attributes!.expires, 90);
});

test('a lifetime the site names is what the cookie gets', () => {
	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { lifetime: 365 });
	assert.equal(attributes!.expires, 365);
});

test('a lifetime that is not a positive number falls back to the default', () => {
	for (const lifetime of [0, -30, NaN, undefined]) {
		writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { lifetime });
		assert.equal(attributes!.expires, DEFAULT_LIFETIME_DAYS, `${lifetime} did not fall back`);
	}
});

// A site says whether the answer is shared, not where. The domain is derived from the page
// by asking the browser which one it will take - and the stand-in jar takes any of them,
// so which one the walk arrives at is checked under jsdom instead. Issue 39.

test('no domain is written when the answer belongs to this host', () => {
	writeConsents('consentio', 1, { strictly_necessary: 'granted' });
	assert.ok(!('domain' in attributes!), 'a domain was written for a host-only answer');

	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: false });
	assert.ok(!('domain' in attributes!), 'a domain was written with sharing turned off');
});

test('a shared answer is written at the domain the page derived', () => {
	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: true });
	assert.equal(attributes!.domain, 'consentio.test');
});

// There are only ever two scopes, and a cookie is only removed at the one it was written
// at. Clearing both is what stops the setting being flipped stranding a cookie the browser
// then sends alongside the new one. Issue 39.
test('clearing removes the answer at both scopes', () => {
	clearConsents('consentio');
	assert.deepEqual(writes.map((given) => given.domain), [undefined, 'consentio.test']);
	assert.ok(writes.every((given) => given.expires === -1), 'a clear wrote something other than an expiry');
});

test('a write clears both scopes before it stores the answer', () => {
	writeConsents('consentio', 1, { strictly_necessary: 'granted' }, { shared: true });
	assert.deepEqual(writes.map((given) => given.domain), [undefined, 'consentio.test', 'consentio.test']);
	assert.equal(writes[2].expires, 90);
});
