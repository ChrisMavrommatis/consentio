import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

test('Create builds a working instance', () => {
	const instance = Consentio.Create();
	assert.ok(instance instanceof Consentio);
	assert.ok(instance.el);
});

test('issue 9 - Create registers the instance where the loader looks for it', () => {
	assert.ok(
		window.ConsentioInstance,
		'the loader guards on global.ConsentioInstance, and Create never sets it - which is why defect 8 bites'
	);
});
