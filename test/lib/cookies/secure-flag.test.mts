import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { withOrigin } from '../../helpers.mjs';

// The symptom of defect 12 - the browser silently discarding the cookie - cannot be
// reproduced here: jsdom's cookie jar accepts a `secure` cookie over http rather than
// dropping it. Asserting on the serialised attributes is the only honest check
// available, so a green suite is NOT evidence that defect 12 is fixed in a real
// browser. Verify that by hand on http://localhost.

test('over https the cookie is marked secure', () => {
	assert.match(Cookies.set('a', 'b'), /; secure/);
});

test('issue 12 - the secure flag follows the page protocol, not a hardcoded true', { todo: true }, () => {
	withOrigin('http://localhost:4000/', () => {
		assert.doesNotMatch(Cookies.set('a', 'b'), /; secure/);
	});
});
