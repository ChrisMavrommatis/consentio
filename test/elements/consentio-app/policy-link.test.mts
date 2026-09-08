// Where a banner points at the site's privacy policy, and what it refuses to point at.
// Issues 36 and 37.
import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

const app = boot({ policyUrl: '/privacy/' });

const anchor = (host: Element | null) => host!.querySelector('.policy a') as HTMLAnchorElement | null;

test('the bar carries the policy link', () => {
	assert.equal(anchor(app.bar)!.getAttribute('href'), '/privacy/');
	assert.equal(anchor(app.bar)!.textContent, 'Privacy Policy');
});

test('the modal carries it too, which is where the description sends the reader', () => {
	assert.equal(anchor(app.modal)!.getAttribute('href'), '/privacy/');
});

test('the link opens away from the banner without handing over the opener', () => {
	assert.equal(anchor(app.bar)!.getAttribute('target'), '_blank');
	assert.equal(anchor(app.bar)!.getAttribute('rel'), 'noopener noreferrer');
});

test('the focus trap reaches the link, because it collects anchors with an href', () => {
	assert.ok(app.bar!.querySelector('a[href]'));
});

test('issue 37 - a javascript: URL renders no anchor at all', () => {
	app.config = { policyUrl: 'javascript:alert(1)' };
	assert.equal(anchor(app.bar), null);
	assert.equal(anchor(app.modal), null);
});

test('no policy URL leaves no empty paragraph behind', () => {
	app.config = { policyUrl: '' };
	assert.equal(app.bar!.querySelector('.policy'), null);
	assert.equal(app.modal!.querySelector('.policy'), null);
});

test('setting one again brings the link back', () => {
	app.config = { policyUrl: 'https://example.com/privacy' };
	assert.equal(anchor(app.bar)!.getAttribute('href'), 'https://example.com/privacy');
});
