import test from 'node:test';
import assert from 'node:assert/strict';

import { pushes } from '../basics.mjs';

// Off unless asked: a click id in every internal link is the site's choice to make.

document.head.innerHTML = '<script data-consentio-loader src="/js/consentio-loader.min.js"></script>';

test('without the attribute nothing about url_passthrough is pushed', async () => {
	await import('../../src/consentio-loader.js');
	assert.equal(pushes().some((push) => push.action === 'url_passthrough'), false);
	assert.equal(window.ConsentioDefault!.urlPassthrough, false);
});
