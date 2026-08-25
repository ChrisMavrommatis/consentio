import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioModalElement from '../../../src/elements/consentio-modal.js';
import { captureEvents, click } from '../../helpers.mjs';
import { mountModal } from './mount.mjs';

const proto = ConsentioModalElement.prototype as unknown as Record<string, ((this: unknown) => void) | undefined>;

test('the modal collects its consent items on upgrade', () => {
	const { modal, items } = mountModal();
	assert.equal(modal.consents.length, items.length);
});

test('saving reports one state per item, keyed by the category', () => {
	const { modal } = mountModal();
	const [event] = captureEvents('consentio:save-settings', () => click(modal.saveBtn!));
	assert.deepEqual(Object.keys(event.detail), ['strictly_necessary', 'statistics_performance', 'marketing_advertising']);
});

test('a ticked switch is reported as granted', () => {
	const { modal, items } = mountModal();
	items[1].input!.checked = true;
	const [event] = captureEvents('consentio:save-settings', () => click(modal.saveBtn!));
	assert.equal(event.detail.statistics_performance, 'granted');
});

test('an unticked switch is reported as denied', () => {
	const { modal, items } = mountModal();
	items[2].input!.checked = false;
	const [event] = captureEvents('consentio:save-settings', () => click(modal.saveBtn!));
	assert.equal(event.detail.marketing_advertising, 'denied');
});

test('an alwaysOn category is reported as granted whatever its switch says', () => {
	const { modal, items } = mountModal();
	items[0].input!.checked = false;
	const [event] = captureEvents('consentio:save-settings', () => click(modal.saveBtn!));
	assert.equal(event.detail.strictly_necessary, 'granted');
});

test('cancelling emits consentio:cancel-settings and reports no state', () => {
	const { modal } = mountModal();
	const seen = captureEvents('consentio:cancel-settings', () => click(modal.cancelBtn!));
	assert.equal(seen.length, 1);
	assert.deepEqual(seen[0].detail, {});
});

test('issue 7 - a disconnected modal stops emitting', () => {
	const { modal } = mountModal();
	proto.disconnectedCallback!.call(modal);
	const seen = captureEvents('consentio:cancel-settings', () => click(modal.cancelBtn!));
	assert.equal(seen.length, 0, 'removeEventListener rebinds, so it never matches what was added');
});
