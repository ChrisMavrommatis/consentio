import test from 'node:test';
import assert from 'node:assert/strict';

import ConsentioConsentItemElement from '../../../src/elements/consentio-consent-item.js';
import { click } from '../../helpers.mjs';
import { mountItem } from './mount.mjs';

const proto = ConsentioConsentItemElement.prototype as unknown as Record<string, ((this: unknown) => void) | undefined>;

test('the item spells disconnectedCallback correctly, so the DOM will call it', () => {
	assert.equal(typeof proto.disconnectedCallback, 'function');
});

test('issue 7 - a disconnected item stops responding to clicks', { todo: true }, () => {
	const item = mountItem();
	proto.disconnectedCallback!.call(item);

	click(item.querySelector('.consent-header')!);
	assert.equal(
		item.consentBody!.style.display,
		'none',
		'removeEventListener rebinds toggleBody, so the listener it removes is a different function object'
	);
});
