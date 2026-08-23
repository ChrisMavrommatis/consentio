import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { clearCookies } from '../../basics.mjs';

beforeEach(clearCookies);

test('set then get round-trips a value', () => {
	Cookies.set('flavour', 'ginger');
	assert.equal(Cookies.get('flavour'), 'ginger');
});

test('values are percent-encoded on write and decoded on read', () => {
	const raw = '{"a":1,"b":"x y"}';
	Cookies.set('json', raw);
	assert.ok(document.cookie.includes('%22'), 'expected the raw jar to be encoded');
	assert.equal(Cookies.get('json'), raw);
});

test('a value containing an equals sign survives the round trip', () => {
	Cookies.set('padded', 'YWJjZA==');
	assert.equal(Cookies.get('padded'), 'YWJjZA==');
});

test('get with no key returns the whole jar', () => {
	Cookies.set('one', '1');
	Cookies.set('two', '2');
	assert.deepEqual(Cookies.get(), { one: '1', two: '2' });
});

test('get returns undefined for a key that is not set', () => {
	assert.equal(Cookies.get('absent'), undefined);
});

test('remove expires the cookie', () => {
	Cookies.set('doomed', 'x');
	assert.equal(Cookies.get('doomed'), 'x');
	Cookies.remove('doomed');
	assert.equal(Cookies.get('doomed'), undefined);
});
