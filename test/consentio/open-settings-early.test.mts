// A link on the page can be clicked before the loader has injected the bundle, so the
// method has to survive an instance whose element is not on the page yet. Issue 40.
import test from 'node:test';
import assert from 'node:assert/strict';

import Consentio from '../../src/consentio.js';

test('issue 40 - openSettings before the banner is attached is ignored, not thrown', () => {
	document.documentElement.removeChild(document.body);
	const instance = new Consentio({}, [], null);

	assert.equal(instance.el!.isRendered, false, 'precondition: nothing has been built');
	assert.doesNotThrow(() => instance.openSettings());
});
