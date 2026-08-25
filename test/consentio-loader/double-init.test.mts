import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.js"></script>';
window.ConsentioInstance = { alreadyRunning: true };

test('an already-initialised page is left alone', async () => {
	await importScript(LOADER);

	const injected = document.head.querySelector('script:not([data-consentio-loader])');
	assert.equal(injected, null, 'the guard on global.ConsentioInstance did not hold');
});
