import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

// The loader is an IIFE that runs on import, so each scenario needs an uncached module
// and therefore its own file. The DOM is arranged at module scope, before the import.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js" data-config-url="/c.json"></script>';

test('the loader injects the bundle that matches its own build', async () => {
	await importScript(LOADER);

	const injected = document.head.querySelector('script[src*="consentio"]:not([data-consentio-loader])');
	assert.ok(injected, 'no bundle was injected');
	assert.equal(injected.getAttribute('src'), '/js/consentio.min.js', 'the minified loader must pull the minified bundle');
});
