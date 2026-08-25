import test from 'node:test';
import assert from 'node:assert/strict';

import { importScript } from '../helpers.mjs';

const LOADER = new URL('../../src/consentio-loader.js', import.meta.url);

// A loader tag pasted inline rather than linked - no src attribute to read a base path from.
document.head.innerHTML = '<script data-consentio-loader data-config-url="/c.json"></script>';

test('issue 22 - a loader tag with no src fails softly instead of throwing', async () => {
	await assert.doesNotReject(
		importScript(LOADER),
		'getAttribute("src") returns null and is passed straight to substring()'
	);
});
