import test from 'node:test';
import assert from 'node:assert/strict';

import { click } from '../../helpers.mjs';
import { mountItem } from './mount.mjs';

// `toggleBody` is bound to the host, and the switch sits inside the host, so a click
// meant for the checkbox bubbles up and expands the description as well.
//
// Note on the assertions below: isHidden() is `display === 'none' || offsetParent === null`,
// and jsdom does no layout, so offsetParent is null for everything. Under test the toggle
// therefore always takes the "show" branch. Assert on the inline display, which is the
// half of that expression jsdom does model.

test('clicking the header expands the description', () => {
	const item = mountItem();
	click(item.querySelector('.consent-header')!);
	assert.equal(item.consentBody!.style.display, 'block');
});

test('issue 15 - clicking the switch does not also expand the description', () => {
	const item = mountItem();
	assert.equal(item.consentBody!.style.display, 'none');

	click(item.input!);
	assert.equal(item.consentBody!.style.display, 'none', 'the click listener is on the whole host, and the switch is inside it');
});

test('issue 15 - clicking the switch still changes the switch', () => {
	const item = mountItem();
	const before = item.input!.checked;
	click(item.input!);
	assert.notEqual(item.input!.checked, before);
	assert.equal(item.consentBody!.style.display, 'none');
});
