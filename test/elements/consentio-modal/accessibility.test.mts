import test from 'node:test';
import assert from 'node:assert/strict';

import { mountModal } from './mount.mjs';

// Defect 14. With consentRequired the modal sits behind a full-screen fixed overlay, so
// a visitor who cannot use a pointer has no way through it at all.

test('issue 14 - the modal identifies itself as a dialog', { todo: true }, () => {
	assert.equal(mountModal().modal.getAttribute('role'), 'dialog');
});

test('issue 14 - the modal is marked aria-modal', { todo: true }, () => {
	assert.equal(mountModal().modal.getAttribute('aria-modal'), 'true');
});

test('issue 14 - the modal has an accessible name', { todo: true }, () => {
	const { modal } = mountModal();
	const labelled = modal.getAttribute('aria-label') ?? modal.getAttribute('aria-labelledby');
	assert.ok(labelled, 'nothing associates the heading with the dialog');
});

test('issue 14 - save and cancel are keyboard operable', { todo: true }, () => {
	const { modal } = mountModal();
	for (const control of [modal.cancelBtn!, modal.saveBtn!]) {
		const operable = control.tagName === 'BUTTON' || control.hasAttribute('href');
		assert.ok(operable, `<${control.tagName.toLowerCase()}> with no href is neither focusable nor keyboard-activatable`);
	}
});
