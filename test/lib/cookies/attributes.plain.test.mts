import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { clearCookies } from '../../basics.mjs';

const expiryOf = (serialised: string) => new Date(/; expires=([^;]+)/.exec(serialised)![1]);

beforeEach(clearCookies);

test('set returns the serialised cookie with the default attributes', () => {
	const serialised = Cookies.set('a', 'b');
	assert.match(serialised, /^a=b;/);
	assert.match(serialised, /; path=\//);
	assert.match(serialised, /; sameSite=Lax/);
});

test('no expiry is defaulted here, so a bare set is a session cookie', () => {
	assert.doesNotMatch(Cookies.set('a', 'b'), /; expires=/);
});

test('a numeric expires is read as a number of days', () => {
	const hours = (expiryOf(Cookies.set('a', 'b', { expires: 1 })).getTime() - Date.now()) / 36e5;
	assert.ok(hours > 23.9 && hours < 24.1, `expected ~24 hours, got ${hours}`);
});

test('an explicit attribute overrides the default', () => {
	const serialised = Cookies.set('a', 'b', { path: '/scoped', sameSite: 'Strict' });
	assert.match(serialised, /; path=\/scoped/);
	assert.match(serialised, /; sameSite=Strict/);
	assert.doesNotMatch(serialised, /; path=\/;/);
});

test('a falsy attribute is omitted rather than serialised', () => {
	assert.doesNotMatch(Cookies.set('a', 'b', { path: '' }), /; path/);
});

test('a boolean attribute is serialised as a bare flag', () => {
	assert.match(Cookies.set('a', 'b'), /; secure(;|$)/);
});

// A cookie is only removed by a call carrying the domain it was written with. Issue 39.
test('remove carries the attributes it is given, with an expiry in the past', () => {
	let serialised = '';
	const set = Cookies.set;
	Cookies.set = (key, value, attributes) => (serialised = set.call(Cookies, key, value, attributes));
	Cookies.remove('a', { domain: 'example.test' });
	Cookies.set = set;

	assert.match(serialised, /^a=;/);
	assert.match(serialised, /; domain=example\.test/);
	assert.ok(expiryOf(serialised).getTime() < Date.now(), 'the expiry is not in the past');
});
