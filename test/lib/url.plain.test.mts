// The schemes an href may carry. Issue 37, and issue 29 is why an attribute needs this
// when a text node does not.
import test from 'node:test';
import assert from 'node:assert/strict';

import { safeUrl } from '../../src/lib/url.js';

const ALLOWED = [
	'https://example.com/privacy',
	'http://example.com/privacy',
	'HTTPS://EXAMPLE.COM/PRIVACY',
	'/privacy/',
	'/'
];

const REFUSED = [
	'javascript:alert(1)',
	'JavaScript:alert(1)',
	' javascript:alert(1)',
	'data:text/html,<script>alert(1)</script>',
	'vbscript:msgbox(1)',
	'//example.com/privacy',
	'privacy.html',
	'',
	'   '
];

for (const url of ALLOWED) {
	test(`${url} is an address the banner may link to`, () => {
		assert.equal(safeUrl(url), url.trim());
	});
}

for (const url of REFUSED) {
	test(`"${url}" is refused`, () => {
		assert.equal(safeUrl(url), null);
	});
}

test('anything that is not a string is refused', () => {
	assert.equal(safeUrl(undefined), null);
	assert.equal(safeUrl(null), null);
	assert.equal(safeUrl({ toString: () => 'https://example.com' }), null);
});

test('surrounding whitespace is trimmed rather than making the address unusable', () => {
	assert.equal(safeUrl('  https://example.com/privacy  '), 'https://example.com/privacy');
});
