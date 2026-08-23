import test from 'node:test';
import assert from 'node:assert/strict';

import { boot, pushes } from '../helpers.mjs';

// The other half of defect 1. The loader owns `consent default` and pushes it on its
// first pass, before it fetches anything; this bundle must only ever push
// `consent update`. See ../README.md for what those tests can and cannot show.

const app = boot();

test('issue 1 - the async bundle pushes nothing at all until the visitor acts', () => {
	assert.deepEqual(pushes(), [], 'anything pushed from connectedCallback arrives after the tag read consent');
});

test('issue 1 - the async bundle never pushes a consent default', () => {
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));
	assert.deepEqual(pushes().filter((push) => push.action === 'default'), []);
});

test('a choice made in the banner is pushed as an update', () => {
	assert.ok(pushes().some((push) => push.action === 'update'));
});
