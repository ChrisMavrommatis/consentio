import test from 'node:test';
import assert from 'node:assert/strict';

import { mountItem } from './mount.mjs';

// Defect 14. The switch is an <input type="checkbox"> wrapped in a <label> that holds
// only the lever <span>, so the label contributes no text and the checkbox is unnamed
// to a screen reader. The alwaysOn variant is the sole exception, because render()
// writes the "Always On" text into that same label.

const nameOf = (input: HTMLInputElement) =>
	input.getAttribute('aria-label')
	?? input.getAttribute('aria-labelledby')
	?? Array.from(input.labels ?? [], (label) => label.textContent?.trim()).join(' ').trim();

test('an alwaysOn item shows a text label in place of the switch', () => {
	const item = mountItem({ alwaysOn: 'Always On' });
	assert.equal(item.switch!.querySelector('label')!.textContent, 'Always On');
	assert.equal(item.querySelector('.switch-lever'), null);
});

test('issue 23 - the alwaysOn label keeps its checkbox instead of detaching it', () => {
	const item = mountItem({ alwaysOn: 'Always On' });
	assert.ok(
		item.contains(item.input!),
		'render() clears the label with innerHTML = "", which removes the input and leaves this.input dangling'
	);
});

test('issue 14 - an ordinary switch has an accessible name', { todo: true }, () => {
	assert.notEqual(nameOf(mountItem().input!), '', 'the wrapping label has no text, so the checkbox is unnamed');
});

test('issue 14 - the switch is associated with the category title', { todo: true }, () => {
	const item = mountItem();
	const title = item.querySelector('h5')!.textContent;
	assert.equal(nameOf(item.input!), title);
});

test('issue 14 - the expandable header says whether it is expanded', { todo: true }, () => {
	const header = mountItem().querySelector('.consent-header')!;
	assert.ok(header.hasAttribute('aria-expanded'), 'a click target that expands a region needs aria-expanded');
});
