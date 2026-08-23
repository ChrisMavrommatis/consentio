import test from 'node:test';
import assert from 'node:assert/strict';

import { boot, pushes } from '../helpers.mjs';

// The other half of defect 1. The synchronous core owns `consent default`; this async
// bundle must only ever push `consent update`. See ../consentio-core/README.md for what
// the core's own tests can and cannot show.

const app = boot();

test('issue 1 - the async bundle pushes nothing at all until the visitor acts', { todo: true }, () => {
	assert.deepEqual(pushes(), [], 'anything pushed from connectedCallback arrives after the tag read consent');
});

test('issue 1 - the async bundle never pushes a consent default', { todo: true }, () => {
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));
	assert.deepEqual(pushes().filter((push) => push.action === 'default'), []);
});

test('a choice made in the banner is pushed as an update', () => {
	assert.ok(pushes().some((push) => push.action === 'update'));
});
