import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// The loader must refuse to pretend. `async` or `defer` on its own tag is proof the
// browser was told not to block, so the default cannot land before the tag manager. That
// is worth a warning whatever the debug setting says.
const warnings: unknown[] = [];
globalThis.console = { ...console, warn: (...args: unknown[]) => { warnings.push(args[0]); } } as Console;

document.head.innerHTML = '<script async data-consentio-loader src="/js/consentio-loader.min.js"></script>';

test('an async loader tag warns, whatever the debug setting', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(warnings.length, 1);
	assert.match(String(warnings[0]), /async or defer/);
});

test('it still pushes the default, because a late default beats no default', () => {
	assert.equal(pushes()[0].action, 'default');
});
