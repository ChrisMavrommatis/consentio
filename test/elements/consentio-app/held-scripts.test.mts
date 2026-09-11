import test from 'node:test';
import assert from 'node:assert/strict';

import { boot } from '../../helpers.mjs';

// One held script per category, on the page before the banner is. jsdom never executes
// a script, so "ran" is asserted the way a browser decides it: a fresh script element
// with no `text/plain` on it has been inserted in the held one's place.
const KEYS = ['strictly_necessary', 'preferences_functionality', 'statistics_performance', 'marketing_advertising'];
for (const key of KEYS) {
	document.body.insertAdjacentHTML('beforeend', `<script type="text/plain" data-consentio="${key}">window.ran = '${key}';</script>`);
}
document.body.insertAdjacentHTML('beforeend', '<script type="text/plain" id="unmarked">window.ran = "unmarked";</script>');

const held = (key: string) => document.querySelector<HTMLScriptElement>(`script[data-consentio="${key}"]`)!;
const ran = (key: string) => held(key).getAttribute('type') === null;

const before = new Map(KEYS.map((key) => [key, held(key)]));
const app = boot();

test('nothing runs at the default, the always-on category included', () => {
	assert.ok(KEYS.every((key) => !ran(key)));
});

test('granting one category runs that script and no other', () => {
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: { strictly_necessary: 'granted', preferences_functionality: 'denied', statistics_performance: 'granted', marketing_advertising: 'denied' }
	}));

	assert.equal(ran('statistics_performance'), true);
	assert.ok(['preferences_functionality', 'marketing_advertising'].every((key) => !ran(key)));
});

test('the script runs as a new element carrying the held one\'s content', () => {
	const live = held('statistics_performance');
	assert.notEqual(live, before.get('statistics_performance'));
	assert.equal(live.textContent, "window.ran = 'statistics_performance';");
	assert.equal(before.get('statistics_performance')!.isConnected, false);
});

test('revoking does not un-run it, and granting another runs that one', () => {
	const live = held('statistics_performance');
	app.saveSettings(new CustomEvent('consentio:save-settings', {
		detail: { strictly_necessary: 'granted', preferences_functionality: 'denied', statistics_performance: 'denied', marketing_advertising: 'granted' }
	}));

	assert.equal(held('statistics_performance'), live);
	assert.equal(ran('marketing_advertising'), true);
});

test('accepting all runs the rest, once each', () => {
	const live = held('marketing_advertising');
	app.acceptAll(new CustomEvent('consentio:accept-all-consents'));

	assert.ok(KEYS.every((key) => ran(key)));
	assert.equal(held('marketing_advertising'), live);
});

test('rejecting all leaves every script where it is', () => {
	const live = KEYS.map((key) => held(key));
	app.rejectAll(new CustomEvent('consentio:reject-all-consents'));

	assert.deepEqual(KEYS.map((key) => held(key)), live);
});

test('a text/plain script the owner did not mark is never touched', () => {
	assert.equal(document.getElementById('unmarked')!.getAttribute('type'), 'text/plain');
});
