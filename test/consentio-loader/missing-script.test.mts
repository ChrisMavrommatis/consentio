import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

const errors: unknown[] = [];
globalThis.console = { ...console, error: (...args: unknown[]) => { errors.push(args[0]); } } as Console;

test('with no loader tag on the page, nothing is injected and the reason is logged', async () => {
	await importScript(LOADER);

	assert.equal(document.head.querySelector('script'), null);
	assert.deepEqual(errors, ['[Consentio Loader] script not found']);
});
