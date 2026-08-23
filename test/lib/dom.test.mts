import test from 'node:test';
import assert from 'node:assert/strict';

import { hideElement, isHidden, showElement } from '../../src/lib/dom.js';

// `isHidden` is `display === 'none' || offsetParent === null`. jsdom does no layout and
// returns null for offsetParent on every element, so only the first branch is observable
// here - an element with no inline display reads as hidden under test but not in a browser.
// Every assertion below therefore sets display explicitly.

test('hideElement sets display none', () => {
	const el = document.createElement('div');
	hideElement(el);
	assert.equal(el.style.display, 'none');
});

test('showElement sets display block', () => {
	const el = document.createElement('div');
	showElement(el);
	assert.equal(el.style.display, 'block');
});

test('isHidden is true for an element hidden inline', () => {
	const el = document.createElement('div');
	hideElement(el);
	assert.equal(isHidden(el), true);
});

test('show then hide leaves the element hidden', () => {
	const el = document.createElement('div');
	showElement(el);
	hideElement(el);
	assert.equal(el.style.display, 'none');
});
