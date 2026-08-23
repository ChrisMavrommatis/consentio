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
	assert.match(serialised, /; expires=/);
});

test('the default expiry is 90 days out', () => {
	const days = (expiryOf(Cookies.set('a', 'b')).getTime() - Date.now()) / 864e5;
	assert.ok(days > 89.9 && days < 90.1, `expected ~90 days, got ${days}`);
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
