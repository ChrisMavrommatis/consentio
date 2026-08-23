import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

document.head.innerHTML = '<script data-consentio-loader src="/vendor/consentio-loader.js"></script>';

test('the unminified loader pulls the unminified bundle from the same directory', async () => {
	await importScript(LOADER);

	const injected = document.head.querySelector('script[src*="consentio"]:not([data-consentio-loader])');
	assert.equal(injected!.getAttribute('src'), '/vendor/consentio.js');
});
