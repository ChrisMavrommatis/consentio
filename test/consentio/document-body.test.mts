import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

// The loader appends the main script with no `defer`, so a page that puts the loader in
// <head> reaches the constructor while document.body is still null.

test('issue 10 - constructing before <body> exists does not throw', () => {
	document.documentElement.removeChild(document.body);
	assert.equal(document.body, null, 'precondition: no body');

	assert.doesNotThrow(() => new Consentio({}, [], null), 'the constructor appends straight to document.body');
});
