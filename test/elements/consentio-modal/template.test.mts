import test from 'node:test';
import assert from 'node:assert/strict';

import modalTemplate from '../../../src/templates/consentio-modal.html';
import { placeholdersIn } from '../../helpers.mjs';

// ConsentioAppElement.render supplies exactly these four when it renders the modal.
// The consent items are appended as nodes afterwards, not substituted as text.
const SUPPLIED = ['modalTitle', 'modalDescription', 'buttonSave', 'buttonCancel'];

test('every placeholder the app supplies appears in the template', () => {
	const asked = placeholdersIn(modalTemplate);
	for (const name of SUPPLIED) {
		assert.ok(asked.includes(name), `${name} is supplied but never used`);
	}
});

test('issue 16 - the template asks for nothing the app does not supply', () => {
	const unsupplied = placeholdersIn(modalTemplate).filter((name) => !SUPPLIED.includes(name));
	assert.deepEqual(unsupplied, [], 'a placeholder nobody fills is silently replaced by an empty string');
});
