import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// The loader fetches the config and injects the bundle - it just does neither until the
// default is already out. This file pins that ordering, which is the whole point of
// moving the default here rather than leaving it in the banner.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-config-url="/c.json"></script>';

const fetches: unknown[] = [];
globalThis.fetch = ((...args: unknown[]) => {
	fetches.push(args);
	return Promise.reject(new Error('not in this test'));
}) as typeof fetch;

// Recorded at the moment the bundle is injected, which is the first thing the loader does
// after the default. Anything less than a full default means the ordering slipped.
let pushedByInjection = -1;
const appendChild = document.head.appendChild.bind(document.head);
document.head.appendChild = ((node: Node) => {
	pushedByInjection = pushes().length;
	return appendChild(node);
}) as typeof document.head.appendChild;

test('issue 1 - the default is on the dataLayer before the bundle is injected', async () => {
	await import('../../src/consentio-loader.js');
	assert.ok(pushedByInjection >= 2, `only ${pushedByInjection} entries had been pushed when the bundle was injected`);
	assert.equal(pushes()[0].action, 'default');
});

test('issue 1 - nothing is fetched before the default', () => {
	assert.deepEqual(fetches, [], 'a fetch ahead of the default would put it behind a network round trip');
});
