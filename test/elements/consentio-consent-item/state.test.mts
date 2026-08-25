import test from 'node:test';
import assert from 'node:assert/strict';

import { mountItem } from './mount.mjs';

test('an unticked switch reads as denied', () => {
	const item = mountItem();
	item.input!.checked = false;
	assert.equal(item.readState(), 'denied');
});

test('a ticked switch reads as granted', () => {
	const item = mountItem();
	item.input!.checked = true;
	assert.equal(item.readState(), 'granted');
});

test('an alwaysOn item reads as granted whatever the switch says', () => {
	const item = mountItem({ alwaysOn: 'Always On' });
	item.input!.checked = false;
	assert.equal(item.readState(), 'granted');
});

test('updateState ticks the switch and records the state', () => {
	const item = mountItem();
	item.updateState('granted');
	assert.equal(item.input!.checked, true);
	assert.equal(item.itemState, 'granted');
});

test('reset restores the switch from the recorded state', () => {
	const item = mountItem();
	item.updateState('granted');
	item.input!.checked = false;
	item.reset();
	assert.equal(item.input!.checked, true);
});

test('reset collapses the description body', () => {
	const item = mountItem();
	item.reset();
	assert.equal(item.consentBody!.style.display, 'none');
});

test('an alwaysOn item labels its switch with the configured text', () => {
	const item = mountItem({ alwaysOn: 'Always On' });
	assert.equal(item.switch!.querySelector('label')!.textContent, 'Always On');
});

test('the item takes its id from the category key, which is how state is matched back', () => {
	assert.equal(mountItem().id, 'statistics_performance');
});
