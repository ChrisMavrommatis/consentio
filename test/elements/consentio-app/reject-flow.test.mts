// Rejecting is an answer, not a dismissal. Issue 35.
import test from 'node:test';
import assert from 'node:assert/strict';

import Cookies from '../../../src/lib/cookies.js';
import { boot, pushes } from '../../helpers.mjs';

const app = boot();

test('the bar offers a refusal beside the acceptance', () => {
	assert.ok(app.bar!.rejectAllBtn, 'a first screen with no way to say no is issue 35');
	assert.equal(app.bar!.rejectAllBtn!.textContent, 'Reject All');
});

test('the reject control is the same kind of control as accept', () => {
	assert.equal(app.bar!.rejectAllBtn!.tagName, app.bar!.acceptAllBtn!.tagName);
	assert.equal(app.bar!.rejectAllBtn!.className, app.bar!.acceptAllBtn!.className);
});

test('a keyboard reaches settings, then reject, then accept', () => {
	const roles = Array.from(
		app.bar!.querySelectorAll('button'),
		(button) => button.getAttribute('data-role')
	);
	assert.deepEqual(roles, ['settings', 'rejectAll', 'acceptAll']);
});

test('rejecting stores an answer rather than hiding the bar', () => {
	app.rejectAll(new CustomEvent('consentio:reject-all-consents'));

	assert.equal(app.state.consentGiven, true);
	assert.match(Cookies.get('consentio')!, /"marketing_advertising":"denied"/);
});

test('rejecting keeps the strictly necessary category granted', () => {
	assert.equal(app.state.consents.strictly_necessary, 'granted');
	assert.equal(app.state.consents.preferences_functionality, 'denied');
	assert.equal(app.state.consents.statistics_performance, 'denied');
	assert.equal(app.state.consents.marketing_advertising, 'denied');
});

test('rejecting pushes a consent update with only security_storage granted', () => {
	const [update] = pushes().filter((push) => push.action === 'update');
	assert.equal(update.payload.security_storage, 'granted');
	assert.equal(update.payload.ad_storage, 'denied');
	assert.equal(update.payload.analytics_storage, 'denied');
	assert.equal(update.payload.functionality_storage, 'denied');
	assert.equal(update.payload.personalization_storage, 'denied');
});

test('rejecting swaps the bar for the floating button', () => {
	assert.equal(app.bar!.style.display, 'none');
	assert.equal(app.floatingButton!.style.display, 'block');
});

test('rejecting unticks every switch the visitor can turn off', () => {
	const optional = app.consentItems.filter((item) => !item.alwaysOn);
	assert.ok(optional.every((item) => !item.input!.checked));
});
